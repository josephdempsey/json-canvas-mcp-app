# JSON Canvas MCP App

Architecture-first MCP App for designing software systems up front without leaving your coding harness (for example, Claude or Codex). It renders and edits JSON Canvas-style architecture or flows so planning, review, and implementation can happen in one workflow.

## What this app is for

- Model your system architecture before writing production code.
- Keep requirements, service boundaries, data flows, and implementation tasks in one visual canvas.
- Use the same MCP workflow where your agent already writes code.

## How it works

- MCP server exposes a tool that accepts canvas data.
- UI resource renders the architecture canvas in-host.
- Tool responses return `structuredContent` so the host can display and iterate on architecture context directly.

## Project structure

- `server.ts`: MCP stdio server with app resource + tool registration.
- `server-http.ts`: Streamable HTTP MCP transport.
- `src/mcp-app.ts`: host UI app that renders the canvas view.
- `vite.config.ts`: build output for the embedded app bundle.

## Install

```bash
npm install
npm run build
```

## Run

### Local stdio transport

```bash
npm run serve
```

### HTTP transport

```bash
npm run serve:http
```

Starts MCP HTTP endpoint at `http://localhost:3001/mcp`.

## MCP tool

Tool name: `render_json_canvas`

Inputs:

- `canvas`: JSON object or JSON string (required)
- `attachmentDir`: relative/absolute path for attachment nodes (optional)
- `theme`: `light` | `dark` (optional)

## Typical workflow in Claude/Codex

1. Draft architecture in a JSON canvas.
2. Call `render_json_canvas` to review and refine in context.
3. Convert nodes and links into implementation tasks.
4. Execute coding work while keeping the architecture view available in the same harness.
