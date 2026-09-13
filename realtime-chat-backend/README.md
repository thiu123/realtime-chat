# Realtime Chat - Backend (NestJS)

Backend cho ứng dụng chat realtime: đăng ký / đăng nhập bằng JWT, nhắn tin 1-1,
báo "đang gõ", trạng thái online và đã xem.

- REST API: dùng cho các việc không cần realtime (đăng nhập, tải lịch sử tin nhắn...).
- WebSocket (Socket.IO): dùng cho những việc cần hiện ngay lập tức (tin nhắn mới,
  đang gõ, online/offline).

## 1. Chạy thử

```bash
npm install
npm run start:dev     # có hot reload
```

Tạo file `.env` ở thư mục gốc của backend:

```env
MONGODB_URL=mongodb://localhost:27017/realtime-chat
PORT=5000
JWT_ACCESS_KEY=doi-thanh-chuoi-bi-mat-cua-ban
FRONTEND_URL=http://localhost:3000
```

Kiểm tra server đã sống chưa: mở `http://localhost:5000/api/health`.

> **Nếu database đã có dữ liệu từ trước**, hãy chạy một lần:
>
> ```bash
> npm run migrate:object-ids
> ```
>
> Schema cũ khai báo khoá ngoại bằng `Types.ObjectId`, bị @nestjs/mongoose hiểu thành
> kiểu `Mixed` nên `conversationId` / `senderId` / `lastMessage` bị lưu dưới dạng
> chuỗi (khiến `unreadCount` luôn bằng 0). Schema đã được sửa, script trên đổi nốt
> dữ liệu cũ sang ObjectId. Nhớ backup database trước khi chạy.

## 2. Cấu trúc thư mục

Mỗi thư mục trong `src/` là một **module** của NestJS. Một module thường có đủ 4 phần:

| Tệp | Vai trò |
| --- | --- |
| `*.module.ts` | Khai báo module có gì, import gì, export gì cho module khác dùng |
| `*.controller.ts` | Nhận request HTTP, không chứa logic, chỉ gọi xuống service |
| `*.service.ts` | Logic nghiệp vụ + truy vấn database |
| `schemas/*.ts` | Mô tả cấu trúc collection trong MongoDB (Mongoose) |
| `dto/*.ts` | Mô tả + kiểm tra dữ liệu client gửi lên |

```
src/
├── main.ts                 # khởi động app: CORS, prefix /api, ValidationPipe
├── app.module.ts           # module gốc, gom tất cả module con
├── app.controller.ts       # GET /api/health
├── auth/                   # đăng ký, đăng nhập, JWT
│   ├── auth.constants.ts   # khoá bí mật + thời hạn token (dùng chung 1 chỗ)
│   ├── decorators/         # @CurrentUser() - lấy user đang đăng nhập
│   ├── guards/             # JwtAuthGuard - chặn request không có token
│   └── strategies/         # JwtStrategy - kiểm tra token hợp lệ
├── users/                  # người dùng
├── conversations/          # cuộc trò chuyện giữa 2 người
├── messages/               # tin nhắn
└── chat/                   # WebSocket
    ├── chat.gateway.ts     # "controller" của WebSocket
    ├── chat.types.ts       # kiểu dữ liệu của các sự kiện socket
    └── presence.service.ts # ghi nhớ ai đang online
```

Luồng của một request HTTP:

```
Client -> Guard (nếu có) -> ValidationPipe (kiểm tra DTO) -> Controller -> Service -> MongoDB
```

## 3. REST API

Tất cả đều bắt đầu bằng `/api`.

| Method | Đường dẫn | Ghi chú |
| --- | --- | --- |
| GET | `/health` | kiểm tra server |
| POST | `/auth/signup` | `{ name?, email, password }` -> trả về `access_token` |
| POST | `/auth/login` | `{ email, password }` -> trả về `access_token` |
| GET | `/auth/profile` | cần header `Authorization: Bearer <token>` |
| GET | `/users` | danh sách người dùng |
| GET | `/users/:id` | |
| PATCH | `/users/:id` | `{ name?, avatar? }` |
| PATCH | `/users/:id/avatar` | `{ avatar }` (ảnh base64) |
| DELETE | `/users/:id` | |
| GET | `/conversations?userId=` | kèm `unreadCount` của từng cuộc trò chuyện |
| POST | `/conversations` | `{ userId, participantId }` - có rồi thì trả về, chưa có thì tạo |
| GET | `/conversations/:id` | |
| DELETE | `/conversations/:id` | |
| GET | `/messages/conversation/:conversationId` | lịch sử tin nhắn |
| GET | `/messages/:id` | |
| PATCH | `/messages/:id` | cần token, chỉ sửa được tin của mình |
| DELETE | `/messages/:id` | cần token, chỉ xoá được tin của mình |

## 4. Sự kiện WebSocket

Client gửi lên:

| Sự kiện | Dữ liệu |
| --- | --- |
| `presence:online` | `{ userId }` |
| `joinConversation` | `{ conversationId }` |
| `sendMessage` | `{ conversationId, senderId, content?, type?, imageUrl? }` |
| `updateMessage` | `{ conversationId, messageId, senderId, content }` |
| `deleteMessage` | `{ conversationId, messageId, senderId }` |
| `typing` | `{ conversationId, userId, isTyping }` |
| `markAsRead` | `{ conversationId, userId }` |

Server gửi xuống:

| Sự kiện | Dữ liệu |
| --- | --- |
| `presence:update` | `{ userId, online }` |
| `presence:list` | `{ onlineUserIds }` |
| `newMessage` | tin nhắn vừa tạo |
| `messageUpdated` | tin nhắn sau khi sửa |
| `messageDeleted` | `{ messageId }` |
| `userTyping` | `{ conversationId, userId, isTyping }` |
| `messagesRead` | `{ conversationId, userId, messageIds }` |

## 5. Lệnh hay dùng

```bash
npm run start:dev    # chạy dev, tự nạp lại code
npm run build        # build ra thư mục dist/
npm run start:prod   # chạy bản đã build
npm run lint         # kiểm tra + tự sửa lỗi code style
npm test             # chạy unit test
npm run test:e2e     # chạy test e2e (cần MongoDB)
```

## 6. Điểm cần làm thêm nếu đưa lên production

- Socket đang tin tưởng `senderId` / `userId` do client gửi lên; nên xác thực JWT
  ngay khi socket kết nối rồi lấy id từ token.
- Các route `GET /users`, `/conversations`, `/messages/...` chưa yêu cầu đăng nhập.
- `PresenceService` lưu trong RAM nên chỉ đúng khi chạy 1 server; chạy nhiều server
  thì cần chuyển sang Redis.
- Ảnh đang lưu base64 ngay trong MongoDB; nên đổi sang lưu file/CDN.
