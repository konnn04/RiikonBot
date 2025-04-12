export async function handleServersCommand(botClient, telegramApi, chatId) {
  const serverList = botClient.guilds.cache.map(g => `• ${g.name} (${g.id}) - ${g.memberCount} members`).join('\n');
  const message = `📋 **Server List** (${botClient.guilds.cache.size}):\n${serverList || 'No servers found'}`;
  
  await telegramApi.sendMessage(chatId, message);
}
