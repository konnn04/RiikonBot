export async function handleHelpCommand(config, telegramApi, chatId) {
  const commands = [
    `${config.commandPrefix}status - Show bot status information`,
    `${config.commandPrefix}servers - List all connected servers`,
    `${config.commandPrefix}users - Show total user count`,
    `${config.commandPrefix}help - Show this help message`
  ].join('\n');
  
  const message = `📚 **Available Commands**:\n${commands}`;
  await telegramApi.sendMessage(chatId, message);
}
