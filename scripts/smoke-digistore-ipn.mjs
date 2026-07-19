import { createHash, webcrypto } from 'node:crypto';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const workerPath = new URL('../cloudflare-worker/src/worker.js', import.meta.url);

class KVNamespace {
  constructor(initial = {}) {
    this.values = new Map(Object.entries(initial));
  }

  async get(key, type) {
    const value = this.values.get(key);
    if (value === undefined) return null;
    return type === 'json' ? JSON.parse(value) : value;
  }

  async put(key, value) {
    this.values.set(key, String(value));
  }

  async delete(key) {
    this.values.delete(key);
  }

  async list({ prefix = '' } = {}) {
    return {
      keys: [...this.values.keys()].filter(key => key.startsWith(prefix)).map(name => ({ name })),
      list_complete: true,
    };
  }

  snapshot() {
    return [...this.values.entries()];
  }
}

class FailOnceKVNamespace extends KVNamespace {
  constructor(failKey, initial = {}) {
    super(initial);
    this.failKey = failKey;
    this.failed = false;
  }

  async put(key, value) {
    if (!this.failed && key === this.failKey) {
      this.failed = true;
      throw new Error('fixture_order_index_write_failure');
    }
    return super.put(key, value);
  }
}

class DurableObjectStorage {
  constructor() {
    this.values = new Map();
  }

  async get(key) {
    return this.values.get(key);
  }

  async put(key, value) {
    this.values.set(key, structuredClone(value));
  }

  snapshot() {
    return [...this.values.entries()];
  }
}

class DurableObjectNamespace {
  constructor(ClassReference, env) {
    this.ClassReference = ClassReference;
    this.env = env;
    this.instances = new Map();
  }

  idFromName(name) {
    return name;
  }

  get(id) {
    if (!this.instances.has(id)) {
      const state = { storage: new DurableObjectStorage() };
      this.instances.set(id, { state, instance: new this.ClassReference(state, this.env) });
    }
    return { fetch: request => this.instances.get(id).instance.fetch(request) };
  }

  snapshot() {
    return [...this.instances.entries()].map(([id, entry]) => [id, entry.state.storage.snapshot()]);
  }
}

