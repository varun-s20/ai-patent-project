import { describe, it, expect, vi, afterEach } from "vitest";
import { getOllama } from "@/lib/ollama/client";

afterEach(() => {
  vi.unstubAllGlobals();
});

function mockFetch(response: object, ok = true, status = 200) {
  const fn = vi.fn().mockResolvedValue({
    ok,
    status,
    json: async () => response,
    text: async () => JSON.stringify(response),
  });
  vi.stubGlobal("fetch", fn);
  return fn;
}

describe("getOllama adapter", () => {
  it("sends a system + user message to /api/chat and returns the reply as a text block", async () => {
    const fetchFn = mockFetch({ message: { role: "assistant", content: '{"ok":true}' } });

    const msg = await getOllama().messages.create({
      model: "llama3.1",
      max_tokens: 256,
      system: "SYS",
      messages: [{ role: "user", content: "HELLO" }],
    });

    expect(msg.content).toEqual([{ type: "text", text: '{"ok":true}' }]);

    const [url, init] = fetchFn.mock.calls[0];
    expect(String(url)).toContain("/api/chat");
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body.model).toBe("llama3.1");
    expect(body.stream).toBe(false);
    expect(body.format).toBe("json");
    expect(body.options.num_predict).toBe(256);
    expect(body.messages[0]).toEqual({ role: "system", content: "SYS" });
    expect(body.messages[1]).toEqual({ role: "user", content: "HELLO" });
  });

  it("throws when Ollama returns a non-ok HTTP status", async () => {
    mockFetch({ error: "model not found" }, false, 404);

    await expect(
      getOllama().messages.create({
        model: "missing",
        max_tokens: 10,
        system: "S",
        messages: [{ role: "user", content: "U" }],
      }),
    ).rejects.toThrow(/Ollama request failed \(404\)/);
  });

  it("throws when the response body carries an error field", async () => {
    mockFetch({ error: "boom" }, true, 200);

    await expect(
      getOllama().messages.create({
        model: "llama3.1",
        max_tokens: 10,
        system: "S",
        messages: [{ role: "user", content: "U" }],
      }),
    ).rejects.toThrow(/Ollama error: boom/);
  });

  it("throws when the response has neither error nor message", async () => {
    mockFetch({}, true, 200);

    await expect(
      getOllama().messages.create({
        model: "llama3.1",
        max_tokens: 10,
        system: "S",
        messages: [{ role: "user", content: "U" }],
      }),
    ).rejects.toThrow(/Ollama returned no message/);
  });
});
