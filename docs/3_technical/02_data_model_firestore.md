# 02_data_model_firestore

## 1) Tổng quan
Firestore là data source chính. ERD được trình bày theo logical ERD (NoSQL) nhưng vẫn đảm bảo nghiệp vụ.

Quan hệ logic:
- TOUR (1) — (N) REGISTRATION
- ADMIN (1) — (N) TOUR (mâu thuẫn về field lưu adminId trong tour: chưa có trong API Spec)

## 2) Collections

### 2.1 `tours`
Entity: TOUR  
Document ID: có thể dùng `tourId` như ERD hoặc `id` như PRD/API (khuyến nghị: docId = tourId)

| Field | Type | Required | Notes |
|---|---|---:|---|
| tourId / id | String | Yes | ID duy nhất (docId) |
| title | String | Yes | |
| description | String | Yes | |
| itinerary | String | Yes | |
| location | String | Yes | Địa điểm (vd: "Sapa, Lào Cai") |
| duration | String | Yes | Thời lượng tour (vd: "5 ngày 4 đêm") |
| content | Object | Yes | Thông tin nội dung chi tiết |
| content.introduction | String | Yes | Giới thiệu tổng quan chương trình |
| content.schedule | String | Yes | Lịch trình chi tiết (có thể multi-line) |
| content.activities | String | Yes | Danh sách hoạt động |
| content.suitableFor | String | Yes | Đối tượng phù hợp |
| content.notes | String | Yes | Ghi chú quan trọng |
| startDate | Timestamp | Yes | |
| endDate | Timestamp | Yes | |
| price | Number | No | |
| status | Enum | Yes | draft/open/closed |
| images | Array<string> | No | danh sách hình ảnh |
| createdAt | Timestamp | Yes | |
| updatedAt | Timestamp | No | |

Indexes (ERD hint):
- `tours.status`

### 2.2 `registrations`
Entity: REGISTRATION  
Document ID: `registrationId` (docId)

| Field | Type | Required | Notes |
|---|---|---:|---|
| registrationId / id | String | Yes | docId |
| tourId | String | Yes | reference `tours` docId |
| fullName | String | Yes | |
| phone | String | Yes | |
| email | String | No | |
| note | String | No | |
| createdAt | Timestamp | Yes | |

Indexes:
- `registrations.tourId`

### 2.3 `admins`
Entity: ADMIN  
Document ID: `adminId` (docId)

| Field | Type | Required | Notes |
|---|---|---:|---|
| adminId | String | Yes | docId |
| email | String | Yes | |
| passwordHash | String | Yes | SRS yêu cầu mật khẩu mã hoá |
| role | String | Yes | expected `admin` |
| createdAt | Timestamp | Yes | ERD |
| lastLoginAt | Timestamp | No | |

## 3) Mapping Timestamp ↔ API
- Tour startDate/endDate:
  - Firestore: Timestamp
  - API: string `YYYY-MM-DD` (theo ví dụ API Spec)
- Registration createdAt:
  - Firestore: Timestamp
  - API: ISO string (khuyến nghị) — API Spec chưa nêu, Wireframe hiển thị “Ngày đăng ký”