function loadWorker(workerConsole) {
  let source = readFileSync(workerPath, 'utf8');
  source = source
    .replace('export class CommerceCoordinator', 'class CommerceCoordinator')
    .replace('export default {', 'const worker = {');
  source += '\nglobalThis.__workerExports = { worker, CommerceCoordinator };\n';
  const context = vm.createContext({
    crypto: webcrypto,
    Request,
    Response,
    Headers,
    URL,
    URLSearchParams,
    TextEncoder,
    TextDecoder,
    structuredClone,
    atob: value => Buffer.from(value, 'base64').toString('binary'),
    btoa: value => Buffer.from(value, 'binary').toString('base64'),
    console: workerConsole,
  });
  vm.runInContext(source, context, { filename: 'worker.js' });
  return context.__workerExports;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function fixtureSecret(label) {
  return `${label}-fixture-${'x'.repeat(48)}`;
}

function referenceSignature(parameters, passphrase) {
  const input = Object.entries(parameters)
    .filter(([key, value]) => !['sha_sign', 'SHASIGN'].includes(key) && value !== '')
    .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
    .map(([key, value]) => `${key}=${String(value)}${passphrase}`)
    .join('');
  return createHash('sha512').update(input, 'utf8').digest('hex').toUpperCase();
}

function signedBody(parameters, passphrase, signatureField = 'sha_sign') {
  const payload = { ...parameters };
  payload[signatureField] = referenceSignature(payload, passphrase);
  return new URLSearchParams(payload).toString();
}

const capturedWorkerLogs = [];
const workerConsole = Object.fromEntries(
  ['log', 'info', 'warn', 'error'].map(level => [level, (...values) => {
    capturedWorkerLogs.push([level, ...values.map(String)]);
  }]),
);
const { worker, CommerceCoordinator } = loadWorker(workerConsole);

function createEnv(overrides = {}) {
  const env = {
    ACCESS_CODES: new KVNamespace(),
    PROTECTED_CONTENT: new KVNamespace({
      'tasks/aufgaben-optimiert.json': JSON.stringify({
        aufgaben: [{ id: 'task-1', titel: 'Fixture' }],
      }),
    }),
    JWT_SECRET: fixtureSecret('jwt'),
    ADMIN_SECRET: fixtureSecret('admin'),
    DIGISTORE_IPN_PASSPHRASE_TEST: fixtureSecret('ipn'),
    DIGISTORE_PRODUCT_IDS: 'product-test-pro,product-test-plus',
    DIGISTORE_PRODUCT_PLANS: 'product-test-pro=pro,product-test-plus=plus',
    ...overrides,
  };
  env.COMMERCE_COORDINATOR = new DurableObjectNamespace(CommerceCoordinator, env);
  return env;
}

async function callIpn(env, parameters = {}, options = {}) {
  const body = options.rawBody ?? signedBody(
    parameters,
    options.passphrase ?? env.DIGISTORE_IPN_PASSPHRASE_TEST,
    options.signatureField ?? 'sha_sign',
  );
  return worker.fetch(new Request('https://worker.test/digistore/ipn', {
    method: 'POST',
    headers: { 'Content-Type': options.contentType ?? 'application/x-www-form-urlencoded' },
    body,
  }), env);
}

async function expectAck(response, status, label) {
  assert(response.status === status, `${label}: expected HTTP ${status}, got ${response.status}`);
  assert(response.headers.get('content-type') === 'text/plain', `${label}: content-type must be exactly text/plain`);
  assert(await response.text() === 'OK', `${label}: body must be exactly OK`);
}

async function expectError(response, status, error, label) {
  assert(response.status === status, `${label}: expected HTTP ${status}, got ${response.status}`);
  const payload = await response.json();
  assert(payload.ok === false, `${label}: error response must be fail-closed`);
  assert(payload.error === error, `${label}: expected ${error}, got ${payload.error}`);
  return payload;
}

async function login(env, code) {
  return worker.fetch(new Request('https://worker.test/verify-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': '203.0.113.10' },
    body: JSON.stringify({ code }),
  }), env);
}

async function protectedTask(env, accessToken) {
  return worker.fetch(new Request('https://worker.test/content/tasks/task-1', {
    headers: { Authorization: `Bearer ${accessToken}` },
  }), env);
}

function sha256(value) {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}

function stateText(env) {
  return JSON.stringify({
    kv: env.ACCESS_CODES.snapshot(),
    durableObjects: env.COMMERCE_COORDINATOR.snapshot(),
  });
}

function containsObjectKey(value, targetKey) {
  if (typeof value === 'string') {
    try {
      return containsObjectKey(JSON.parse(value), targetKey);
    } catch {
      return false;
    }
  }
  if (Array.isArray(value)) return value.some(item => containsObjectKey(item, targetKey));
  if (!value || typeof value !== 'object') return false;
  return Object.entries(value).some(([key, nested]) => key === targetKey || containsObjectKey(nested, targetKey));
}

function stateContainsObjectKey(env, targetKey) {
  return containsObjectKey({
    kv: env.ACCESS_CODES.snapshot(),
    durableObjects: env.COMMERCE_COORDINATOR.snapshot(),
  }, targetKey);
}

const PASSPHRASE = fixtureSecret('ipn');
const LICENSE_KEY = ['Ds24', 'Case', 'Key', 'Order', '100'].join('-');
const SECOND_LICENSE_KEY = ['Ds24', 'Case', 'Key', 'Order', '200'].join('-');
const BUYER_EMAIL = ['buyer', 'example.test'].join('@');
const RAW_ORDER_ID = ['ORDER', '100'].join('-');
const base = {
  api_mode: 'test',
  product_id: 'product-test-pro',
  product_name: 'Fixture Pro',
  email: BUYER_EMAIL,
};

