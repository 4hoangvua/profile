# prProfile — Web Profile / CV cá nhân

> **Mục đích:** Xây dựng một website giới thiệu bản thân (CV/Portfolio) hiện đại,
> đẹp mắt, dễ quản trị nội dung qua trang Admin.

---

## 1. Tổng quan dự án

Website Profile cá nhân dạng single-page, hiển thị thông tin CV/Portfolio chuyên
nghiệp. Toàn bộ dữ liệu được lưu trong SQLite và phục vụ qua PHP API. Giao diện
Frontend thuần HTML + CSS + JavaScript, **không dùng framework**.

**Đối tượng sử dụng:**

- **Khách truy cập:** xem thông tin cá nhân, kỹ năng, dự án, liên hệ.
- **Quản trị viên (Admin):** đăng nhập và quản lý toàn bộ nội dung qua giao diện
  Admin.

---

## 2. Tech Stack

| Layer      | Công nghệ                         | Ghi chú                          |
| ---------- | --------------------------------- | -------------------------------- |
| Frontend   | HTML, CSS (file riêng), JS (file riêng) | Không dùng framework CSS/JS     |
| Backend    | PHP (API thuần)                   | Trả JSON, nhận request AJAX     |
| Database   | SQLite                            | File `.db`, không cần MySQL server |
| Web Server | Apache / XAMPP / Laragon           | Chạy local hoặc shared hosting  |

---

## 3. Kiến trúc file

```
profile/
├── index.html              ← Trang chính (CV hiển thị cho khách)
├── admin/
│   └── index.html          ← Trang quản trị nội dung
├── css/
│   ├── style.css           ← Style chính cho index.html
│   └── admin.css           ← Style riêng cho admin/index.html
├── js/
│   ├── main.js             ← Logic frontend: fetch API, render dữ liệu
│   └── admin.js            ← Logic admin: CRUD, upload, xác thực
├── api/
│   ├── index.php           ← Router API chính (nhận request, phân phối)
│   ├── config.php          ← Kết nối SQLite, cấu hình chung, Auth helpers
│   ├── auth.php            ← Đăng nhập / xác thực session admin
│   ├── profile.php         ← CRUD thông tin cá nhân
│   ├── skills.php          ← CRUD kỹ năng
│   ├── projects.php        ← CRUD dự án / portfolio
│   ├── education.php       ← CRUD học vấn
│   ├── experience.php      ← CRUD kinh nghiệm làm việc
│   ├── contact.php         ← Nhận form liên hệ
│   └── settings.php        ← Cài đặt giao diện (theme, màu sắc)
├── uploads/                ← Ảnh avatar, ảnh dự án, file CV
├── data/
│   └── profile.db          ← File SQLite database
└── README.md
```

---

## 4. Database Schema (SQLite)

### 4.1 Bảng `admin`

| Cột        | Kiểu    | Mô tả                    |
| ---------- | ------- | ------------------------- |
| id         | INTEGER | PRIMARY KEY AUTOINCREMENT |
| username   | TEXT    | Tên đăng nhập             |
| password   | TEXT    | Mật khẩu (hashed)         |
| created_at | TEXT    | Ngày tạo                  |

### 4.2 Bảng `profile`

| Cột        | Kiểu    | Mô tả                          |
| ---------- | ------- | ------------------------------- |
| id         | INTEGER | PRIMARY KEY (luôn = 1)          |
| full_name  | TEXT    | Họ tên                          |
| title      | TEXT    | Chức danh / Vai trò             |
| bio        | TEXT    | Giới thiệu ngắn                 |
| avatar     | TEXT    | Đường dẫn ảnh đại diện          |
| email      | TEXT    | Email liên hệ                   |
| phone      | TEXT    | Số điện thoại                    |
| address    | TEXT    | Địa chỉ                         |
| github     | TEXT    | Link GitHub                      |
| linkedin   | TEXT    | Link LinkedIn                    |
| facebook   | TEXT    | Link Facebook                    |
| website    | TEXT    | Website cá nhân                  |
| cv_url     | TEXT    | Đường dẫn file CV (PDF/DOCX)    |

### 4.3 Bảng `skills`

| Cột        | Kiểu    | Mô tả                    |
| ---------- | ------- | ------------------------- |
| id         | INTEGER | PRIMARY KEY AUTOINCREMENT |
| name       | TEXT    | Tên kỹ năng (VD: PHP)     |
| level      | INTEGER | Mức độ thành thạo (0-100) |
| category   | TEXT    | Nhóm: frontend/backend/other |
| sort_order | INTEGER | Thứ tự hiển thị            |

