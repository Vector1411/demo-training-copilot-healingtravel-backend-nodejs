# 04_copilot_prompt_examples

### Prompt: Hoàn thiện /admin/login (Option A)
Đọc `docs/3_technical/04_authz_rbac.md`, chọn Option A.
- Implement gọi Firebase Identity Toolkit signInWithPassword
- Trả response đúng API-04 (token=idToken, expiredAt từ expiresIn)
- Nếu email/password sai → 401 AUTH_FAILED
- Update docs nếu cần (nhưng không đổi contract ngoài phạm vi tài liệu)

### Prompt: Hoàn thiện Admin Tour APIs response schema
API Spec hiện thiếu schema (API-05..08). Liệt kê thiếu gì, đề xuất schema tối thiểu (id, title, status, dates, ...), yêu cầu stakeholder xác nhận trước khi code.

