---
trigger: always_on
glob:
description: System rules for the Profile CV project — enforced on every agent run.
---

# Profile CV — System Rules

> Các quy tắc dưới đây là BẮT BUỘC cho mọi task trong dự án này.
> Spec chi tiết (schema, endpoints, features) xem `prProfile.md`.

---

## 1. Tech Stack — KHÔNG ĐƯỢC THAY ĐỔI

| Layer      | Bắt buộc dùng                              | Cấm                                   |
| ---------- | ------------------------------------------- | -------------------------------------- |
| Frontend   | HTML, CSS (file `.css` riêng), JS (file `.js` riêng) | Framework CSS (Bootstrap, Tailwind), Framework JS (React, Vue, Angular) |
| Backend    | PHP thuần (API trả JSON)                    | Laravel, Symfony, bất kỳ PHP framework |
| Database   | SQLite (file `.db`)                         | MySQL, PostgreSQL, MongoDB             |
| Icons      | SVG inline hoặc emoji                       | Font Awesome, Material Icons, bất kỳ thư viện icon ngoài |

- Frontend gọi API bằng `fetch()`, nhận JSON, render DOM bằng JavaScript.
- PHP API nhận request qua query string `?action=...`, trả JSON.
- Không import CDN cho framework. Chỉ được dùng CDN cho Google Fonts.

---

## 2. Kiến trúc file — BẮT BUỘC TUÂN THỦ

```
profile/
├── index.html              ← Trang chính (public)
├── admin/
│   └── index.html          ← Trang quản trị nội dung
├── css/
│   ├── style.css           ← Style cho index.html
│   └── admin.css           ← Style cho admin/index.html
├── js/
│   ├── main.js             ← Logic frontend
│   └── admin.js            ← Logic admin
├── api/
│   ├── index.php           ← Router API chính
│   ├── config.php          ← Kết nối SQLite + cấu hình
│   ├── auth.php            ← Xác thực session
│   ├── profile.php         ← CRUD profile
│   ├── skills.php          ← CRUD skills
│   ├── projects.php        ← CRUD projects
│   ├── education.php       ← CRUD education
│   ├── experience.php      ← CRUD experience
│   ├── contact.php         ← Contact messages
│   └── settings.php        ← Settings
├── uploads/                ← Ảnh upload
├── data/
│   └── profile.db          ← SQLite database
└── README.md
```

**Quy tắc:**
- KHÔNG tạo file ngoài cấu trúc trên trừ khi được human cho phép.
- Mỗi PHP resource có file riêng, KHÔNG gộp nhiều resource vào một file.
- CSS và JS PHẢI tách file riêng, KHÔNG viết inline trong HTML.

---

## 3. Quy tắc Code — ÁP DỤNG MỌI LÚC

| Quy tắc            | Chi tiết                                          |
| ------------------- | ------------------------------------------------- |
| CSS                 | File riêng, dùng CSS Variables (`--var`) cho theme |
| JavaScript          | File riêng, dùng `fetch()` gọi API, cú pháp ES6+ |
| PHP                 | Mỗi resource một file, chỉ trả JSON              |
| Naming — JS         | `camelCase` cho biến và hàm                       |
| Naming — PHP/DB     | `snake_case` cho biến, hàm, tên cột               |
| Comment             | Tiếng Việt hoặc tiếng Anh, nhất quán trong file   |
| API response lỗi    | `{"success": false, "message": "..."}`            |
| API response thành công | `{"success": true, "data": ...}`              |

---

## 4. Bảo mật — KHÔNG BAO GIỜ ĐƯỢC BỎ QUA

- Mật khẩu admin **phải** hash bằng `password_hash()` / `password_verify()`.
- **Mọi query SQLite** phải dùng Prepared Statements — KHÔNG nối chuỗi trực tiếp.
- Validate và sanitize **mọi input** phía server trước khi xử lý.
- Auth admin dùng PHP Session — kiểm tra session trước mọi API có `Auth = ✓`.
- Upload ảnh: giới hạn **2MB**, chỉ cho phép **jpg, png, webp**.
- Đặt CORS headers khi cần thiết.

---

## 5. Yêu cầu UI/UX — BẮT BUỘC KHI VIẾT FRONTEND

- **Responsive**: mobile-first, hoạt động tốt trên mọi kích thước màn hình.
- **Dark mode mặc định**, hỗ trợ chuyển sang Light và Ocean theme.
- **Smooth scroll** giữa các section trên trang chính.
- **Micro-animation**: fade-in khi scroll, hover effect trên card/button,
  progress bar animation cho skills.
- **Typography**: Google Fonts — dùng Inter hoặc Outfit.
- **Color palette**:
  - Dark: gradient tối (slate/indigo).
  - Ocean: tông xanh biển.
  - Light: sáng nhẹ, thanh lịch.
- Giao diện Admin: sidebar trái + content phải, responsive thu gọn sidebar
  trên mobile, modal confirm khi xóa.

---

## 6. Tham chiếu

Khi cần chi tiết về Database Schema, API Endpoints, danh sách features,
hoặc thứ tự triển khai → đọc file `prProfile.md`.
