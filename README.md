# RiikonBot

Riikon's Discord Bot - A modular Discord bot with extensible package management

*Read this in: [English](#english) | [Tiếng Việt](#tiếng-việt)*

---

## English

### Introduction

RiikonBot is a powerful, modular Discord bot built with extensibility in mind. Its package-based architecture allows for easy addition of new features without modifying the core code. It also includes a web dashboard for configuration and a Telegram integration for remote monitoring.

### Features

- **Modular Package System**: Add, remove, or modify functionality through packages
- **Web Dashboard**: Easily configure and manage the bot through a web interface
- **Telegram Integration**: Monitor and control your bot remotely via Telegram
- **Database Support**: Track configuration and user data with SQLite
- **Slash Command Support**: Modern Discord slash command integration

### Requirements

- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)
- Discord Bot Token
- (Optional) Telegram Bot Token for monitoring

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Riikon-Team/RiikonBot.git
   cd RiikonBot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure the environment**
   - Copy `.env.example` to `.env`
   - Fill in your Discord token and other configuration values
   ```bash
   cp .env.example .env
   ```

4. **Update Discord slash commands**
   ```bash
   npm run update
   ```

5. **Build the application**
   ```bash
   npm run build
   ```

### Running the Bot

1. **Start the bot**
   ```bash
   npm start
   ```

2. **Development mode**
   ```bash
   npm run dev
   ```

3. **Accessing the Dashboard**
   - Open `http://localhost:3100` in your browser (or the port you configured)
   - Login with Discord OAuth

### Package Management

Packages are stored in `src/packages/available/` and can be enabled/disabled through the web dashboard.

### Creating Custom Packages

1. **Basic Package Structure**
   ```
   package-name/
   ├── package.json        # Package metadata and configuration
   ├── index.js            # Main package file with lifecycle methods
   ├── commands/           # Slash commands
   │   └── index.js        # Command registration
   ├── prefixCommands/     # Regular message commands
   │   └── index.js        # Prefix command registration
   └── events/             # Event handlers
       └── index.js        # Event registration
   ```

2. **Required Files**:

   **package.json**:
   ```json
   {
     "name": "your-package-name",
     "version": "1.0.0",
     "description": "Your package description",
     "main": "index.js",
     "author": "Your Name",
     "type": "module",
     "defaultConfig": {
       "prefix": "!",
       "enabled": true
     }
   }
   ```

   **index.js**:
   ```js
   import logger from '../../../utils/logger.js';

   let config = null;
   let packageManager = null;

   export async function initialize(client, manager, packageConfig) {
     packageManager = manager;
     config = packageConfig;
     
     logger.info('Your package initialized');
   }

   export async function onConfigUpdate(newConfig) {
     config = newConfig;
   }

   export async function onEnable() {
     logger.info('Your package enabled');
   }

   export async function onDisable() {
     logger.info('Your package disabled');
   }
   ```

3. **Adding Commands**

   Create a command file in `commands/yourcommand.js`:
   ```js
   import logger from '../../../../utils/logger.js';

   export const config = {
     name: 'yourcommand',
     description: 'Your command description'
   };

   export async function execute(interaction, client) {
     await interaction.reply('Your response here!');
   }
   ```

4. **Registering Events**

   In `events/index.js`:
   ```js
   export function registerEvents(client, packageManager, config) {
     packageManager.registerEventListener('messageCreate', (message, client) => 
       // Your handler function
     , 'your-package-name');
   }
   ```

### Available Commands

Use the `/help` command in Discord or run the help command in Telegram to see all available commands.

### Troubleshooting

- **Command not registering**: Run `npm run update` to update slash commands
- **Database errors**: Check if the database directory exists and is writable
- **Telegram errors**: Verify your Telegram token and chat ID in the .env file

### License

This project is licensed under the Apache License 2.0 - see the LICENSE file for details.

---


