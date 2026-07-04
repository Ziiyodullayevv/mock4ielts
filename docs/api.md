# Mock4IELTS API Contract

This document is the canonical API reference for the Mock4IELTS web and admin
applications. It consolidates the previous root backend contract and admin app
API notes into one place.

## Sources

- Backend Swagger UI: `https://mockapi.mock4ielts.uz/docs`
- OpenAPI JSON: `https://mockapi.mock4ielts.uz/openapi.json`
- Base URL: `https://mockapi.mock4ielts.uz/api/v1`
- Web endpoint registry: `apps/web/src/lib/axios.ts`
- Admin endpoint registry: `apps/admin/src/lib/axios.ts`

The OpenAPI snapshot was previously verified against 88 paths, including 41
admin endpoints. Re-check Swagger before changing request or response shapes.

## Transport Rules

All endpoint paths below are relative to `/api/v1`.

Protected endpoints use:

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

Media upload endpoints use `multipart/form-data`.

Most responses use this envelope:

```json
{
  "success": true,
  "data": {},
  "message": "OK",
  "pagination": null
}
```

List responses may include pagination:

```json
{
  "success": true,
  "data": [],
  "message": "OK",
  "pagination": {
    "page": 1,
    "size": 20,
    "total": 100,
    "pages": 5
  }
}
```

Errors should be treated as structured when possible and message-based as a
fallback:

```json
{
  "success": false,
  "error_code": "NOT_FOUND",
  "message": "Resource not found"
}
```

## Core Enums

| Name | Values |
| --- | --- |
| `section_type` | `listening`, `reading`, `writing`, `speaking` |
| `exam_type` | `academic`, `general_training` |
| `difficulty` | `easy`, `medium`, `hard` |
| `auth_provider` | `google`, `apple`, `email` |
| `contest_status` | `scheduled`, `live`, `grading`, `finished` |

Question types currently handled by the apps:

```txt
single_choice, multiple_choice, matching, map_labeling, map_labelling,
sentence_completion, short_answer, note_completion, table_completion,
diagram_completion, form_completion, flow_chart_completion,
true_false_not_given, yes_no_not_given, matching_headings,
matching_information, matching_features, matching_sentence_endings,
summary_completion_list, summary_completion_free,
graph_description, letter_writing, essay,
speaking_short, speaking_cue_card, speaking_discussion
```

## Authentication

### Web Auth

| Method | Endpoint | Body | Notes |
| --- | --- | --- | --- |
| `POST` | `/auth/email` | `{ "email": "...", "invitation_code": "..." }` | Sends OTP. `invitation_code` is optional in the web client. |
| `POST` | `/auth/verify-otp` | `{ "email": "...", "otp_code": "...", "invitation_code": "..." }` | Returns token pair. |
| `POST` | `/auth/google` | `{ "id_token": "...", "invitation_code": "..." }` | Google ID token is required by the web client. |
| `POST` | `/auth/apple` | `{ "id_token": "..." }` | Swagger expects `id_token`; current web client only sends invitation code when present. Align before enabling Apple login. |
| `POST` | `/auth/refresh` | `{ "refresh_token": "..." }` | Returns a fresh token pair. |
| `POST` | `/auth/logout` | optional `{ "refresh_token": "..." }` | Web currently calls logout without a body and clears local tokens. |

Token response:

```json
{
  "success": true,
  "data": {
    "access_token": "<jwt>",
    "refresh_token": "<jwt>",
    "token_type": "bearer"
  },
  "message": "OK"
}
```

Web token storage:

- access token key: `jwt_access_token`
- refresh token key: `jwt_refresh_token`
- primary storage: `localStorage`
- legacy migration source: `sessionStorage`

### Admin Auth

| Method | Endpoint | Body | Notes |
| --- | --- | --- | --- |
| `POST` | `/admin/auth/login` | `{ "email": "...", "password": "..." }` | Admin JWT login. |
| `POST` | `/admin/auth/refresh` | `{ "refresh_token": "..." }` | Admin token refresh. |
| `POST` | `/auth/logout` | `{ "refresh_token": "..." }` | Called by admin auth action; endpoint is shared. |

Known statuses for admin login:

| Status | Meaning |
| --- | --- |
| `200` | Login succeeded |
| `401` | Email or password is invalid |
| `403` | User is not an admin |
| `422` | Request validation failed |

Admin token storage:

- access token key: `jwt_access_token`
- refresh token key: `jwt_refresh_token`
- storage: `sessionStorage`

## Web API Surface

