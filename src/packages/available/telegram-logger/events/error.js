export async function onError(error, sendMessage) {
  await sendMessage(`❌ Error: ${error.message || error}`);
}
