# 03_screen_behavior_specs

## G-01 Landing Page
Layout:
- Header sticky: Logo, menu (Giới thiệu/Tour/Liên hệ), nút “Đăng nhập”
- Hero: ảnh thiên nhiên full-width + USP + CTA “Xem các tour”
- About / Service sections
- Open Tours section: danh sách tour status=open (card: thumbnail, title, time, CTA “Xem chi tiết”)
- Footer: liên hệ

States:
- Loading khi fetch tours
- Empty state nếu không có tour open
Responsive:
- Mobile: card dọc; Desktop: grid 2–3 cột

## G-02 Tour Detail Page
Nội dung:
- Slider ảnh (banner)
- Thông tin cơ bản: title, time, price (nếu có), status
- Description (text dài)
- Itinerary (bullet/accordion)
- CTA “Đăng ký tour” chỉ khi status=open

States:
- Nếu closed/draft → disable CTA
- Nếu không tìm thấy tour → 404 message

## G-03 Registration Form
Fields & validation:
- fullName: required, non-empty
- phone: required, VN format
- email: optional, email format
- note: optional, max 500 chars
Buttons:
- “Gửi đăng ký”
- “Hủy”
States:
- Loading khi submit
- Success / Error message

## A-01 Admin Login
Fields: email, password (required)
Validation: email format
State: lock form khi submit; hiển thị lỗi

## A-02 Admin Dashboard
Layout: sidebar menu + main content area

## A-03 Tour Management (List)
Table columns: Tên tour, Thời gian, Status badge, Actions (Edit/Delete)
Actions: “Tạo tour mới”, confirm khi delete

## A-04 Create/Edit Tour
Fields:
- title (required)
- description (required)
- itinerary (required)
- date range start/end (required)
- price (optional)
- status dropdown (required)
- images upload (optional)
Buttons: Lưu / Hủy

## A-05 Registration Management
- Chọn tour
- Danh sách đăng ký theo tour: fullName, phone, email, note, createdAt

