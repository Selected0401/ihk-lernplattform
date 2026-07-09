#!/usr/bin/env node
import fs from 'node:fs';
import vm from 'node:vm';
import { TextDecoder, TextEncoder } from 'node:util';
import { webcrypto } from 'node:crypto';

class KVNamespace {
  constructor(initial = {}) {
    this.store = new Map(Object.entries(initial));
  }

  async get(key, type) {
    const value = this.store.get(key);
    if (value === undefined) return null;
    if (type === 'json') return JSON.parse(value);
    return value;
  }

  async put(key, value) {
    this.store.set(key, String(value));
  }
}

function loadWorker() {
  const source = fs.readFileSync('cloudflare-worker/src/worker.js', 'utf8')
    .replace('export default', 'globalThis.worker =');
  const context = {
    console,
    crypto: webcrypto,
    TextEncoder,
    TextDecoder,
    URL,
    URLSearchParams,
    Request,
    Response,
    Headers,
    atob: globalThis.atob,
    btoa: globalThis.btoa,
    setTimeout,
    clearTimeout,
  };
  vm.createContext(context);
  vm.runInContext(source, context, { filename: 'worker.js' });
  return context.worker;
}

async function jsonResponse(response) {
  return JSON.parse(await response.text());
}

async function request(worker, env, path, options = {}) {
  return worker.fetch(new Request(`https://worker.test${path}`, options), env);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const worker = loadWorker();
const env = {
  ACCESS_CODES: new KVNamespace(),
  PROTECTED_CONTENT: new KVNamespace({
    'tasks/aufgaben-optimiert.json': JSON.stringify({
      aufgaben: [{ id: 'excel-001', kategorie: 'excel', titel: 'Testaufgabe', punkte: 10, zeit: 15 }],
    }),
  }),
  JWT_SECRET: 'test-jwt-secret-at-least-32-chars',
  ADMIN_SECRET: 'admin-secret',
  DIGISTORE_WEBHOOK_SECRET: 'webhook-secret',
};

let response = await request(worker, env, '/verify-code', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': '203.0.113.10' },
  body: JSON.stringify({ code: 'not-a-code' }),
});
assert(response.status === 400, 'invalid code format must be rejected');

response = await request(worker, env, '/admin/create-code', {
  method: 'POST',
  headers: { Authorization: 'Bearer admin-secret', 'Content-Type': 'application/json' },
  body: JSON.stringify({ code: 'IHK-ABCD-2345', email: 'alex@example.test', orderId: 'order-1' }),
});
assert(response.status === 200, 'admin create-code must work');

response = await request(worker, env, '/verify-code', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': '203.0.113.10' },
  body: JSON.stringify({ code: 'IHK-ABCD-2345' }),
});
const verified = await jsonResponse(response);
assert(response.status === 200 && verified.accessToken, 'valid code must return an access token');

response = await request(worker, env, '/content/tasks', {
  method: 'GET',
  headers: { Authorization: `Bearer ${verified.accessToken}` },
});
assert(response.status === 200, 'fresh token must access protected task list');

response = await request(worker, env, '/digistore24-webhook', {
  method: 'POST',
  headers: { Authorization: 'Bearer webhook-secret', 'Content-Type': 'application/json' },
  body: JSON.stringify({ event: 'refund', order_id: 'order-1' }),
});
assert([200, 202].includes(response.status), 'refund webhook must process or acknowledge revocation');

response = await request(worker, env, '/verify-code', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': '203.0.113.11' },
  body: JSON.stringify({ code: 'IHK-ABCD-2345' }),
});
assert(response.status === 403, 'revoked code must not verify again');

response = await request(worker, env, '/content/tasks', {
  method: 'GET',
  headers: { Authorization: `Bearer ${verified.accessToken}` },
});
assert(response.status === 401 || response.status === 403, 'old token must stop working after revocation');

response = await request(worker, env, '/digistore24-webhook', {
  method: 'POST',
  headers: { Authorization: 'Bearer webhook-secret', 'Content-Type': 'application/json' },
  body: JSON.stringify({ event: 'payment_completed', order_id: 'order-2', email: 'buyer@example.test' }),
});
const purchase = await jsonResponse(response);
assert(response.status === 200 && purchase.action === 'purchase_code_created' && /^IHK-[A-Z2-9]{4}-[A-Z2-9]{4}$/.test(purchase.code), 'allowed purchase webhook must create one access code');

response = await request(worker, env, '/digistore24-webhook', {
  method: 'POST',
  headers: { Authorization: 'Bearer webhook-secret', 'Content-Type': 'application/json' },
  body: JSON.stringify({ event: 'unknown_non_purchase', order_id: 'order-unknown', email: 'buyer@example.test' }),
});
const ignored = await jsonResponse(response);
assert(response.status === 202 && ignored.action === 'ignored_event', 'unknown webhook event must not create access code');

console.log('worker-security-smoke=PASS');