### Profile

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/users/me` | Read current profile |
| `PATCH` | `/users/me` | Update current profile |
| `DELETE` | `/users/me` | Delete current account |
| `POST` | `/users/me/avatar` | Upload profile avatar |
| `DELETE` | `/users/me/avatar` | Remove profile avatar |

Profile update fields used by the web app:

```json
{
  "first_name": "Ali",
  "last_name": "Valiyev",
  "full_name": "Ali Valiyev",
  "date_of_birth": "2000-01-15",
  "gender": "male",
  "phone": "+998901234567",
  "phone_country_code": "UZ",
  "country": "Uzbekistan",
  "country_region_of_residence": "Tashkent",
  "country_region_code": "UZ-TK",
  "target_band": "7.5"
}
```

### Sections and Practice

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/sections` | List published practice sections |
| `GET` | `/sections/{section_id}` | Read section detail |
| `POST` | `/sections/{section_id}/start` | Start section attempt |
| `POST` | `/sections/{section_id}/submit` | Submit section answers |
| `GET` | `/sections/{section_id}/result/{attempt_id}` | Read attempt result |

List filters used by the web app:

```json
{
  "section_type": "listening",
  "page": 1,
  "size": 20
}
```

Submission payload:

```json
{
  "attempt_id": "<attempt_id>",
  "answers": [
    {
      "question_id": "<question_id>",
      "answer": "candidate answer"
    }
  ]
}
```

Writing sections are expected to contain two tasks. Task 1 can be
`graph_description` or `letter_writing`; Task 2 is usually `essay`. Task visuals
belong on `question.image_url`.

Speaking uses both the backend section APIs and LiveKit session APIs.

### Speaking and LiveKit

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/speaking/start-session` | Start backend-managed speaking session |
| `POST` | `/attempts/{attempt_id}/grade-speaking` | Grade speaking attempt |
| `GET` | web `/api/token` | Local Next route for LiveKit token and agent dispatch |

The web app prefers `NEXT_PUBLIC_LIVEKIT_URL` if the backend returns an internal
LiveKit URL such as `ws://livekit:7880`.

### Mock Exams

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/mock-exams` | List available mock exams |
| `GET` | `/mock-exams/{exam_id}` | Read mock exam detail |
| `POST` | `/mock-exams/{exam_id}/start` | Start mock exam |
| `POST` | `/mock-exams/{exam_id}/submit-section` | Submit one section |
| `POST` | `/mock-exams/{exam_id}/finish` | Finish exam |
| `GET` | `/mock-exams/{exam_id}/result/{attempt_id}` | Read exam result |

### Contests

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/contests` | List contests |
| `GET` | `/contests/{contest_id}` | Read contest detail |
| `POST` | `/contests/{contest_id}/register` | Register current user |
| `POST` | `/contests/{contest_id}/start` | Start contest |
| `POST` | `/contests/{contest_id}/submit-section` | Submit one contest section |
| `POST` | `/contests/{contest_id}/finish` | Finish contest |
| `GET` | `/contests/{contest_id}/leaderboard` | Read leaderboard |
| `GET` | `/contests/{contest_id}/my-result` | Read current user result |

Contest statistics currently come from `/statistics/me/contests`.

### Favorites, Notifications, and Statistics

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/favorites` | List current user's favorites |
| `GET` | `/favorites/{section_id}/status` | Read favorite status |
| `POST` or `DELETE` | `/favorites/{section_id}` | Toggle favorite state |
| `GET` | `/me/notifications` | List notifications |
| `PATCH` | `/me/notifications/{notification_id}/read` | Mark one notification read |
| `PATCH` | `/me/notifications/mark-all-read` | Mark all notifications read |
| `GET` | `/me/devices` | List notification devices |
| `POST` | `/me/devices` | Register notification device |
| `DELETE` | `/me/devices/{device_id}` | Remove notification device |
| `GET` | `/statistics/me` | Current user statistics |
| `GET` | `/statistics/me/overview` | Aggregated overview |
| `GET` | `/statistics/me/sections` | Section statistics |
| `GET` | `/statistics/me/sections/{section_type}` | Section-specific statistics |
| `GET` | `/statistics/me/exams` | Exam statistics |
| `GET` | `/statistics/me/mock-exams` | Mock exam statistics |
| `GET` | `/statistics/global` | Global statistics |

## Admin API Surface

### Users

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/admin/users` | List users |
| `GET` | `/admin/users/{user_id}` | Read user detail |
| `PATCH` | `/admin/users/{user_id}` | Update admin-editable user fields |

User admin update fields verified by prior integration work:

```json
{
  "full_name": "Ali Valiyev",
  "phone": "+998901234567",
  "country": "Uzbekistan",
  "target_band": "7.5",
  "token_balance": 150,
  "is_admin": false
}
```

