export async function onGuildJoin(guild, sendMessage) {
  await sendMessage(`➕ Bot added to new server: ${guild.name} (${guild.id})`);
}
