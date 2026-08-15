import type { RuntimeEvent } from "../core/types.ts";
import { HarnessError } from "../shared/errors.ts";
import type { Result } from "../shared/result.ts";
import { err, ok } from "../shared/result.ts";
import { runCartographerPreflight, type CartographerPreflightInput, type CartographerPreflightResult } from "./preflight.ts";

export type CartographerPreflightAdapterKind = "codex" | "claude" | "gemini" | "antigravity" | "generic";

export interface CartographerPreflightAdapterInput extends CartographerPreflightInput {
	readonly adapter: CartographerPreflightAdapterKind;
	readonly turnId?: string | undefined;
	readonly now?: Date | undefined;
}

export interface CartographerPreflightAdapterPayload {
	readonly adapter: CartographerPreflightAdapterKind;
	readonly turnId: string;
	readonly promptText: string;
	readonly preflight: CartographerPreflightResult;
	readonly runtimeEvents: readonly RuntimeEvent[];
}

export async function buildCartographerPreflightAdapterPayload(
	input: CartographerPreflightAdapterInput,
): Promise<Result<CartographerPreflightAdapterPayload, HarnessError>> {
	const preflight = await runCartographerPreflight(input);
	if (!preflight.ok) return err(preflight.error);
	return ok(cartographerPreflightAdapterPayload(input, preflight.data));
}

export function cartographerPreflightAdapterPayload(
	input: CartographerPreflightAdapterInput,
	preflight: CartographerPreflightResult,
): CartographerPreflightAdapterPayload {
	const turnId = input.turnId ?? `cartographer-preflight-${Date.now()}`;
	const timestamp = (input.now ?? new Date()).toISOString();
	return {
		adapter: input.adapter,
		turnId,
		promptText: preflight.promptText,
		preflight,
		runtimeEvents: [
			cartographerPreflightToolUseEvent({ input, preflight, turnId, timestamp }),
			cartographerPreflightToolResultEvent({ preflight, turnId, timestamp }),
		],
	};
}

function cartographerPreflightToolUseEvent(input: {
	readonly input: CartographerPreflightAdapterInput;
	readonly preflight: CartographerPreflightResult;
	readonly turnId: string;
	readonly timestamp: string;
}): RuntimeEvent {
	return {
		type: "tool_use",
		turnId: input.turnId,
		timestamp: input.timestamp,
		data: {
			adapter: input.input.adapter,
			name: "cartographer.preflight",
			command: input.preflight.command,
			input: {
				root: input.preflight.root,
				path: input.preflight.targetPath,
				live: input.preflight.live,
				depth: input.preflight.depth,
			},
		},
	};
}

function cartographerPreflightToolResultEvent(input: {
	readonly preflight: CartographerPreflightResult;
	readonly turnId: string;
	readonly timestamp: string;
}): RuntimeEvent {
	return {
		type: "tool_result",
		turnId: input.turnId,
		timestamp: input.timestamp,
		data: {
			name: "cartographer.preflight",
			command: input.preflight.command,
			durationMs: input.preflight.durationMs,
			timings: input.preflight.timings,
			context: input.preflight.context,
			promptText: input.preflight.promptText,
		},
	};
}
