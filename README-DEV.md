# RiikonBot - Developer Guide

This guide provides detailed instructions for extending RiikonBot's functionality by creating custom packages and modifying existing features.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Package System](#package-system)
- [Creating Custom Packages](#creating-custom-packages)
- [Adding Commands](#adding-commands)
  - [Slash Commands](#slash-commands)
  - [Prefix Commands](#prefix-commands)
- [Adding Event Handlers](#adding-event-handlers)
- [Advanced Development](#advanced-development)
  - [Database Access](#database-access)
  - [Scheduling Tasks](#scheduling-tasks)
  - [HTTP Requests](#http-requests)
- [Web Dashboard Extensions](#web-dashboard-extensions)
- [Troubleshooting](#troubleshooting)

## Architecture Overview

RiikonBot uses a modular architecture with the following key components:

- **Core**: The main bot logic that handles the connection to Discord/Telegram
- **Package Manager**: Handles loading, enabling, and disabling packages
- **Command Manager**: Registers and executes commands
- **Event System**: Routes events to the appropriate handlers
- **Web Dashboard**: Provides a UI for configuration and monitoring
- **Database**: Stores persistent data

## Package System

### Package Lifecycle Methods

Each package has four main lifecycle methods:

- `initialize`: Called when the bot starts up, used for setup and resource loading
- `onEnable`: Called when the package is enabled, ideal for starting services
- `onDisable`: Called when the package is disabled, used for cleanup
- `onConfigUpdate`: Called when the package configuration is updated, allows real-time config changes

### Package Structure

Packages are stored in `src/packages/` and follow this structure:

```
package-name/
├── package.json        # Package metadata and configuration
├── index.js            # Main package file with lifecycle methods
├── commands/           # Slash commands
│   ├── command1.js     # Individual command file
│   ├── command2.js     # Another command
│   └── index.js        # Command registration
├── prefixCommands/     # Regular message commands
│   └── index.js        # Prefix command registration
└── events/             # Event handlers
    └── index.js        # Event registration
```

## Creating Custom Packages

### 1. Create the package directory

```bash
mkdir -p src/packages/your-package-name
cd src/packages/your-package-name
```

### 2. Create the required files

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
    "enabled": true,
    "customSetting": "value"
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
  
  logger.info(`[${config.name}] Package initialized`);
  
  // Register command modules if they exist
  try {
    const commandsModule = await import('./commands/index.js');
    if (commandsModule.registerCommands) {
      await commandsModule.registerCommands(client, manager, config);
    }
  } catch (error) {
    // Commands module is optional
  }
  
  // Register prefix commands if they exist
  try {
    const prefixCommandsModule = await import('./prefixCommands/index.js');
    if (prefixCommandsModule.registerCommands) {
      await prefixCommandsModule.registerCommands(client, manager, config);
    }
  } catch (error) {
    // Prefix commands module is optional
  }
  
  // Register event handlers if they exist
  try {
    const eventsModule = await import('./events/index.js');
    if (eventsModule.registerEvents) {
      await eventsModule.registerEvents(client, manager, config);
    }
  } catch (error) {
    // Events module is optional
  }
}

export function onEnable() {
  logger.info(`[${config.name}] Package enabled`);
  return true;
}

export function onDisable() {
  logger.info(`[${config.name}] Package disabled`);
  return true;
}

export function onConfigUpdate(newConfig) {
  logger.info(`[${config.name}] Configuration updated`);
  config = newConfig;
  return true;
}
```

## Adding Commands

### Slash Commands

1. Create a directory for commands:

```bash
mkdir -p commands
```

2. Create a command file (e.g., `commands/hello.js`):

```js
export const config = {
  name: 'hello',
  description: 'Says hello to you',
  options: [
    {
      type: 3, // STRING
      name: 'name',
      description: 'Your name',
      required: false
    }
  ]
};

export async function execute(interaction, client, packageConfig) {
  const name = interaction.options.getString('name') || 'there';
  await interaction.reply(`Hello, ${name}! Nice to meet you.`);
}
```

3. Create the command registration file (`commands/index.js`):

```js
import { readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import logger from '../../../../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function registerCommands(client, packageManager, config) {
  // Get all .js files in the commands directory except index.js
  const commandFiles = readdirSync(__dirname)
    .filter(file => file.endsWith('.js') && file !== 'index.js');
  
  for (const file of commandFiles) {
    try {
      // Import the command module
      const commandModule = await import(`./${file}`);
      
      // Register the command with the package manager
      packageManager.registerCommand(
        commandModule.config,
        commandModule.execute,
        config.name
      );
      
      logger.info(`Registered command: ${commandModule.config.name}`);
    } catch (error) {
      logger.error(`Error registering command from ${file}: ${error.message}`);
    }
  }
}
```

### Prefix Commands

1. Create a directory for prefix commands:

```bash
mkdir -p prefixCommands
```

2. Create the prefix command registration file (`prefixCommands/index.js`):

```js
import logger from '../../../../utils/logger.js';

export async function registerCommands(client, packageManager, config) {
  // Register a prefix command handler
  packageManager.registerPrefixCommand({
    name: 'hello',
    description: 'Says hello to you',
    usage: 'hello [name]',
    execute: async (message, args, client) => {
      const name = args[0] || 'there';
      await message.reply(`Hello, ${name}! Nice to meet you.`);
    }
  }, config.name);
  
  logger.info(`Registered prefix command: hello`);
}
```

## Adding Event Handlers

1. Create a directory for event handlers:

```bash
mkdir -p events
```

2. Create the event registration file (`events/index.js`):

```js
import logger from '../../../../utils/logger.js';

export async function registerEvents(client, packageManager, config) {
  // Register event handlers
  packageManager.registerEvent('messageCreate', async (message) => {
    // Skip bot messages
    if (message.author.bot) return;
    
    // Example event handler logic
    if (message.content.toLowerCase().includes('hello bot')) {
      await message.reply('Hello there!');
    }
  }, config.name);
  
  logger.info(`Registered messageCreate event handler`);
}
```

## Advanced Development

### Database Access

RiikonBot comes with a SQLite database that packages can use to store data:

```js
import { getDatabase } from '../../../utils/database.js';

// In one of your functions
const db = getDatabase();

// Create a table if it doesn't exist
await db.run(`
  CREATE TABLE IF NOT EXISTS my_package_data (
    user_id TEXT PRIMARY KEY,
    value TEXT,
    timestamp INTEGER
  )
`);

// Insert data
await db.run(
  'INSERT OR REPLACE INTO my_package_data (user_id, value, timestamp) VALUES (?, ?, ?)',
  [userId, data, Date.now()]
);

// Query data
const rows = await db.all('SELECT * FROM my_package_data WHERE user_id = ?', [userId]);
```

### Scheduling Tasks

For recurring tasks or delayed operations:

```js
import { scheduleJob } from '../../../utils/scheduler.js';

// Run a task every hour
const jobId = scheduleJob('0 * * * *', () => {
  logger.info('This runs every hour');
});

// To cancel the job later
// scheduler.cancelJob(jobId);
```

### HTTP Requests

For integrating with external APIs:

```js
import fetch from 'node-fetch';

async function getWeather(location) {
  try {
    const response = await fetch(`https://api.weather.com/v1/location=${encodeURIComponent(location)}`);
    return await response.json();
  } catch (error) {
    logger.error(`Weather API error: ${error.message}`);
    return null;
  }
}
```

## Web Dashboard Extensions

To add custom pages or components to the web dashboard, create a dashboard folder in your package:

```
your-package-name/
└── dashboard/
    ├── routes.js      # Define custom routes
    └── components/    # Custom Vue components
        └── Settings.vue
```

Example `routes.js`:

```js
export default [
  {
    path: '/packages/your-package-name',
    name: 'YourPackageSettings',
    component: () => import('./components/Settings.vue')
  }
];
```

## Troubleshooting

### Common Issues

- **Commands not showing up in Discord**: Run `npm run update` to update Discord slash commands
- **Package not loading**: Check the console for error messages and ensure your package structure is correct
- **Database errors**: Make sure your SQL queries are correct and the database directory is writable

### Debug Mode

For detailed logging, you can enable debug mode:

```bash
DEBUG=true npm run dev
```

This will provide more verbose logs to help diagnose issues.

### Support

If you encounter any issues or have questions, please:

1. Check existing issues on GitHub
2. Open a new issue with a detailed description of your problem
3. Include logs and steps to reproduce the issue

## Best Practices

1. **Keep packages focused**: Each package should have a single responsibility
2. **Handle errors gracefully**: Catch exceptions to prevent crashing the bot
3. **Clean up resources**: Always implement proper cleanup in the `onDisable` method
4. **Use configuration**: Make your package configurable rather than hardcoding values
5. **Document your code**: Include comments and documentation for your package

Happy coding with RiikonBot!
