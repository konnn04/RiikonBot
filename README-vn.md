## Tiếng Việt

### Giới thiệu

RiikonBot là một bot Discord mạnh mẽ và mô-đun, được xây dựng với khả năng mở rộng. Kiến trúc dựa trên gói cho phép dễ dàng thêm tính năng mới mà không cần sửa đổi mã nguồn cốt lõi. Nó còn bao gồm bảng điều khiển web để cấu hình và tích hợp Telegram để giám sát từ xa.

### Tính năng

- **Hệ thống gói mô-đun**: Thêm, xóa hoặc sửa đổi chức năng thông qua các gói
- **Bảng điều khiển web**: Dễ dàng cấu hình và quản lý bot thông qua giao diện web
- **Tích hợp Telegram**: Giám sát và điều khiển bot của bạn từ xa qua Telegram
- **Hỗ trợ cơ sở dữ liệu**: Theo dõi cấu hình và dữ liệu người dùng với SQLite
- **Hỗ trợ lệnh Slash**: Tích hợp lệnh slash Discord hiện đại

### Yêu cầu

- Node.js (v14.0.0 trở lên)
- npm (v6.0.0 trở lên)
- Token Bot Discord
- (Tùy chọn) Token Bot Telegram để giám sát

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
   - Điền token Discord và các giá trị cấu hình khác của bạn
   ```bash
   cp .env.example .env
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

2. **Chế độ phát triển**
   ```bash
   npm run dev
   ```

3. **Truy cập bảng điều khiển**
   - Mở `http://localhost:3100` trong trình duyệt (hoặc cổng bạn đã cấu hình)
   - Đăng nhập bằng OAuth Discord

### Quản lý gói

Các gói được lưu trữ trong `src/packages/available/` và có thể được bật/tắt thông qua bảng điều khiển web.

### Tạo gói tùy chỉnh

1. **Cấu trúc gói cơ bản**
   ```
   package-name/
   ├── package.json        # Siêu dữ liệu và cấu hình gói
   ├── index.js            # File chính của gói với các phương thức vòng đời
   ├── commands/           # Lệnh slash
   │   └── index.js        # Đăng ký lệnh
   ├── prefixCommands/     # Lệnh thông qua tin nhắn thông thường
   │   └── index.js        # Đăng ký lệnh prefix
   └── events/             # Các xử lý sự kiện
       └── index.js        # Đăng ký sự kiện
   ```

2. **Các file bắt buộc**:

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
     
     logger.info('Gói của bạn đã được khởi tạo');
   }

   export async function onConfigUpdate(newConfig) {
     config = newConfig;
   }

   export async function onEnable() {
     logger.info('Gói của bạn đã được bật');
   }

   export async function onDisable() {
     logger.info('Gói của bạn đã bị tắt');
   }
   ```

3. **Thêm lệnh**

   Tạo file lệnh trong `commands/tenlenhcuaban.js`:
   ```js
   import logger from '../../../../utils/logger.js';

   export const config = {
     name: 'tenlenhcuaban',
     description: 'Mô tả lệnh của bạn'
   };

   export async function execute(interaction, client) {
     await interaction.reply('Phản hồi của bạn ở đây!');
   }
   ```

4. **Đăng ký sự kiện**

   Trong `events/index.js`:
   ```js
   export function registerEvents(client, packageManager, config) {
     packageManager.registerEventListener('messageCreate', (message, client) => 
       // Hàm xử lý của bạn
     , 'tên-gói-của-bạn');
   }
   ```

### Các lệnh có sẵn

Sử dụng lệnh `/help` trong Discord hoặc chạy lệnh help trong Telegram để xem tất cả các lệnh có sẵn.

### Xử lý sự cố

- **Lệnh không đăng ký**: Chạy `npm run update` để cập nhật lệnh slash
- **Lỗi cơ sở dữ liệu**: Kiểm tra xem thư mục cơ sở dữ liệu có tồn tại và có thể ghi không
- **Lỗi Telegram**: Xác minh token Telegram và ID chat của bạn trong file .env

### Giấy phép

Dự án này được cấp phép theo Apache License 2.0 - xem file LICENSE để biết chi tiết.