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

### Prerequisites

- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)
- Discord Developer Account
- Basic knowledge of JavaScript

### Setting Up Your Discord Bot

1. **Create a Discord Application**
   - Go to the [Discord Developer Portal](https://discord.com/developers/applications)
   - Click "New Application" and give it a name
   - Go to the "Bot" tab and click "Add Bot"
   - Under "Privileged Gateway Intents", enable:
     - Presence Intent
     - Server Members Intent
     - Message Content Intent
   - Save your changes

2. **Get Your Bot Token**
   - In the Bot tab, click "Reset Token" or copy your existing token
   - Keep this token secure, as it grants full access to your bot

3. **Invite the Bot to Your Server**
   - Go to the "OAuth2" tab, then "URL Generator"
   - Select the scopes: `bot` and `applications.commands`
   - Select the permissions your bot needs (recommended: "Administrator" for testing)
   - Copy the generated URL and open it in your browser
   - Select the server where you want to add the bot

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
   ```bash
   cp .env.example .env
   ```
   - Edit the `.env` file with your settings:
   ```
   # Bot Configuration
   DISCORD_TOKEN=your_discord_bot_token
   CLIENT_ID=your_discord_application_id
   GUILD_ID=your_discord_server_id    # Optional: for dev environments
   PREFIX=!                           # Default prefix for text commands
   
   # Web Dashboard
   DASHBOARD_ENABLED=true
   DASHBOARD_PORT=3100
   DASHBOARD_SECRET=some_random_string
   DISCORD_OAUTH_CLIENT_SECRET=your_client_secret
   
   # Telegram Integration (optional)
   TELEGRAM_ENABLED=false
   TELEGRAM_TOKEN=your_telegram_token
   TELEGRAM_CHAT_ID=your_chat_id
   
   # Database
   DATABASE_PATH=./data/database.sqlite
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

2. **Development mode** (with auto-restart on file changes)
   ```bash
   npm run dev
   ```

3. **Accessing the Dashboard**
   - Open `http://localhost:3100` in your browser (or the port you configured)
   - Login with Discord OAuth
   - Navigate to the "Packages" section to manage your bot's functionality

### Understanding the Package System

RiikonBot uses a modular package system that allows you to add, remove, or modify functionality without changing the core code. Each package is a self-contained module that can provide commands, event handlers, and other features.

#### Package Lifecycle Methods

Each package has four main lifecycle methods:

- `initialize`: Called when the bot starts up
- `onEnable`: Called when the package is enabled
- `onDisable`: Called when the package is disabled
- `onConfigUpdate`: Called when the package configuration is updated

#### Package Structure

Packages are stored in `src/packages/available/` and follow this structure:

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

### Creating Custom Packages

1. **Create the package directory**
   ```bash
   mkdir -p src/packages/available/your-package-name
   cd src/packages/available/your-package-name
   ```

2. **Create the required files**

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
     
     // You can also load additional resources here
     // For example: connect to external APIs, load data, etc.
   }

   export async function onConfigUpdate(newConfig) {
     logger.info(`[${config.name}] Config updated`);
     config = newConfig;
     
     // React to configuration changes
     // For example: update internal settings, reconnect to services, etc.
   }

   export async function onEnable() {
     logger.info(`[${config.name}] Package enabled`);
     
     // Start your package functionality here
     // For example: schedule tasks, start services, etc.
   }

   export async function onDisable() {
     logger.info(`[${config.name}] Package disabled`);
     
     // Clean up resources, close connections, etc.
   }

   // You can add additional helper functions as needed
   ```

3. **Adding Slash Commands**

   First, create a command file (e.g., `commands/greet.js`):

   ```js
   import logger from '../../../../utils/logger.js';

   export const config = {
     name: 'greet',
     description: 'Greets the user or mentioned person',
     options: [
       {
         name: 'user',
         description: 'The user to greet',
         type: 6, // USER type
         required: false
       },
       {
         name: 'message',
         description: 'Custom greeting message',
         type: 3, // STRING type
         required: false
       }
     ]
   };

   export async function execute(interaction, client) {
     const user = interaction.options.getUser('user') || interaction.user;
     const message = interaction.options.getString('message') || 'Hello';
     
     await interaction.reply(`${message}, ${user.toString()}!`);
     logger.info(`Greeting command used by ${interaction.user.tag}`);
   }
   ```

   Then, register your commands in `commands/index.js`:

   ```js
   import { readdirSync } from 'fs';
   import { fileURLToPath } from 'url';
   import { dirname, join } from 'path';
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

