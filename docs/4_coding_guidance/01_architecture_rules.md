# 01_architecture_rules

Kiến trúc bắt buộc:
- routes → controllers → services → repositories
- Zod schemas tại boundary
- middlewares: auth, validation, error handler, http logger, cors, rate limit

Không được:
- gọi Firestore trực tiếp trong controller/route
- đổi response format khác API Spec