// Pinned from Digistore24's official PHP Generic-IPN receiver example:
// https://www.digistore24.com/download/ipn/examples/ipn/ipn_receiver.php
// Retrieved 2026-07-19; source SHA-256:
// 3b3acc615a274464885248b1917680fc1b0ec61875f737d42b815b29d8822822
const officialFixturePassphrase = 'fixture-passphrase-2026-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
const officialFixtureParameters = {
  Zeta: 'Z',
  alpha: 'A',
  api_mode: 'test',
  empty: '',
  event: 'connection_test',
};
const officialFixtureSignature = 'C723C6CEF004383F2E2B77891697152A57B168FE764A1A3B4473200E5DBBBF4AF750BBC3FC43A749EB02766921D7ABF80C6D39C75F1274992257FBD9E8B54A77';
assert(
  referenceSignature(officialFixtureParameters, officialFixturePassphrase) === officialFixtureSignature,
  'official SHA-512 known-answer fixture must match',
);
const officialEnv = createEnv({ DIGISTORE_IPN_PASSPHRASE_TEST: officialFixturePassphrase });
await expectAck(await callIpn(officialEnv, {}, {
  rawBody: new URLSearchParams({ ...officialFixtureParameters, sha_sign: officialFixtureSignature }).toString(),
}), 200, 'known-answer Generic IPN');

let env = createEnv({ DIGISTORE_IPN_PASSPHRASE_TEST: PASSPHRASE });
await expectAck(await callIpn(env, { event: 'connection_test', api_mode: 'test' }), 200, 'connection test');

let duplicateBody = signedBody({ event: 'connection_test', api_mode: 'test' }, PASSPHRASE);
duplicateBody += '&event=connection_test';
await expectError(await callIpn(env, {}, { rawBody: duplicateBody }), 400, 'duplicate_parameter', 'duplicate parameter');

const oneSignatureBody = signedBody({ event: 'connection_test', api_mode: 'test' }, PASSPHRASE);
const signatureValue = new URLSearchParams(oneSignatureBody).get('sha_sign');
await expectError(
  await callIpn(env, {}, { rawBody: `${oneSignatureBody}&SHASIGN=${signatureValue}` }),
  400,
  'ambiguous_signature',
  'two signature fields',
);

const payment = {
  ...base,
  event: 'on_payment',
  order_id: RAW_ORDER_ID,
  transaction_id: 'TX-100',
  license_key: LICENSE_KEY,
};

const partialWriteOrderId = ['ORDER', 'PARTIAL', 'WRITE'].join('-');
const partialWriteLicenseKey = ['Ds24', 'Partial', 'Write', 'Key'].join('-');
const partialWriteOrderIdHash = sha256(partialWriteOrderId);
const partialWriteCodeHash = sha256(partialWriteLicenseKey);
const partialWriteEnv = createEnv({
  ACCESS_CODES: new FailOnceKVNamespace(`order:${partialWriteOrderIdHash}`),
  DIGISTORE_IPN_PASSPHRASE_TEST: PASSPHRASE,
});
const partialWritePayment = {
  ...base,
  event: 'on_payment',
  order_id: partialWriteOrderId,
  transaction_id: 'TX-PARTIAL-WRITE',
  license_key: partialWriteLicenseKey,
};
let transientWriteError = null;
try {
  await callIpn(partialWriteEnv, partialWritePayment);
} catch (error) {
  transientWriteError = error;
}
assert(
  transientWriteError?.message === 'fixture_order_index_write_failure',
  'first payment must surface the injected transient order-index failure',
);
let partialWriteAccess = await partialWriteEnv.ACCESS_CODES.get(`code-hash:${partialWriteCodeHash}`, 'json');
assert(partialWriteAccess?.active === true, 'partial write fixture must persist access before index failure');
assert(
  await partialWriteEnv.ACCESS_CODES.get(`order:${partialWriteOrderIdHash}`, 'json') === null,
  'partial write fixture must start retry without order index',
);
await expectAck(await callIpn(partialWriteEnv, partialWritePayment), 200, 'payment retry repairs order index');
const repairedOrderIndex = await partialWriteEnv.ACCESS_CODES.get(`order:${partialWriteOrderIdHash}`, 'json');
assert(repairedOrderIndex?.codeHash === partialWriteCodeHash, 'payment retry must repair missing order index');
await expectAck(await callIpn(partialWriteEnv, {
  ...base,
  event: 'on_refund',
  order_id: partialWriteOrderId,
  transaction_id: 'TX-PARTIAL-WRITE-REFUND',
}), 200, 'refund after repaired payment retry');
partialWriteAccess = await partialWriteEnv.ACCESS_CODES.get(`code-hash:${partialWriteCodeHash}`, 'json');
assert(
  partialWriteAccess.revoked === true
    && partialWriteAccess.active === false
    && partialWriteAccess.revocationReason === 'on_refund'
    && partialWriteAccess.sessionVersion === 2,
  'refund after repaired retry must revoke access and invalidate sessions',
);
const validPaymentBody = signedBody(payment, PASSPHRASE);
await expectError(
  await callIpn(env, {}, { rawBody: validPaymentBody.replace('product-test-pro', 'product-tampered') }),
  401,
  'invalid_signature',
  'tampered signed value',
);
assert(!stateText(env).includes(LICENSE_KEY), 'tampered payload must not persist the license key');

