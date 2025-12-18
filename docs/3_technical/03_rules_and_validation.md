# 03_rules_and_validation

## Enums
- Tour.status: `draft | open | closed`

## Validation rules (Public registration)
Nguồn: SRS + Wireframe + API Spec
- `fullName`: required, không rỗng
- `phone`: required, format VN
- `email`: optional, đúng format nếu nhập
- `note`: optional, tối đa 500 ký tự
- `tourId`: required, phải tồn tại

## Business rules
- Guest chỉ được đăng ký khi tour.status == `open` (nếu khác → `TOUR_CLOSED`)
- Admin-only cho mọi API `/admin/*` (trừ `/admin/login`)
- Admin quản lý tour: list/create/update/delete + cập nhật status
- Đăng ký: dùng cho chăm sóc khách hàng, **không chỉnh sửa**

