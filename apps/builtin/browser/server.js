module.exports = function(ctx) {
  const { authMiddleware, getUserSettings, saveUserSettings } = ctx;

  // Simple token extraction for injecting into proxied HTML
  function extractToken(req) {
    const auth = req.headers.authorization;
    if (auth && auth.startsWith('Bearer ')) return auth.slice(7);
    if (req.query && req.query.token) return req.query.token;
    const cookieHeader = req.headers.cookie || '';
    const cookies = {};
    cookieHeader.split(';').forEach(c => {
      const [key, ...vals] = c.trim().split('=');
      if (key) cookies[key.trim()] = vals.join('=').trim();
    });
    return cookies.token || null;
  }

  function isPrivateHost(hostname) {
    return /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|0\.|localhost|::1|\[::1\])/i.test(hostname);
  }

  // Catch-all for relative asset requests from proxied pages (e.g. /_next/*, /static/*)
  async function assetCatchAll(req, res, next) {
    const referer = req.headers.referer || '';
    // Only intercept if request originated from a proxied page
    const proxyMatch = referer.match(/\/api\/browser\/proxy[^?]*\?[^#]*url=([^&#]+)/);
    if (!proxyMatch) return next();
    try {
      const refOrigin = new URL(decodeURIComponent(proxyMatch[1])).origin;
      const targetUrl = refOrigin + req.originalUrl;
      // Block internal/private IPs
      const hostname = new URL(targetUrl).hostname;
      if (isPrivateHost(hostname)) {
        return next();
      }
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      const resp = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': req.headers.accept || '*/*',
          'Accept-Language': req.headers['accept-language'] || 'en-US,en;q=0.5'
        },
        signal: controller.signal,
        redirect: 'follow'
      });
      clearTimeout(timeout);
      const contentType = resp.headers.get('content-type') || 'application/octet-stream';
      res.set('Content-Type', contentType);
      res.set('Access-Control-Allow-Origin', '*');
      res.set('Cache-Control', 'public, max-age=31536000, immutable');
      const buffer = Buffer.from(await resp.arrayBuffer());
      res.send(buffer);
    } catch (e) {
      next();
    }
  }

  // Browser proxy GET — fetches external page, rewrites HTML/CSS/JS
  async function proxyGet(req, res) {
    const targetUrl = req.query.url;
    if (!targetUrl) return res.status(400).json({ error: 'url required' });
    try {
      new URL(targetUrl); // validate URL
    } catch { return res.status(400).json({ error: 'Invalid URL' }); }

    // Block internal/private IPs to prevent SSRF
    try {
      const parsed = new URL(targetUrl);
      if (isPrivateHost(parsed.hostname)) {
        return res.status(403).json({ error: 'Access to internal addresses is not allowed' });
      }
    } catch { return res.status(400).json({ error: 'Invalid URL' }); }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      const resp = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': req.headers.accept || 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': req.headers['accept-language'] || 'en-US,en;q=0.5'
        },
        signal: controller.signal,
        redirect: 'follow'
      });
      clearTimeout(timeout);

      const contentType = resp.headers.get('content-type') || 'text/html';
      res.set('Content-Type', contentType);
      res.set('X-Final-URL', resp.url);
      // Strip security headers that break proxied content
      res.removeHeader('content-security-policy');
      res.removeHeader('content-security-policy-report-only');
      res.removeHeader('x-frame-options');
      res.set('Access-Control-Allow-Origin', '*');

      // For HTML content, inject base tag to fix relative URLs
      if (contentType.includes('text/html')) {
        let html = await resp.text();
        const baseUrl = new URL(resp.url);
        const baseHref = baseUrl.origin + baseUrl.pathname.replace(/\/[^/]*$/, '/');
        // Rewrite link/script/img src and href attributes to go through proxy
        html = html.replace(/(href|src)=(["'])(?!data:|blob:|#|javascript:|about:|mailto:)([^"']+)\2/gi, function(match, attr, q, url) {
          try {
            var absUrl = new URL(url, baseUrl.href).href;
            if (new URL(absUrl).protocol === 'http:' || new URL(absUrl).protocol === 'https:') {
              return attr + '=' + q + '/api/browser/proxy?url=' + encodeURIComponent(absUrl) + q;
            }
            return match;
          } catch(e) { return match; }
        });
        // Remove CSP meta tags
        html = html.replace(/<meta[^>]*http-equiv=["']content-security-policy["'][^>]*>/gi, '');
        // Rewrite url() references inside inline <style> tags
        html = html.replace(/(<style[^>]*>)([\s\S]*?)(<\/style>)/gi, function(m, open, css, close) {
          css = css.replace(/url\(\s*['"]?(?!data:|blob:|#|about:)([^)'"\s]+)['"]?\s*\)/gi, function(um, urlVal) {
            try {
              var absUrl = new URL(urlVal, baseUrl.href).href;
              return 'url(/api/browser/proxy?url=' + encodeURIComponent(absUrl) + ')';
            } catch(e) { return um; }
          });
          return open + css + close;
        });
        // Inject script to intercept link clicks and window.open inside iframe
        const interceptAll = req.query.interceptAll === '1';
        const proxyDomain = req.query.proxyDomain || (interceptAll ? baseUrl.hostname : '');
        const reqToken = extractToken(req) || '';
        const xhrIntercept = proxyDomain ? `
        var _authTk='Bearer ${reqToken.replace(/'/g, "\\'")}';
        var _pDomain='${proxyDomain.replace(/'/g, "\\'")}';var _pDomains=[_pDomain];try{var _bd=new URL('${baseHref}');if(_bd.hostname!==_pDomain)_pDomains.push(_bd.hostname);}catch(e){}
        var _baseOrigin='${baseUrl.origin}';
        var _interceptAllOrigins=${interceptAll ? 'true' : 'false'};
        function _resolveUrl(url){try{var u=new URL(url,location.href);if(u.hostname===location.hostname&&u.hostname!==new URL(_baseOrigin).hostname){return new URL(u.pathname+u.search+u.hash,_baseOrigin);}return u;}catch(e){return null;}}
        function _matchDomain(h){if(_interceptAllOrigins&&h!==location.hostname)return true;for(var i=0;i<_pDomains.length;i++)if(h.includes(_pDomains[i]))return true;return false;}
        var _origXhrOpen=XMLHttpRequest.prototype.open;
        var _origXhrSend=XMLHttpRequest.prototype.send;
        XMLHttpRequest.prototype.open=function(method,url,async,user,pass){
          this._pMethod=method;this._pUrl=url;this._pAsync=async;this._pUser=user;this._pPass=pass;
          try{var u=_resolveUrl(url);if(u&&_matchDomain(u.hostname)){this._pIntercept=true;this._pFullUrl=u.href;return;}}catch(e){}
          return _origXhrOpen.apply(this,arguments);
        };
        XMLHttpRequest.prototype.send=function(body){
          if(this._pIntercept){
            var self=this;var hdrs=this._pHeaders||{};
            fetch(location.origin+'/api/browser/proxy-xhr',{method:'POST',headers:{'Content-Type':'application/json','Authorization':_authTk},body:JSON.stringify({url:self._pFullUrl,method:self._pMethod,body:body,headers:hdrs})}).then(function(r){return r.text().then(function(t){Object.defineProperty(self,'readyState',{writable:true});self.readyState=4;Object.defineProperty(self,'status',{writable:true});self.status=r.status;Object.defineProperty(self,'statusText',{writable:true});self.statusText=r.statusText||'';Object.defineProperty(self,'responseText',{writable:true});self.responseText=t;Object.defineProperty(self,'response',{writable:true});self.response=t;if(typeof self.onreadystatechange==='function')self.onreadystatechange();if(typeof self.onload==='function')self.onload();self.dispatchEvent(new Event('readystatechange'));self.dispatchEvent(new Event('load'));self.dispatchEvent(new Event('loadend'));});}).catch(function(e){Object.defineProperty(self,'readyState',{writable:true});self.readyState=4;Object.defineProperty(self,'status',{writable:true});self.status=0;if(typeof self.onerror==='function')self.onerror(e);self.dispatchEvent(new Event('error'));self.dispatchEvent(new Event('loadend'));});
            return;
          }
          return _origXhrSend.apply(this,arguments);
        };
        var _origSetReqHdr=XMLHttpRequest.prototype.setRequestHeader;
        XMLHttpRequest.prototype.setRequestHeader=function(k,v){
          if(this._pIntercept){if(!this._pHeaders)this._pHeaders={};this._pHeaders[k]=v;return;}
          return _origSetReqHdr.apply(this,arguments);
        };
        var _origFetch=window.fetch;
        window.fetch=function(input,init){
          var url=typeof input==='string'?input:(input&&input.url?input.url:'');
          try{var u=_resolveUrl(url);if(u&&_matchDomain(u.hostname)){
            var method=(init&&init.method)||'GET';var body=(init&&init.body)||undefined;var fHeaders={};
            if(init&&init.headers){if(typeof init.headers.forEach==='function'){init.headers.forEach(function(v,k){fHeaders[k]=v;});}else if(typeof init.headers==='object'){for(var hk in init.headers)fHeaders[hk]=init.headers[hk];}}
            return _origFetch(location.origin+'/api/browser/proxy-xhr',{method:'POST',headers:{'Content-Type':'application/json','Authorization':_authTk},body:JSON.stringify({url:u.href,method:method,body:typeof body==='string'?body:undefined,headers:fHeaders})});
          }}catch(e){}
          return _origFetch.apply(this,arguments);
        };` : '';
      const interceptScript = `<script>(function(){
        var _proxyBase='${baseUrl.origin}';
        function _toProxy(url){
          try{
            var u=new URL(url,_proxyBase);
            if(u.protocol==='http:'||u.protocol==='https:'){
              return location.origin+'/api/browser/proxy?url='+encodeURIComponent(u.href);
            }
          }catch(e){}
          return url;
        }
        function _needsProxy(url){
          if(!url||typeof url!=='string')return false;
          if(url.startsWith('data:')||url.startsWith('blob:')||url.startsWith('about:')||url.startsWith('javascript:'))return false;
          if(url.indexOf('/api/browser/proxy')!==-1)return false;
          try{var u=new URL(url,location.href);return u.origin===location.origin&&!url.startsWith(location.origin+'/api/');}catch(e){return false;}
        }
        // Patch script.src setter
        var _scriptSrcDesc=Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype,'src');
        if(_scriptSrcDesc&&_scriptSrcDesc.set){
          Object.defineProperty(HTMLScriptElement.prototype,'src',{
            set:function(v){if(typeof v==='string'&&_needsProxy(v)){v=_toProxy(v);}return _scriptSrcDesc.set.call(this,v);},
            get:_scriptSrcDesc.get,configurable:true,enumerable:true
          });
        }
        // Patch link.href setter
        var _linkHrefDesc=Object.getOwnPropertyDescriptor(HTMLLinkElement.prototype,'href');
        if(_linkHrefDesc&&_linkHrefDesc.set){
          Object.defineProperty(HTMLLinkElement.prototype,'href',{
            set:function(v){if(typeof v==='string'&&_needsProxy(v)){v=_toProxy(v);}return _linkHrefDesc.set.call(this,v);},
            get:_linkHrefDesc.get,configurable:true,enumerable:true
          });
        }
        // Patch setAttribute for src/href
        var _origSetAttr=Element.prototype.setAttribute;
        Element.prototype.setAttribute=function(name,value){
          if((name==='src'||name==='href')&&typeof value==='string'&&_needsProxy(value)){value=_toProxy(value);}
          return _origSetAttr.call(this,name,value);
        };
        var origOpen=window.open;
        window.open=function(url){
          if(url){try{var u=new URL(url,location.href);parent.postMessage({type:'browser-navigate',url:u.href},'*');}catch(e){}}return null;};
        var _origReplaceState=history.replaceState.bind(history);
        var _origPushState=history.pushState.bind(history);
        history.replaceState=function(state,title,url){try{_origReplaceState(state,title,url);}catch(e){}};
        history.pushState=function(state,title,url){try{_origPushState(state,title,url);}catch(e){}};
        document.addEventListener('click',function(e){
          var a=e.target.closest('a');
          if(!a)return;
          var href=a.getAttribute('href');
          if(!href||href.startsWith('#')||href.startsWith('javascript:'))return;
          ${interceptAll ? '' : "if(a.target==='_blank'||a.target==='_new'||e.ctrlKey||e.metaKey){"}
            e.preventDefault();e.stopPropagation();
            try{var u=new URL(href,location.href);parent.postMessage({type:'browser-navigate',url:u.href},'*');}catch(ex){}
          ${interceptAll ? '' : '}'}
        },true);${xhrIntercept}
      })();<\/script>`;
        html = html.replace(/(<head[^>]*>)/i, '$1' + interceptScript);
        res.send(html);
      } else if (contentType.includes('text/css')) {
        let css = await resp.text();
        const cssBase = resp.url;
        css = css.replace(/url\(\s*['"]?(?!data:|blob:|#|about:)([^)'"\s]+)['"]?\s*\)/gi, function(match, urlVal) {
          try {
            var absUrl = new URL(urlVal, cssBase).href;
            return 'url(/api/browser/proxy?url=' + encodeURIComponent(absUrl) + ')';
          } catch(e) { return match; }
        });
        res.send(css);
      } else if (contentType.includes('javascript') || contentType.includes('application/x-javascript')) {
        let js = await resp.text();
        const jsBase = resp.url;
        // Rewrite font/asset references in JS bundles (Next.js CSS-in-JS patterns)
        js = js.replace(/url\(\s*\\?['"]?(?!data:|blob:|#|about:)([^)'"\\\s]+\.(?:woff2?|ttf|eot|otf|svg|png|jpg|gif|webp))\\?['"]?\s*\)/gi, function(match, urlVal) {
          try {
            var absUrl = new URL(urlVal, jsBase).href;
            return 'url(/api/browser/proxy?url=' + encodeURIComponent(absUrl) + ')';
          } catch(e) { return match; }
        });
        res.send(js);
      } else {
        const buffer = Buffer.from(await resp.arrayBuffer());
        res.send(buffer);
      }
    } catch (e) {
      if (e.name === 'AbortError') return res.status(504).json({ error: 'Request timeout' });
      res.status(502).json({ error: e.message || 'Fetch failed' });
    }
  }

  // Browser proxy POST/PUT/DELETE (for intercepted XHR/fetch from proxied pages)
  async function proxyXhr(req, res) {
    const targetUrl = req.body.url;
    const method = (req.body.method || 'POST').toUpperCase();
    if (!targetUrl) return res.status(400).json({ error: 'url required' });
    try { new URL(targetUrl); } catch { return res.status(400).json({ error: 'Invalid URL' }); }
    try {
      const parsed = new URL(targetUrl);
      if (isPrivateHost(parsed.hostname)) {
        return res.status(403).json({ error: 'Access to internal addresses is not allowed' });
      }
    } catch { return res.status(400).json({ error: 'Invalid URL' }); }
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);
      const fwdHeaders = {};
      const passthroughKeys = ['content-type', 'accept', 'accept-language', 'x-requested-with', 'x-goog-authuser', 'x-same-domain'];
      if (req.body.headers && typeof req.body.headers === 'object') {
        for (const [k, v] of Object.entries(req.body.headers)) {
          const lk = k.toLowerCase();
          if (passthroughKeys.includes(lk) || lk.startsWith('x-goog-')) {
            fwdHeaders[k] = v;
          }
        }
      }
      fwdHeaders['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
      if (req.body.cookies) {
        fwdHeaders['Cookie'] = req.body.cookies;
      }
      const fetchOpts = {
        method: ['GET','POST','PUT','DELETE','PATCH'].includes(method) ? method : 'POST',
        headers: fwdHeaders,
        signal: controller.signal,
        redirect: 'follow'
      };
      if (method !== 'GET' && method !== 'HEAD' && req.body.body !== undefined) {
        fetchOpts.body = typeof req.body.body === 'string' ? req.body.body : JSON.stringify(req.body.body);
      }
      const resp = await fetch(targetUrl, fetchOpts);
      clearTimeout(timeout);
      const ct = resp.headers.get('content-type') || 'application/octet-stream';
      res.set('Content-Type', ct);
      res.set('Access-Control-Allow-Origin', '*');
      const buffer = Buffer.from(await resp.arrayBuffer());
      res.status(resp.status).send(buffer);
    } catch (e) {
      if (e.name === 'AbortError') return res.status(504).json({ error: 'Request timeout' });
      res.status(502).json({ error: e.message || 'Fetch failed' });
    }
  }

  // Browser Bookmarks API
  function getBookmarks(req, res) {
    const settings = getUserSettings(req.user.username);
    res.json({ bookmarks: Array.isArray(settings.browserBookmarks) ? settings.browserBookmarks : [] });
  }

  function addBookmark(req, res) {
    const { url, title } = req.body;
    if (!url || typeof url !== 'string') return res.status(400).json({ error: 'url required' });
    const settings = getUserSettings(req.user.username);
    const bookmarks = Array.isArray(settings.browserBookmarks) ? settings.browserBookmarks : [];
    if (bookmarks.find(b => b.url === url)) return res.json({ ok: true, message: 'Already bookmarked', bookmarks });
    const bm = { url, title: (typeof title === 'string' && title.trim()) ? title.trim().slice(0, 200) : url };
    bookmarks.push(bm);
    saveUserSettings(req.user.username, { ...settings, browserBookmarks: bookmarks });
    res.json({ ok: true, bookmarks });
  }

  function deleteBookmark(req, res) {
    const { url } = req.body;
    if (!url || typeof url !== 'string') return res.status(400).json({ error: 'url required' });
    const settings = getUserSettings(req.user.username);
    let bookmarks = Array.isArray(settings.browserBookmarks) ? settings.browserBookmarks : [];
    bookmarks = bookmarks.filter(b => b.url !== url);
    saveUserSettings(req.user.username, { ...settings, browserBookmarks: bookmarks });
    res.json({ ok: true, bookmarks });
  }

  return {
    routes: [
      { method: 'get', path: ['/_next/*', '/static/*', '/__nextjs*'], handlers: [assetCatchAll] },
      { method: 'get', path: '/api/browser/proxy', handlers: [authMiddleware, proxyGet] },
      { method: 'post', path: '/api/browser/proxy-xhr', handlers: [authMiddleware, proxyXhr] },
      { method: 'get', path: '/api/browser/bookmarks', handlers: [authMiddleware, getBookmarks] },
      { method: 'post', path: '/api/browser/bookmarks', handlers: [authMiddleware, addBookmark] },
      { method: 'delete', path: '/api/browser/bookmarks', handlers: [authMiddleware, deleteBookmark] }
    ]
  };
};
