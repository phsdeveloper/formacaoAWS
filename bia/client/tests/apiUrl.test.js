import { afterEach, test } from "node:test";
import assert from "node:assert/strict";
import { resolveApiUrl } from "../src/apiUrl.js";

const originalFetch = globalThis.fetch;
const location = { origin: "http://localhost:3001", hostname: "localhost" };

afterEach(() => {
  globalThis.fetch = originalFetch;
});

test("prefere a URL configurada quando a API responde", async () => {
  const calls = [];
  globalThis.fetch = async (url) => {
    calls.push(url);
    return new Response("Bia 4.3.0");
  };

  assert.equal(await resolveApiUrl("http://localhost:8080/", location, assert.fail), "http://localhost:8080");
  assert.deepEqual(calls, ["http://localhost:8080/api/versao"]);
});

test("usa a origem da página quando a URL configurada falha", async () => {
  const warnings = [];
  globalThis.fetch = async (url) => url.includes(":8080/")
    ? new Response("Erro", { status: 503 })
    : new Response("Bia 4.3.0");

  assert.equal(await resolveApiUrl("http://localhost:8080", location, (message) => warnings.push(message)), location.origin);
  assert.match(warnings[0], /HTTP 503/);
});

test("usa a origem quando a URL configurada está inacessível", async () => {
  const warnings = [];
  globalThis.fetch = async (url) => {
    if (url.includes(":8080/")) throw new TypeError("Failed to fetch");
    return new Response("Bia 4.3.0");
  };

  assert.equal(await resolveApiUrl("http://localhost:8080", location, (message) => warnings.push(message)), location.origin);
  assert.match(warnings[0], /Failed to fetch/);
});

test("não usa localhost do visitante ao acessar a EC2", async () => {
  const remote = { origin: "http://ec2.example:8080", hostname: "ec2.example" };
  const calls = [];
  const warnings = [];
  globalThis.fetch = async (url) => {
    calls.push(url);
    return new Response("Bia 4.3.0");
  };

  assert.equal(await resolveApiUrl("http://localhost:3001", remote, (message) => warnings.push(message)), remote.origin);
  assert.deepEqual(calls, ["http://ec2.example:8080/api/versao"]);
  assert.match(warnings[0], /ignorada/);
});

test("rejeita HTML de fallback e informa falha quando não encontra a API", async () => {
  const warnings = [];
  globalThis.fetch = async () => new Response("<html>frontend</html>");

  await assert.rejects(resolveApiUrl(undefined, location, (message) => warnings.push(message)), /Não foi possível conectar/);
  assert.match(warnings[0], /Resposta inesperada/);
});
