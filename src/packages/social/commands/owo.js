import { displayCurrentTime } from '../../../utils/commandUtilities.js';
import logger from '../../../utils/logger.js'
import { EmbedBuilder } from 'discord.js'
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

export const config = {
    name: 'owo',
    description: "Don't know what to say? Just OwO",
    category: 'Social',
    options: []
}

export async function execute(interaction, client) {
    const user = interaction.user
    await interaction.reply(`**${user.username}** send an OwO`)
}