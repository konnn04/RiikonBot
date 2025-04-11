import logger from '../../../../utils/logger.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

// Lưu trữ các handlers của command
const commandHandlers = new Map();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COMMANDS_DIR = path.join(__dirname, '..', 'commands');

// Hàm để nạp tất cả các command từ thư mục commands
async function loadCommands() {
  try {
    // Đảm bảo thư mục commands tồn tại
    if (!fs.existsSync(COMMANDS_DIR)) {
      logger.warn(`Commands directory not found: ${COMMANDS_DIR}`);
      return;
    }
    
    // Đọc tất cả các file trong thư mục commands (không bao gồm index.js)
    const commandFiles = fs.readdirSync(COMMANDS_DIR)
      .filter(file => file.endsWith('.js') && file !== 'index.js');
    
    for (const file of commandFiles) {
      try {
        // Import file command
        const filePath = path.join(COMMANDS_DIR, file);
        const commandModule = await import(pathToFileURL(filePath).href);
        
        // Lấy tên command từ tên file (bỏ .js)
        const commandName = path.basename(file, '.js');
        
        // Đăng ký command handler
        if (commandModule.execute) {
          commandHandlers.set(commandName, commandModule.execute);
          logger.debug(`Loaded command: ${commandName}`);
        } else {
          logger.warn(`Command ${commandName} doesn't have execute function`);
        }
      } catch (error) {
        logger.error(`Error loading command from ${file}:`, error);
      }
    }
    
    logger.info(`Loaded ${commandHandlers.size} commands`);
  } catch (error) {
    logger.error('Error loading commands:', error);
  }
}

// Nạp tất cả các commands khi file này được import
loadCommands();

// Handler xử lý tất cả các command interactions
export async function handleCommand(interaction, client) {
  if (!interaction.isChatInputCommand()) return;
  
  const commandName = interaction.commandName;
  
  // Kiểm tra xem command có được đăng ký trong client.commands không
  if (client.commands && client.commands.has(commandName)) {
    return; // Để cho main command handler xử lý
  }
  
  // Tìm handler cho command
  const handler = commandHandlers.get(commandName);
  if (!handler) return;
  
  try {
    // Thực thi handler
    await handler(interaction, client);
    logger.debug(`Executed command ${commandName} for ${interaction.user.tag}`);
  } catch (error) {
    logger.error(`Error executing command ${commandName}:`, error);
    // Gửi thông báo lỗi nếu chưa reply
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: 'There was an error executing this command!',
        ephemeral: true
      }).catch(() => {});
    }
  }
}
