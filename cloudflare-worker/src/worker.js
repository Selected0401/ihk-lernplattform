const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://selected0401.github.io',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Digistore-Signature',
};

const SESSION_TTL_SECONDS = 60 * 60;
const MIN_SECRET_LENGTH = 32;

class SerialDurableObject {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.queue = Promise.resolve();
  }

  fetch(request) {
    const operation = this.queue.then(() => this.handle(request));
    this.queue = operation.catch(() => undefined);
    return operation;
  }
}

export class CommerceCoordinator extends SerialDurableObject {
  async handle(request) {
    if (request.method !== 'POST') return json({ ok: false, error: 'method_not_allowed' }, 405);
    const operation = await request.json().catch(() => ({}));
    return processCommerceEvent(this.state, this.env, operation);
  }
}

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

function digistoreAcknowledgement(status = 200) {
  return new Response('OK', {
    status,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

function normalizeCode(code) {
  return String(code || '').trim().toUpperCase();
}

function normalizeDigistoreLoginKey(code) {
  return String(code || '').trim();
}

function isPlausibleAccessCode(code) {
  return /^(IHK|PLUS)-[A-Z2-9]{4}-[A-Z2-9]{4}$/.test(code);
}

function isPlausibleDigistoreLicenseKey(code) {
  return /^[\x21-\x7E]{8,256}$/.test(code);
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

async function sha512HexUpper(input) {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest('SHA-512', data);
  return [...new Uint8Array(hash)]
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
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

function hasStrongSecret(secret) {
  return typeof secret === 'string' && secret.length >= MIN_SECRET_LENGTH;
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
  if (!hasStrongSecret(env.JWT_SECRET)) throw new Error('JWT_SECRET missing or too short');
  const header = { alg: 'HS256', typ: 'JWT' };
  const signingInput = `${base64UrlEncode(JSON.stringify(header))}.${base64UrlEncode(JSON.stringify(payload))}`;
  const signature = await hmacSha256(signingInput, env.JWT_SECRET);
  return `${signingInput}.${base64UrlEncode(signature)}`;
}

async function verifyAccessToken(token, env) {
  if (!hasStrongSecret(env.JWT_SECRET) || !token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const header = JSON.parse(base64UrlDecodeToString(parts[0]));
    if (header.alg !== 'HS256' || header.typ !== 'JWT') return null;
    const signingInput = `${parts[0]}.${parts[1]}`;
    const expected = base64UrlEncode(await hmacSha256(signingInput, env.JWT_SECRET));
    if (!timingSafeEqual(expected, parts[2])) return null;

    const payload = JSON.parse(base64UrlDecodeToString(parts[1]));
    if (!Number.isInteger(payload.iat) || !Number.isInteger(payload.exp)) return null;
    if (Date.now() >= payload.exp * 1000) return null;
    if (!/^[a-f0-9]{64}$/.test(payload.codeHash || '')) return null;
    if (!Number.isInteger(payload.sessionVersion) || payload.sessionVersion < 1) return null;
    return payload;
  } catch {
    return null;
  }
}

async function rememberCodeHashIndex(env, code, metadata = {}) {
  const codeHash = await sha256Hex(code);
  await env.ACCESS_CODES.put(`code-hash:${codeHash}`, JSON.stringify({
    code,
    indexedAt: new Date().toISOString(),
    ...metadata,
  }));
  return codeHash;
}

async function verifyDigistoreRequest(request, env, rawBody) {
  const contentType = request.headers.get('Content-Type') || '';
  if (!contentType.toLowerCase().startsWith('application/x-www-form-urlencoded')) {
    return { ok: false, status: 415, error: 'unsupported_media_type' };
  }
  if (new TextEncoder().encode(rawBody).byteLength > 65_536) {
    return { ok: false, status: 413, error: 'payload_too_large' };
  }
  if (!hasStrongSecret(env.DIGISTORE_IPN_PASSPHRASE_TEST)) {
    return { ok: false, status: 503, error: 'digistore_signature_not_configured' };
  }

  const parsed = parseDigistorePayload(rawBody);
  if (!parsed.ok) return { ok: false, status: 400, error: parsed.error };
  const { payload } = parsed;
  const signatureFields = ['sha_sign', 'SHASIGN']
    .filter(key => Object.prototype.hasOwnProperty.call(payload, key));
  if (signatureFields.length !== 1) {
    return { ok: false, status: signatureFields.length > 1 ? 400 : 401, error: signatureFields.length > 1 ? 'ambiguous_signature' : 'invalid_signature' };
  }
  const received = String(payload[signatureFields[0]] || '').toUpperCase();
  if (!/^[A-F0-9]{128}$/.test(received)) {
    return { ok: false, status: 401, error: 'invalid_signature' };
  }
  const expected = await digistoreSignature(payload, env.DIGISTORE_IPN_PASSPHRASE_TEST);
  if (!timingSafeEqual(received, expected)) {
    return { ok: false, status: 401, error: 'invalid_signature' };
  }
  return { ok: true, payload };
}

async function handleVerify(request, env) {
  if (!env.ACCESS_CODES || !hasStrongSecret(env.JWT_SECRET)) {
    return json({ ok: false, error: 'access_backend_not_configured' }, 503);
  }
  const body = await request.json().catch(() => ({}));
  const code = normalizeDigistoreLoginKey(body.code);
  if (!code) return json({ ok: false, error: 'missing_code' }, 400);

  const ipHash = await sha256Hex(clientIp(request));
  const exactCodeHash = await sha256Hex(code);
  const [ipLimit, codeLimit] = await Promise.all([
    enforceRateLimit(env, `rate:verify:ip:${ipHash}`, 40, 600),
    enforceRateLimit(env, `rate:verify:code:${exactCodeHash}`, 12, 600),
  ]);
  if (!ipLimit.allowed || !codeLimit.allowed) {
    const retryAfter = Math.ceil((Math.max(ipLimit.resetAt, codeLimit.resetAt) - Date.now()) / 1000);
    return json({ ok: false, error: 'rate_limited' }, 429, { 'Retry-After': String(Math.max(1, retryAfter)) });
  }

  let codeHash = exactCodeHash;
  let storageKey = `code-hash:${codeHash}`;
  let stored = await env.ACCESS_CODES.get(storageKey, 'json');
  if (!stored) {
    const legacyCode = normalizeCode(code);
    if (!isPlausibleAccessCode(legacyCode)) {
      return json({ ok: false, valid: false, error: 'invalid_code_format' }, 400);
    }
    stored = await env.ACCESS_CODES.get(legacyCode, 'json');
    if (!stored) return json({ ok: false, valid: false, error: 'invalid_code' }, 404);
    codeHash = await sha256Hex(legacyCode);
    storageKey = legacyCode;
  } else if (!isPlausibleDigistoreLicenseKey(code)) {
    return json({ ok: false, valid: false, error: 'invalid_code_format' }, 400);
  }

  if (stored.revoked || stored.active === false) return json({ ok: false, valid: false, error: 'revoked_code' }, 403);
  if (stored.expiresAt && Date.now() > new Date(stored.expiresAt).getTime()) {
    return json({ ok: false, valid: false, error: 'expired_code' }, 403);
  }

  const now = new Date().toISOString();
  stored.lastUsedAt = now;
  stored.uses = (stored.uses || 0) + 1;
  await env.ACCESS_CODES.put(storageKey, JSON.stringify(stored));
  if (!storageKey.startsWith('code-hash:')) {
    await rememberCodeHashIndex(env, storageKey, {
      plan: stored.plan || 'pro',
      orderIdHash: stored.orderIdHash || null,
      sessionVersion: Number.isInteger(stored.sessionVersion) ? stored.sessionVersion : 1,
    });
  }
  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + SESSION_TTL_SECONDS;
  const sessionVersion = Number.isInteger(stored.sessionVersion) ? stored.sessionVersion : 1;
  const accessToken = await signAccessToken({
    sub: codeHash,
    codeHash,
    plan: stored.plan || 'pro',
    sessionVersion,
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
  if (!env.ACCESS_CODES || !hasStrongSecret(env.JWT_SECRET)) {
    return { response: json({ ok: false, error: 'access_backend_not_configured' }, 503) };
  }
  const token = request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
  const payload = await verifyAccessToken(token, env);
  if (!payload) return { response: json({ ok: false, error: 'unauthorized' }, 401) };
  if (!payload.codeHash) return { response: json({ ok: false, error: 'unauthorized' }, 401) };

  const index = await env.ACCESS_CODES.get(`code-hash:${payload.codeHash}`, 'json').catch(() => null);
  if (!index) return { response: json({ ok: false, error: 'access_revoked' }, 403) };

  const stored = index.code
    ? await env.ACCESS_CODES.get(index.code, 'json').catch(() => null)
    : index;
  if (!stored) {
    return { response: json({ ok: false, error: 'access_revoked' }, 403) };
  }
  const currentSessionVersion = Number.isInteger(stored.sessionVersion) ? stored.sessionVersion : 1;
  if (payload.sessionVersion !== currentSessionVersion) {
    return { response: json({ ok: false, error: 'session_revoked' }, 403) };
  }
  if (stored.revoked || stored.active === false) {
    return { response: json({ ok: false, error: 'access_revoked' }, 403) };
  }
  if (stored.expiresAt && Date.now() > new Date(stored.expiresAt).getTime()) {
    return { response: json({ ok: false, error: 'access_expired' }, 403) };
  }

  payload.plan = stored.plan || payload.plan || 'pro';
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
  await rememberCodeHashIndex(env, code, { plan: payload.plan, orderIdHash });
  if (orderIdHash) {
    await env.ACCESS_CODES.put(`order:${orderIdHash}`, JSON.stringify({ code, plan: payload.plan, createdAt: payload.createdAt }));
  }
  return json({ ok: true, code, payload });
}

function parseDigistorePayload(rawBody) {
  const payload = Object.create(null);
  const canonicalNames = new Map();
  for (const [key, value] of new URLSearchParams(rawBody)) {
    if (Object.prototype.hasOwnProperty.call(payload, key)) {
      return { ok: false, error: 'duplicate_parameter' };
    }
    const canonicalName = key.toLowerCase().replaceAll('_', '');
    if (canonicalNames.has(canonicalName)) {
      return {
        ok: false,
        error: canonicalName === 'shasign' ? 'ambiguous_signature' : 'ambiguous_parameter',
      };
    }
    canonicalNames.set(canonicalName, key);
    payload[key] = value;
  }
  return { ok: true, payload };
}

async function digistoreSignature(payload, passphrase) {
  const signatureInput = Object.keys(payload)
    .filter(key => !['sha_sign', 'SHASIGN'].includes(key))
    .filter(key => payload[key] !== '')
    .sort((left, right) => (left < right ? -1 : left > right ? 1 : 0))
    .map(key => `${key}=${payload[key]}${passphrase}`)
    .join('');
  return sha512HexUpper(signatureInput);
}

function digistoreEventType(payload) {
  return String(payload.event || 'unknown').trim().toLowerCase();
}

function isPurchaseEvent(eventType) {
  return eventType === 'on_payment';
}

function isRevocationEvent(eventType) {
  return new Set(['on_refund', 'on_chargeback', 'on_payment_missed']).has(eventType);
}

function isTerminalCommerceState(orderState) {
  return orderState?.terminal === true
    || ['refunded', 'chargeback', 'manual_review'].includes(orderState?.status);
}

function extractOrderId(payload) {
  return String(payload.order_id || '').trim();
}

function extractTransactionId(payload) {
  return String(payload.transaction_id || '').trim();
}

function configuredDigistoreProductIds(env) {
  const ids = String(env.DIGISTORE_PRODUCT_IDS || '')
    .split(',')
    .map(value => value.trim())
    .filter(Boolean);
  if (new Set(ids).size !== ids.length) return null;
  return ids;
}

function configuredDigistoreProductPlans(env) {
  const plans = new Map();
  const entries = String(env.DIGISTORE_PRODUCT_PLANS || '')
    .split(',')
    .map(value => value.trim())
    .filter(Boolean);
  for (const entry of entries) {
    const separator = entry.indexOf('=');
    if (separator <= 0 || separator !== entry.lastIndexOf('=')) return null;
    const productId = entry.slice(0, separator).trim();
    const plan = entry.slice(separator + 1).trim().toLowerCase();
    if (!productId || !['pro', 'plus'].includes(plan) || plans.has(productId)) return null;
    plans.set(productId, plan);
  }
  return plans;
}

function allowedDigistoreProduct(env, productId) {
  const ids = configuredDigistoreProductIds(env);
  return Boolean(ids?.length && ids.includes(String(productId || '').trim()));
}

function configuredDigistoreProductPlan(env, productId) {
  const plans = configuredDigistoreProductPlans(env);
  return plans?.get(String(productId || '').trim()) || null;
}

function hasConfiguredDigistoreProductContract(env) {
  const ids = configuredDigistoreProductIds(env);
  const plans = configuredDigistoreProductPlans(env);
  return Boolean(ids?.length && plans && ids.every(productId => plans.has(productId)));
}

async function webhookEventKey(transactionId, eventType) {
  return `event:${await sha256Hex(`${transactionId}:${eventType}`)}`;
}

async function rememberWebhookEvent(env, key, value) {
  await env.ACCESS_CODES.put(key, JSON.stringify({ ...value, processedAt: new Date().toISOString() }), {
    expirationTtl: 60 * 60 * 24 * 180,
  });
}

function accessExpiryAtLeastThreeYears(createdAt) {
  const expiresAt = new Date(createdAt);
  expiresAt.setUTCFullYear(expiresAt.getUTCFullYear() + 3);
  return expiresAt.toISOString();
}

async function putDigistoreAccessRecord(env, codeHash, payload) {
  if (!env.ACCESS_CODES) throw new Error('ACCESS_CODES binding missing');
  if (!/^[a-f0-9]{64}$/.test(codeHash || '')) throw new Error('invalid_code_hash');
  await env.ACCESS_CODES.put(`code-hash:${codeHash}`, JSON.stringify({ ...payload, codeHash }));
}

async function putDigistoreOrderIndex(env, orderIdHash, codeHash, payload) {
  if (!env.ACCESS_CODES) throw new Error('ACCESS_CODES binding missing');
  if (!/^[a-f0-9]{64}$/.test(orderIdHash || '')) throw new Error('invalid_order_id_hash');
  if (!/^[a-f0-9]{64}$/.test(codeHash || '')) throw new Error('invalid_code_hash');
  await env.ACCESS_CODES.put(`order:${orderIdHash}`, JSON.stringify({ ...payload, codeHash }));
}

async function revokeOrderAccess(env, orderIdHash, reason) {
  const index = await env.ACCESS_CODES.get(`order:${orderIdHash}`, 'json');
  if (!index || !index.codeHash) return { revoked: false, orderIdHash };

  const stored = await env.ACCESS_CODES.get(`code-hash:${index.codeHash}`, 'json');
  if (!stored) return { revoked: false, orderIdHash, codeMissing: true };

  if (stored.revoked === true && stored.active === false && stored.revocationReason === reason) {
    return { revoked: true, orderIdHash, codeHash: index.codeHash };
  }

  stored.revoked = true;
  stored.active = false;
  stored.sessionVersion = (Number.isInteger(stored.sessionVersion) ? stored.sessionVersion : 1) + 1;
  stored.revokedAt = new Date().toISOString();
  stored.revocationReason = reason;
  await env.ACCESS_CODES.put(`code-hash:${index.codeHash}`, JSON.stringify(stored));
  return { revoked: true, orderIdHash, codeHash: index.codeHash };
}

async function reactivateMissedPaymentAccess(env, orderIdHash, index) {
  const stored = await env.ACCESS_CODES.get(`code-hash:${index.codeHash}`, 'json');
  if (stored?.active === true && stored.reactivatedFrom === 'on_payment_missed') {
    return {
      action: 'purchase_access_reactivated',
      orderIdHash,
      codeHash: index.codeHash,
      plan: index.plan || stored.plan || 'pro',
    };
  }
  if (!stored || stored.revocationReason !== 'on_payment_missed') return null;
  stored.revoked = false;
  stored.active = true;
  stored.sessionVersion = (Number.isInteger(stored.sessionVersion) ? stored.sessionVersion : 1) + 1;
  stored.reactivatedAt = new Date().toISOString();
  stored.reactivatedFrom = 'on_payment_missed';
  delete stored.revokedAt;
  delete stored.revocationReason;
  await env.ACCESS_CODES.put(`code-hash:${index.codeHash}`, JSON.stringify(stored));
  return {
    action: 'purchase_access_reactivated',
    orderIdHash,
    codeHash: index.codeHash,
    plan: index.plan || stored.plan || 'pro',
  };
}

function completedCommerceEvent(operation, result, httpStatus = 200) {
  return {
    status: 'complete',
    eventFingerprint: operation.eventFingerprint,
    orderIdHash: operation.orderIdHash,
    licenseKeyHash: operation.licenseKeyHash || null,
    httpStatus,
    result,
  };
}

async function processCommerceEvent(state, env, operation) {
  if (!env.ACCESS_CODES) return json({ ok: false, error: 'access_backend_not_configured' }, 503);
  const { eventKey, eventType, orderIdHash } = operation;
  if (
    !/^event:[a-f0-9]{64}$/.test(eventKey || '')
    || !/^[a-f0-9]{64}$/.test(orderIdHash || '')
    || !/^[a-f0-9]{64}$/.test(operation.eventFingerprint || '')
  ) {
    return json({ ok: false, error: 'invalid_commerce_operation' }, 400);
  }
  const orderStateKey = `order:${orderIdHash}`;
  const conflictStateKey = `conflict:${operation.eventFingerprint}`;
  const priorConflict = await state.storage.get(conflictStateKey);
  if (priorConflict?.status === 'complete') {
    const httpStatus = Number.isInteger(priorConflict.httpStatus) ? priorConflict.httpStatus : 409;
    return json({ ok: false, ...priorConflict.result }, httpStatus);
  }
  const priorEvent = await state.storage.get(eventKey);
  if (priorEvent?.status === 'complete') {
    if (priorEvent.eventFingerprint === operation.eventFingerprint) {
      const httpStatus = Number.isInteger(priorEvent.httpStatus) ? priorEvent.httpStatus : 200;
      return json({ ok: httpStatus < 400, ...priorEvent.result }, httpStatus);
    }
    if (
      isPurchaseEvent(eventType)
      && priorEvent.orderIdHash === orderIdHash
      && priorEvent.licenseKeyHash
      && priorEvent.licenseKeyHash !== operation.licenseKeyHash
    ) {
      const orderState = await state.storage.get(orderStateKey);
      const revoked = await revokeOrderAccess(env, orderIdHash, 'order_license_conflict');
      if (orderState) {
        await state.storage.put(orderStateKey, { ...orderState, status: 'manual_review', manualReview: true });
      }
      const result = {
        action: 'manual_review',
        state: 'MANUAL_REVIEW',
        error: 'order_license_conflict',
        eventType,
        orderIdHash,
        revoked: revoked.revoked === true,
      };
      await state.storage.put(conflictStateKey, completedCommerceEvent(operation, result, 409));
      return json({ ok: false, ...result }, 409);
    }
    return json({ ok: false, error: 'event_payload_conflict', eventType }, 409);
  }
  await state.storage.put(eventKey, {
    status: 'pending',
    eventType,
    eventFingerprint: operation.eventFingerprint,
    orderIdHash,
    licenseKeyHash: operation.licenseKeyHash || null,
  });

  if (isRevocationEvent(eventType)) {
    let orderState = await state.storage.get(orderStateKey);
    if (!orderState) {
      const legacyIndex = await env.ACCESS_CODES.get(`order:${orderIdHash}`, 'json');
      if (legacyIndex?.codeHash) orderState = { ...legacyIndex, status: 'active' };
    }
    if (isTerminalCommerceState(orderState)) {
      const result = {
        action: 'revocation_ignored_terminal',
        state: String(orderState.status).toUpperCase(),
        eventType,
        orderIdHash,
        revoked: true,
      };
      await state.storage.put(eventKey, completedCommerceEvent(operation, result));
      await rememberWebhookEvent(env, eventKey, result);
      return json({ ok: true, ...result });
    }
    const revocation = await revokeOrderAccess(env, orderIdHash, eventType);
    const nextStatus = eventType === 'on_refund'
      ? 'refunded'
      : eventType === 'on_chargeback'
        ? 'chargeback'
        : 'payment_missed';
    await state.storage.put(orderStateKey, {
      ...(orderState || {}),
      status: nextStatus,
      terminal: eventType === 'on_refund' || eventType === 'on_chargeback',
      updatedAt: new Date().toISOString(),
    });
    const result = {
      action: 'revocation',
      state: nextStatus.toUpperCase(),
      eventType,
      orderIdHash,
      ...revocation,
    };
    const httpStatus = revocation.revoked ? 200 : 202;
    await state.storage.put(eventKey, completedCommerceEvent(operation, result, httpStatus));
    await rememberWebhookEvent(env, eventKey, result);
    return json({ ok: true, ...result }, httpStatus);
  }

  if (eventType !== 'on_payment' || !['pro', 'plus'].includes(operation.plan)) {
    return json({ ok: false, error: 'invalid_commerce_operation' }, 400);
  }
  if (!/^[a-f0-9]{64}$/.test(operation.licenseKeyHash || '')) {
    return json({ ok: false, error: 'invalid_license_key_hash' }, 400);
  }

  let orderState = await state.storage.get(orderStateKey);
  if (!orderState) {
    const legacyIndex = await env.ACCESS_CODES.get(`order:${orderIdHash}`, 'json');
    if (legacyIndex?.codeHash) {
      orderState = { ...legacyIndex, status: 'active' };
      await state.storage.put(orderStateKey, orderState);
    }
  }

  if (orderState?.terminal === true && ['refunded', 'chargeback'].includes(orderState.status)) {
    const codeHash = operation.licenseKeyHash;
    if (orderState.codeHash && orderState.codeHash !== codeHash) {
      const result = {
        action: 'manual_review',
        state: 'MANUAL_REVIEW',
        error: 'order_license_conflict',
        eventType,
        orderIdHash,
        revoked: true,
      };
      await state.storage.put(orderStateKey, {
        ...orderState,
        status: 'manual_review',
        terminal: true,
        terminalState: orderState.status,
        manualReview: true,
      });
      await state.storage.put(eventKey, completedCommerceEvent(operation, result, 409));
      return json({ ok: false, ...result }, 409);
    }
    const licenseStateKey = `license:${codeHash}`;
    const licenseState = await state.storage.get(licenseStateKey);
    if (licenseState?.orderIdHash && licenseState.orderIdHash !== orderIdHash) {
      const result = {
        action: 'license_key_reuse_blocked',
        error: 'license_key_already_linked',
        state: orderState.status.toUpperCase(),
        eventType,
        orderIdHash,
      };
      await state.storage.put(eventKey, completedCommerceEvent(operation, result, 409));
      return json({ ok: false, ...result }, 409);
    }
    if (!licenseState) {
      await state.storage.put(licenseStateKey, { orderIdHash, claimedAt: new Date().toISOString() });
    }
    if (!orderState.codeHash) {
      orderState = { ...orderState, codeHash, plan: operation.plan };
      await state.storage.put(orderStateKey, orderState);
    }
    const result = {
      action: 'late_payment_ignored',
      state: orderState.status.toUpperCase(),
      eventType,
      orderIdHash,
    };
    await state.storage.put(eventKey, completedCommerceEvent(operation, result));
    await rememberWebhookEvent(env, eventKey, result);
    return json({ ok: true, ...result });
  }

  if (orderState?.status === 'payment_missed' && orderState.codeHash) {
    if (orderState.codeHash !== operation.licenseKeyHash) {
      const result = {
        action: 'manual_review',
        state: 'MANUAL_REVIEW',
        error: 'order_license_conflict',
        eventType,
        orderIdHash,
        revoked: true,
      };
      await state.storage.put(orderStateKey, { ...orderState, status: 'manual_review', manualReview: true });
      await state.storage.put(eventKey, completedCommerceEvent(operation, result, 409));
      return json({ ok: false, ...result }, 409);
    }
    const reactivated = await reactivateMissedPaymentAccess(env, orderIdHash, orderState);
    if (!reactivated) {
      const result = {
        action: 'manual_review',
        state: 'MANUAL_REVIEW',
        error: 'reactivation_state_mismatch',
        eventType,
        orderIdHash,
      };
      await state.storage.put(orderStateKey, { ...orderState, status: 'manual_review', manualReview: true });
      await state.storage.put(eventKey, completedCommerceEvent(operation, result, 409));
      return json({ ok: false, ...result }, 409);
    }
    const result = { ...reactivated, state: 'ACTIVE', eventType };
    await state.storage.put(orderStateKey, {
      ...orderState,
      status: 'active',
      terminal: false,
      reactivatedAt: new Date().toISOString(),
    });
    await state.storage.put(eventKey, completedCommerceEvent(operation, result));
    await rememberWebhookEvent(env, eventKey, result);
    return json({ ok: true, ...result });
  }

  if (orderState?.status === 'active' && orderState.codeHash) {
    if (orderState.codeHash !== operation.licenseKeyHash) {
      const revoked = await revokeOrderAccess(env, orderIdHash, 'order_license_conflict');
      const result = {
        action: 'manual_review',
        state: 'MANUAL_REVIEW',
        error: 'order_license_conflict',
        eventType,
        orderIdHash,
        revoked: revoked.revoked === true,
      };
      await state.storage.put(orderStateKey, { ...orderState, status: 'manual_review', manualReview: true });
      await state.storage.put(eventKey, completedCommerceEvent(operation, result, 409));
      await rememberWebhookEvent(env, eventKey, result);
      return json({ ok: false, ...result }, 409);
    }
    const result = {
      action: 'purchase_duplicate_order',
      eventType,
      orderIdHash,
      codeHash: orderState.codeHash,
      plan: orderState.plan || operation.plan,
    };
    await state.storage.put(eventKey, completedCommerceEvent(operation, result));
    await rememberWebhookEvent(env, eventKey, result);
    return json({ ok: true, duplicateOrder: true, ...result });
  }

  if (orderState?.status === 'manual_review') {
    const result = {
      action: 'manual_review',
      state: 'MANUAL_REVIEW',
      error: 'order_requires_manual_review',
      eventType,
      orderIdHash,
    };
    await state.storage.put(eventKey, completedCommerceEvent(operation, result, 409));
    return json({ ok: false, ...result }, 409);
  }

  const codeHash = operation.licenseKeyHash;
  const licenseStateKey = `license:${codeHash}`;
  const licenseState = await state.storage.get(licenseStateKey);
  if (licenseState?.orderIdHash && licenseState.orderIdHash !== orderIdHash) {
    const result = {
      action: 'license_key_reuse_blocked',
      error: 'license_key_already_linked',
      eventType,
      orderIdHash,
    };
    await state.storage.put(eventKey, completedCommerceEvent(operation, result, 409));
    await rememberWebhookEvent(env, eventKey, result);
    return json({ ok: false, ...result }, 409);
  }
  const existingAccess = await env.ACCESS_CODES.get(`code-hash:${codeHash}`, 'json');
  if (existingAccess) {
    const existingOrderIdHash = String(existingAccess.orderIdHash || '');
    if (existingOrderIdHash !== orderIdHash) {
      const result = {
        action: 'license_key_reuse_blocked',
        error: 'license_key_already_linked',
        eventType,
        orderIdHash,
      };
      await state.storage.put(eventKey, completedCommerceEvent(operation, result, 409));
      await rememberWebhookEvent(env, eventKey, result);
      return json({ ok: false, ...result }, 409);
    }
    const migratedOrder = {
      codeHash,
      plan: existingAccess.plan || operation.plan,
      createdAt: existingAccess.createdAt || new Date().toISOString(),
      status: existingAccess.active === false || existingAccess.revoked ? 'manual_review' : 'active',
    };
    await putDigistoreOrderIndex(env, orderIdHash, codeHash, {
      plan: migratedOrder.plan,
      createdAt: migratedOrder.createdAt,
    });
    await state.storage.put(licenseStateKey, { orderIdHash, migratedAt: new Date().toISOString() });
    await state.storage.put(orderStateKey, migratedOrder);
    const result = {
      action: 'purchase_duplicate_order',
      eventType,
      orderIdHash,
      codeHash,
      plan: migratedOrder.plan,
    };
    await state.storage.put(eventKey, completedCommerceEvent(operation, result));
    return json({ ok: true, duplicateOrder: true, ...result });
  }

  const createdAt = new Date().toISOString();
  const pendingOrder = { codeHash, plan: operation.plan, createdAt, status: 'pending' };
  await state.storage.put(licenseStateKey, { orderIdHash, claimedAt: createdAt });
  await state.storage.put(orderStateKey, pendingOrder);
  await putDigistoreAccessRecord(env, codeHash, {
    plan: operation.plan,
    orderIdHash,
    createdAt,
    expiresAt: accessExpiryAtLeastThreeYears(createdAt),
    source: 'digistore24',
    active: true,
    revoked: false,
    sessionVersion: 1,
    uses: 0,
  });
  await putDigistoreOrderIndex(env, orderIdHash, codeHash, {
    plan: operation.plan,
    createdAt,
  });
  await state.storage.put(orderStateKey, { ...pendingOrder, status: 'active' });
  const result = {
    action: 'purchase_access_activated',
    state: 'ACTIVE',
    eventType,
    codeHash,
    plan: operation.plan,
    orderIdHash,
  };
  await state.storage.put(eventKey, completedCommerceEvent(operation, result));
  await rememberWebhookEvent(env, eventKey, result);
  return json({ ok: true, ...result });
}

async function handleDigistoreWebhook(request, env) {
  const rawBody = await request.text();
  const verification = await verifyDigistoreRequest(request, env, rawBody);
  if (!verification.ok) return json({ ok: false, error: verification.error }, verification.status);

  const payload = verification.payload;
  const apiMode = String(payload.api_mode || '').trim().toLowerCase();
  if (!['test', 'live'].includes(apiMode)) return json({ ok: false, error: 'invalid_api_mode' }, 400);
  if (apiMode === 'live') return json({ ok: false, error: 'live_ipn_disabled' }, 403);

  const eventType = digistoreEventType(payload);
  if (eventType === 'connection_test') return digistoreAcknowledgement();
  if (!env.ACCESS_CODES) return json({ ok: false, error: 'access_backend_not_configured' }, 503);
  if (!isPurchaseEvent(eventType) && !isRevocationEvent(eventType)) {
    return json({ ok: false, error: 'unsupported_event', eventType }, 400);
  }
  if (!allowedDigistoreProduct(env, payload.product_id)) {
    return json({ ok: false, error: 'product_not_allowed' }, 403);
  }
  const configuredPlan = configuredDigistoreProductPlan(env, payload.product_id);
  if (!configuredPlan) {
    return json({ ok: false, error: 'product_plan_not_configured' }, 503);
  }
  const plan = isPurchaseEvent(eventType) ? configuredPlan : null;

  const orderId = extractOrderId(payload);
  const transactionId = extractTransactionId(payload);
  if (!orderId) return json({ ok: false, error: 'missing_order_id' }, 400);
  if (!transactionId) return json({ ok: false, error: 'missing_transaction_id' }, 400);
  if (!env.COMMERCE_COORDINATOR) {
    return json({ ok: false, error: 'commerce_coordinator_not_configured' }, 503);
  }

  const orderIdHash = await sha256Hex(orderId);
  let licenseKeyHash = null;
  if (isPurchaseEvent(eventType)) {
    const rawLicenseKey = String(payload.license_key || '');
    if (!rawLicenseKey) return json({ ok: false, error: 'missing_license_key' }, 400);
    if (rawLicenseKey !== rawLicenseKey.trim() || !isPlausibleDigistoreLicenseKey(rawLicenseKey)) {
      return json({ ok: false, error: 'invalid_license_key' }, 400);
    }
    licenseKeyHash = await sha256Hex(rawLicenseKey);
  }
  const productIdHash = await sha256Hex(String(payload.product_id || '').trim());
  const eventFingerprint = await sha256Hex([
    apiMode,
    eventType,
    orderIdHash,
    productIdHash,
    plan || '',
    licenseKeyHash || '',
  ].join(':'));
  const operation = {
    eventKey: await webhookEventKey(transactionId, eventType),
    eventFingerprint,
    eventType,
    orderIdHash,
    licenseKeyHash,
    plan,
  };
  const id = env.COMMERCE_COORDINATOR.idFromName(`digistore24-commerce:${apiMode}`);
  const commerceResponse = await env.COMMERCE_COORDINATOR.get(id).fetch(new Request(
    'https://commerce-coordinator.internal/process',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(operation),
    },
  ));
  if (commerceResponse.status < 200 || commerceResponse.status >= 300) return commerceResponse;
  const result = await commerceResponse.json().catch(() => null);
  if (!result?.ok) return json({ ok: false, error: 'invalid_commerce_response' }, 502);
  return digistoreAcknowledgement(commerceResponse.status);
}

function handleHealth(env) {
  const configured = Boolean(
    env.ACCESS_CODES
    && env.PROTECTED_CONTENT
    && env.COMMERCE_COORDINATOR
    && hasStrongSecret(env.JWT_SECRET)
    && hasStrongSecret(env.ADMIN_SECRET)
    && hasStrongSecret(env.DIGISTORE_IPN_PASSPHRASE_TEST)
    && hasConfiguredDigistoreProductContract(env)
  );
  return json({ ok: configured, service: 'ihk-access-worker', configured }, configured ? 200 : 503);
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS });
    const url = new URL(request.url);

    try {
      if (url.pathname === '/health' && request.method === 'GET') return handleHealth(env);
      if (url.pathname === '/verify-code' && request.method === 'POST') return handleVerify(request, env);
      if (url.pathname === '/admin/create-code' && request.method === 'POST') return handleCreateCode(request, env);
      if (url.pathname === '/digistore/ipn' && request.method === 'POST') return handleDigistoreWebhook(request, env);
      if (url.pathname === '/content/tasks' && request.method === 'GET') return handleTaskList(request, env);
      if (url.pathname.startsWith('/content/tasks/') && request.method === 'GET') {
        return handleTaskDetail(request, env, decodeURIComponent(url.pathname.replace('/content/tasks/', '')));
      }
      return json({ ok: false, error: 'not_found' }, 404);
    } catch (error) {
      console.error('Worker request failed:', error);
      return json({ ok: false, error: 'server_error' }, 500);
    }
  },
};
