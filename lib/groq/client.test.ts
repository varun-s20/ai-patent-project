import { describe, it, expect, vi, afterEach } from "vitest";
import { getGroq } from "@/lib/groq/client";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
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

describe("getGroq adapter", () => {
  it("sends a bearer-authed system + user message to /chat/completions and returns the reply", async () => {
    vi.stubEnv("GROQ_API_KEY", "test-key");
    vi.stubEnv("GROQ_MODEL", "llama-3.3-70b-versatile");
    const fetchFn = mockFetch({
      choices: [{ message: { role: "assistant", content: '{"ok":true}' } }],
    });

    const msg = await getGroq().messages.create({
      // Consumers thread an Ollama model name here; Groq must ignore it.
      model: "llama3.1",
      max_tokens: 256,
      system: "SYS",
      messages: [{ role: "user", content: "HELLO" }],
    });

    expect(msg.content).toEqual([{ type: "text", text: '{"ok":true}' }]);

    const [url, init] = fetchFn.mock.calls[0];
    expect(String(url)).toContain("/chat/completions");
    const headers = (init as RequestInit).headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer test-key");
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body.model).toBe("llama-3.3-70b-versatile"); // from GROQ_MODEL, not params.model
    expect(body.temperature).toBe(0);
    expect(body.max_tokens).toBe(256);
    expect(body.response_format).toEqual({ type: "json_object" });
    expect(body.messages[0]).toEqual({ role: "system", content: "SYS" });
    expect(body.messages[1]).toEqual({ role: "user", content: "HELLO" });
  });

  it("throws when GROQ_API_KEY is missing", async () => {
    vi.stubEnv("GROQ_API_KEY", "");
    await expect(
      getGroq().messages.create({
        model: "m",
        max_tokens: 10,
        system: "S",
        messages: [{ role: "user", content: "U" }],
      }),
    ).rejects.toThrow(/GROQ_API_KEY is not set/);
  });

  it("throws when Groq returns a non-ok HTTP status", async () => {
    vi.stubEnv("GROQ_API_KEY", "test-key");
    mockFetch({ error: { message: "rate limited" } }, false, 429);

    await expect(
      getGroq().messages.create({
        model: "m",
        max_tokens: 10,
        system: "S",
        messages: [{ role: "user", content: "U" }],
      }),
    ).rejects.toThrow(/Groq request failed \(429\)/);
  });

  it("throws when the response body carries an error object", async () => {
    vi.stubEnv("GROQ_API_KEY", "test-key");
    mockFetch({ error: { message: "boom" } }, true, 200);

    await expect(
      getGroq().messages.create({
        model: "m",
        max_tokens: 10,
        system: "S",
        messages: [{ role: "user", content: "U" }],
      }),
    ).rejects.toThrow(/Groq error: boom/);
  });

  it("throws when the response has no choices", async () => {
    vi.stubEnv("GROQ_API_KEY", "test-key");
    mockFetch({ choices: [] }, true, 200);

    await expect(
      getGroq().messages.create({
        model: "m",
        max_tokens: 10,
        system: "S",
        messages: [{ role: "user", content: "U" }],
      }),
    ).rejects.toThrow(/Groq returned no message/);
  });
});
