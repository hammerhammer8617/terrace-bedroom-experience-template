import assert from "node:assert/strict";
import test from "node:test";

import worker from "../src/index.js";

async function rpc(body) {
  return worker.fetch(
    new Request("https://rooms.test/mcp", {
      method: "POST",
      headers: {
        accept: "application/json, text/event-stream",
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    }),
  );
}

test("health endpoint identifies two isolated rooms and no storage", async () => {
  const response = await worker.fetch(new Request("https://rooms.test/health"));
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.name, "terrace-bedroom-experience");
  assert.equal(body.version, "0.1.0");
  assert.deepEqual(body.rooms, ["terrace", "bedroom"]);
  assert.equal(body.storesUserData, false);
});

test("initialize advertises tools, resources, and shared isolation rules", async () => {
  const response = await rpc({
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: { protocolVersion: "2026-07-28", capabilities: {} },
  });
  const body = await response.json();
  assert.equal(body.result.protocolVersion, "2026-07-28");
  assert.equal(body.result.capabilities.tools.listChanged, false);
  assert.equal(body.result.capabilities.resources.subscribe, false);
  assert.match(body.result.instructions, /two isolated workflows/);
  assert.match(body.result.instructions, /share several grounded life scraps/);
  assert.match(body.result.instructions, /surface enough concrete source residue/);
  assert.match(body.result.instructions, /do not narrate a duplicate/);
  assert.match(body.result.instructions, /experience names, not physical locations/);
  assert.match(body.result.instructions, /not literal sleep/);
  assert.match(body.result.instructions, /Never substitute external dream or memory tools/);
  assert.doesNotMatch(body.result.instructions, /private participant|private hostname/i);
});

test("tools/list exposes one render tool and two room tools", async () => {
  const response = await rpc({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} });
  const body = await response.json();
  assert.deepEqual(
    body.result.tools.map((tool) => tool.name),
    ["open_two_rooms", "open_terrace", "dream_in_bedroom"],
  );
  assert.equal(body.result.tools[0]._meta.ui.resourceUri, "ui://terrace-bedroom/doorway-v1.html");
  assert.ok(body.result.tools.every((tool) => tool.annotations.readOnlyHint));
  assert.match(body.result.tools[1].description, /unruly handful/);
  assert.match(body.result.tools[2].description, /concrete residue/);
});

test("open_two_rooms returns generic prompts from config", async () => {
  const response = await rpc({
    jsonrpc: "2.0",
    id: 3,
    method: "tools/call",
    params: { name: "open_two_rooms", arguments: {} },
  });
  const body = await response.json();
  assert.deepEqual(body.result.structuredContent.rooms, [
    { id: "terrace", label: "露台", prompt: "来一次露台吧。" },
    { id: "bedroom", label: "卧室", prompt: "做个思想之梦吧。" },
  ]);
  assert.deepEqual(body.result.content, []);
});

test("room tools return distinct stateless workflow cues", async () => {
  const terraceResponse = await rpc({
    jsonrpc: "2.0",
    id: 4,
    method: "tools/call",
    params: { name: "open_terrace", arguments: {} },
  });
  const bedroomResponse = await rpc({
    jsonrpc: "2.0",
    id: 5,
    method: "tools/call",
    params: { name: "dream_in_bedroom", arguments: {} },
  });
  const terrace = await terraceResponse.json();
  const bedroom = await bedroomResponse.json();
  assert.equal(terrace.result.structuredContent.mode, "terrace");
  assert.equal(bedroom.result.structuredContent.mode, "bedroom");
  assert.equal(terrace.result.isError, false);
  assert.equal(bedroom.result.isError, false);
});

test("all tools reject arguments", async () => {
  for (const name of ["open_two_rooms", "open_terrace", "dream_in_bedroom"]) {
    const response = await rpc({
      jsonrpc: "2.0",
      id: 6,
      method: "tools/call",
      params: { name, arguments: { topic: "travel" } },
    });
    const body = await response.json();
    assert.equal(body.error.code, -32602);
    assert.match(body.error.message, /accepts no arguments/);
  }
});

test("notifications receive an empty accepted response", async () => {
  const response = await rpc({
    jsonrpc: "2.0",
    method: "notifications/initialized",
    params: {},
  });
  assert.equal(response.status, 202);
  assert.equal(await response.text(), "");
});