### 4.4 Bảng `projects`

| Cột         | Kiểu    | Mô tả                    |
| ----------- | ------- | ------------------------- |
| id          | INTEGER | PRIMARY KEY AUTOINCREMENT |
| title       | TEXT    | Tên dự án                 |
| description | TEXT    | Mô tả ngắn                |
| image       | TEXT    | Ảnh minh họa               |
| tech_stack  | TEXT    | Công nghệ sử dụng         |
| demo_url    | TEXT    | Link demo (nếu có)        |
| source_url  | TEXT    | Link mã nguồn             |
| sort_order  | INTEGER | Thứ tự hiển thị            |
| created_at  | TEXT    | Ngày thêm                  |

### 4.5 Bảng `education`

| Cột         | Kiểu    | Mô tả                    |
| ----------- | ------- | ------------------------- |
| id          | INTEGER | PRIMARY KEY AUTOINCREMENT |
| school      | TEXT    | Tên trường                 |
| degree      | TEXT    | Bằng cấp / Chuyên ngành   |
| start_year  | TEXT    | Năm bắt đầu               |
| end_year    | TEXT    | Năm kết thúc               |
| description | TEXT    | Ghi chú thêm               |
| sort_order  | INTEGER | Thứ tự hiển thị            |

### 4.6 Bảng `experience`

| Cột         | Kiểu    | Mô tả                    |
| ----------- | ------- | ------------------------- |
| id          | INTEGER | PRIMARY KEY AUTOINCREMENT |
| company     | TEXT    | Tên công ty                |
| position    | TEXT    | Vị trí / Chức danh         |
| start_date  | TEXT    | Ngày bắt đầu               |
| end_date    | TEXT    | Ngày kết thúc (hoặc "Hiện tại") |
| description | TEXT    | Mô tả công việc            |
| sort_order  | INTEGER | Thứ tự hiển thị            |

### 4.7 Bảng `contact_messages`

| Cột        | Kiểu    | Mô tả                    |
| ---------- | ------- | ------------------------- |
| id         | INTEGER | PRIMARY KEY AUTOINCREMENT |
| name       | TEXT    | Tên người gửi             |
| email      | TEXT    | Email người gửi            |
| subject    | TEXT    | Tiêu đề                   |
| message    | TEXT    | Nội dung tin nhắn          |
| is_read    | INTEGER | 0 = chưa đọc, 1 = đã đọc  |
| created_at | TEXT    | Thời gian gửi              |

### 4.8 Bảng `settings`

| Cột   | Kiểu | Mô tả                              |
| ----- | ---- | ----------------------------------- |
| key   | TEXT | PRIMARY KEY (VD: "theme", "color")  |
| value | TEXT | Giá trị tương ứng                   |

---

## 5. API Endpoints

Tất cả API trả về JSON. Base URL: `/api/index.php`

### 5.1 Auth

| Method | Endpoint                 | Mô tả              | Auth |
| ------ | ------------------------ | ------------------- | ---- |
| POST   | `?action=login`          | Đăng nhập admin     | ✗    |
| POST   | `?action=logout`         | Đăng xuất           | ✓    |
| GET    | `?action=check_auth`     | Kiểm tra session    | ✗    |
| POST   | `?action=change_password`| Đổi mật khẩu admin   | ✓    |

### 5.2 Profile

| Method | Endpoint               | Mô tả                | Auth |
| ------ | ---------------------- | --------------------- | ---- |
| GET    | `?action=get_profile`  | Lấy thông tin cá nhân | ✗    |
| POST   | `?action=save_profile` | Cập nhật thông tin    | ✓    |

### 5.3 Skills

| Method | Endpoint                | Mô tả            | Auth |
| ------ | ----------------------- | ----------------- | ---- |
| GET    | `?action=get_skills`    | Danh sách kỹ năng | ✗    |
| POST   | `?action=add_skill`     | Thêm kỹ năng     | ✓    |
| POST   | `?action=update_skill`  | Sửa kỹ năng      | ✓    |
| POST   | `?action=delete_skill`  | Xóa kỹ năng      | ✓    |

### 5.4 Projects

