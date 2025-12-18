# 03_AGENT_WORKFLOW

1) Xác định screen liên quan (docs/2_functional/02_screen_inventory.md)  
2) Xác định API gọi (docs/3_technical/01_api_contract.md)  
3) Xác định entity/collection liên quan (docs/3_technical/02_data_model_firestore.md)  
4) Áp quy tắc validation/business (docs/3_technical/03_rules_and_validation.md)  
5) Implement theo thứ tự:
- Zod schema → route wiring → controller → service → repository → tests

Definition of Done:
- Không thêm endpoint/field ngoài spec
- Validation lỗi trả `INVALID_INPUT` (400) hoặc errorCode đúng spec
- Response đúng shape spec

