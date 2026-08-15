# Cartographer for Antigravity

An Antigravity skill and plugin that maps and documents codebases of any size by orchestrating parallel **Gemini Flash 3.6** subagents with **Gemini Pro 3.1**.

## What it does

Cartographer uses **Gemini Pro 3.1** to orchestrate multiple **Gemini Flash 3.6** subagents (with 1M token context windows) to analyze your entire codebase in parallel, then synthesizes their findings into comprehensive documentation:

- `docs/CODEBASE_MAP.md` - Detailed architecture map with file purposes, dependencies, data flows, and navigation guides
- Updates `GEMINI.md` / `AGENTS.md` (or `CLAUDE.md`) with a summary pointing to the map

## Installation for Antigravity

### Project-Specific (Recommended)

Copy or clone to your project's `.agents/skills/` directory:

```bash
git clone https://github.com/kingbootoshi/cartographer.git .agents/skills/cartographer
```

### Global Installation

Clone to your global Antigravity configuration directory:

```bash
git clone https://github.com/kingbootoshi/cartographer.git ~/.gemini/config/skills/cartographer
```

### Dependencies

The scanner script requires tiktoken:

```bash
uv pip install tiktoken
# or
pip install tiktoken
```

## Usage

Simply invoke the skill in Antigravity:

```
/cartographer
```

Or say:
- "map this codebase"
- "create codebase map"
- "document the architecture"
- "understand this codebase"

### Update Mode

If `docs/CODEBASE_MAP.md` already exists, Cartographer will:

1. Check git history for changes since last mapping
2. Only re-analyze changed modules with Gemini Flash 3.6 subagents
3. Merge updates with existing documentation

Just run `/cartographer` again to update.

## How it Works

```
/cartographer invoked
        |
        v
+---------------------------------------+
|  1. Run scan-codebase.py              |
|     - Recursive file tree             |
|     - Token count per file            |
|     - Respects .gitignore             |
+---------------------------------------+
        |
        v
+---------------------------------------+
|  2. Plan subagent assignments         |
|     - Group files by module           |
|     - Balance token budgets           |
|     - Target ~500k tokens per agent   |
+---------------------------------------+
        |
        v
+---------------------------------------+
|  3. Spawn Gemini Flash 3.6 subagents  |
|     (via invoke_subagent Model:flash) |
|     - Each reads assigned files       |
|     - Analyzes purpose, dependencies  |
|     - Returns structured summary      |
+---------------------------------------+
        |
        v
+---------------------------------------+
|  4. Synthesize all reports            |
|     (via Gemini Pro 3.1 orchestrator) |
|     - Merge subagent outputs          |
|     - Build architecture diagram      |
|     - Create navigation guides        |
+---------------------------------------+
        |
        v
+---------------------------------------+
|  5. Write docs/CODEBASE_MAP.md        |
|     Update GEMINI.md / AGENTS.md      |
+---------------------------------------+
```

## Output Structure

The generated `docs/CODEBASE_MAP.md` includes:

- **System Overview** - Mermaid architecture diagram
- **Directory Structure** - Annotated file tree
- **Module Guide** - Per-module documentation with:
  - Purpose and entry points
  - Key files with token counts
  - Exports and dependencies
- **Data Flow** - Request flows, auth flows, sequence diagrams
- **Conventions** - Naming, patterns, style
- **Gotchas** - Non-obvious behaviors and warnings
- **Navigation Guide** - How to add features, modify systems

## Model Allocation & Token Budgets

| Model | Role | Context Window | Safe Budget per Subagent |
|-------|------|---------------|-------------------------|
| Gemini Pro 3.1 | Strategic Orchestrator | 1,000,000 | 500,000 |
| Gemini Flash 3.6 | Codebase Explorer | 1,000,000 | 500,000 |

Cartographer uses **Gemini Pro 3.1** as the orchestrator and **Gemini Flash 3.6** subagents by default for maximum speed and coverage.

## Configuration

The scanner respects `.gitignore` and has sensible defaults for:
- Ignoring `node_modules`, `dist`, `build`, etc.
- Skipping binary files
- Skipping files over 1MB or 50k tokens

## License

Apache-2.0 / MIT
