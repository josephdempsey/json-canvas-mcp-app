import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createJsonCanvasServer } from "./mcp-server.js";

const transport = new StdioServerTransport();
const server = createJsonCanvasServer();
await server.connect(transport);
