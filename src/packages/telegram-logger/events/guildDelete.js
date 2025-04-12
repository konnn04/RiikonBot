export async function onGuildLeave(guild, sendMessage) {
  await sendMessage(`➖ Bot removed from server: ${guild.name} (${guild.id})`);
}
