export async function onClientReady(client, sendMessage) {
  await sendMessage(`✅ Bot connected to Discord as ${client.user.tag}`);
}
