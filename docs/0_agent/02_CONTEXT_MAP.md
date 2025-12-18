# 02_CONTEXT_MAP

## Nguồn yêu cầu
- PRD: mục tiêu kinh doanh, phạm vi, module, data model level-0, out of scope/future enhancements.
- SRS: FR-01..FR-29 + NFR (hiệu năng/bảo mật/mở rộng/khả dụng).
- Wireframe: screen map, layout, state, validation UI-level.
- API Spec: contract kỹ thuật giữa BE/FE/QA.
- ERD/DFD: entity fields/relations và luồng dữ liệu.

## Repo mapping
- Contract → `docs/3_technical/01_api_contract.md` + `src/routes/**` + `src/schemas/**`
- Data model → `docs/3_technical/02_data_model_firestore.md` + `src/repositories/**`
- Rules → `docs/3_technical/03_rules_and_validation.md` + `src/services/**`
- Auth/RBAC → `docs/3_technical/04_authz_rbac.md` + `src/middlewares/auth.ts`
- Error handling → `docs/3_technical/05_error_handling.md` + `src/middlewares/errorHandler.ts`
- Traceability → `docs/3_technical/07_traceability_matrix.md`

