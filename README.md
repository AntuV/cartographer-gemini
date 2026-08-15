# Cartographer

<img width="640" height="360" alt="claudecartographer" src="https://github.com/user-attachments/assets/542818c6-fc2b-41a6-915d-cf196447f346" />


A standalone Cartographer CLI plus Claude Code plugin for mapping and navigating codebases.

Cartographer v2 adds a graph CLI for intelligent coding agents: index a repo into a local SQLite graph, compile bounded briefs, run removal/completeness audits, manage evidence-backed notes, and score whether agents used graph context before editing.

## CLI

Install dependencies:

```bash
bun install
```

Run the CLI:

```bash
bun run cartographer -- --help
bun run cartographer:mcp
bun run cartographer:index -- --root . --out .cartographer
bun run cartographer:verify -- --out .cartographer --root . --fresh
bun run cartographer:view -- --out .cartographer
bun run cartographer:brief -- --out .cartographer --path src/index.ts --mode implementation --json
bun run cartographer:audit -- removal --out .cartographer --target supabase --write .cartographer/audits/supabase-removal.json
bun run cartographer:notes -- audit --out .cartographer --json
bun run cartographer:export -- graph --from .cartographer --format debug-json --out .cartographer/exports/graph.debug.json
```

Run the deterministic Cartographer eval smoke profile:

```bash
bun run eval:cartographer:smoke
bun run eval:cartographer:codex
bun run eval:cartographer:codex:live
```

The smoke, recorded Codex-trace, and explicit live Codex profiles index this repo and use `/Users/saint/dev/agent-runtime-kernel` as a read-only external target. They write graph artifacts under `/tmp/cartographer-code-graph-evals` and append-only JSON reports under `docs/reports`.

Core commands:

- `mcp` - run a thin newline-delimited MCP stdio wrapper over Cartographer graph operations.
- `index` - build `.cartographer/manifest.json`, `.cartographer/graph.sqlite`, JSON schemas, and `CODEBASE_MAP.md`; unchanged repos reuse prior artifacts through the SQLite file-hash cache unless `--force` or `--no-incremental` is passed.
- `verify` - check graph artifact compatibility and, with `--fresh`, fail when persisted artifacts drift from the live repo.
- `view` - summarize an existing graph.
- `brief` - emit bounded agent-facing context around a path, package, symbol, env var, DB/IaC object, audit ledger, or changed files.
- `audit removal` / `audit verify` - create and verify task-specific removal ledgers.
- `notes ingest` / `notes audit` / `notes accept` / `notes retire` - manage evidence-backed semantic notes.
- `export graph` - explicitly export full debug JSON or JSONL graph data.
- `diff` - compare two graph artifact directories.
- `slice`, `impact`, `context`, `preflight` - compatibility/debug graph surfaces. Broad selectors require `--allow-broad` or `--debug-graph`.
- `adoption` - score graph-first behavior from runtime traces.
- `annotate` / `annotations` - legacy OpenRouter annotation workflow, superseded for daily use by `notes`.

The MCP wrapper exposes `cartographer_index`, `cartographer_view`, `cartographer_brief`, `cartographer_context`, `cartographer_preflight`, `cartographer_verify`, `cartographer_audit_removal`, `cartographer_audit_verify`, `cartographer_notes_audit`, and `cartographer_diff` as tools. It wraps the same library functions as the CLI; it does not become a long-lived graph brain or agent manager.

## Installation

The section below documents the Cartographer skill workflow for **Antigravity** that produces `docs/CODEBASE_MAP.md` by orchestrating Gemini Flash 3.6 subagents using Gemini Pro 3.1. It is separate from the Cartographer v2 graph CLI above.

### Installation for Antigravity

Copy or clone to your project's `.agents/skills/` directory:

```bash
git clone https://github.com/kingbootoshi/cartographer.git .agents/skills/cartographer
```

Or for global use:

```bash
git clone https://github.com/kingbootoshi/cartographer.git ~/.gemini/config/skills/cartographer
```

### Usage

Use the skill prompt in Antigravity:

```
/cartographer
```

Or just say "map this codebase" and it will trigger automatically.

## What it Does

Cartographer uses **Gemini Pro 3.1** to orchestrate multiple **Gemini Flash 3.6** subagents (`invoke_subagent` with `Model: "flash"`) to analyze your entire codebase in parallel, then synthesizes their findings into:

- `docs/CODEBASE_MAP.md` - Detailed architecture map with file purposes, dependencies, data flows, and navigation guides
- Updates `GEMINI.md` / `AGENTS.md` (or `CLAUDE.md`) with a summary pointing to the map

## How it Works

1. Runs a scanner script to get file tree with token counts (respects .gitignore)
2. Plans how to split work across subagents based on token budgets
3. Spawns **Gemini Flash 3.6** subagents in parallel - each analyzes a portion of the codebase
4. **Gemini Pro 3.1** synthesizes all subagent reports into comprehensive documentation

## Update Mode

If `docs/CODEBASE_MAP.md` already exists, Cartographer will:

1. Check git history for changes since last mapping
2. Only re-analyze changed modules
3. Merge updates with existing documentation

Just run `/cartographer` again to update.

## Token Usage & Models

- **Orchestrator**: Gemini Pro 3.1
- **Exploration Subagents**: Gemini Flash 3.6 (fast and cost-effective for large codebase analysis)

## Requirements

- tiktoken (for token counting): `pip install tiktoken` or `uv pip install tiktoken`

## Full Documentation

See [plugins/cartographer/README.md](plugins/cartographer/README.md) for detailed documentation.

## License

Apache-2.0 / MIT