4. **Adding Text-Based Commands (Prefix Commands)**

   Create `prefixCommands/index.js`:

   ```js
   import logger from '../../../../utils/logger.js';

   export function registerPrefixCommands(client, packageManager, config) {
     // Register a simple text command
     packageManager.registerPrefixCommand({
       name: 'hello',
       description: 'Says hello',
       execute: async (message, args, client) => {
         message.reply('Hello there!');
       }
     }, config.name);
     
     // Register another command with arguments
     packageManager.registerPrefixCommand({
       name: 'echo',
       description: 'Echoes your message',
       execute: async (message, args, client) => {
         const content = args.join(' ');
         if (!content) {
           message.reply('Please provide something to echo!');
           return;
         }
         message.reply(content);
       }
     }, config.name);
     
     logger.info(`Registered ${config.name} prefix commands`);
   }
   ```

5. **Handling Discord Events**

   Create `events/index.js`:

   ```js
   import logger from '../../../../utils/logger.js';

   export function registerEvents(client, packageManager, config) {
     // Handle message creation events
     packageManager.registerEventListener(
       'messageCreate', 
       (message, client) => {
         // Ignore bot messages
         if (message.author.bot) return;
         
         // Do something with user messages
         if (message.content.includes('hello') && !message.content.startsWith(config.prefix)) {
           message.reply('Hi there! I noticed you said hello.');
           logger.info(`Responded to hello message from ${message.author.tag}`);
         }
       }, 
       config.name
     );
     
     // Handle guild member joining
     packageManager.registerEventListener(
       'guildMemberAdd',
       (member, client) => {
         // Send welcome message
         const welcomeChannel = member.guild.channels.cache.find(
           channel => channel.name === 'welcome' || channel.name === 'general'
         );
         
         if (welcomeChannel) {
           welcomeChannel.send(`Welcome to the server, ${member.toString()}!`);
           logger.info(`New member welcomed: ${member.user.tag}`);
         }
       },
       config.name
     );
     
     logger.info(`Registered ${config.name} event listeners`);
   }
   ```

6. **Enabling the Package**

   After creating your package, you need to enable it:
   
   - Through the web dashboard:
     - Navigate to the "Packages" section
     - Find your package and toggle it on
   
   - Through configuration:
     - Edit the `config.json` file in the data directory
     - Set your package's `enabled` property to `true`

### Advanced Package Development

#### Accessing the Database

RiikonBot comes with a SQLite database that packages can use to store data.

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

#### Scheduling Tasks

You can schedule tasks to run at specific intervals:

```js
import { scheduleJob } from '../../../utils/scheduler.js';

// In your initialize or onEnable function
const jobId = scheduleJob(
  '*/10 * * * *',  // Cron pattern (every 10 minutes)
  async () => {
    // Your task logic here
    logger.info('Scheduled task running');
  },
  config.name
);

// In your onDisable function, cancel the job
cancelJob(jobId);
```

#### Making HTTP Requests

For external API integration:

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

### Troubleshooting

#### Common Issues

- **Command not registering**
  - Run `npm run update` to update slash commands
  - Check the command structure and make sure it follows Discord's API requirements
  - Verify permissions in the Discord Developer Portal

- **Database errors**
  - Check if the database directory exists and is writable
  - Ensure proper SQL syntax in your queries
  - Make sure you're handling promises correctly with `async/await`

- **Telegram errors**
  - Verify your Telegram token and chat ID in the .env file
  - Ensure the bot is an admin in the specified chat
  - Check if Telegram integration is enabled in the .env file

- **Package not loading**
  - Check the logs for any syntax errors in your package code
  - Verify that your package.json has the correct structure
  - Make sure the package is enabled in the configuration

- **Web dashboard not working**
  - Check if the dashboard is enabled in the .env file
  - Verify the port is not in use by another application
  - Ensure your OAuth2 redirect URI is correctly set in the Discord Developer Portal

#### Debug Mode

For detailed logging, you can enable debug mode:

```bash
DEBUG=true npm run dev
```