const mixedCasePayload = {
  api_mode: 'test',
  event: 'on_payment',
  Product_ID: 'product-test-pro',
  order_id: 'ORDER-MIXED',
  transaction_id: 'TX-MIXED',
  license_key: 'Ds24-Mixed-Case-Key',
};
await expectError(await callIpn(env, mixedCasePayload), 403, 'product_not_allowed', 'mixed-case parameter name');
const caseCollisionPayload = { ...payment, Product_ID: 'product-test-pro' };
await expectError(await callIpn(env, caseCollisionPayload), 400, 'ambiguous_parameter', 'mixed-case parameter collision');

await expectError(
  await callIpn(env, { ...payment, transaction_id: 'TX-WHITESPACE', license_key: ` ${LICENSE_KEY}` }),
  400,
  'invalid_license_key',
  'license key boundary whitespace',
);

await expectError(
  await callIpn(env, { ...payment, transaction_id: 'TX-WRONG-PRODUCT', product_id: 'product-not-allowed' }),
  403,
  'product_not_allowed',
  'wrong product id',
);
const missingPlanEnv = createEnv({
  DIGISTORE_IPN_PASSPHRASE_TEST: PASSPHRASE,
  DIGISTORE_PRODUCT_IDS: 'product-test-pro',
  DIGISTORE_PRODUCT_PLANS: '',
});
await expectError(await callIpn(missingPlanEnv, payment), 503, 'product_plan_not_configured', 'missing product-plan mapping');
await expectError(await callIpn(missingPlanEnv, {
  ...base,
  event: 'on_refund',
  order_id: RAW_ORDER_ID,
  transaction_id: 'TX-MISSING-MAP-REFUND',
}), 503, 'product_plan_not_configured', 'missing product-plan mapping on revocation');
const oldSecretOnlyEnv = createEnv({
  DIGISTORE_IPN_PASSPHRASE_TEST: undefined,
  DIGISTORE_SHA_PASSPHRASE: PASSPHRASE,
});
await expectError(
  await callIpn(oldSecretOnlyEnv, {}, { rawBody: signedBody({ event: 'connection_test', api_mode: 'test' }, PASSPHRASE) }),
  503,
  'digistore_signature_not_configured',
  'staging passphrase contract',
);
await expectError(
  await callIpn(env, { ...payment, api_mode: 'live', transaction_id: 'TX-LIVE' }),
  403,
  'live_ipn_disabled',
  'live IPN gate',
);