| Method | Endpoint                  | Mô tả            | Auth |
| ------ | ------------------------- | ----------------- | ---- |
| GET    | `?action=get_projects`    | Danh sách dự án   | ✗    |
| POST   | `?action=add_project`     | Thêm dự án       | ✓    |
| POST   | `?action=update_project`  | Sửa dự án        | ✓    |
| POST   | `?action=delete_project`  | Xóa dự án        | ✓    |

### 5.5 Education

| Method | Endpoint                    | Mô tả            | Auth |
| ------ | --------------------------- | ----------------- | ---- |
| GET    | `?action=get_education`     | Danh sách học vấn | ✗    |
| POST   | `?action=add_education`     | Thêm             | ✓    |
| POST   | `?action=update_education`  | Sửa              | ✓    |
| POST   | `?action=delete_education`  | Xóa              | ✓    |

### 5.6 Experience

| Method | Endpoint                     | Mô tả                  | Auth |
| ------ | ---------------------------- | ----------------------- | ---- |
| GET    | `?action=get_experience`     | Danh sách kinh nghiệm  | ✗    |
| POST   | `?action=add_experience`     | Thêm                   | ✓    |
| POST   | `?action=update_experience`  | Sửa                    | ✓    |
| POST   | `?action=delete_experience`  | Xóa                    | ✓    |

### 5.7 Contact

| Method | Endpoint                   | Mô tả               | Auth |
| ------ | -------------------------- | -------------------- | ---- |
| POST   | `?action=send_contact`     | Gửi tin nhắn liên hệ | ✗    |
| GET    | `?action=get_messages`     | Danh sách tin nhắn   | ✓    |
| POST   | `?action=mark_read`        | Đánh dấu đã đọc     | ✓    |
| POST   | `?action=delete_message`   | Xóa tin nhắn         | ✓    |

### 5.8 Settings

| Method | Endpoint                  | Mô tả          | Auth |
| ------ | ------------------------- | --------------- | ---- |
| GET    | `?action=get_settings`    | Lấy cài đặt    | ✗    |
| POST   | `?action=save_settings`   | Lưu cài đặt    | ✓    |

### 5.9 Upload

| Method | Endpoint              | Mô tả          | Auth |
| ------ | --------------------- | --------------- | ---- |
| POST   | `?action=upload_image`| Upload ảnh      | ✓    |

---

## 6. Các section hiển thị trên trang chính (index.html)

1. **Hero / Header** — Avatar, tên, chức danh, tagline, nút tải CV (PDF/DOCX).
2. **Giới thiệu (About)** — Bio ngắn gọn, thông tin liên hệ cơ bản.
3. **Kỹ năng (Skills)** — Thanh progress bar hoặc biểu đồ, chia nhóm Frontend / Backend / Other.
4. **Dự án (Projects)** — Grid card hiển thị ảnh, tên, mô tả, tech stack, link demo/source.
5. **Học vấn (Education)** — Timeline dọc.
6. **Kinh nghiệm (Experience)** — Timeline dọc.
7. **Liên hệ (Contact)** — Form gửi tin nhắn (name, email, subject, message).
8. **Footer** — Copyright, social links.

---

## 7. Trang Admin (admin/index.html)

### 7.1 Chức năng

- **Đăng nhập / Đăng xuất** — Session PHP, hỗ trợ ẩn/hiện mật khẩu.
- **Dashboard** — Tổng quan: số dự án, số tin nhắn chưa đọc.
- **Quản lý Profile** — Sửa thông tin cá nhân, upload avatar, upload CV.
- **Quản lý Skills** — CRUD kỹ năng dạng inline.
- **Quản lý Projects** — CRUD dự án, hỗ trợ upload ảnh minh họa trực tiếp trong form inline.
- **Quản lý Education** — CRUD học vấn dạng inline.
- **Quản lý Experience** — CRUD kinh nghiệm dạng inline.
- **Tin nhắn liên hệ** — Xem, đánh dấu đã đọc, xóa.
- **URL Hash Routing** — Hệ thống điều hướng dựa trên mã băm (`#`), cho phép lưu trạng thái trang (Dashboard, Edit, Add) ngay cả khi tải lại trình duyệt hoặc nhấn nút Back/Forward.
- **Cài đặt** — Chọn theme (Dark / Light / Ocean), đổi mật khẩu.

### 7.2 Giao diện Admin

