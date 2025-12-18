# 05_error_handling

## Error contract (API Spec)
```json
{
  "success": false,
  "data": null,
  "message": "Mô tả lỗi",
  "errorCode": "ERROR_CODE"
}
```

## Error codes được nêu trong API Spec
- TOUR_FETCH_FAILED (500)
- TOUR_NOT_FOUND (404)
- TOUR_CLOSED (400)
- INVALID_INPUT (400)
- REGISTRATION_FAILED (500)
- AUTH_FAILED (401)

## Lưu ý triển khai
- Validation lỗi dùng `INVALID_INPUT` (400) đúng spec
- Business rule “tour không open” trả `TOUR_CLOSED` (400) đúng spec
- Các lỗi hệ thống còn lại nên map 500 và dùng errorCode tương ứng

