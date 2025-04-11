import { Client, GatewayIntentBits, Events, Collection } from 'discord.js';
import logger from '../utils/logger.js';

export async function startBot(packageManager) {
  // Create a new Discord client with relevant intents
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildVoiceStates,
    ]
  });
  
  // Create a collection for commands
  client.commands = new Collection();
  
  // Store packageManager in client for easy access in commands
  client.packageManager = packageManager;
  
  // Forward Discord events to package manager
  client.on(Events.ClientReady, async () => {
    logger.info(`Bot logged in as ${client.user.tag}`);
    await packageManager.emitEvent('clientReady', client);
  });
  
  client.on(Events.MessageCreate, async (message) => {
    await packageManager.emitEvent('messageCreate', message, client);
  });
  
  client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isChatInputCommand()) {
      await packageManager.emitEvent('commandInteraction', interaction, client);
      
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      
      try {
        await command.execute(interaction, client, packageManager);
      } catch (error) {
        logger.error(`Error executing command ${interaction.commandName}:`, error);
        await interaction.reply({
          content: 'There was an error executing this command!',
          ephemeral: true
        }).catch(() => {});
      }
    }
  });
  
  // Initialize packages with client
  await packageManager.initializePackages(client);
  
  // Login to Discord
  await client.login(process.env.DISCORD_TOKEN);
  
  return client;
}
