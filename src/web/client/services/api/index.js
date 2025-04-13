import botApi from './botApi.js';
import guildsApi from './guildsApi.js';
import commandsApi from './commandsApi.js';
import packagesApi from './packagesApi.js';
import statsApi from './statsApi.js';

export default {
  bot: botApi,
  guilds: guildsApi,
  commands: commandsApi,
  packages: packagesApi,
  stats: statsApi
};
