# 04_authz_rbac

## Quy ước theo API Spec
- Admin xác thực bằng Firebase Authentication
- Bearer token: Firebase ID Token
- Header: `Authorization: Bearer <token>`

## Mâu thuẫn / thiếu rõ ràng
- API-04 `/admin/login` trả `token` + `expiredAt`
- ERD có `admins.passwordHash` và DFD mô tả xác thực với Firestore.admins / Firebase Auth

=> Cần chốt “source of truth” cho login.

## Phương án xử lý (2–3 options)
### Option A: Firebase Auth signInWithPassword
- Backend gọi Firebase Identity Toolkit bằng email/password, lấy `idToken`, trả ra `token=idToken`.
- Middleware verify `idToken`.
- Đồng thời vẫn cần allow-list admin (collection admins) để enforce admin-only.

### Option B: Custom passwordHash + custom JWT
- Verify password với `admins.passwordHash` (bcrypt/argon2).
- Mint JWT riêng.
- Middleware verify JWT riêng.
- NHƯỢC: xung đột với “Firebase ID Token” trong API Spec.

### Option C: FE login trực tiếp bằng Firebase Auth SDK
- FE lấy Firebase ID Token, backend chỉ verify.
- Cần thay đổi API contract (không còn /admin/login) → hiện tại không phù hợp nếu contract cố định.

## Skeleton lựa chọn (an toàn nhất)
- `/admin/login`: **fail-closed** (501) cho tới khi option được chốt.
- `/admin/*`: verify Firebase ID Token + check tồn tại admin record (`role=admin`) để tránh lộ admin APIs.