await expectAck(await callIpn(env, payment), 200, 'on_payment');
const codeHash = sha256(LICENSE_KEY);
const orderHash = sha256(RAW_ORDER_ID);
let accessRecord = await env.ACCESS_CODES.get(`code-hash:${codeHash}`, 'json');
assert(accessRecord?.active === true && accessRecord.plan === 'pro', 'on_payment must activate mapped pro plan');
assert(accessRecord.orderIdHash === orderHash, 'access record must contain only order hash');
assert(!stateText(env).includes(BUYER_EMAIL), 'buyer email must not be persisted');
assert(!stateText(env).includes(RAW_ORDER_ID), 'raw order id must not be persisted');
assert(!stateText(env).includes(LICENSE_KEY), 'plaintext license key must not be persisted');
assert(!env.ACCESS_CODES.values.has(LICENSE_KEY), 'plaintext license key must not be a KV key');

const replayState = stateText(env);
await expectAck(await callIpn(env, payment), 200, 'identical on_payment replay');
assert(stateText(env) === replayState, 'identical replay must not mutate state');

let response = await login(env, LICENSE_KEY);
assert(response.status === 200, 'active case-sensitive license login must succeed');
let loginPayload = await response.json();
assert(typeof loginPayload.accessToken === 'string', 'login must issue access token');
const activeToken = loginPayload.accessToken;
response = await protectedTask(env, activeToken);
assert(response.status === 200, 'active access token must reach protected content');
response = await login(env, LICENSE_KEY.toLowerCase());
assert(response.status !== 200, 'different license-key case must not authenticate');

const productNameEnv = createEnv({ DIGISTORE_IPN_PASSPHRASE_TEST: PASSPHRASE });
await expectAck(await callIpn(productNameEnv, {
  ...payment,
  order_id: 'ORDER-PRODUCT-NAME',
  transaction_id: 'TX-PRODUCT-NAME',
  product_name: 'Fixture PLUS premium',
}), 200, 'manipulated product_name');
const productNameRecord = await productNameEnv.ACCESS_CODES.get(`code-hash:${codeHash}`, 'json');
assert(productNameRecord.plan === 'pro', 'product_name must not elevate product_id plan');

const conflictEnv = createEnv({ DIGISTORE_IPN_PASSPHRASE_TEST: PASSPHRASE });
await expectAck(await callIpn(conflictEnv, payment), 200, 'conflict fixture payment');
let conflict = await callIpn(conflictEnv, { ...payment, transaction_id: 'TX-101', license_key: SECOND_LICENSE_KEY });
let conflictPayload = await expectError(conflict, 409, 'order_license_conflict', 'same order with another key');
assert(conflictPayload.state === 'MANUAL_REVIEW', 'order/key conflict must enter MANUAL_REVIEW');
accessRecord = await conflictEnv.ACCESS_CODES.get(`code-hash:${codeHash}`, 'json');
assert(accessRecord.revoked === true && accessRecord.active === false, 'order/key conflict must revoke original access');
await expectAck(await callIpn(conflictEnv, {
  ...base,
  event: 'on_payment_missed',
  order_id: RAW_ORDER_ID,
  transaction_id: 'TX-MISSED-AFTER-MANUAL-REVIEW',
}), 200, 'payment missed after manual review');
await expectError(await callIpn(conflictEnv, {
  ...payment,
  transaction_id: 'TX-PAYMENT-AFTER-MANUAL-REVIEW',
}), 409, 'order_requires_manual_review', 'payment after manual review and payment missed');
accessRecord = await conflictEnv.ACCESS_CODES.get(`code-hash:${codeHash}`, 'json');
assert(
  accessRecord.revoked === true && accessRecord.active === false,
  'payment missed must not make manual-review access reactivatable',
);

const reuseEnv = createEnv({ DIGISTORE_IPN_PASSPHRASE_TEST: PASSPHRASE });
await expectAck(await callIpn(reuseEnv, payment), 200, 'license reuse fixture payment');
await expectError(await callIpn(reuseEnv, {
  ...payment,
  order_id: 'ORDER-OTHER',
  transaction_id: 'TX-OTHER',
}), 409, 'license_key_already_linked', 'same license with another order');

