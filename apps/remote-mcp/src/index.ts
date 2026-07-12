import { Hono } from "hono";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { sendTelegramMessage, telegramMessageInputSchema } from "sendkit-core";

function createServer(botToken: string) {
    const server = new McpServer({
        name: "sendkit-remote",
        version: "0.0.0",
        description: "Sendkit is a tool for sending messages to Telegram",
    });

    server.registerTool(
	"telegram",
	{
		title: "Telegram",
		description: "Send a Telegram message",
		inputSchema: telegramMessageInputSchema.shape,
	},
	async (input) => {
		const result = await sendTelegramMessage({
			...input,
			botToken,
		});
		return {
			content: [
				{
					type: "text",
					text: `Telegram message ${result.messageId} sent to chat ${result.chatId}`,
				},
			],
		};
	});


    return server;
}

const app = new Hono();

app.post("/:botToken/mcp", async (c) => {
    const botToken = c.req.param("botToken");
    const server = createServer(botToken);
    const transport = new WebStandardStreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
        enableJsonResponse: true,
    });
    await server.connect(transport);
    
    try {
        return await transport.handleRequest(c.req.raw);
    } catch (error) {
        console.error(error);
        return c.json({ error: "Failed to connect to MCP server" }, 500);
    } finally {
        await server.close();
    }
})

app.notFound((c) => c.json({ error: "Not found" }, 404));

export default {
    fetch: app.fetch,
};
