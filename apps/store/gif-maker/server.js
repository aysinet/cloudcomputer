/**
 * GIF Maker — Plugin server.js
 * Server-side GIF generation, image browsing, and file saving
 */
module.exports = function(ctx) {
  const { authMiddleware, DATA_DIR, ensureDir, fs, path } = ctx;
  const { createCanvas, loadImage } = require('canvas');

  // ─── Helpers ───
  function getUserFilesRoot(username) {
    const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
    const dir = path.join(DATA_DIR, safe, 'files');
    ensureDir(dir);
    return dir;
  }

  function safePath(root, rel) {
    const resolved = path.resolve(root, rel || '');
    if (!resolved.startsWith(root)) return null;
    return resolved;
  }

  // ─── Minimal GIF89a encoder (NeuQuant color quantization + LZW compression) ───
  function encodeGif(frames, width, height, quality) {
    const q = Math.max(1, Math.min(30, quality || 10));
    const buf = [];
    function writeByte(b) { buf.push(b & 0xff); }
    function writeShort(s) { buf.push(s & 0xff); buf.push((s >> 8) & 0xff); }
    function writeBytes(arr) { for (let i = 0; i < arr.length; i++) buf.push(arr[i]); }
    function writeStr(s) { for (let i = 0; i < s.length; i++) buf.push(s.charCodeAt(i)); }

    // NeuQuant color quantization
    function neuQuant(pixels, sampleFac) {
      const netsize = 256, prime1 = 499, prime2 = 491, prime3 = 487, prime4 = 503;
      const minpicturebytes = 3 * prime4;
      const ncycles = 100, maxnetpos = netsize - 1;
      const netbiasshift = 4, intbiasshift = 16, intbias = 1 << intbiasshift;
      const gammashift = 10, betashift = 10, beta = intbias >> betashift, betagamma = intbias << (gammashift - betashift);
      const initrad = netsize >> 3, radiusbiasshift = 6, radiusbias = 1 << radiusbiasshift;
      const initradius = initrad * radiusbias, radiusdec = 30;
      const alphabiasshift = 10, initalpha = 1 << alphabiasshift;
      const radbiasshift = 8, radbias = 1 << radbiasshift;
      const alpharadbshift = alphabiasshift + radbiasshift, alpharadbias = 1 << alpharadbshift;

      let network = [], netindex = new Int32Array(256), bias = new Int32Array(netsize), freq = new Int32Array(netsize), radpower = new Int32Array(netsize >> 3);
      const lengthcount = pixels.length / 4;
      const samplepixels = lengthcount / sampleFac;

      for (let i = 0; i < netsize; i++) {
        const v = (i << (netbiasshift + 8)) / netsize;
        network[i] = [v, v, v, 0]; bias[i] = 0; freq[i] = intbias / netsize;
      }

      function contest(b, g, r) {
        let bestd = ~(1 << 31), bestbiasd = bestd, bestpos = -1, bestbiaspos = bestpos;
        for (let i = 0; i < netsize; i++) {
          const n = network[i];
          let dist = Math.abs(n[0] - b) + Math.abs(n[1] - g) + Math.abs(n[2] - r);
          if (dist < bestd) { bestd = dist; bestpos = i; }
          let biasdist = dist - ((bias[i]) >> (intbiasshift - netbiasshift));
          if (biasdist < bestbiasd) { bestbiasd = biasdist; bestbiaspos = i; }
          const betafreq = freq[i] >> betashift;
          freq[i] -= betafreq; bias[i] += betafreq << gammashift;
        }
        freq[bestpos] += beta; bias[bestpos] -= betagamma;
        return bestbiaspos;
      }

      function altersingle(alpha, i, b, g, r) {
        network[i][0] -= (alpha * (network[i][0] - b)) / initalpha;
        network[i][1] -= (alpha * (network[i][1] - g)) / initalpha;
        network[i][2] -= (alpha * (network[i][2] - r)) / initalpha;
      }

      function alterneigh(rad, i, b, g, r) {
        const lo = Math.max(i - rad, 0), hi = Math.min(i + rad, netsize - 1);
        let j = i + 1, k = i - 1, m = 1;
        while (j <= hi || k >= lo) {
          const a = radpower[m++];
          if (j <= hi) { const p = network[j++]; p[0] -= (a * (p[0] - b)) / alpharadbias; p[1] -= (a * (p[1] - g)) / alpharadbias; p[2] -= (a * (p[2] - r)) / alpharadbias; }
          if (k >= lo) { const p = network[k--]; p[0] -= (a * (p[0] - b)) / alpharadbias; p[1] -= (a * (p[1] - g)) / alpharadbias; p[2] -= (a * (p[2] - r)) / alpharadbias; }
        }
      }

      function learn() {
        const alphadec = 30 + ((sampleFac - 1) / 3);
        let alpha = initalpha, radius = initradius, rad = radius >> radiusbiasshift;
        if (rad <= 1) rad = 0;
        for (let i = 0; i < rad; i++) radpower[i] = alpha * (((rad * rad - i * i) * radbias) / (rad * rad));

        let step;
        if (lengthcount < minpicturebytes) step = 1;
        else if (lengthcount % prime1 !== 0) step = prime1;
        else if (lengthcount % prime2 !== 0) step = prime2;
        else if (lengthcount % prime3 !== 0) step = prime3;
        else step = prime4;

        let pix = 0, delta = Math.max(1, samplepixels / ncycles | 0);
        for (let i = 0; i < samplepixels; ) {
          const idx = pix * 4;
          const b = pixels[idx], g = pixels[idx + 1], r = pixels[idx + 2];
          const j = contest(b, g, r);
          altersingle(alpha, j, b, g, r);
          if (rad !== 0) alterneigh(rad, j, b, g, r);
          pix += step;
          if (pix >= lengthcount) pix -= lengthcount;
          i++;
          if (i % delta === 0) {
            alpha -= alpha / alphadec;
            radius -= radius / radiusdec;
            rad = radius >> radiusbiasshift;
            if (rad <= 1) rad = 0;
            for (let k = 0; k < rad; k++) radpower[k] = alpha * (((rad * rad - k * k) * radbias) / (rad * rad));
          }
        }
      }

      function buildIndex() {
        for (let i = 0; i < netsize; i++) {
          network[i][0] = Math.max(0, Math.min(255, Math.round(network[i][0])));
          network[i][1] = Math.max(0, Math.min(255, Math.round(network[i][1])));
          network[i][2] = Math.max(0, Math.min(255, Math.round(network[i][2])));
          network[i][3] = i;
        }
        network.sort((a, b) => a[1] - b[1]);
        for (let i = 0; i < netsize; i++) {
          const g = network[i][1];
          if (i === 0 || g !== network[i - 1][1]) netindex[g] = i;
        }
        let prev = 0;
        for (let i = 0; i < 256; i++) { if (netindex[i] === 0 && i > 0) netindex[i] = prev; else prev = netindex[i]; }
      }

      function lookup(b, g, r) {
        let bestd = 1000, best = -1;
        let i = netindex[g], j = i - 1;
        while (i < netsize || j >= 0) {
          if (i < netsize) {
            const n = network[i];
            let dist = n[1] - g; if (dist >= bestd) i = netsize; else {
              i++; if (dist < 0) dist = -dist;
              dist += Math.abs(n[0] - b); if (dist < bestd) { dist += Math.abs(n[2] - r); if (dist < bestd) { bestd = dist; best = n[3]; } }
            }
          }
          if (j >= 0) {
            const n = network[j];
            let dist = g - n[1]; if (dist >= bestd) j = -1; else {
              j--; if (dist < 0) dist = -dist;
              dist += Math.abs(n[0] - b); if (dist < bestd) { dist += Math.abs(n[2] - r); if (dist < bestd) { bestd = dist; best = n[3]; } }
            }
          }
        }
        return best;
      }

      learn();
      buildIndex();
      return { colorMap: network.map(n => [n[0], n[1], n[2]]), lookup };
    }

    // LZW encoder for GIF
    function lzwEncode(indexedPixels, colorDepth) {
      const initCodeSize = Math.max(2, colorDepth);
      const data = [];
      let curSubBlock = [];
      function flushSubBlock() { if (curSubBlock.length) { data.push(curSubBlock.length); for (const b of curSubBlock) data.push(b); curSubBlock = []; } }
      function emitByte(b) { curSubBlock.push(b); if (curSubBlock.length === 255) flushSubBlock(); }

      const clearCode = 1 << initCodeSize, eoiCode = clearCode + 1;
      let codeSize = initCodeSize + 1, nextCode = eoiCode + 1, maxCode = (1 << codeSize);
      let table = {}, curBits = 0, curByte = 0, bitPos = 0;

      function emit(code) {
        curByte |= (code << bitPos);
        bitPos += codeSize;
        while (bitPos >= 8) { emitByte(curByte & 0xff); curByte >>= 8; bitPos -= 8; }
      }

      function resetTable() { table = {}; codeSize = initCodeSize + 1; nextCode = eoiCode + 1; maxCode = 1 << codeSize; }

      data.push(initCodeSize);
      emit(clearCode);
      resetTable();

      let prev = indexedPixels[0].toString();
      for (let i = 1; i < indexedPixels.length; i++) {
        const cur = indexedPixels[i].toString();
        const key = prev + ',' + cur;
        if (table[key] !== undefined) { prev = key; }
        else {
          emit(prev.indexOf(',') >= 0 ? table[prev] : parseInt(prev));
          table[key] = nextCode++;
          if (nextCode > maxCode && codeSize < 12) { codeSize++; maxCode = 1 << codeSize; }
          if (nextCode > 4095) { emit(clearCode); resetTable(); }
          prev = cur;
        }
      }
      emit(prev.indexOf(',') >= 0 ? table[prev] : parseInt(prev));
      emit(eoiCode);
      if (bitPos > 0) emitByte(curByte & 0xff);
      flushSubBlock();
      data.push(0);
      return data;
    }

    // Header
    writeStr('GIF89a');
    writeShort(width);
    writeShort(height);

    // Quantize first frame for global color table
    const firstPixels = frames[0].data;
    const nq = neuQuant(firstPixels, q);
    const colorTab = nq.colorMap;

    // Global Color Table flags
    writeByte(0xf7);
    writeByte(0);
    writeByte(0);

    // Write global color table
    for (let i = 0; i < 256; i++) {
      const c = colorTab[i] || [0, 0, 0];
      writeByte(c[0]); writeByte(c[1]); writeByte(c[2]);
    }

    // Netscape loop extension
    writeByte(0x21); writeByte(0xff); writeByte(11);
    writeStr('NETSCAPE2.0');
    writeByte(3); writeByte(1); writeShort(0); writeByte(0);

    // Frames
    for (const frame of frames) {
      const delay = Math.round((frame.delay || 100) / 10);
      writeByte(0x21); writeByte(0xf9); writeByte(4);
      writeByte(0x04);
      writeShort(delay);
      writeByte(0); writeByte(0);

      writeByte(0x2c);
      writeShort(0); writeShort(0);
      writeShort(width); writeShort(height);
      writeByte(0);

      const pixels = frame.data;
      const indexed = new Uint8Array(width * height);
      for (let i = 0; i < width * height; i++) {
        const idx = i * 4;
        indexed[i] = nq.lookup(pixels[idx], pixels[idx + 1], pixels[idx + 2]);
      }

      const lzwData = lzwEncode(indexed, 8);
      writeBytes(lzwData);
    }

    // Trailer
    writeByte(0x3b);
    return Buffer.from(buf);
  }

  // ─── Routes ───
  return {
    routes: [
      // Generate GIF from server-side images
      {
        method: 'post',
        path: '/api/gif-maker/generate',
        handlers: [authMiddleware, async (req, res) => {
          try {
            const { images, width, height, delays, quality, globalDelay } = req.body;
            if (!Array.isArray(images) || images.length < 2) return res.status(400).json({ error: 'At least 2 images required' });
            if (images.length > 100) return res.status(400).json({ error: 'Maximum 100 images allowed' });

            const w = Math.min(Math.max(parseInt(width) || 480, 16), 1920);
            const h = Math.min(Math.max(parseInt(height) || 320, 16), 1080);
            const q = Math.min(Math.max(parseInt(quality) || 10, 1), 30);
            const gDelay = Math.min(Math.max(parseInt(globalDelay) || 200, 20), 5000);
            const root = getUserFilesRoot(req.user.username);

            const canvas = createCanvas(w, h);
            const ctx = canvas.getContext('2d');
            const framesData = [];

            for (let i = 0; i < images.length; i++) {
              const imgPath = images[i];

              if (imgPath.startsWith('data:')) {
                const img = await loadImage(imgPath);
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, w, h);
                const sx = w / img.width, sy = h / img.height;
                const scale = Math.min(sx, sy);
                const dw = img.width * scale, dh = img.height * scale;
                const dx = (w - dw) / 2, dy = (h - dh) / 2;
                ctx.drawImage(img, dx, dy, dw, dh);
              } else {
                const resolved = safePath(root, imgPath);
                if (!resolved) return res.status(403).json({ error: 'Invalid path: ' + imgPath });
                if (!fs.existsSync(resolved)) return res.status(404).json({ error: 'File not found: ' + imgPath });

                const img = await loadImage(resolved);
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, w, h);
                const sx = w / img.width, sy = h / img.height;
                const scale = Math.min(sx, sy);
                const dw = img.width * scale, dh = img.height * scale;
                const dx = (w - dw) / 2, dy = (h - dh) / 2;
                ctx.drawImage(img, dx, dy, dw, dh);
              }

              const imageData = ctx.getImageData(0, 0, w, h);
              const delay = (Array.isArray(delays) && delays[i]) ? Math.min(Math.max(parseInt(delays[i]), 20), 5000) : gDelay;
              framesData.push({ data: imageData.data, delay });
            }

            const gifBuffer = encodeGif(framesData, w, h, q);
            const base64 = gifBuffer.toString('base64');

            res.json({ ok: true, gif: 'data:image/gif;base64,' + base64, size: gifBuffer.length });
          } catch (e) {
            console.error('[GIF-Maker] generate error:', e);
            res.status(500).json({ error: 'GIF generation failed: ' + e.message });
          }
        }]
      },

      // Save generated GIF to user's file system
      {
        method: 'post',
        path: '/api/gif-maker/save',
        handlers: [authMiddleware, (req, res) => {
          try {
            const { filePath: fp, data } = req.body;
            if (!fp || !data) return res.status(400).json({ error: 'filePath and data required' });
            const root = getUserFilesRoot(req.user.username);
            const resolved = safePath(root, fp);
            if (!resolved) return res.status(403).json({ error: 'Invalid path' });
            const dir = path.dirname(resolved);
            ensureDir(dir);
            const base64Data = data.replace(/^data:image\/gif;base64,/, '');
            fs.writeFileSync(resolved, Buffer.from(base64Data, 'base64'));
            const stat = fs.statSync(resolved);
            res.json({ ok: true, path: path.relative(root, resolved).replace(/\\/g, '/'), size: stat.size });
          } catch (e) { res.status(500).json({ error: e.message }); }
        }]
      },

      // List images from a directory in user's files
      {
        method: 'get',
        path: '/api/gif-maker/browse-images',
        handlers: [authMiddleware, (req, res) => {
          try {
            const root = getUserFilesRoot(req.user.username);
            const dir = safePath(root, req.query.path || '');
            if (!dir) return res.status(403).json({ error: 'Invalid path' });
            if (!fs.existsSync(dir)) return res.json({ folders: [], images: [] });

            const entries = fs.readdirSync(dir, { withFileTypes: true });
            const imageExts = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp']);
            const folders = [];
            const images = [];

            for (const e of entries) {
              const relPath = path.relative(root, path.join(dir, e.name)).replace(/\\/g, '/');
              if (e.isDirectory()) {
                folders.push({ name: e.name, path: relPath });
              } else {
                const ext = path.extname(e.name).toLowerCase();
                if (imageExts.has(ext)) {
                  const stat = fs.statSync(path.join(dir, e.name));
                  images.push({ name: e.name, path: relPath, size: stat.size, ext });
                }
              }
            }

            folders.sort((a, b) => a.name.localeCompare(b.name));
            images.sort((a, b) => a.name.localeCompare(b.name));
            res.json({ folders, images, currentPath: path.relative(root, dir).replace(/\\/g, '/') || '' });
          } catch (e) { res.status(500).json({ error: e.message }); }
        }]
      },

      // Get image thumbnail as base64
      {
        method: 'get',
        path: '/api/gif-maker/image-thumb',
        handlers: [authMiddleware, async (req, res) => {
          try {
            const root = getUserFilesRoot(req.user.username);
            const fp = safePath(root, req.query.path);
            if (!fp) return res.status(403).json({ error: 'Invalid path' });
            if (!fs.existsSync(fp)) return res.status(404).json({ error: 'File not found' });

            const img = await loadImage(fp);
            const maxW = 120, maxH = 90;
            const scale = Math.min(maxW / img.width, maxH / img.height, 1);
            const tw = Math.round(img.width * scale), th = Math.round(img.height * scale);

            const canvas = createCanvas(tw, th);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, tw, th);

            res.json({
              thumb: canvas.toDataURL('image/jpeg', 0.7),
              width: img.width,
              height: img.height
            });
          } catch (e) { res.status(500).json({ error: e.message }); }
        }]
      }
    ]
  };
};
