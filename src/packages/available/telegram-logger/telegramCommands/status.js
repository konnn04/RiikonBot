import { formatUptime } from '../utils/helpers.js';

export async function handleStatusCommand(botClient, telegramApi, chatId) {
  const uptime = formatUptime(botClient.uptime);
  const serverCount = botClient.guilds.cache.size;
  const userCount = botClient.users.cache.size;
  
  const message = `📊 **Bot Status**
⏱️ Uptime: ${uptime}
🖥️ Servers: ${serverCount}
👥 Users: ${userCount}
🟢 Status: Online`;
  
  await telegramApi.sendMessage(chatId, message);
}
