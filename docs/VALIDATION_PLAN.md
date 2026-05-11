# Validation Plan — Admin Panel

Dự án: **Profile CV**
Mục tiêu: Đảm bảo trang quản trị hoạt động đúng theo spec `prProfile.md` và các rule bảo mật/UX.

## 1. Môi trường kiểm thử
- **URL**: `http://localhost:8080/profile/admin/`
- **Server**: PHP Built-in Server (hoặc XAMPP/Laragon)
- **Account mặc định**: `admin` / `admin123`

## 2. Kịch bản kiểm thử (Test Cases)

| ID | Thành phần | Mô tả | Kết quả mong đợi |
|---|---|---|---|
| TC-01 | Auth | Đăng nhập với tài khoản sai | Hiển thị lỗi "Invalid username or password" |
| TC-02 | Auth | Đăng nhập với tài khoản đúng (`admin` / `admin123`) | Chuyển vào Dashboard, ẩn form login |
| TC-03 | Profile | Cập nhật thông tin cá nhân (Tên, Bio) | Thông báo "Profile đã cập nhật!", dữ liệu lưu vào DB |
| TC-04 | Profile | Upload Avatar | Ảnh upload thành công, preview hiển thị đúng |
| TC-05 | Skills | Thêm kỹ năng mới | Kỹ năng xuất hiện trong danh sách |
| TC-06 | Skills | Sửa kỹ năng | Thông tin cập nhật đúng sau khi lưu |
| TC-07 | Skills | Xóa kỹ năng | Modal confirm hiển thị, xóa thành công sau khi xác nhận |
| TC-08 | Projects | Thêm dự án mới | Project xuất hiện trong bảng quản trị |
| TC-09 | Education | Thêm học vấn | Education hiển thị đúng timeline |
| TC-10 | Experience| Thêm kinh nghiệm | Experience hiển thị đúng |
| TC-11 | Settings | Thay đổi Theme (Dark -> Ocean) | Theme thay đổi tức thì hoặc sau khi load lại |
| TC-12 | Auth | Đổi mật khẩu | Đổi thành công, login lại được với pass mới |
| TC-13 | Auth | Đăng xuất | Quay về trang Login, không thể truy cập API admin |

## 3. Quy trình thực hiện
1. Khởi động server PHP.
2. Sử dụng Browser Subagent để thực hiện tuần tự các Test Cases.
3. Ghi nhận kết quả vào `docs/PROGRESS.md`.
