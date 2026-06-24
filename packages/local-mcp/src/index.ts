import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { sendTelegramMessage, telegramMessageInputSchema } from "sendkit-core";

const server = new McpServer({
	name: "sendkit-local",
	version: "0.0.0",
	description: "Sendkit Local MCP Server",
});

function getTelegramBotToken() {
	const token = process.env.TELEGRAM_BOT_TOKEN;
	if (!token) {
		throw new Error(
			"TELEGRAM_BOT_TOKEN is not set. Configure in in the MCP Client environment.",
		);
	}
	return token;
}

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
			botToken: getTelegramBotToken(),
		});
		return {
			content: [
				{
					type: "text",
					text: `Telegram message ${result.messageId} sent to chat ${result.chatId}`,
				},
			],
		};
	},
);

const transport = new StdioServerTransport();
await server.connect(transport);
