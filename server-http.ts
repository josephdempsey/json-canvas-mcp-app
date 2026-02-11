import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createJsonCanvasServer } from "./mcp-server.js";

const app = createMcpExpressApp();
const port = Number(process.env.PORT ?? 3001);
const mcpPath = process.env.MCP_PATH ?? "/mcp";

app.post(mcpPath, async (req, res) => {
  const server = createJsonCanvasServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true
  });

  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error("Error handling MCP request:", error);
    if (!res.headersSent) {
      res.status(500).json({
        error: {
          code: -32603,
          message: "Internal server error"
        },
        id: null,
        jsonrpc: "2.0"
      });
    }
  }

  res.on("close", () => {
    void transport.close();
    void server.close();
  });
});

app.get(mcpPath, (_req, res) => {
  res.status(405).json({
    error: {
      code: -32000,
      message: "Method not allowed."
    },
    id: null,
    jsonrpc: "2.0"
  });
});

app.delete(mcpPath, (_req, res) => {
  res.status(405).json({
    error: {
      code: -32000,
      message: "Method not allowed."
    },
    id: null,
    jsonrpc: "2.0"
  });
});

app.get("/health", (_req, res) => {
  res.status(200).send("ok");
});

app.listen(port, (error?: unknown) => {
  if (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
  console.log(`MCP HTTP server listening on http://localhost:${port}${mcpPath}`);
});