This will provide more verbose logs to help diagnose issues.

### Available Commands

Use the `/help` command in Discord or run the help command in Telegram to see all available commands.

You can also view and manage commands through the web dashboard.

### License

This project is licensed under the Apache License 2.0 - see the LICENSE file for details.

---

## Tiếng Việt

### Giới thiệu

RiikonBot là một bot Discord mạnh mẽ và mô-đun, được xây dựng với khả năng mở rộng. Kiến trúc dựa trên gói cho phép dễ dàng thêm tính năng mới mà không cần sửa đổi mã nguồn cốt lõi. Nó còn bao gồm bảng điều khiển web để cấu hình và tích hợp Telegram để giám sát từ xa.

### Tính năng

- **Hệ thống gói mô-đun**: Thêm, xóa hoặc sửa đổi chức năng thông qua các gói
- **Bảng điều khiển web**: Dễ dàng cấu hình và quản lý bot thông qua giao diện web
- **Tích hợp Telegram**: Giám sát và điều khiển bot của bạn từ xa qua Telegram
- **Hỗ trợ cơ sở dữ liệu**: Theo dõi cấu hình và dữ liệu người dùng với SQLite
- **Hỗ trợ lệnh Slash**: Tích hợp lệnh slash Discord hiện đại

### Điều kiện tiên quyết

- Node.js (v14.0.0 trở lên)
- npm (v6.0.0 trở lên)
- Tài khoản Discord Developer
- Kiến thức cơ bản về JavaScript

### Thiết lập Bot Discord của bạn

