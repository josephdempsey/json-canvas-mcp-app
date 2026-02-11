import {
  App,
  applyDocumentTheme,
  applyHostFonts,
  applyHostStyleVariables
} from "@modelcontextprotocol/ext-apps";
import { JSONCanvasViewer } from "json-canvas-viewer";
import { Controls, Minimap, MistouchPreventer } from "json-canvas-viewer/modules";
import "./styles.css";

type ViewerPayload = {
  attachmentDir?: string;
  canvas: unknown;
  theme?: "light" | "dark";
};

type ViewerLike = { destroy?: () => void };

const appRoot = document.getElementById("app");
if (!appRoot) {
  throw new Error("Missing #app element.");
}

appRoot.innerHTML = `
  <section class="layout">
    <header class="toolbar">
      <strong>JSON Canvas Viewer</strong>
      <p class="status" id="status">Waiting for tool call...</p>
    </header>
    <section class="canvas-shell">
      <div class="canvas-root" id="canvas-root"></div>
    </section>
  </section>
`;

const status = document.getElementById("status");
const canvasRoot = document.getElementById("canvas-root");
if (!status || !canvasRoot) {
  throw new Error("Missing required UI elements.");
}

let viewer: ViewerLike | undefined;

const setStatus = (text: string) => {
  status.textContent = text;
};

const parseCanvasPayload = (input: unknown): ViewerPayload => {
  const source = (input ?? {}) as Partial<ViewerPayload> & { canvas?: unknown };
  const rawCanvas = source.canvas;
  if (rawCanvas === undefined || rawCanvas === null) {
    throw new Error("Tool result is missing `canvas`.");
  }

  const canvas = typeof rawCanvas === "string" ? JSON.parse(rawCanvas) : rawCanvas;
  return {
    attachmentDir: source.attachmentDir,
    canvas,
    theme: source.theme
  };
};

const renderCanvas = (payload: ViewerPayload) => {
  viewer?.destroy?.();
  canvasRoot.innerHTML = "";

  // `full` mode is used for production use: modules + host-framework integrations.
  viewer = new JSONCanvasViewer(
    {
      attachmentDir: payload.attachmentDir,
      canvas: payload.canvas as never,
      container: canvasRoot,
      loading: "normal",
      theme: payload.theme
    },
    [Minimap, Controls, MistouchPreventer]
  ) as ViewerLike;

  setStatus("Canvas rendered.");
};

const app = new App({
  name: "json-canvas-mcp-app",
  version: "0.1.0"
});

app.ontoolinput = () => {
  setStatus("Receiving tool input...");
};

app.ontoolresult = (result) => {
  try {
    const payload = parseCanvasPayload((result as { structuredContent?: unknown }).structuredContent);
    renderCanvas(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to render canvas.";
    setStatus(message);
  }
};

app.onhostcontextchanged = (ctx) => {
  if (ctx.theme) applyDocumentTheme(ctx.theme);
  if (ctx.styles?.variables) applyHostStyleVariables(ctx.styles.variables);
  if (ctx.styles?.css?.fonts) applyHostFonts(ctx.styles.css.fonts);

  if (ctx.safeAreaInsets) {
    const { bottom, left, right, top } = ctx.safeAreaInsets;
    document.body.style.padding = `${top}px ${right}px ${bottom}px ${left}px`;
  }
};

app.onteardown = async () => {
  viewer?.destroy?.();
  return {};
};

void app.connect();
