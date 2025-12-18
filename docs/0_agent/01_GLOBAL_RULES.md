# 01_GLOBAL_RULES

## Quy ước response chung (API Spec)
Success:
```json
{ "success": true, "data": {}, "message": "", "errorCode": null }
```
Error:
```json
{ "success": false, "data": null, "message": "Mô tả lỗi", "errorCode": "ERROR_CODE" }
```

## Base URL + format
- Base URL: `/api/v1`
- Content-Type: `application/json`, UTF-8

## Authentication (Admin)
- Header: `Authorization: Bearer <token>`
- Token: Firebase ID Token (JWT)

## HTTP status code mapping (API Spec)
- 200 success
- 400 sai dữ liệu (INVALID_INPUT, TOUR_CLOSED, ...)
- 401 chưa xác thực
- 403 không có quyền
- 404 không tìm thấy
- 500 lỗi hệ thống

