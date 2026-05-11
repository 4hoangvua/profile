# Project Plan

## Product Summary

Website Profile cá nhân (CV/Portfolio) hiện đại, dùng để giới thiệu bản thân.
Giao diện Frontend thuần HTML + CSS + JS, Backend PHP API, lưu dữ liệu SQLite.
Admin có thể quản lý toàn bộ nội dung qua trang quản trị riêng.

## Tech Stack

| Layer     | Choice                              |
| --------- | ----------------------------------- |
| Frontend  | HTML, CSS (file riêng), JS (file riêng) |
| Backend   | PHP (API thuần, trả JSON)           |
| Database  | SQLite                              |
| Hosting   | XAMPP / Laragon / Shared hosting    |

## Features

| #  | Feature                   | Status  | Notes                          |
| -- | ------------------------- | ------- | ------------------------------ |
| F1 | Spec document (prProfile) | done    | prProfile.md đã viết xong      |
| F2 | Database schema + Auth    | done    | 8 tables + session auth        |
| F3 | API CRUD (Profile, Skills)| done    | All PHP endpoints              |
| F4 | Frontend (index.html)     | done    | 8 sections, responsive         |
| F5 | Admin panel (admin/index.html)| done    | Full CRUD + sidebar layout     |
| F6 | Projects + Edu + Exp API  | done    | All CRUD endpoints             |
| F7 | Contact form + Messages   | done    | Public contact + admin inbox   |
| F8 | Theme switching           | done    | Dark / Light / Ocean           |
| F9 | Upload ảnh                | done    | 2MB limit, type validation     |
| F10| Mobile UX Improvements    | done    | Overlay, click-outside, smooth sidebar |
| F11| Inline Form UX            | done    | Replace modals with full-width forms |
| F12| Multi-language Support    | planned | Vietnamese / English toggle    |
| F13| Export CV to PDF          | done    | Client-side PDF generation (CV Upload/Download) |
| F14| SEO & Performance         | done    | Meta tags, lazy loading, cache-busting |
| F15| Admin URL Routing         | done    | Deep linking and state persistence using Hash |


**Status values:** `planned` → `in-progress` → `done` → `cut`

## Architecture Notes

- **Kiến trúc 3 lớp**: Frontend (HTML/CSS/JS) → API (PHP) → Database (SQLite).
- Frontend gọi API bằng `fetch()`, nhận JSON, render DOM.
- Mỗi resource có file PHP riêng (profile.php, skills.php, projects.php...).
- Auth dùng PHP session.
- Chi tiết đầy đủ xem `prProfile.md`.

## Open Questions

- (none yet)
