# RiikonBot - Quick Start Guide

A modular Discord bot with extensible package management, web dashboard, and Telegram integration.

![RiikonBot Logo](assets/logo.png)

## Introduction

RiikonBot is a powerful, extensible Discord bot built with a modular package system that allows you to easily add, remove, or modify functionality without changing the core code. Each package is a self-contained module that can provide commands, event handlers, and other features.

## Features

- 🧩 **Modular Package System**: Enable/disable features as needed
- 🔄 **Real-time Configuration**: Update settings without restarting
- 🌐 **Web Dashboard**: Manage your bot through an intuitive interface
- 📱 **Telegram Integration**: Optional connection to Telegram
- 💾 **Database Storage**: Built-in SQLite database for data persistence
- 🛠️ **Slash Commands**: Modern Discord interactions
- 📝 **Text Commands**: Traditional prefix commands

## Technologies

RiikonBot is built with modern web and Discord technologies:

### Core Technologies
- [Node.js](https://nodejs.org/) - JavaScript runtime environment
- [Express](https://expressjs.com/) - Web server framework
- [SQLite](https://www.sqlite.org/) - Embedded database

### Discord Integration
- [Discord.js](https://discord.js.org/) - Discord API wrapper for Node.js
- [@discordjs/voice](https://discord.js.org/#/docs/voice/main/general/welcome) - Voice support for Discord.js
- [@discordjs/opus](https://github.com/discordjs/opus) - Opus audio codec binding

### Frontend Dashboard
- [Vue.js](https://vuejs.org/) - Progressive JavaScript framework for UIs
- [Vue Router](https://router.vuejs.org/) - Official router for Vue.js
- [Bootstrap](https://getbootstrap.com/) - CSS framework for responsive design
- [Bootstrap Icons](https://icons.getbootstrap.com/) - Icon library

### Media and Content
- [youtubei.js](https://github.com/LuanRT/YouTube.js) - YouTube API wrapper for Node.js

### Utilities
- [node-fetch](https://github.com/node-fetch/node-fetch) - Lightweight HTTP client
- [winston](https://github.com/winstonjs/winston) - Versatile logging library
- [Prisma](https://www.prisma.io/) - Next-generation ORM for Node.js and TypeScript
- [dotenv](https://github.com/motdotla/dotenv) - Environment variable management
- [lodash-es](https://lodash.com/) - Utility library (ESM version)

## Prerequisites

- [Node.js](https://nodejs.org/) (v16.x or higher)
- [npm](https://www.npmjs.com/) (v7.x or higher)
- A Discord account and a registered Discord application/bot
- (Optional) A Telegram bot

## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Riikon-Team/RiikonBot.git
   cd RiikonBot
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Copy the example environment file and edit it:

   ```bash
   cp .env.example .env
   ```

   Open `.env` file and fill in your configuration details:

   ```
   # Discord Configuration
   DISCORD_TOKEN=your_discord_bot_token
   DISCORD_CLIENT_ID=your_discord_client_id
   DISCORD_CLIENT_SECRET=your_discord_client_secret
   
   # Optional: for development environments
   GUILD_ID=your_discord_server_id
   
   # Default prefix for text commands
   PREFIX=!
   
   # Web Dashboard
   DASHBOARD_ENABLED=true
   DASHBOARD_PORT=3100
   DASHBOARD_SECRET=some_random_string
   DISCORD_OAUTH_CLIENT_SECRET=your_client_secret
   
   # Telegram Integration (optional)
   TELEGRAM_ENABLED=true
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token
   TELEGRAM_CHAT_ID=your_telegram_chat_id
   
   # Database
   DATABASE_URL="file:./data/database.sqlite"
   ```

## Running the Bot

RiikonBot offers multiple ways to run the application depending on your needs:

### Production Mode (Discord Bot Only)

```bash
npm start
```

This will start the Discord bot only.

### Development Mode (Full Stack)

```bash
npm run dev
```

This will:
1. Build the web dashboard
2. Start the Discord bot with nodemon for auto-restarting

### Update Discord Slash Commands

```bash
npm run update
```

Run this after making changes to slash commands to update them on Discord.

### Web Dashboard Only

Build the dashboard:
```bash
npm run build
```

Run the server:
```bash
npm run dev:server
```

Frontend development mode:
```bash
npm run dev:client
```

## Basic Usage

1. **Invite the bot to your server** using the Discord OAuth2 URL generator
2. **Access the web dashboard** at `http://localhost:3100` (or your configured port)
3. **Use commands in Discord**:
   - Slash commands: `/help`
   - Text commands: `!help` (or your configured prefix)

## Additional Resources

- For detailed development instructions, see [README-DEV.md](README-DEV.md)
- For troubleshooting, check the [Troubleshooting section](README-DEV.md#troubleshooting)

## License

This project is licensed under the Apache License 2.0 - see the LICENSE file for details.