const payloadConflictEnv = createEnv({ DIGISTORE_IPN_PASSPHRASE_TEST: PASSPHRASE });
await expectAck(await callIpn(payloadConflictEnv, payment), 200, 'payload conflict fixture payment');
await expectError(await callIpn(payloadConflictEnv, {
  ...payment,
  product_id: 'product-test-plus',
}), 409, 'event_payload_conflict', 'same event identity with changed payload');

const refund = { ...base, event: 'on_refund', order_id: RAW_ORDER_ID, transaction_id: 'TX-REFUND' };
await expectAck(await callIpn(env, refund), 200, 'on_refund');
accessRecord = await env.ACCESS_CODES.get(`code-hash:${codeHash}`, 'json');
assert(accessRecord.revoked === true && accessRecord.sessionVersion === 2, 'refund must revoke and increment sessionVersion');
response = await login(env, LICENSE_KEY);
assert(response.status === 403, 'login after refund must fail');
response = await protectedTask(env, activeToken);
assert(response.status === 403, 'token issued before refund must be invalidated');
assert((await response.json()).error === 'session_revoked', 'old token must fail by sessionVersion');
await expectAck(await callIpn(env, { ...payment, transaction_id: 'TX-LATE-PAYMENT' }), 200, 'late payment after refund');
accessRecord = await env.ACCESS_CODES.get(`code-hash:${codeHash}`, 'json');
assert(accessRecord.revoked === true && accessRecord.active === false, 'late payment must not reactivate terminal refund');
await expectAck(await callIpn(env, {
  ...base,
  event: 'on_payment_missed',
  order_id: RAW_ORDER_ID,
  transaction_id: 'TX-MISSED-AFTER-REFUND',
}), 200, 'payment missed after refund');
await expectAck(await callIpn(env, { ...payment, transaction_id: 'TX-PAYMENT-AFTER-REFUND-MISSED' }), 200, 'payment after refund and payment missed');
accessRecord = await env.ACCESS_CODES.get(`code-hash:${codeHash}`, 'json');
assert(
  accessRecord.revoked === true
    && accessRecord.active === false
    && accessRecord.revocationReason === 'on_refund'
    && accessRecord.sessionVersion === 2,
  'payment missed must not downgrade or reactivate terminal refund',
);

const chargebackEnv = createEnv({ DIGISTORE_IPN_PASSPHRASE_TEST: PASSPHRASE });
await expectAck(await callIpn(chargebackEnv, payment), 200, 'chargeback fixture payment');
await expectAck(await callIpn(chargebackEnv, {
  ...base,
  event: 'on_chargeback',
  order_id: RAW_ORDER_ID,
  transaction_id: 'TX-CHARGEBACK',
}), 200, 'on_chargeback');
accessRecord = await chargebackEnv.ACCESS_CODES.get(`code-hash:${codeHash}`, 'json');
assert(accessRecord.revoked === true && accessRecord.sessionVersion === 2, 'chargeback must revoke and increment sessionVersion');
await expectAck(await callIpn(chargebackEnv, {
  ...base,
  event: 'on_payment_missed',
  order_id: RAW_ORDER_ID,
  transaction_id: 'TX-MISSED-AFTER-CHARGEBACK',
}), 200, 'payment missed after chargeback');
await expectAck(await callIpn(chargebackEnv, {
  ...payment,
  transaction_id: 'TX-PAYMENT-AFTER-CHARGEBACK-MISSED',
}), 200, 'payment after chargeback and payment missed');
accessRecord = await chargebackEnv.ACCESS_CODES.get(`code-hash:${codeHash}`, 'json');
assert(
  accessRecord.revoked === true
    && accessRecord.active === false
    && accessRecord.revocationReason === 'on_chargeback'
    && accessRecord.sessionVersion === 2,
  'payment missed must not downgrade or reactivate terminal chargeback',
);

