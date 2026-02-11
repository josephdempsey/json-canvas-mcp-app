import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { registerAppResource, registerAppTool } from "@modelcontextprotocol/ext-apps/server";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const resourceUri = "ui://json-canvas/viewer.html";

export function createJsonCanvasServer() {
  const server = new McpServer({
    name: "json-canvas-mcp-app",
    version: "0.1.0"
  });

  registerAppResource(server, "json-canvas-viewer-ui", resourceUri, {}, async () => {
    const html = readFileSync(resolve(__dirname, "dist/index.html"), "utf8");
    return {
      contents: [
        {
          mimeType: "text/html",
          text: html,
          uri: resourceUri
        }
      ]
    };
  });

  registerAppTool(
    server,
    "render_json_canvas",
    {
      description: "Render a JSON Canvas document in an interactive viewer.",
      inputSchema: {
        attachmentDir: z.string().optional().describe("Directory for image/file nodes."),
        canvas: z
          .union([z.string(), z.record(z.unknown())])
          .describe("JSON Canvas object or serialized JSON string."),
        theme: z.enum(["light", "dark"]).optional()
      },
      title: "Render JSON Canvas",
      _meta: {
        ui: {
          resourceUri
        }
      }
    },
    async ({ attachmentDir, canvas, theme }) => {
      const parsedCanvas =
        typeof canvas === "string" ? (JSON.parse(canvas) as Record<string, unknown>) : canvas;

      return {
        content: [
          {
            text: "Rendered JSON Canvas in the interactive viewer.",
            type: "text"
          }
        ],
        structuredContent: {
          attachmentDir,
          canvas: parsedCanvas,
          theme
        }
      };
    }
  );

  return server;
}
