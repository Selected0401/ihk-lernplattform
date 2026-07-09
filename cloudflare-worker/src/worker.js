const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://selected0401.github.io',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Digistore-Signature',
};

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...extraHeaders,
    },
  });
}

function normalizeCode(code) {
  return String(code || '').trim().toUpperCase();
}

function isPlausibleAccessCode(code) {
  return /^(IHK|PLUS)-[A-Z2-9]{4}-[A-Z2-9]{4}$/.test(code);
}

function generateCode(prefix = 'IHK') {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const part = (len) => Array.from({ length: len }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
  return `${prefix}-${part(4)}-${part(4)}`;
}

async function sha256Hex(input) {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(hash)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

function base64UrlEncode(input) {
  const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : input;
  let binary = '';
  bytes.forEach(byte => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlDecodeToString(input) {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

async function hmacSha256(input, secret) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(input));
  return new Uint8Array(signature);
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let index = 0; index < a.length; index += 1) {
    diff |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return diff === 0;
}

function clientIp(request) {
  return request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || 'unknown';
}

async function enforceRateLimit(env, key, limit, windowSeconds) {
  if (!env.ACCESS_CODES) return { allowed: false, resetAt: Date.now() + windowSeconds * 1000 };
  const now = Date.now();
  const existing = await env.ACCESS_CODES.get(key, 'json').catch(() => null);
  const bucket = existing && existing.resetAt > now
    ? existing
    : { count: 0, resetAt: now + windowSeconds * 1000 };
  bucket.count = (bucket.count || 0) + 1;
  await env.ACCESS_CODES.put(key, JSON.stringify(bucket), { expirationTtl: windowSeconds + 60 });
  return { allowed: bucket.count <= limit, resetAt: bucket.resetAt };
}

async function signAccessToken(payload, env) {
  if (!env.JWT_SECRET) throw new Error('JWT_SECRET missing');
  const header = { alg: 'HS256', typ: 'JWT' };
  const signingInput = `${base64UrlEncode(JSON.stringify(header))}.${base64UrlEncode(JSON.stringify(payload))}`;
  const signature = await hmacSha256(signingInput, env.JWT_SECRET);
  return `${signingInput}.${base64UrlEncode(signature)}`;
}

async function verifyAccessToken(token, env) {
  if (!env.JWT_SECRET || !token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const signingInput = `${parts[0]}.${parts[1]}`;
  const expected = base64UrlEncode(await hmacSha256(signingInput, env.JWT_SECRET));
  if (!timingSafeEqual(expected, parts[2])) return null;

  const payload = JSON.parse(base64UrlDecodeToString(parts[1]));
  if (payload.exp && Date.now() >= payload.exp * 1000) return null;
  return payload;
}

async function verifyDigistoreRequest(request, env, rawBody) {
  // MVP guard only. Replace with official Digistore signature verification before production.
  const provided = request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
  return Boolean(env.DIGISTORE_WEBHOOK_SECRET && provided && timingSafeEqual(provided, env.DIGISTORE_WEBHOOK_SECRET));
}

async function handleVerify(request, env) {
  const body = await request.json().catch(() => ({}));
  const code = normalizeCode(body.code);
  if (!code) return json({ ok: false, error: 'missing_code' }, 400);

  if (!isPlausibleAccessCode(code)) {
    return json({ ok: false, valid: false, error: 'invalid_code_format' }, 400);
  }

  const ipHash = await sha256Hex(clientIp(request));
  const codeHash = await sha256Hex(code);
  const [ipLimit, codeLimit] = await Promise.all([
    enforceRateLimit(env, `rate:verify:ip:${ipHash}`, 40, 600),
    enforceRateLimit(env, `rate:verify:code:${codeHash}`, 12, 600),
  ]);
  if (!ipLimit.allowed || !codeLimit.allowed) {
    const retryAfter = Math.ceil((Math.max(ipLimit.resetAt, codeLimit.resetAt) - Date.now()) / 1000);
    return json({ ok: false, error: 'rate_limited' }, 429, { 'Retry-After': String(Math.max(1, retryAfter)) });
  }

  const stored = await env.ACCESS_CODES.get(code, 'json');
  if (!stored) return json({ ok: false, valid: false, error: 'invalid_code' }, 404);

  if (stored.revoked) return json({ ok: false, valid: false, error: 'revoked_code' }, 403);
  if (stored.expiresAt && Date.now() > new Date(stored.expiresAt).getTime()) {
    return json({ ok: false, valid: false, error: 'expired_code' }, 403);
  }

  const now = new Date().toISOString();
  stored.lastUsedAt = now;
  stored.uses = (stored.uses || 0) + 1;
  await env.ACCESS_CODES.put(code, JSON.stringify(stored));
  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + 60 * 60;
  const accessToken = await signAccessToken({
    sub: codeHash,
    codeHash,
    plan: stored.plan || 'pro',
    iat: issuedAt,
    exp: expiresAt,
  }, env);

  return json({
    ok: true,
    valid: true,
    access: 'granted',
    plan: stored.plan || 'pro',
    accessToken,
    expiresAt: new Date(expiresAt * 1000).toISOString(),
    codeHash,
  });
}

function contentNamespace(env) {
  return env.PROTECTED_CONTENT || null;
}

async function readTaskBundle(env) {
  const namespace = contentNamespace(env);
  if (!namespace) return null;
  return namespace.get('tasks/aufgaben-optimiert.json', 'json');
}

function summarizeTask(task) {
  return {
    id: task.id,
    kategorie: task.kategorie,
    modul: task.modul || task.kategorie,
    titel: task.titel,
    beschreibung: task.beschreibung,
    schwierigkeit: task.schwierigkeit,
    punkte: task.punkte,
    zeit: task.zeit,
    dauer: task.dauer || (typeof task.zeit === 'number' ? `${task.zeit} Min` : task.zeit),
  };
}

async function requireAccess(request, env) {
  const token = request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
  const payload = await verifyAccessToken(token, env);
  if (!payload) return { response: json({ ok: false, error: 'unauthorized' }, 401) };
  return { payload };
}

async function handleTaskList(request, env) {
  const access = await requireAccess(request, env);
  if (access.response) return access.response;

  const bundle = await readTaskBundle(env);
  if (!bundle || !Array.isArray(bundle.aufgaben)) {
    return json({ ok: false, error: 'protected_content_not_configured' }, 503);
  }

  return json({ ok: true, count: bundle.aufgaben.length, aufgaben: bundle.aufgaben.map(summarizeTask) });
}

async function handleTaskDetail(request, env, taskId) {
  const access = await requireAccess(request, env);
  if (access.response) return access.response;

  const bundle = await readTaskBundle(env);
  if (!bundle || !Array.isArray(bundle.aufgaben)) {
    return json({ ok: false, error: 'protected_content_not_configured' }, 503);
  }

  const task = bundle.aufgaben.find(item => item.id === taskId);
  if (!task) return json({ ok: false, error: 'task_not_found' }, 404);
  return json({ ok: true, aufgabe: task });
}

async function handleCreateCode(request, env) {
  const auth = request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
  if (!env.ADMIN_SECRET || auth !== env.ADMIN_SECRET) return json({ ok: false, error: 'unauthorized' }, 401);

  const body = await request.json().catch(() => ({}));
  const code = normalizeCode(body.code || generateCode(body.prefix || 'IHK'));
  if (!isPlausibleAccessCode(code)) return json({ ok: false, error: 'invalid_code_format' }, 400);
  const orderId = body.orderId ? String(body.orderId) : null;
  const orderIdHash = orderId ? await sha256Hex(orderId) : null;
  const payload = {
    email: String(body.email || '').trim().toLowerCase() || null,
    plan: body.plan || 'pro',
    orderIdHash,
    createdAt: new Date().toISOString(),
    source: body.source || 'manual',
    revoked: false,
    uses: 0,
    expiresAt: body.expiresAt || null,
  };
  await env.ACCESS_CODES.put(code, JSON.stringify(payload));
  if (orderIdHash) {
    await env.ACCESS_CODES.put(`order:${orderIdHash}`, JSON.stringify({ code, plan: payload.plan, createdAt: payload.createdAt }));
  }
  return json({ ok: true, code, payload });
}

function parseDigistorePayload(rawBody) {
  try {
    return JSON.parse(rawBody);
  } catch {
    return Object.fromEntries(new URLSearchParams(rawBody));
  }
}

function digistoreEventType(payload) {
  return String(
    payload.event ||
    payload.event_type ||
    payload.type ||
    payload.status ||
    payload.transaction_type ||
    payload.payment_status ||
    'purchase'
  ).toLowerCase();
}

function isRevocationEvent(eventType) {
  return /(refund|chargeback|cancel|cancellation|revok|revoke|returned|rebill_cancelled|subscription_cancelled)/i.test(eventType);
}

function extractOrderId(payload) {
  return String(payload.order_id || payload.purchase_id || payload.transaction_id || payload.invoice_id || '').trim();
}

async function webhookEventKey(payload, eventType, rawBody) {
  const orderId = extractOrderId(payload);
  const eventId = String(payload.event_id || payload.ipn_id || payload.notification_id || payload.transaction_id || '').trim();
  const basis = eventId || `${orderId || rawBody}:${eventType}`;
  return `event:${await sha256Hex(basis)}`;
}

async function rememberWebhookEvent(env, key, value) {
  await env.ACCESS_CODES.put(key, JSON.stringify({ ...value, processedAt: new Date().toISOString() }), {
    expirationTtl: 60 * 60 * 24 * 180,
  });
}

async function revokeOrderAccess(env, orderId, reason) {
  const orderIdHash = await sha256Hex(orderId);
  const index = await env.ACCESS_CODES.get(`order:${orderIdHash}`, 'json');
  if (!index || !index.code) return { revoked: false, orderIdHash };

  const stored = await env.ACCESS_CODES.get(index.code, 'json');
  if (!stored) return { revoked: false, orderIdHash, codeMissing: true };

  stored.revoked = true;
  stored.revokedAt = new Date().toISOString();
  stored.revocationReason = reason;
  await env.ACCESS_CODES.put(index.code, JSON.stringify(stored));
  return { revoked: true, orderIdHash, codeHash: await sha256Hex(index.code) };
}

async function handleDigistoreWebhook(request, env) {
  const rawBody = await request.text();
  const allowed = await verifyDigistoreRequest(request, env, rawBody);
  if (!allowed) return json({ ok: false, error: 'unauthorized' }, 401);

  const payload = parseDigistorePayload(rawBody);
  const eventType = digistoreEventType(payload);
  const eventKey = await webhookEventKey(payload, eventType, rawBody);
  const previousEvent = await env.ACCESS_CODES.get(eventKey, 'json');
  if (previousEvent) {
    return json({ ok: true, duplicate: true, eventType, ...previousEvent });
  }

  const email = String(payload.email || payload.buyer_email || payload.customer_email || '').trim().toLowerCase();
  const orderId = extractOrderId(payload) || crypto.randomUUID();
  const orderIdHash = await sha256Hex(orderId);

  if (isRevocationEvent(eventType)) {
    const result = await revokeOrderAccess(env, orderId, eventType);
    await rememberWebhookEvent(env, eventKey, { action: 'revocation', eventType, orderIdHash, ...result });
    return json({ ok: true, eventType, ...result }, result.revoked ? 200 : 202);
  }

  const plan = String(payload.product_name || payload.product_id || '').toLowerCase().includes('plus') ? 'plus' : 'pro';

  const existingOrder = await env.ACCESS_CODES.get(`order:${orderIdHash}`, 'json');
  if (existingOrder && existingOrder.code) {
    const result = { action: 'purchase_duplicate_order', eventType, orderIdHash, code: existingOrder.code, plan: existingOrder.plan || plan };
    await rememberWebhookEvent(env, eventKey, result);
    return json({ ok: true, duplicateOrder: true, ...result });
  }

  const code = generateCode(plan === 'plus' ? 'PLUS' : 'IHK');

  await env.ACCESS_CODES.put(code, JSON.stringify({
    email,
    plan,
    orderIdHash,
    createdAt: new Date().toISOString(),
    source: 'digistore24',
    revoked: false,
    uses: 0,
  }));
  await env.ACCESS_CODES.put(`order:${orderIdHash}`, JSON.stringify({ code, plan, createdAt: new Date().toISOString() }));

  // Digistore24 should still send the buyer email. This endpoint returns the generated code for automation tools.
  const result = { action: 'purchase_code_created', eventType, code, plan, orderIdHash };
  await rememberWebhookEvent(env, eventKey, result);
  return json({ ok: true, ...result });
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS });
    const url = new URL(request.url);

    try {
      if (url.pathname === '/health') return json({ ok: true, service: 'ihk-access-worker' });
      if (url.pathname === '/verify-code' && request.method === 'POST') return handleVerify(request, env);
      if (url.pathname === '/admin/create-code' && request.method === 'POST') return handleCreateCode(request, env);
      if (url.pathname === '/digistore24-webhook' && request.method === 'POST') return handleDigistoreWebhook(request, env);
      if (url.pathname === '/content/tasks' && request.method === 'GET') return handleTaskList(request, env);
      if (url.pathname.startsWith('/content/tasks/') && request.method === 'GET') {
        return handleTaskDetail(request, env, decodeURIComponent(url.pathname.replace('/content/tasks/', '')));
      }
      return json({ ok: false, error: 'not_found' }, 404);
    } catch (error) {
      return json({ ok: false, error: 'server_error', message: error.message }, 500);
    }
  },
};
