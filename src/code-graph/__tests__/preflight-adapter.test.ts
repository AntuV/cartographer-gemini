import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { analyzeGraphCommandAdoption } from "../adoption.ts";
import { buildCartographerPreflightAdapterPayload } from "../preflight-adapter.ts";
import { createCartographerFixture, removeCartographerFixture } from "./fixture.ts";

let tempDir: string;

beforeEach(async () => {
	tempDir = await createCartographerFixture("cartographer-adapter-test-");
});

afterEach(async () => {
	await removeCartographerFixture(tempDir);
});

describe("Cartographer preflight adapter payload", () => {
	test("emits prompt text and adoption-compatible runtime events", async () => {
		const result = await buildCartographerPreflightAdapterPayload({
			adapter: "codex",
			root: join(tempDir, "repo"),
			path: "src/index.ts",
			live: true,
			turnId: "turn-adapter",
			now: new Date("2026-05-12T00:00:00.000Z"),
		});

		expect(result.ok).toBe(true);
		if (!result.ok) throw result.error;

		expect(result.data.adapter).toBe("codex");
		expect(result.data.turnId).toBe("turn-adapter");
		expect(result.data.promptText).toContain("cartographer-preflight");
		expect(result.data.runtimeEvents.length).toBe(2);
		expect(result.data.runtimeEvents[0]?.type).toBe("tool_use");
		expect(result.data.runtimeEvents[1]?.type).toBe("tool_result");
		expect(analyzeGraphCommandAdoption(result.data.runtimeEvents).adopted).toBe(true);
	});

	test("emits adapter payload for antigravity adapter kind", async () => {
		const result = await buildCartographerPreflightAdapterPayload({
			adapter: "antigravity",
			root: join(tempDir, "repo"),
			path: "src/index.ts",
			live: true,
		});

		expect(result.ok).toBe(true);
		if (!result.ok) throw result.error;
		expect(result.data.adapter).toBe("antigravity");
	});
});
