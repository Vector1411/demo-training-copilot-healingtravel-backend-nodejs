# 07_traceability_matrix

| Screen | FR (SRS) | API | Collections | Rules |
|---|---|---|---|---|
| G-01 Landing | FR-01..FR-04 | API-01 | tours | status=open default; loading/empty |
| Header Public | FR-05..FR-07 | (n/a) | (n/a) | login CTA leads to A-01 |
| G-02 Tour Detail | FR-08..FR-10 | API-02 | tours | status!=open disable CTA; 404 if missing |
| G-03 Registration | FR-11..FR-15 | API-03 | registrations + tours | validate; tourId exists; status=open else TOUR_CLOSED |
| A-01 Login | FR-16..FR-19 | API-04 | admins (+Firebase Auth) | AUTH_FAILED on mismatch; session maintained (FE) |
| A-03/A-04 Tours | FR-22..FR-26 | API-05..08 | tours | CRUD + status enum |
| A-05 Registrations | FR-27..FR-29 | API-09 | registrations | filter by tourId; view-only |

Unknowns:
- API-05..08 response schemas not specified in API Spec
- Login mechanism conflict (Firebase vs passwordHash)
- `thumbnail` mapping vs `images[]`

