export async function handleUsersCommand(botClient, telegramApi, chatId) {
  const message = `👥 **Users**: ${botClient.users.cache.size} users across all servers`;
  await telegramApi.sendMessage(chatId, message);
}
