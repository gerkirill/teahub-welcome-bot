export const config = {
  botToken: process.argv['bot-token'] || process.env.BOT_TOKEN || "",
  apiToken: process.argv['api-token'] || process.env.API_TOKEN || "",
  chatId: process.argv['chat-id'] || process.env.DHAT_ID || "",
}