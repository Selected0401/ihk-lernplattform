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
    .replace('export class CommerceCoordinator', 'class CommerceCoordinator')
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
  ADMIN_SECRET: 'test-admin-secret-at-least-32-chars',
};

let response = await request(worker, env, '/verify-code', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': '203.0.113.10' },
  body: JSON.stringify({ code: 'not-a-code' }),
});
assert(response.status === 400, 'invalid code format must be rejected');

response = await request(worker, env, '/admin/create-code', {
  method: 'POST',
  headers: { Authorization: 'Bearer test-admin-secret-at-least-32-chars', 'Content-Type': 'application/json' },
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

console.log('worker-security-smoke=PASS');
