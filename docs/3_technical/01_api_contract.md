# 01_api_contract

## 1. Giới thiệu
Tài liệu này là **hợp đồng kỹ thuật (contract)** cho backend API phục vụ Website Giới thiệu & Đăng ký Tour Du lịch Chữa lành. Mọi thay đổi API phải được cập nhật đồng bộ giữa Backend/Frontend/QA.

Nguồn gốc yêu cầu: PRD, SRS, Wireframe & Screen Spec, ERD/DFD.

## 2. Phạm vi API
Phục vụ:
- Public (Guest)
- Admin (đã xác thực)

Không bao gồm:
- Thanh toán online
- API cho mobile app native

## 3. Quy ước chung

### 3.1 Base URL
- Base URL: `/api/v1`

### 3.2 Content-Type & Encoding
- Request/Response: `application/json`
- Encoding: UTF-8

### 3.3 Response format chung (Success)
```json
{
  "success": true,
  "data": {},
  "message": "",
  "errorCode": null
}
```

### 3.4 Response format chung (Error)
```json
{
  "success": false,
  "data": null,
  "message": "Mô tả lỗi",
  "errorCode": "ERROR_CODE"
}
```

### 3.5 Authentication & Authorization (Admin)
- Sử dụng Firebase Authentication cho Admin
- Token: JWT (Firebase ID Token)
- Header bắt buộc:
  - `Authorization: Bearer <token>`

**Ghi chú:** API-04 `/admin/login` cũng trả về `token`. Tài liệu không làm rõ token này là Firebase ID Token hay token do backend tự cấp → xem mục **UNKNOWN/CONFLICT** tại `docs/3_technical/04_authz_rbac.md`.

### 3.6 HTTP Status Code (quy ước chung)
| HTTP | Ý nghĩa |
|---:|---|
| 200 | Thành công |
| 400 | Sai dữ liệu |
| 401 | Chưa xác thực |
| 403 | Không có quyền |
| 404 | Không tìm thấy |
| 500 | Lỗi hệ thống |

---

## 4. Danh sách API – PUBLIC (GUEST)

### API-01: Lấy danh sách tour đang mở
- **Method/Endpoint:** `GET /tours`
- **Mục đích:** Lấy danh sách tour với các tiêu chí filter (mặc định chỉ lấy tour `open`).
- **Sử dụng cho màn hình:** Landing Page (G-01)

#### Query Params
| Tên | Type | Bắt buộc | Mô tả |
|---|---|---:|---|
| status | string | No | Enum `draft/open/closed`, mặc định = `open` |
| q | string | No | Full-text search (case-insensitive) trên `title`, `description`, `itinerary`, `location`, `content.*` |
| location | string | No | Filter theo substring (case-insensitive) trong `location` |
| minPrice | number | No | Giá tối thiểu (>= 0); nếu có cả min/max thì `minPrice <= maxPrice` |
| maxPrice | number | No | Giá tối đa (>= 0); nếu có cả min/max thì `minPrice >= 0` |

#### Response – Success (200)
```json
{
  "success": true,
  "data": [
    {
      "id": "tour_001",
      "title": "Thiền & Tái tạo năng lượng",
      "startDate": "2025-03-01",
      "endDate": "2025-03-03",
      "price": 3500000,
      "status": "open",
      "thumbnail": "url"
    }
  ]
}
```

#### Error Codes
| errorCode | Mô tả | HTTP |
|---|---|---:|
| TOUR_FETCH_FAILED | Không lấy được dữ liệu | 500 |

---

### API-02: Lấy chi tiết tour
- **Method/Endpoint:** `GET /tours/{tourId}`
- **Mục đích:** Lấy thông tin chi tiết của một tour
- **Sử dụng cho màn hình:** Tour Detail Page (G-02)

#### Path Params
| Tên | Type | Bắt buộc | Mô tả |
|---|---|---:|---|
| tourId | string | Yes | ID tour |

#### Response – Success (200)
```json
{
  "success": true,
  "data": {
    "id": "tour_001",
    "title": "Thiền & Tái tạo năng lượng",
    "location": "Sapa, Lào Cai",
    "duration": "5 ngày 4 đêm",
    "description": "...",
    "itinerary": "...",
    "content": {
      "introduction": "...",
      "schedule": "...",
      "activities": "...",
      "suitableFor": "...",
      "notes": "..."
    },
    "startDate": "2025-03-01",
    "endDate": "2025-03-03",
    "price": 3500000,
    "status": "open",
    "images": ["url1", "url2"]
  }
}
```

