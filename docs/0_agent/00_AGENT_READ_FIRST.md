# 00_AGENT_READ_FIRST

## Mục tiêu pack
Tạo backend skeleton **build được** và bộ tài liệu đủ chi tiết để Copilot triển khai phần TODO mà **không làm sai contract**.

## Luật bắt buộc
1. API: bám 1:1 theo **API Spec** (path/method, request/response, errorCode, HTTP status).  
2. Data: bám theo **ERD/DFD + PRD/SRS** (collections/fields/relations/index hints).  
3. UI/Flow: bám theo **SRS + Wireframe** (screens, states, validations, behaviors).  
4. Khi thiếu/mâu thuẫn: ghi rõ **UNKNOWN/CONFLICT**, đưa 2–3 phương án, và skeleton chọn **an toàn nhất** (security fail-closed).

## Thứ tự đọc khuyến nghị
1) `docs/3_technical/01_api_contract.md`  
2) `docs/3_technical/02_data_model_firestore.md`  
3) `docs/3_technical/03_rules_and_validation.md`  
4) `docs/3_technical/04_authz_rbac.md`  
5) `docs/3_technical/05_error_handling.md`  
6) `docs/3_technical/07_traceability_matrix.md`  

## Thứ tự triển khai (Copilot)
- Route + Zod schema trước → Controllers → Services → Repositories → Tests

