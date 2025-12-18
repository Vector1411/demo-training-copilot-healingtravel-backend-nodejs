# 06_nfr_performance_security

## NFR (SRS + PRD)
### Performance
- Thời gian load trang < 3 giây

### Security
- Bảo vệ khu vực Admin
- Mật khẩu được mã hóa (passwordHash)

### Scalability
- Thiết kế dễ mở rộng (future enhancements)

### Usability
- Giao diện dễ dùng cho người không rành kỹ thuật

## Backend implications
- Rate limit cơ bản
- Helmet + CORS
- Query theo index (`tours.status`, `registrations.tourId`)

