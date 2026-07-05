const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Digistore-Signature',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
}

function normalizeCode(code) {
  return String(code || '').trim().toUpperCase();
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

async function verifyDigistoreRequest(request, env, rawBody) {
  // Prefer a shared secret query/header for MVP simplicity. Replace with official Digistore signature verification when configured.
  const url = new URL(request.url);
  const provided = request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '') || url.searchParams.get('secret');
  return Boolean(env.DIGISTORE_WEBHOOK_SECRET && provided && provided === env.DIGISTORE_WEBHOOK_SECRET);
}

async function handleVerify(request, env) {
  const body = await request.json().catch(() => ({}));
  const code = normalizeCode(body.code);
  if (!code) return json({ ok: false, error: 'missing_code' }, 400);

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

  return json({
    ok: true,
    valid: true,
    access: 'granted',
    plan: stored.plan || 'pro',
    email: stored.email || null,
    codeHash: await sha256Hex(code),
  });
}

async function handleCreateCode(request, env) {
  const auth = request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
  if (!env.ADMIN_SECRET || auth !== env.ADMIN_SECRET) return json({ ok: false, error: 'unauthorized' }, 401);

  const body = await request.json().catch(() => ({}));
  const code = normalizeCode(body.code || generateCode(body.prefix || 'IHK'));
  const payload = {
    email: String(body.email || '').trim().toLowerCase() || null,
    plan: body.plan || 'pro',
    orderId: body.orderId || null,
    createdAt: new Date().toISOString(),
    source: body.source || 'manual',
    revoked: false,
    uses: 0,
    expiresAt: body.expiresAt || null,
  };
  await env.ACCESS_CODES.put(code, JSON.stringify(payload));
  return json({ ok: true, code, payload });
}

async function handleDigistoreWebhook(request, env) {
  const rawBody = await request.text();
  const allowed = await verifyDigistoreRequest(request, env, rawBody);
  if (!allowed) return json({ ok: false, error: 'unauthorized' }, 401);

  let payload = {};
  try {
    payload = JSON.parse(rawBody);
  } catch {
    payload = Object.fromEntries(new URLSearchParams(rawBody));
  }

  const email = String(payload.email || payload.buyer_email || payload.customer_email || '').trim().toLowerCase();
  const orderId = String(payload.order_id || payload.purchase_id || payload.transaction_id || crypto.randomUUID());
  const plan = String(payload.product_name || payload.product_id || '').toLowerCase().includes('plus') ? 'plus' : 'pro';
  const code = generateCode(plan === 'plus' ? 'PLUS' : 'IHK');

  await env.ACCESS_CODES.put(code, JSON.stringify({
    email,
    plan,
    orderId,
    createdAt: new Date().toISOString(),
    source: 'digistore24',
    revoked: false,
    uses: 0,
    rawPayload: payload,
  }));

  // Digistore24 should still send the buyer email. This endpoint returns the generated code for automation tools.
  return json({ ok: true, code, email, plan, orderId });
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
      return json({ ok: false, error: 'not_found' }, 404);
    } catch (error) {
      return json({ ok: false, error: 'server_error', message: error.message }, 500);
    }
  },
};
