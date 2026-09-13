# Realtime Chat - Frontend (Next.js)

Giao diện chat realtime: đăng nhập/đăng ký, nhắn tin 1-1, gửi ảnh, emoji,
báo "đang gõ", chấm xanh online và dấu tích đã xem.

Cần chạy backend (`../realtime-chat-backend`) trước.

## 1. Chạy thử

```bash
npm install
npm run dev
```

File `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

## 2. Cấu trúc thư mục

```
src/
├── app/                     # route của Next.js (App Router)
│   ├── page.tsx             # màn hình chat, chỉ còn phần bố cục 3 cột
│   ├── login/page.tsx
│   └── signup/page.tsx
├── components/
│   ├── auth/                # các mảnh dùng chung của 2 trang login & signup
│   │   ├── AuthLayout.tsx   # khung 2 cột (giới thiệu | form)
│   │   ├── TextField.tsx    # ô nhập có icon
│   │   ├── PasswordField.tsx
│   │   ├── SubmitButton.tsx
│   │   ├── SocialAuthButtons.tsx
│   │   ├── TermsCheckbox.tsx
│   │   └── FormError.tsx
│   ├── chat/                # các thành phần của màn hình chat
│   └── ui/                  # component shadcn/ui (chỉ giữ cái đang dùng)
├── hooks/
│   ├── useChatSocket.ts     # nghe sự kiện WebSocket -> đổ vào store
│   ├── useChatData.ts       # gọi REST API -> đổ vào store
│   ├── useChatActions.ts    # gửi/sửa/xoá tin, báo đang gõ
│   ├── useRequireAuth.ts    # chặn trang khi chưa đăng nhập
│   ├── useAvatarUpload.ts
│   └── useTypingNotifier.ts
├── lib/
│   ├── axios.ts             # axios instance, tự gắn Bearer token
│   ├── chat-mappers.ts      # đổi dữ liệu API -> dữ liệu cho UI
│   ├── errors.ts            # lấy thông báo lỗi từ response của NestJS
│   └── utils.ts
├── services/
│   ├── auth.service.ts      # POST /auth/login, /auth/signup
│   ├── chat.service.ts      # các API users / conversations / messages
│   └── socket.service.ts    # bọc socket.io-client, gom tên sự kiện một chỗ
├── stores/
│   ├── auth.store.ts        # user + token (lưu localStorage)
│   └── chat.store.ts        # conversations, messages, ai đang online
└── types/
    ├── api.ts               # đúng như backend trả về (_id, senderId...)
    └── chat.ts              # dạng đã gọn cho UI (id, user, timestamp...)
```

## 3. Dữ liệu chảy như thế nào

```
REST API  --useChatData-->  chat.store  -->  component
WebSocket --useChatSocket-->    ^
component --useChatActions--> WebSocket --> backend
```

- **services/** chỉ biết gọi API, không biết gì về React.
- **hooks/** nối services với store.
- **components/** chỉ đọc store và vẽ giao diện.

Nhờ vậy `app/page.tsx` chỉ còn ~85 dòng bố cục, không còn chứa logic socket.

## 4. Lệnh hay dùng

```bash
npm run dev     # chạy dev (http://localhost:3000)
npm run build   # build production
npm start       # chạy bản đã build
npm run lint    # kiểm tra code style
```

## 5. Phần còn là giao diện mẫu

Những chỗ này chưa có backend, đang để `disabled` hoặc dùng dữ liệu mẫu:

- Đăng nhập bằng Google / GitHub (`components/auth/SocialAuthButtons.tsx`)
- Nút gọi điện / gọi video / tìm trong hội thoại (`components/chat/ChatHeader.tsx`)
- Nút ghi âm trong ô nhập tin (`components/chat/MessageInput.tsx`)
- Danh sách file đã gửi (`components/chat/SharedFilesSection.tsx`)

## 6. Thêm lại component shadcn/ui

Các component không dùng đã bị xoá cho gọn. Cần cái nào thì cài lại:

```bash
npx shadcn@latest add <tên-component>
```
