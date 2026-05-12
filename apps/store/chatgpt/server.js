module.exports = function(ctx) {
  const {
    authMiddleware, DATA_DIR, ensureDir, fs, path, crypto
  } = ctx;

  // ─── Provider endpoints (mirrors desktop.js AI_PROVIDER_ENDPOINTS) ───
  const PROVIDER_ENDPOINTS = {
    openai:      { url: 'https://api.openai.com/v1/chat/completions', authHeader: 'Bearer' },
    anthropic:   { url: 'https://api.anthropic.com/v1/messages', authHeader: 'x-api-key', extraHeaders: { 'anthropic-version': '2023-06-01' } },
    google:      { url: 'https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent', authParam: 'key' },
    mistral:     { url: 'https://api.mistral.ai/v1/chat/completions', authHeader: 'Bearer' },
    deepseek:    { url: 'https://api.deepseek.com/v1/chat/completions', authHeader: 'Bearer' },
    cohere:      { url: 'https://api.cohere.ai/v2/chat', authHeader: 'Bearer' },
    groq:        { url: 'https://api.groq.com/openai/v1/chat/completions', authHeader: 'Bearer' },
    xai:         { url: 'https://api.x.ai/v1/chat/completions', authHeader: 'Bearer' },
    github:      { url: 'https://models.inference.ai.azure.com/chat/completions', authHeader: 'Bearer' },
    openrouter:  { url: 'https://openrouter.ai/api/v1/chat/completions', authHeader: 'Bearer' },
    perplexity:  { url: 'https://api.perplexity.ai/chat/completions', authHeader: 'Bearer' },
    huggingface: { url: 'https://router.huggingface.co/v1/chat/completions', authHeader: 'Bearer' }
  };

  // ─── Helpers ───
  function getUserDir(username) {
    const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
    const dir = path.join(DATA_DIR, safe);
    ensureDir(dir);
    return dir;
  }

  function getConversationsPath(username) {
    return path.join(getUserDir(username), 'chatgpt-conversations.json');
  }

  function loadConversations(username) {
    const fp = getConversationsPath(username);
    if (!fs.existsSync(fp)) return [];
    try { return JSON.parse(fs.readFileSync(fp, 'utf-8')); } catch { return []; }
  }

  function saveConversations(username, conversations) {
    fs.writeFileSync(getConversationsPath(username), JSON.stringify(conversations, null, 2));
  }

  function getUserAISettings(username) {
    const fp = path.join(getUserDir(username), 'ai-settings.json');
    if (!fs.existsSync(fp)) return { providers: [] };
    try { return JSON.parse(fs.readFileSync(fp, 'utf-8')); } catch { return { providers: [] }; }
  }

  function getProviderConfig(username, providerId) {
    const settings = getUserAISettings(username);
    return (settings.providers || []).find(p => p.id === providerId && p.enabled);
  }

  // ─── Streaming chat handler ───
  async function handleStream(req, res) {
    const { provider, model, messages, temperature, max_tokens } = req.body;
    if (!provider || !messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'provider and messages required' });
    }

    const providerConfig = getProviderConfig(req.user.username, provider);
    if (!providerConfig) {
      return res.status(400).json({ error: 'Provider not configured or not enabled. Add API key in Settings > AI.' });
    }

    const apiKey = providerConfig.apiKey;
    const selectedModel = model || providerConfig.model || providerConfig.defaultModel || 'gpt-4o-mini';
    const endpoint = PROVIDER_ENDPOINTS[provider];
    if (!endpoint && !providerConfig.baseUrl) {
      return res.status(400).json({ error: 'Unknown provider: ' + provider });
    }

    try {
      // Anthropic has different format
      if (provider === 'anthropic') {
        return await streamAnthropic(req, res, apiKey, selectedModel, messages, temperature, max_tokens, endpoint);
      }
      // Google has different format
      if (provider === 'google') {
        return await streamGoogle(req, res, apiKey, selectedModel, messages, temperature, max_tokens, endpoint);
      }
      // OpenAI-compatible providers
      return await streamOpenAI(req, res, apiKey, selectedModel, messages, temperature, max_tokens, endpoint, provider);
    } catch (err) {
      console.error('[chatgpt-plugin] Stream error:', err.message);
      if (!res.headersSent) {
        res.status(500).json({ error: err.message });
      } else {
        res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
        res.end();
      }
    }
  }

  async function streamOpenAI(req, res, apiKey, model, messages, temperature, max_tokens, endpoint, provider) {
    const url = endpoint.url;
    const headers = { 'Content-Type': 'application/json' };
    if (endpoint.authHeader === 'Bearer') {
      headers['Authorization'] = 'Bearer ' + apiKey;
    }

    const body = {
      model,
      messages,
      stream: true
    };
    if (temperature !== undefined) body.temperature = temperature;
    if (max_tokens) body.max_tokens = max_tokens;

    const resp = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(120000)
    });

    if (!resp.ok) {
      const errText = await resp.text().catch(() => 'Unknown error');
      throw new Error(`${provider} API error (${resp.status}): ${errText.substring(0, 300)}`);
    }

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;
          const data = trimmed.slice(6);
          if (data === '[DONE]') {
            res.write('data: [DONE]\n\n');
            continue;
          }
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta;
            if (delta?.content) {
              res.write(`data: ${JSON.stringify({ content: delta.content })}\n\n`);
            }
            if (delta?.reasoning_content) {
              res.write(`data: ${JSON.stringify({ reasoning: delta.reasoning_content })}\n\n`);
            }
          } catch { /* skip invalid JSON */ }
        }
      }
    } finally {
      reader.releaseLock();
    }
    res.write('data: [DONE]\n\n');
    res.end();
  }

  async function streamAnthropic(req, res, apiKey, model, messages, temperature, max_tokens, endpoint) {
    const systemMsg = messages.find(m => m.role === 'system');
    const chatMessages = messages.filter(m => m.role !== 'system').map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content
    }));

    const headers = {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    };

    const body = {
      model,
      messages: chatMessages,
      max_tokens: max_tokens || 4096,
      stream: true
    };
    if (systemMsg) body.system = systemMsg.content;
    if (temperature !== undefined) body.temperature = temperature;

    const resp = await fetch(endpoint.url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(120000)
    });

    if (!resp.ok) {
      const errText = await resp.text().catch(() => 'Unknown error');
      throw new Error(`Anthropic API error (${resp.status}): ${errText.substring(0, 300)}`);
    }

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data: ')) continue;
          const data = trimmed.slice(6);
          try {
            const parsed = JSON.parse(data);
            if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
              res.write(`data: ${JSON.stringify({ content: parsed.delta.text })}\n\n`);
            }
            if (parsed.type === 'message_stop') {
              res.write('data: [DONE]\n\n');
            }
          } catch { /* skip */ }
        }
      }
    } finally {
      reader.releaseLock();
    }
    res.write('data: [DONE]\n\n');
    res.end();
  }

  async function streamGoogle(req, res, apiKey, model, messages, temperature, max_tokens, endpoint) {
    const url = endpoint.url.replace('{model}', encodeURIComponent(model)) + '?key=' + encodeURIComponent(apiKey) + '&alt=sse';

    const systemParts = messages.filter(m => m.role === 'system').map(m => ({ text: m.content }));
    const contents = messages.filter(m => m.role !== 'system').map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const body = { contents };
    if (systemParts.length) body.systemInstruction = { parts: systemParts };
    if (temperature !== undefined || max_tokens) {
      body.generationConfig = {};
      if (temperature !== undefined) body.generationConfig.temperature = temperature;
      if (max_tokens) body.generationConfig.maxOutputTokens = max_tokens;
    }

    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(120000)
    });

    if (!resp.ok) {
      const errText = await resp.text().catch(() => 'Unknown error');
      throw new Error(`Google API error (${resp.status}): ${errText.substring(0, 300)}`);
    }

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data: ')) continue;
          const data = trimmed.slice(6);
          try {
            const parsed = JSON.parse(data);
            const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
            }
          } catch { /* skip */ }
        }
      }
    } finally {
      reader.releaseLock();
    }
    res.write('data: [DONE]\n\n');
    res.end();
  }

  // ─── Return plugin definition ───
  return {
    routes: [
      // Load conversations
      {
        method: 'get',
        path: '/api/chatgpt/conversations',
        handlers: [authMiddleware, (req, res) => {
          const conversations = loadConversations(req.user.username);
          res.json({ conversations });
        }]
      },
      // Save conversations
      {
        method: 'post',
        path: '/api/chatgpt/conversations',
        handlers: [authMiddleware, (req, res) => {
          const { conversations } = req.body;
          if (!Array.isArray(conversations)) {
            return res.status(400).json({ error: 'conversations array required' });
          }
          // Limit to 200 conversations max
          const trimmed = conversations.slice(0, 200);
          saveConversations(req.user.username, trimmed);
          res.json({ ok: true });
        }]
      },
      // List available providers
      {
        method: 'get',
        path: '/api/chatgpt/providers',
        handlers: [authMiddleware, (req, res) => {
          const settings = getUserAISettings(req.user.username);
          const providers = (settings.providers || [])
            .filter(p => p.enabled && p.apiKey)
            .map(p => ({
              id: p.id,
              name: p.name || p.id,
              icon: p.icon || '🤖',
              model: p.model || p.defaultModel || '',
              hasKey: true
            }));
          res.json({ providers });
        }]
      },
      // Streaming chat
      {
        method: 'post',
        path: '/api/chatgpt/stream',
        handlers: [authMiddleware, handleStream]
      }
    ]
  };
};