Do not send `avatar` through `PATCH /admin/users/{user_id}` unless the backend
schema explicitly adds support for it.

### Sections

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/admin/sections` | Create section, optionally with nested parts/questions |
| `GET` | `/admin/sections` | List sections |
| `GET` | `/admin/sections/{section_id}` | Read section detail |
| `PATCH` | `/admin/sections/{section_id}` | Update section-level fields |
| `DELETE` | `/admin/sections/{section_id}` | Delete section |
| `POST` | `/admin/sections/{section_id}/publish` | Toggle published state |
| `POST` | `/admin/sections/{section_id}/duplicate` | Duplicate section |
| `POST` | `/admin/sections/{section_id}/parts` | Add part |
| `PATCH` | `/admin/sections/{section_id}/parts/{part_id}` | Update part |
| `DELETE` | `/admin/sections/{section_id}/parts/{part_id}` | Delete part |
| `POST` | `/admin/sections/parts/{part_id}/questions` | Add question |
| `POST` | `/admin/sections/parts/{part_id}/questions/bulk` | Add questions in bulk |
| `PATCH` | `/admin/sections/parts/{part_id}/questions/{question_id}` | Update question |
| `DELETE` | `/admin/sections/parts/{part_id}/questions/{question_id}` | Delete question |
| `PUT` | `/admin/sections/parts/{part_id}/questions/reorder` | Reorder questions |

Important persistence boundary:

- `PATCH /admin/sections/{section_id}` is section-level only.
- part changes must use part endpoints.
- question changes must use question endpoints.
- do not send nested `parts` to the section patch endpoint.

Minimal `SectionCreate`:

```json
{
  "section_type": "reading",
  "exam_type": "academic",
  "title": "Reading Test 1",
  "duration_minutes": 60,
  "difficulty": "medium",
  "tags": ["cambridge", "academic"],
  "parts": []
}
```

Question payload shape:

```json
{
  "question_type": "true_false_not_given",
  "text": "Statement text",
  "correct_answer": "TRUE",
  "points": 1,
  "order": 1,
  "metadata": {
    "group_id": "tfng-1-7",
    "allowed_values": ["TRUE", "FALSE", "NOT GIVEN"]
  }
}
```

For writing Task 1 image uploads, save the returned URL to `question.image_url`.

### Mock Exams

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/admin/mock-exams` | Create mock exam |
| `GET` | `/admin/mock-exams` | List mock exams |
| `GET` | `/admin/mock-exams/{exam_id}` | Read mock exam detail |
| `PATCH` | `/admin/mock-exams/{exam_id}` | Update mock exam |
| `DELETE` | `/admin/mock-exams/{exam_id}` | Delete mock exam |
| `POST` | `/admin/mock-exams/{exam_id}/publish` | Publish mock exam |
| `POST` | `/admin/mock-exams/{exam_id}/duplicate` | Duplicate mock exam |

### Contests

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/admin/contests` | Create contest |
| `GET` | `/admin/contests` | List contests |
| `GET` | `/admin/contests/{contest_id}` | Read contest detail |
| `PATCH` | `/admin/contests/{contest_id}` | Update contest |
| `DELETE` | `/admin/contests/{contest_id}` | Delete contest |
| `POST` | `/admin/contests/{contest_id}/publish` | Publish contest |
| `POST` | `/admin/contests/{contest_id}/start` | Start contest |
| `POST` | `/admin/contests/{contest_id}/end` | End contest |
| `POST` | `/admin/contests/{contest_id}/finalize` | Finalize grading/ranking |
| `GET` | `/admin/contests/{contest_id}/leaderboard` | Read contest leaderboard |
| `GET` | `/admin/contests/{contest_id}/stats` | Read contest stats |

### Grading and Media

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/admin/attempts/{attempt_id}/grade-writing` | Grade writing attempt |
| `POST` | `/admin/attempts/{attempt_id}/grade-speaking` | Grade speaking attempt |
| `POST` | `/admin/media/upload` | Upload one media file |
| `POST` | `/admin/media/upload-multiple` | Upload up to 10 media files |
| `GET` | `/admin/media` | List media files |
| `DELETE` | `/admin/media/{media_id}` | Delete media file |

Upload response URLs must be verified separately. A successful upload does not
guarantee that the public `/media/...` URL is reachable from the browser.

## Implementation Rules

- Keep endpoint constants in `src/lib/axios.ts` for each app.
- Keep request/response normalization in API adapters or form utilities.
- Do not format backend responses directly inside presentational components.
- Update this document whenever a backend endpoint, field name, enum, or payload
  boundary changes.
- Prefer live Swagger/OpenAPI verification before changing admin forms or public
  practice flows.