1. **Tạo ứng dụng Discord**
   - Truy cập [Discord Developer Portal](https://discord.com/developers/applications)
   - Nhấp "New Application" và đặt tên cho nó
   - Chuyển đến tab "Bot" và nhấp "Add Bot"
   - Trong phần "Privileged Gateway Intents", hãy bật:
     - Presence Intent
     - Server Members Intent
     - Message Content Intent
   - Lưu thay đổi của bạn

2. **Lấy token của Bot**
   - Trong tab Bot, nhấp "Reset Token" hoặc sao chép token hiện có
   - Giữ token này an toàn, vì nó cấp quyền truy cập đầy đủ vào bot của bạn

3. **Mời Bot vào server của bạn**
   - Chuyển đến tab "OAuth2", sau đó "URL Generator"
   - Chọn các phạm vi: `bot` và `applications.commands`
   - Chọn quyền mà bot của bạn cần (khuyến nghị: "Administrator" để kiểm tra)
   - Sao chép URL đã tạo và mở nó trong trình duyệt của bạn
   - Chọn server nơi bạn muốn thêm bot

### Cài đặt

1. **Clone repository**
   ```bash
   git clone https://github.com/Riikon-Team/RiikonBot.git
   cd RiikonBot
   ```

2. **Cài đặt các gói phụ thuộc**
   ```bash
   npm install
   ```

3. **Cấu hình môi trường**
   - Sao chép `.env.example` thành `.env`
   ```bash
   cp .env.example .env
   ```
   - Chỉnh sửa file `.env` với cài đặt của bạn:
   ```
   # Cấu hình Bot
   DISCORD_TOKEN=token_bot_discord_của_bạn
   CLIENT_ID=id_ứng_dụng_discord_của_bạn
   GUILD_ID=id_server_discord_của_bạn   # Tùy chọn: cho môi trường phát triển
   PREFIX=!                             # Prefix mặc định cho lệnh văn bản
   
   # Bảng điều khiển Web
   DASHBOARD_ENABLED=true
   DASHBOARD_PORT=3100
   DASHBOARD_SECRET=chuỗi_ngẫu_nhiên
   DISCORD_OAUTH_CLIENT_SECRET=client_secret_của_bạn
   
   # Tích hợp Telegram (tùy chọn)
   TELEGRAM_ENABLED=false
   TELEGRAM_TOKEN=token_telegram_của_bạn
   TELEGRAM_CHAT_ID=chat_id_của_bạn
   
   # Cơ sở dữ liệu
   DATABASE_PATH=./data/database.sqlite
   ```

4. **Cập nhật lệnh slash Discord**
   ```bash
   npm run update
   ```

5. **Xây dựng ứng dụng**
   ```bash
   npm run build
   ```

### Chạy Bot

1. **Khởi động bot**
   ```bash
   npm start
   ```

2. **Chế độ phát triển** (với tự động khởi động lại khi file thay đổi)
   ```bash
   npm run dev
   ```

3. **Truy cập bảng điều khiển**
   - Mở `http://localhost:3100` trong trình duyệt (hoặc cổng bạn đã cấu hình)
   - Đăng nhập bằng OAuth Discord
   - Điều hướng đến phần "Packages" để quản lý chức năng của bot của bạn

### Hiểu về hệ thống gói

RiikonBot sử dụng hệ thống gói mô-đun cho phép bạn thêm, xóa hoặc sửa đổi chức năng mà không thay đổi mã cốt lõi. Mỗi gói là một mô-đun độc lập có thể cung cấp lệnh, trình xử lý sự kiện và các tính năng khác.

#### Các phương thức vòng đời của gói

Mỗi gói có bốn phương thức vòng đời chính:

- `initialize`: Được gọi khi bot khởi động
- `onEnable`: Được gọi khi gói được bật
- `onDisable`: Được gọi khi gói bị tắt
- `onConfigUpdate`: Được gọi khi cấu hình gói được cập nhật

#### Cấu trúc gói

Các gói được lưu trữ trong `src/packages/available/` và tuân theo cấu trúc này:

```
package-name/
├── package.json        # Siêu dữ liệu và cấu hình gói
├── index.js            # File chính của gói với các phương thức vòng đời
├── commands/           # Lệnh slash
│   ├── command1.js     # File lệnh riêng lẻ
│   ├── command2.js     # Lệnh khác
│   └── index.js        # Đăng ký lệnh
├── prefixCommands/     # Lệnh tin nhắn thông thường
│   └── index.js        # Đăng ký lệnh prefix
└── events/             # Trình xử lý sự kiện
    └── index.js        # Đăng ký sự kiện
```

### Tạo gói tùy chỉnh

1. **Tạo thư mục gói**
   ```bash
   mkdir -p src/packages/available/tên-gói-của-bạn
   cd src/packages/available/tên-gói-của-bạn
   ```

2. **Tạo các file bắt buộc**

   **package.json**:
   ```json
   {
     "name": "tên-gói-của-bạn",
     "version": "1.0.0",
     "description": "Mô tả gói của bạn",
     "main": "index.js",
     "author": "Tên của bạn",
     "type": "module",
     "defaultConfig": {
       "prefix": "!",
       "enabled": true,
       "customSetting": "giá trị"
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
     
     logger.info(`[${config.name}] Gói đã được khởi tạo`);
     
     // Bạn cũng có thể tải thêm tài nguyên ở đây
     // Ví dụ: kết nối với API bên ngoài, tải dữ liệu, v.v.
   }

   export async function onConfigUpdate(newConfig) {
     logger.info(`[${config.name}] Cấu hình đã được cập nhật`);
     config = newConfig;
     
     // Phản ứng với các thay đổi cấu hình
     // Ví dụ: cập nhật cài đặt nội bộ, kết nối lại với dịch vụ, v.v.
   }

   export async function onEnable() {
     logger.info(`[${config.name}] Gói đã được bật`);
     
     // Bắt đầu chức năng gói của bạn ở đây
     // Ví dụ: lên lịch cho các tác vụ, khởi động dịch vụ, v.v.
   }

   export async function onDisable() {
     logger.info(`[${config.name}] Gói đã bị tắt`);
     
     // Dọn dẹp tài nguyên, đóng kết nối, v.v.
   }

   // Bạn có thể thêm các hàm trợ giúp bổ sung khi cần
   ```

3. **Thêm lệnh Slash**

   Đầu tiên, tạo một file lệnh (ví dụ, `commands/chao.js`):

   ```js
   import logger from '../../../../utils/logger.js';

   export const config = {
     name: 'chao',
     description: 'Chào người dùng hoặc người được đề cập',
     options: [
       {
         name: 'nguoi-dung',
         description: 'Người dùng để chào',
         type: 6, // Kiểu USER
         required: false
       },
       {
         name: 'tin-nhan',
         description: 'Thông điệp chào tùy chỉnh',
         type: 3, // Kiểu STRING
         required: false
       }
     ]
   };

   export async function execute(interaction, client) {
     const user = interaction.options.getUser('nguoi-dung') || interaction.user;
     const message = interaction.options.getString('tin-nhan') || 'Xin chào';
     
     await interaction.reply(`${message}, ${user.toString()}!`);
     logger.info(`Lệnh chào được sử dụng bởi ${interaction.user.tag}`);
   }
   ```

   Sau đó, đăng ký lệnh của bạn trong `commands/index.js`:

   ```js
   import { readdirSync } from 'fs';
   import { fileURLToPath } from 'url';
   import { dirname, join } from 'path';
   import logger from '../../../../utils/logger.js';

   const __filename = fileURLToPath(import.meta.url);
   const __dirname = dirname(__filename);

   export async function registerCommands(client, packageManager, config) {
     // Lấy tất cả các file .js trong thư mục commands trừ index.js
     const commandFiles = readdirSync(__dirname)
       .filter(file => file.endsWith('.js') && file !== 'index.js');
     
     for (const file of commandFiles) {
       try {
         // Import module lệnh
         const commandModule = await import(`./${file}`);
         
         // Đăng ký lệnh với package manager
         packageManager.registerCommand(
           commandModule.config,
           commandModule.execute,
           config.name
         );
         
         logger.info(`Đã đăng ký lệnh: ${commandModule.config.name}`);
       } catch (error) {
         logger.error(`Lỗi khi đăng ký lệnh từ ${file}: ${error.message}`);
       }
     }
   }
   ```

4. **Thêm lệnh dựa trên văn bản (Lệnh Prefix)**

   Tạo `prefixCommands/index.js`:

   ```js
   import logger from '../../../../utils/logger.js';

   export function registerPrefixCommands(client, packageManager, config) {
     // Đăng ký một lệnh văn bản đơn giản
     packageManager.registerPrefixCommand({
       name: 'xin-chao',
       description: 'Nói xin chào',
       execute: async (message, args, client) => {
         message.reply('Xin chào bạn!');
       }
     }, config.name);
     
     // Đăng ký một lệnh khác với đối số
     packageManager.registerPrefixCommand({
       name: 'echo',
       description: 'Lặp lại tin nhắn của bạn',
       execute: async (message, args, client) => {
         const content = args.join(' ');
         if (!content) {
           message.reply('Vui lòng cung cấp nội dung để lặp lại!');
           return;
         }
         message.reply(content);
       }
     }, config.name);
     
     logger.info(`Đã đăng ký các lệnh prefix của ${config.name}`);
   }
   ```

5. **Xử lý sự kiện Discord**

   Tạo `events/index.js`:

   ```js
   import logger from '../../../../utils/logger.js';

   export function registerEvents(client, packageManager, config) {
     // Xử lý sự kiện tạo tin nhắn
     packageManager.registerEventListener(
       'messageCreate', 
       (message, client) => {
         // Bỏ qua tin nhắn từ bot
         if (message.author.bot) return;
         
         // Làm gì đó với tin nhắn người dùng
         if (message.content.includes('xin chào') && !message.content.startsWith(config.prefix)) {
           message.reply('Chào bạn! Tôi nhận thấy bạn đã nói xin chào.');
           logger.info(`Đã phản hồi tin nhắn xin chào từ ${message.author.tag}`);
         }
       }, 
       config.name
     );
     
     // Xử lý thành viên guild tham gia
     packageManager.registerEventListener(
       'guildMemberAdd',
       (member, client) => {
         // Gửi tin nhắn chào mừng
         const welcomeChannel = member.guild.channels.cache.find(
           channel => channel.name === 'welcome' || channel.name === 'general'
         );
         
         if (welcomeChannel) {
           welcomeChannel.send(`Chào mừng đến với server, ${member.toString()}!`);
           logger.info(`Đã chào mừng thành viên mới: ${member.user.tag}`);
         }
       },
       config.name
     );
     
     logger.info(`Đã đăng ký các trình lắng nghe sự kiện ${config.name}`);
   }
   ```

6. **Bật gói**

   Sau khi tạo gói, bạn cần bật nó:
   
   - Thông qua bảng điều khiển web:
     - Điều hướng đến phần "Packages"
     - Tìm gói của bạn và bật nó
   
   - Thông qua cấu hình:
     - Chỉnh sửa file `config.json` trong thư mục data
     - Đặt thuộc tính `enabled` của gói bạn thành `true`

### Phát triển gói nâng cao

#### Truy cập cơ sở dữ liệu

RiikonBot đi kèm với cơ sở dữ liệu SQLite mà các gói có thể sử dụng để lưu trữ dữ liệu.

```js
import { getDatabase } from '../../../utils/database.js';

// Trong một trong các hàm của bạn
const db = getDatabase();

// Tạo bảng nếu nó không tồn tại
await db.run(`
  CREATE TABLE IF NOT EXISTS du_lieu_goi_cua_toi (
    user_id TEXT PRIMARY KEY,
    value TEXT,
    timestamp INTEGER
  )
`);

// Chèn dữ liệu
await db.run(
  'INSERT OR REPLACE INTO du_lieu_goi_cua_toi (user_id, value, timestamp) VALUES (?, ?, ?)',
  [userId, data, Date.now()]
);

// Truy vấn dữ liệu
const rows = await db.all('SELECT * FROM du_lieu_goi_cua_toi WHERE user_id = ?', [userId]);
```

#### Lên lịch cho các tác vụ

Bạn có thể lên lịch cho các tác vụ chạy ở các khoảng thời gian cụ thể:

```js
import { scheduleJob } from '../../../utils/scheduler.js';

// Trong hàm initialize hoặc onEnable của bạn
const jobId = scheduleJob(
  '*/10 * * * *',  // Mẫu Cron (mỗi 10 phút)
  async () => {
    // Logic tác vụ của bạn ở đây
    logger.info('Tác vụ theo lịch đang chạy');
  },
  config.name
);

// Trong hàm onDisable của bạn, hủy công việc
cancelJob(jobId);
```

#### Thực hiện yêu cầu HTTP

Cho tích hợp API bên ngoài:

```js
import fetch from 'node-fetch';

async function getWeather(location) {
  try {
    const response = await fetch(`https://api.weather.com/v1/location=${encodeURIComponent(location)}`);
    return await response.json();
  } catch (error) {
    logger.error(`Lỗi API thời tiết: ${error.message}`);
    return null;
  }
}
```

### Xử lý sự cố

#### Vấn đề phổ biến

- **Lệnh không đăng ký**
  - Chạy `npm run update` để cập nhật lệnh slash
  - Kiểm tra cấu trúc lệnh và đảm bảo nó tuân theo yêu cầu API của Discord
  - Xác minh quyền trong Discord Developer Portal

- **Lỗi cơ sở dữ liệu**
  - Kiểm tra xem thư mục cơ sở dữ liệu có tồn tại và có thể ghi không
  - Đảm bảo cú pháp SQL đúng trong các truy vấn của bạn
  - Đảm bảo bạn đang xử lý promises đúng cách với `async/await`

- **Lỗi Telegram**
  - Xác minh token Telegram và chat ID của bạn trong file .env
  - Đảm bảo bot là quản trị viên trong chat đã chỉ định
  - Kiểm tra xem tích hợp Telegram có được bật trong file .env không

- **Gói không tải**
  - Kiểm tra logs để tìm lỗi cú pháp trong mã gói của bạn
  - Xác minh rằng package.json của bạn có cấu trúc đúng
  - Đảm bảo gói được bật trong cấu hình

- **Bảng điều khiển web không hoạt động**
  - Kiểm tra xem bảng điều khiển có được bật trong file .env không
  - Xác minh cổng không bị sử dụng bởi ứng dụng khác
  - Đảm bảo URI chuyển hướng OAuth2 của bạn được đặt đúng trong Discord Developer Portal

#### Chế độ gỡ lỗi

Để ghi nhật ký chi tiết, bạn có thể bật chế độ gỡ lỗi:

```bash
DEBUG=true npm run dev
```

Điều này sẽ cung cấp logs chi tiết hơn để giúp chẩn đoán các vấn đề.

### Các lệnh có sẵn

Sử dụng lệnh `/help` trong Discord hoặc chạy lệnh help trong Telegram để xem tất cả các lệnh có sẵn.

Bạn cũng có thể xem và quản lý các lệnh thông qua bảng điều khiển web.

### Giấy phép

Dự án này được cấp phép theo Apache License 2.0 - xem file LICENSE để biết chi tiết.