- Sidebar navigation bên trái.
- Nội dung chính bên phải.
- Responsive (thu gọn sidebar trên mobile, có lớp nền mờ Overlay).
- **Click-outside**: Chạm ra ngoài vùng menu để tự động đóng sidebar trên mobile.
- Modal confirm khi xóa dữ liệu.

---

## 8. Yêu cầu giao diện (UI/UX)

### 8.1 Design chung

- **Responsive** hoàn toàn (mobile-first).
- **Dark mode** làm mặc định, hỗ trợ chuyển Light / Ocean.
- **Smooth scroll** giữa các section.
- **Micro-animation**: fade-in khi scroll, hover effect trên card, progress bar animation.
- **Full-page Preloader**: Màn hình chờ chuyên nghiệp, che giấu hiện tượng "nháy" dữ liệu mặc định trước khi API hoàn tất việc tải và render.
- **Panel transitions**: Hiệu ứng chuyển đổi mượt mà (fade & slide) giữa các trang quản trị.
- **Typography**: Google Fonts (Inter hoặc Outfit).
- **Color palette**: Gradient tối (slate/indigo) cho Dark, xanh biển cho Ocean, sáng nhẹ cho Light.

### 8.2 Không dùng

- Không framework CSS (Bootstrap, Tailwind…).
- Không framework JS (React, Vue…).
- Không thư viện icon ngoài (tự dùng SVG inline hoặc emoji).

---

## 9. Bảo mật & Lưu ý Kỹ thuật

- **Mật khẩu admin**: Hash bằng `password_hash()`.
- **Prepared statements**: Chống SQL Injection cho mọi query SQLite.
- **Auth Helpers**: Các hàm `require_auth()` được đặt trong `config.php` để tránh lỗi Undefined function.
- **Upload**: Giới hạn 2MB, hỗ trợ `jpg, png, webp` (ảnh) và `pdf, docx` (CV).
- **Download CV**: Tên file tải về tự động đặt theo `[Ho_Ten]_[Chuc_Danh]_CV.[ext]`.
- **Inline Form UI**: Thay thế Modal cũ để tăng không gian nhập liệu, giúp quản trị dễ dàng hơn.
- **Cache-busting**: Sử dụng query string versioning để đảm bảo trình duyệt luôn load CSS/JS mới nhất.

---

## 10. Quy tắc code

| Quy tắc              | Chi tiết                                     |
| --------------------- | -------------------------------------------- |
| CSS                   | File riêng, dùng CSS Variables cho theme     |
| JavaScript            | - Frontend gọi API bằng `fetch()`, nhận JSON, render DOM bằng JavaScript. <br> - PHP API nhận request qua query string `?action=...`, trả JSON. <br> - **Cache Busting**: Luôn thêm phiên bản `?v=N` vào đường dẫn CSS/JS trong HTML để tránh lỗi cache trình duyệt (Ví dụ: `style.css?v=3`). <br> - Không import CDN cho framework. Chỉ được dùng CDN cho Google Fonts. |
| Icons                 | Ưu tiên SVG inline để kiểm soát màu sắc theo theme. Sử dụng Emoji cho các thành phần trang trí không cần đổi màu. |
| Naming                | camelCase cho JS, snake_case cho PHP/DB      |
| Comment               | Tiếng Việt hoặc tiếng Anh, nhất quán        |
| Error handling        | API trả `{success: false, message: "..."}` khi lỗi |

---

## 11. Thứ tự triển khai (gợi ý)

| Phase | Nội dung                                      | Ưu tiên |
| ----- | --------------------------------------------- | ------- |
| P1    | Database schema + API config + auth           | Cao     |
| P2    | API Profile + Skills + CRUD                   | Cao     |
| P3    | Frontend index.html + style.css + main.js     | Cao     |
| P4    | admin/index.html + admin.css + admin.js       | Cao     |
| P5    | API Projects + Education + Experience         | Trung bình |
| P6    | Contact form + Messages                       | Trung bình |
| P7    | Theme switching + Settings                    | Thấp    |
| P8    | Upload ảnh + tối ưu responsive                | Thấp    |
| P9    | Animation, polish, test toàn diện             | Thấp    |

---

## 12. Kết quả hoàn thiện

- Website chạy hoàn hảo trên XAMPP (Local) và đồng bộ mã nguồn.
- Giao diện hiện đại, responsive, hỗ trợ 3 theme.
- Hệ thống quản lý linh hoạt, tự động hóa việc đặt tên file và ẩn/hiện thành phần giao diện.