#### Error Codes
| errorCode | Mô tả | HTTP |
|---|---|---:|
| TOUR_NOT_FOUND | Không tồn tại tour | 404 |

---

### API-03: Đăng ký tour
- **Method/Endpoint:** `POST /registrations`
- **Mục đích:** Lưu thông tin khách đăng ký tour
- **Sử dụng cho màn hình:** Tour Registration Form (G-03)

#### Request Body
```json
{
  "tourId": "tour_001",
  "fullName": "Nguyễn Văn A",
  "phone": "0909123456",
  "email": "a@gmail.com",
  "note": ""
}
```

#### Validation Rules
- `tourId`: bắt buộc, tồn tại
- `fullName`: không rỗng
- `phone`: đúng định dạng VN
- `email`: đúng format nếu có
- `note`: max 500 ký tự (Wireframe)

#### Response – Success (200)
```json
{
  "success": true,
  "message": "Đăng ký thành công"
}
```

#### Error Codes
| errorCode | Mô tả | HTTP |
|---|---|---:|
| TOUR_CLOSED | Tour đã đóng | 400 |
| INVALID_INPUT | Dữ liệu không hợp lệ | 400 |
| REGISTRATION_FAILED | Lưu dữ liệu thất bại | 500 |

---

## 5. Danh sách API – ADMIN

### API-04: Admin Login
- **Method/Endpoint:** `POST /admin/login`
- **Mục đích:** Xác thực Admin
- **Sử dụng cho màn hình:** Admin Login (A-01)

#### Request Body
```json
{
  "email": "admin@company.com",
  "password": "******"
}
```

#### Response – Success (200)
```json
{
  "success": true,
  "data": {
    "token": "jwt_token",
    "expiredAt": "2025-03-01T12:00:00Z"
  }
}
```

#### Error Codes
| errorCode | Mô tả | HTTP |
|---|---|---:|
| AUTH_FAILED | Sai email hoặc password | 401 |

**UNKNOWN/CONFLICT:** Token ở đây là gì (Firebase ID Token hay custom JWT)? Cần chốt cơ chế theo `docs/3_technical/04_authz_rbac.md`.

---

### API-05: Lấy danh sách tour (Admin)
- **Method/Endpoint:** `GET /admin/tours`
- **Mục đích:** Lấy toàn bộ tour
- **Sử dụng cho màn hình:** Tour Management (A-03)
- **Authorization:** Bearer Token (Firebase ID Token)

**Thiếu trong API Spec:** request/response schema chi tiết (fields, paging, sorting, errors).  
Skeleton hiện tại trả raw list từ Firestore và đánh dấu UNKNOWN trong code/docs.

---

### API-06: Tạo mới tour
- **Method/Endpoint:** `POST /admin/tours`
- **Authorization:** Bearer Token

#### Request Body (API Spec)
```json
{
  "title": "",
  "description": "",
  "itinerary": "",
  "location": "",
  "duration": "",
  "content": {
    "introduction": "",
    "schedule": "",
    "activities": "",
    "suitableFor": "",
    "notes": ""
  },
  "startDate": "",
  "endDate": "",
  "price": 0,
  "status": "draft",
  "images": []
}
```

#### Validation (API Spec)
- `title`, `description`, `itinerary`, `location`, `duration`, `content.*`, `dates`: bắt buộc

**Thiếu trong API Spec:** response schema (id? full object?), error codes cụ thể.

---

### API-07: Cập nhật tour
- **Method/Endpoint:** `PUT /admin/tours/{tourId}`
- **Authorization:** Bearer Token

**Thiếu trong API Spec:** request body schema (partial/full), response schema, error codes.

---

### API-08: Xóa tour
- **Method/Endpoint:** `DELETE /admin/tours/{tourId}`
- **Authorization:** Bearer Token

**Thiếu trong API Spec:** response schema, error codes.

---

### API-09: Lấy danh sách đăng ký theo tour
- **Method/Endpoint:** `GET /admin/registrations?tourId=xxx`
- **Sử dụng cho màn hình:** Registration Management (A-05)
- **Authorization:** Bearer Token

**Thiếu trong API Spec:** response schema chi tiết.

---

## 6. Liên kết traceability
- Screen ↔ API ↔ Data ↔ Rule: xem `docs/3_technical/07_traceability_matrix.md`