const missedEnv = createEnv({ DIGISTORE_IPN_PASSPHRASE_TEST: PASSPHRASE });
await expectAck(await callIpn(missedEnv, payment), 200, 'payment-denial fixture payment');
await expectAck(await callIpn(missedEnv, {
  ...base,
  event: 'on_payment_missed',
  order_id: RAW_ORDER_ID,
  transaction_id: 'TX-PAYMENT-MISSED',
}), 200, 'payment denial/on_payment_missed');
accessRecord = await missedEnv.ACCESS_CODES.get(`code-hash:${codeHash}`, 'json');
assert(accessRecord.revoked === true && accessRecord.sessionVersion === 2, 'payment denial must suspend access');
await expectAck(await callIpn(missedEnv, { ...payment, transaction_id: 'TX-REACTIVATE' }), 200, 'payment after nonterminal denial');
accessRecord = await missedEnv.ACCESS_CODES.get(`code-hash:${codeHash}`, 'json');
assert(accessRecord.active === true && accessRecord.sessionVersion === 3, 'same-key payment must reactivate and increment sessionVersion');

const pendingRefundEnv = createEnv({ DIGISTORE_IPN_PASSPHRASE_TEST: PASSPHRASE });
const refundBeforePayment = {
  ...base,
  event: 'on_refund',
  order_id: 'ORDER-PENDING-REFUND',
  transaction_id: 'TX-PENDING-REFUND',
};
await expectAck(await callIpn(pendingRefundEnv, refundBeforePayment), 202, 'refund before payment');
const pendingSnapshot = stateText(pendingRefundEnv);
await expectAck(await callIpn(pendingRefundEnv, refundBeforePayment), 202, '202 replay with original status');
assert(stateText(pendingRefundEnv) === pendingSnapshot, '202 replay must not mutate state');

const legacyBody = signedBody({ event: 'connection_test', api_mode: 'test' }, PASSPHRASE);
response = await worker.fetch(new Request('https://worker.test/digistore24-webhook', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: legacyBody,
}), env);
assert(response.status === 404, 'old /digistore24-webhook alias must remain closed');

response = await worker.fetch(new Request('https://worker.test/health'), createEnv({ DIGISTORE_IPN_PASSPHRASE_TEST: PASSPHRASE }));
assert(response.status === 200, 'fully configured health must pass');
response = await worker.fetch(new Request('https://worker.test/health'), missingPlanEnv);
assert(response.status === 503, 'health must fail closed without product-plan mapping');

const allState = [env, productNameEnv, conflictEnv, reuseEnv, payloadConflictEnv, chargebackEnv, missedEnv, pendingRefundEnv]
  .map(stateText)
  .join('\n');
const allLogs = JSON.stringify(capturedWorkerLogs);
for (const forbidden of [LICENSE_KEY, SECOND_LICENSE_KEY, BUYER_EMAIL, RAW_ORDER_ID, PASSPHRASE]) {
  assert(!allState.includes(forbidden), `state must not contain forbidden plaintext fixture: ${forbidden}`);
  assert(!allLogs.includes(forbidden), `logs must not contain forbidden plaintext fixture: ${forbidden}`);
}
for (const checkedEnv of [env, productNameEnv, conflictEnv, reuseEnv, payloadConflictEnv, chargebackEnv, missedEnv, pendingRefundEnv]) {
  assert(!stateContainsObjectKey(checkedEnv, 'license_key'), 'state must not retain a plaintext license_key field');
}

console.log('Digistore24 Generic-IPN staging smoke: PASS');
console.log('Covered: SHA-512 KAT, duplicate/ambiguous/mixed-case/tamper gates, exact text/plain OK, case-sensitive hash-only licenses, product mapping, idempotency, partial-write retry repair, conflicts, refund, chargeback, payment denial, terminal-state downgrade protection, terminal late payment, login/session invalidation, KV/DO/log PII checks, legacy alias 404, live 403.');
