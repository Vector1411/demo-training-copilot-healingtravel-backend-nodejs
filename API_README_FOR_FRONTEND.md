# API_README_FOR_FRONTEND

## Table of Contents
- [Tổng quan và conventions chung](#tổng-quan-và-conventions-chung)
- [Public — Health](#public---health)
  - [GET /api/v1/health](#get-apiv1health)
- [Public — Tours](#public---tours)
  - [GET /api/v1/tours](#get-apiv1tours)
  - [GET /api/v1/tours/{tourId}](#get-apiv1tourstourid)
- [Public — Registrations](#public---registrations)
  - [POST /api/v1/registrations](#post-apiv1registrations)
- [Admin — Auth & Tours & Registrations (ROLE_ADMIN)](#admin---auth--tours--registrations-role_admin)
  - [POST /api/v1/admin/login](#post-apiv1adminlogin)
  - [GET /api/v1/admin/tours](#get-apiv1admintours)
  - [POST /api/v1/admin/tours](#post-apiv1admintours)
  - [PUT /api/v1/admin/tours/{tourId}](#put-apiv1admintourstourid)
  - [DELETE /api/v1/admin/tours/{tourId}](#delete-apiv1admintourstourid)
  - [GET /api/v1/admin/registrations?tourId=](#get-apiv1adminregistrationstourid)
- [QA summary (files parsed, endpoints found)](#qa-summary-files-parsed-endpoints-found)
- [Appendix: Error codes & client checklist & snippets](#appendix-error-codes--client-checklist--snippets)


## Tổng quan và conventions chung
- Base mount prefix: `/api/v1` (configurable via `API_PREFIX`). All paths below assume `/api/v1`.
- Content-Type: `application/json; charset=utf-8` required for requests with body.
- Success envelope (server):

```json
{
  "success": true,
  "data": ...,
  "message": "",
  "errorCode": null
}
```

- Error envelope (server):

```json
{
  "success": false,
  "data": null,
  "message": "Mô tả lỗi",
  "errorCode": "ERROR_CODE",
  "details": <optional array | null>
}
```

- Normalizer suggestion (client):

```ts
function normalizeServerError(res:any){
  return {
    code: res.errorCode,
    message: res.message,
    details: res.details ?? null,
    requestId: (res as any).requestId ?? null
  };
}
```

- IDs: server may use `id` or `_id`. Normalize:

```ts
const id = String(item.id ?? item._id);
```

- Dates: request/response date strings use `YYYY-MM-DD` (ISO date without time). Client must send dates in this format. If schema contains a regex for dates it will be shown per-field below.

- Nullability rules (strict):
  - `NULLABLE` — schema used `.nullable()` (field may be `null`).
  - `OPTIONAL (omit if absent)` — schema used `.optional()`; client should omit the key when absent (do not send `null`).
  - `REQUIRED` — neither `.nullable()` nor `.optional()`; client must send the value and must not use `null`.

- Arrays: If Zod schema has `.min(n)` state it in field docs: `min length = n`.

- Validation contract: validation errors return `400` with `errorCode: "INVALID_INPUT"` and `details` an array of `{ path, message, code }` converted from Zod issues. Use `details` to highlight form fields.


## Public — Health

### GET /api/v1/health
- Summary: Kiểm tra trạng thái service.
- Method & Full Path: GET /api/v1/health
- Success HTTP status code(s): 200
- Auth: No
- Headers: None
- Path Params: None
- Query Params: None
- Request Body: None
- Response Success example:

```json
{
  "success": true,
  "data": { "uptime": 12345 },
  "message": "",
  "errorCode": null
}
```

- Errors: 500 INTERNAL_ERROR
- Client guidance: Use for health checks and readiness.


## Public — Tours

### GET /api/v1/tours
- Summary: Lấy danh sách tour; mặc định filter `status = "open"`.
- Method & Full Path: GET /api/v1/tours
- Success HTTP status code(s): 200
- Auth: No
- Headers: `Accept: application/json`
- Path Params: None
- Query Params:
  - `status` | string enum `draft` | `open` | `closed` | OPTIONAL (omit if absent) | Zod: `TourStatusEnum.optional()`
  - Default server-side: `open` when omitted
  - Casting rules: send lowercase `draft|open|closed`
- Request Body: None
- Response Success — envelope & inner type:

```ts
interface TourSummary {
  id: string;            // normalize id = String(item.id ?? item._id)
  title: string;
  startDate: string;     // YYYY-MM-DD
  endDate: string;       // YYYY-MM-DD
  price?: number | null; // OPTIONAL (may be null)
  status: 'draft'|'open'|'closed';
  thumbnail?: string | null;
}
```

- Error Responses:
  - 500 TOUR_FETCH_FAILED — server DB/error
  - 400 INVALID_INPUT — invalid `status` value (details contains Zod issue)

- Examples:
  - Valid

```
GET /api/v1/tours
```

Response (200):

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
      "thumbnail": "https://..."
    }
  ],
  "message": "",
  "errorCode": null
}
```

  - Invalid

```
GET /api/v1/tours?status=INVALID
```

Response (400):

```json
{
  "success": false,
  "data": null,
  "message": "Dữ liệu không hợp lệ",
  "errorCode": "INVALID_INPUT",
  "details": [ { "path":"status", "message":"Invalid enum value", "code":"invalid_type" } ]
}
```

- Client guidance:
  - Prefer `status=open` for public listing.
  - Validate status value locally against `['draft','open','closed']`.
  - Normalize `id` using `String(item.id ?? item._id)`.
  - Parse dates expecting `YYYY-MM-DD`.

- Notes/Caveats:
  - Server-side validation was tightened to `TourStatusEnum` (see `src/schemas/tours.schemas.ts`).


### GET /api/v1/tours/{tourId}
- Summary: Lấy chi tiết tour.
- Method & Full Path: GET /api/v1/tours/{tourId}
- Success HTTP status code(s): 200
- Auth: No
- Headers: `Accept: application/json`
- Path Params:
  - `tourId` | string | REQUIRED | NOT NULL | Zod excerpt: `tourId: z.string().min(1)`
- Request Body: None
- Response Success (interface):

```ts
interface TourDetail {
  id: string;
  title: string;
  description: string;
  itinerary: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  price?: number | null;
  status: 'draft'|'open'|'closed';
  images: string[]; // optional array may be []
}
```

- Error Responses:
  - 404 TOUR_NOT_FOUND
  - 400 INVALID_INPUT (empty tourId)

- Examples:
  - Valid

```
GET /api/v1/tours/tour_001
```

Response (200): see TourDetail example above.

  - Invalid (empty id)

Response (400):
```json
{ "success": false, "data": null, "message": "Dữ liệu không hợp lệ", "errorCode": "INVALID_INPUT", "details": [{"path":"tourId","message":"String must contain at least 1 character(s)","code":"too_small"}] }
```

- Client guidance:
  - Validate non-empty id before making request.


## Public — Registrations

### POST /api/v1/registrations
- Summary: Gửi form đăng ký cho một tour (public).
- Method & Full Path: POST /api/v1/registrations
- Success HTTP status code(s): 200 (message)
- Auth: No
- Headers:
  - `Content-Type: application/json`
  - `Accept: application/json`
- Path Params: None
- Query Params: None
- Request Body (Zod excerpts and nullability):
  - `tourId` | string | REQUIRED | NOT NULL | `tourId: z.string().min(1)`
  - `fullName` | string | REQUIRED | NOT NULL | `fullName: z.string().min(1)`
  - `phone` | string | REQUIRED | NOT NULL | `phone: z.string().regex(/^(0|\\+84)(\\d{9})$/)`
    - Regex: `^(0|\+84)(\d{9})$` (valid examples: `0909123456`, `+84909123456`)
  - `email` | string | OPTIONAL (omit if absent) | `email: z.string().email().optional()`
  - `note` | string | OPTIONAL (omit if absent) | `note: z.string().max(500).optional()`
    - Constraint: max 500 chars
- Response Success:
  ```json
  { "success": true, "data": null, "message": "Đăng ký thành công", "errorCode": null }
  ```
- Error Responses:
  - 400 INVALID_INPUT — `details` contains field error array
  - 400 TOUR_CLOSED — business rule (tour.status !== 'open')
  - 404 TOUR_NOT_FOUND
  - 500 REGISTRATION_FAILED

- Examples:
  - Valid

```json
POST /api/v1/registrations
Content-Type: application/json

{
  "tourId": "tour_001",
  "fullName": "Nguyễn Văn A",
  "phone": "0909123456",
  "email": "a@gmail.com",
  "note": "Ghi chú"
}
```

Response (200):
```json
{ "success": true, "data": null, "message": "Đăng ký thành công", "errorCode": null }
```

  - Invalid

```json
{ "tourId": "", "fullName": "", "phone": "123" }
```

Response (400):
```json
{
  "success": false,
  "data": null,
  "message": "Dữ liệu không hợp lệ",
  "errorCode": "INVALID_INPUT",
  "details": [
    { "path": "tourId", "message": "String must contain at least 1 character(s)", "code": "too_small" },
    { "path": "fullName", "message": "String must contain at least 1 character(s)", "code": "too_small" },
    { "path": "phone", "message": "Invalid", "code": "invalid_string" }
  ]
}
```

- Client guidance:
  - Pre-validate phone with regex above.
  - Show `TOUR_CLOSED` as business-level validation (disable submission UI).


## Admin — Auth & Tours & Registrations (ROLE_ADMIN)
> All admin endpoints (except POST /admin/login) require header:
> `Authorization: Bearer <Firebase ID Token>` and the token UID must exist in `admins` allow-list with `role === "admin"`.

### POST /api/v1/admin/login
- Summary: Admin login using Firebase Identity Toolkit (server-side implementation).
- Method & Full Path: POST /api/v1/admin/login
- Success HTTP status code(s): 200
- Auth: No
- Headers: `Content-Type: application/json`
- Request Body:
  - `email` | string | REQUIRED | NOT NULL | `email: z.string().email()`
  - `password` | string | REQUIRED | NOT NULL | `password: z.string().min(1)`
- Response Success (confirmed):
  - `data` contains `{ token, expiredAt }` where `token` is an ID token (string) and `expiredAt` is ISO timestamp.
  ```ts
  interface AdminLoginResponse { token: string; expiredAt: string }
  ```
- Error Responses:
  - 401 AUTH_FAILED — bad credentials or not in admins allow-list
  - 400 INVALID_INPUT
- Client guidance:
  - Store token securely and attach `Authorization: Bearer <token>` for admin requests.


### GET /api/v1/admin/tours
- Summary: Admin list all tours (management view).
- Method & Full Path: GET /api/v1/admin/tours
- Success HTTP status code(s): 200
- Auth: Required (ROLE_ADMIN)
- Headers: `Authorization: Bearer <token>`
- Response Success: array of tour summaries (admin-friendly) — fields similar to `TourSummary` but may include `tourId` as id field.
- Errors: 401/403


### POST /api/v1/admin/tours
- Summary: Admin tạo tour mới.
- Method & Full Path: POST /api/v1/admin/tours
- Success HTTP status code(s): 200
- Auth: Required (ROLE_ADMIN)
- Headers: `Authorization: Bearer <token>`, `Content-Type: application/json`
- Request Body (Zod excerpts & nullability):
  - `title` | string | REQUIRED | NOT NULL | `z.string().min(1)`
  - `description` | string | REQUIRED | NOT NULL | `z.string().min(1)`
  - `itinerary` | string | REQUIRED | NOT NULL | `z.string().min(1)`
  - `startDate` | string | REQUIRED | NOT NULL | `z.string().min(1)` — format `YYYY-MM-DD`
  - `endDate` | string | REQUIRED | NOT NULL | `z.string().min(1)` — format `YYYY-MM-DD`
  - `price` | number | OPTIONAL (omit if absent) | `z.number().optional()`
  - `status` | enum | REQUIRED | NOT NULL | `z.enum(["draft","open","closed"])`
  - `images` | string[] | OPTIONAL (omit if absent) | `z.array(z.string()).optional()`
- Response Success (CONFIRMED from `TourService`): server returns an object with created id:

```json
{ "success": true, "data": { "tourId": "<id>" }, "message": "", "errorCode": null }
```

- Error Responses:
  - 400 INVALID_INPUT
  - 401/403
- Examples:
  - Valid request -> success with `{ tourId }` in `data`.
  - Invalid (missing fields) -> 400 with `details`.
- Client guidance:
  - Validate required strings and date formats locally before submit.


### PUT /api/v1/admin/tours/{tourId}
- Summary: Admin cập nhật tour (partial update).
- Method & Full Path: PUT /api/v1/admin/tours/{tourId}
- Success HTTP status code(s): 200
- Auth: Required (ROLE_ADMIN)
- Headers: `Authorization: Bearer <token>`, `Content-Type: application/json`
- Path Params:
  - `tourId` | string | REQUIRED | NOT NULL | `z.string().min(1)`
- Request Body: Partial of create schema — all fields OPTIONAL (omit if absent). DO NOT send `null` for omitted fields.
- Response Success (CONFIRMED): server returns `{ tourId }` after update:

```json
{ "success": true, "data": { "tourId": "<id>" }, "message": "", "errorCode": null }
```

- Error Responses: 400/401/403/404
- Examples:
  - Valid: `{ "status":"open" }` -> 200 + `{ tourId }`


### DELETE /api/v1/admin/tours/{tourId}
- Summary: Admin xóa tour.
- Method & Full Path: DELETE /api/v1/admin/tours/{tourId}
- Success HTTP status code(s): 200
- Auth: Required (ROLE_ADMIN)
- Response Success: `{ success:true, data:{ tourId }, message:"", errorCode: null }`
- Errors: 401/403/404


### GET /api/v1/admin/registrations?tourId=
- Summary: Admin list registrations for một tour hoặc tất cả tour.
- Method & Full Path: GET /api/v1/admin/registrations?tourId=xxx | GET /api/v1/admin/registrations?tourId=ALL
- Success HTTP status code(s): 200
- Auth: Required (ROLE_ADMIN)
- Headers: `Authorization: Bearer <token>`
- Query Params:
  - `tourId` | string | REQUIRED | NOT NULL | `z.string().min(1)`
    - Special value: nếu bằng `"ALL"` (in hoa) thì server trả về registrations của **tất cả** tour.
- Response Success: array of registration items:

```ts
interface RegistrationItem {
  id: string;
  tourId: string;
  fullName: string;
  phone: string;
  email?: string | null;
  note?: string | null;
  createdAt?: string; // ISO timestamp
}
```

- Error Responses: 400 INVALID_INPUT, 401/403


## QA Summary (files parsed, endpoints discovered)
- Files parsed during generation:
  - `src/app.ts`
  - `src/routes/index.ts`
  - `src/routes/tours.routes.ts`
  - `src/routes/registrations.routes.ts`
  - `src/routes/admin.routes.ts`
  - `src/routes/health.routes.ts`
  - `src/controllers/tours.controller.ts`
  - `src/controllers/registrations.controller.ts`
  - `src/controllers/admin.controller.ts`
  - `src/controllers/adminTours.controller.ts`
  - `src/services/TourService.ts` (CONFIRMED admin create/update/delete return `{ tourId }`)
  - `src/services/AdminAuthService.ts` (CONFIRMED returns `{ token, expiredAt }` on success)
  - `src/services/RegistrationService.ts` (CONFIRMED adminListRegistrations returns mapped rows)
  - `src/schemas/tours.schemas.ts` (GetToursQuerySchema now uses `TourStatusEnum`)
  - `src/schemas/registrations.schemas.ts`
  - `src/schemas/admin.schemas.ts`
  - `src/middlewares/validate.ts`
  - `src/shared/http.ts`

- Endpoints discovered (10):
  1. GET /api/v1/health
  2. GET /api/v1/tours
  3. GET /api/v1/tours/{tourId}
  4. POST /api/v1/registrations
  5. POST /api/v1/admin/login
  6. GET /api/v1/admin/tours
  7. POST /api/v1/admin/tours
  8. PUT /api/v1/admin/tours/{tourId}
  9. DELETE /api/v1/admin/tours/{tourId}
 10. GET /api/v1/admin/registrations?tourId=

- Items requiring follow-up / TODOs:
  - `src/controllers/adminTours.controller.ts` and service responses: create/update/delete return `{ tourId }` (confirmed) but if you need full object returned adjust service to return created object.
  - If you want `GET /api/v1/tours` to accept non-enum values, revert `GetToursQuerySchema` change. Current server expects enum values now.


## Appendix: Error codes & client checklist & snippets

### Error codes (code -> short meaning)
- INVALID_INPUT -> Dữ liệu request vi phạm validation (400). `details` contains Zod issues.
- TOUR_NOT_FOUND -> Tour không tồn tại (404).
- TOUR_FETCH_FAILED -> Lỗi khi lấy danh sách tour (500).
- TOUR_CLOSED -> Tour đã đóng, không cho đăng ký (400).
- REGISTRATION_FAILED -> Lưu registration thất bại (500).
- AUTH_FAILED -> Đăng nhập thất bại (401).
- UNAUTHORIZED -> Thiếu/không hợp lệ token (401).
- FORBIDDEN -> Token hợp lệ nhưng không có role admin (403).
- INTERNAL_ERROR -> Lỗi hệ thống (500).

### Client-side validation checklist (copy/paste)
- Ensure `Content-Type: application/json` for POST/PUT.
- Trim and assert required strings length > 0.
- Phone: validate with `^(0|\+84)(\d{9})$` before submit.
- Email: if present, validate RFC-style email.
- Note: if present, ensure length <= 500.
- Dates: enforce `YYYY-MM-DD` format.
- Status fields: restrict to `['draft','open','closed']`.
- TourId fields: non-empty string.
- On server `INVALID_INPUT`, use `details` array to show inline field errors.

### Quick fetch example (admin login)
```ts
async function adminLogin(email:string, password:string){
  const res = await fetch('/api/v1/admin/login', {
    method: 'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ email, password })
  });
  const j = await res.json();
  if(!j.success) throw normalizeServerError(j);
  return j.data; // { token, expiredAt }
}
```

### Quick axios example (create tour)
```ts
import axios from 'axios';
async function createTour(token:string, payload:any){
  const res = await axios.post('/api/v1/admin/tours', payload, { headers:{ Authorization:`Bearer ${token}` } });
  if(!res.data.success) throw res.data;
  return res.data.data; // { tourId }
}
```

### Quick fetch example (public register)
```ts
async function registerToTour(body){
  // pre-validate phone/date on client
  const res = await fetch('/api/v1/registrations', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
  const j = await res.json();
  if(!j.success) throw normalizeServerError(j);
  return j.message;
}
```

---

*Generated by parsing route files and service implementations in the repository. If you want an OpenAPI spec produced from these schemas, I can generate it next.*
