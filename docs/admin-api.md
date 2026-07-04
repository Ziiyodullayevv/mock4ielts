# Mock4IELTS Admin API hujjati

Yangilangan sana: 2026-06-18  
Swagger: `https://mockapi.mock4ielts.uz/docs`  
OpenAPI JSON: `https://mockapi.mock4ielts.uz/openapi.json`  
Base URL: `https://mockapi.mock4ielts.uz/api/v1`

Bu hujjat admin panel uchun kerak bo'ladigan API manzillari, request body formatlari va live API dan tekshirilgan response shakllarini jamlaydi. Swagger bo'yicha jami 88 path bor, shundan 41 tasi admin endpoint.

## Umumiy qoidalar

Admin endpointlar `Bearer` token bilan ishlaydi.

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

Ko'p endpointlarda javob umumiy wrapper bilan keladi:

```json
{
  "success": true,
  "data": {},
  "message": "OK",
  "pagination": null
}
```

List endpointlarda `pagination` shunday keladi:

```json
{
  "total": 7,
  "page": 1,
  "size": 3,
  "pages": 3
}
```

Asosiy enum qiymatlar:

| Nomi | Qiymatlar |
| --- | --- |
| `section_type` | `listening`, `reading`, `writing`, `speaking` |
| `exam_type` | `academic`, `general_training` |
| `auth_provider` | `google`, `apple`, `email` |
| `contest_status` | `scheduled`, `live`, `grading`, `finished` |

`question_type` qiymatlari:

```txt
single_choice, multiple_choice, matching, map_labeling, sentence_completion,
short_answer, note_completion, table_completion, diagram_completion,
form_completion, flow_chart_completion, true_false_not_given,
yes_no_not_given, matching_headings, matching_information,
matching_features, matching_sentence_endings, summary_completion_list,
summary_completion_free, graph_description, letter_writing, essay,
speaking_short, speaking_cue_card, speaking_discussion
```

## Auth

### POST `/admin/auth/login`

Admin login. Request:

```json
{
  "email": "admin@example.com",
  "password": "password"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "access_token": "<jwt>",
    "refresh_token": "<jwt>",
    "token_type": "bearer"
  },
  "message": "OK",
  "pagination": null
}
```

Statuslar:

| Status | Ma'nosi |
| --- | --- |
| `200` | Login muvaffaqiyatli |
| `401` | Email yoki parol noto'g'ri |
| `403` | User admin emas |
| `422` | Request validatsiyadan o'tmadi |

### POST `/admin/auth/refresh`

Access token yangilash. Request:

```json
{
  "refresh_token": "<refresh_token>"
}
```

Response login bilan bir xil: `access_token`, `refresh_token`, `token_type`.

## Admin endpointlar ro'yxati

| Method | Endpoint | Vazifasi | Path params | Query params | Body |
| --- | --- | --- | --- | --- | --- |
| `POST` | `/admin/auth/login` | Admin login | - | - | `AdminLoginRequest` |
| `POST` | `/admin/auth/refresh` | Admin token refresh | - | - | `RefreshTokenRequest` |
| `POST` | `/admin/sections` | Section yaratish, nested parts/questions bilan | - | - | `SectionCreate` |
| `GET` | `/admin/sections` | Sectionlar ro'yxati | - | `section_type`, `is_published`, `difficulty`, `q`, `page`, `size` | - |
| `GET` | `/admin/sections/{section_id}` | Section detail | `section_id` | - | - |
| `PATCH` | `/admin/sections/{section_id}` | Section update | `section_id` | - | `SectionUpdate` |
| `DELETE` | `/admin/sections/{section_id}` | Section o'chirish | `section_id` | - | - |
| `POST` | `/admin/sections/{section_id}/publish` | Published holatini toggle qilish | `section_id` | - | - |
| `POST` | `/admin/sections/{section_id}/duplicate` | Section nusxalash | `section_id` | - | - |
| `POST` | `/admin/sections/{section_id}/parts` | Part qo'shish | `section_id` | - | `PartCreate` |
| `PATCH` | `/admin/sections/{section_id}/parts/{part_id}` | Part update | `section_id`, `part_id` | - | `PartUpdate` |
| `DELETE` | `/admin/sections/{section_id}/parts/{part_id}` | Part o'chirish | `section_id`, `part_id` | - | - |
| `POST` | `/admin/sections/parts/{part_id}/questions` | Question qo'shish | `part_id` | - | `QuestionCreateV2` |
| `POST` | `/admin/sections/parts/{part_id}/questions/bulk` | Bir nechta question qo'shish | `part_id` | - | `QuestionCreateV2[]` |
| `PATCH` | `/admin/sections/parts/{part_id}/questions/{question_id}` | Question update | `part_id`, `question_id` | - | `QuestionUpdateV2` |
| `DELETE` | `/admin/sections/parts/{part_id}/questions/{question_id}` | Question o'chirish | `part_id`, `question_id` | - | - |
| `PUT` | `/admin/sections/parts/{part_id}/questions/reorder` | Question tartibini o'zgartirish | `part_id` | - | `QuestionReorderItem[]` |
| `POST` | `/admin/mock-exams` | Mock exam yaratish | - | - | `MockExamCreate` |
| `GET` | `/admin/mock-exams` | Mock examlar ro'yxati | - | `page`, `size` | - |
| `GET` | `/admin/mock-exams/{exam_id}` | Mock exam detail | `exam_id` | - | - |
| `PATCH` | `/admin/mock-exams/{exam_id}` | Mock exam update | `exam_id` | - | `MockExamUpdate` |
| `DELETE` | `/admin/mock-exams/{exam_id}` | Mock exam o'chirish | `exam_id` | - | - |
| `POST` | `/admin/mock-exams/{exam_id}/publish` | Mock exam publish qilish | `exam_id` | - | - |
| `POST` | `/admin/contests` | Contest yaratish | - | - | `ContestCreate` |
| `GET` | `/admin/contests` | Contestlar ro'yxati | - | `page`, `size` | - |
| `GET` | `/admin/contests/{contest_id}` | Contest detail | `contest_id` | - | - |
| `PATCH` | `/admin/contests/{contest_id}` | Contest update | `contest_id` | - | `ContestUpdate` |
| `DELETE` | `/admin/contests/{contest_id}` | Contest o'chirish | `contest_id` | - | - |
| `POST` | `/admin/contests/{contest_id}/publish` | Contest publish qilish | `contest_id` | - | - |
| `POST` | `/admin/contests/{contest_id}/start` | Contest boshlash | `contest_id` | - | - |
| `POST` | `/admin/contests/{contest_id}/end` | Contest tugatish | `contest_id` | - | - |
| `POST` | `/admin/contests/{contest_id}/finalize` | Contestni grade/rank qilish | `contest_id` | - | - |
| `GET` | `/admin/users` | Userlar ro'yxati | - | `search`, `auth_provider`, `is_admin`, `page`, `size` | - |
| `GET` | `/admin/users/{user_id}` | User detail | `user_id` | - | - |
| `PATCH` | `/admin/users/{user_id}` | Userni admin tomondan update qilish | `user_id` | - | `UserAdminUpdate` |
| `POST` | `/admin/attempts/{attempt_id}/grade-writing` | Writing attempt grade qilish | `attempt_id` | - | `GradeWritingRequest` |
| `POST` | `/admin/attempts/{attempt_id}/grade-speaking` | Speaking attempt grade qilish | `attempt_id` | - | `GradeSpeakingRequest` |
| `POST` | `/admin/media/upload` | Bitta media upload | - | - | `multipart/form-data`, `file` |
| `POST` | `/admin/media/upload-multiple` | Bir nechta media upload, max 10 | - | - | `multipart/form-data`, `files[]` |
| `GET` | `/admin/media` | Media ro'yxati | - | `page`, `size` | - |
| `DELETE` | `/admin/media/{media_id}` | Media o'chirish | `media_id` | - | - |

## Sections

### SectionCreate

Required maydonlar `*` bilan belgilangan.

| Maydon | Type | Izoh |
| --- | --- | --- |
| `section_type`* | enum | `listening`, `reading`, `writing`, `speaking` |
| `exam_type` | enum | default `academic` |
| `title`* | string | 1-200 belgi |
| `instructions` | string yoki `null` | Section instruction |
| `audio_url` | string yoki `null` | Listening/audio section uchun |
| `duration_minutes` | integer yoki `null` | 1 dan katta, max 180 |
| `difficulty` | string yoki `null` | Masalan `easy`, `medium`, `hard` |
| `tags` | string[] yoki `null` | Teglar |
| `parts` | `PartCreate[]` | Nested parts |

Minimal request:

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

Nested request namunasi:

```json
{
  "section_type": "reading",
  "exam_type": "academic",
  "title": "Reading Test 1",
  "instructions": "Questions 1-40",
  "duration_minutes": 60,
  "difficulty": "medium",
  "tags": ["reading"],
  "parts": [
    {
      "title": "Passage 1",
      "passage_text": "<p>Passage text</p>",
      "instructions": "Questions 1-13",
      "order": 0,
      "questions": [
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
      ]
    }
  ]
}
```

### SectionUpdate

Faqat update qilinadigan maydonlarni yuboring:

```json
{
  "title": "Reading Test 1 updated",
  "exam_type": "academic",
  "instructions": "New instruction",
  "audio_url": null,
  "duration_minutes": 60,
  "difficulty": "medium",
  "tags": ["reading", "updated"]
}
```

Bo'sh body yuborilsa `400 No fields to update` qaytishi mumkin.

### PartCreate

| Maydon | Type | Izoh |
| --- | --- | --- |
| `title`* | string | 1-200 belgi |
| `passage_text` | string yoki `null` | Reading passage HTML/text |
| `passage_source` | string yoki `null` | Source |
| `audio_url` | string yoki `null` | Audio manzil |
| `audio_start_time` | number yoki `null` | 0 dan katta yoki teng |
| `audio_end_time` | number yoki `null` | 0 dan katta yoki teng |
| `image_url` | string yoki `null` | Rasm |
| `instructions` | string yoki `null` | Part instruction |
| `order` | integer | default `0` |
| `questions` | `QuestionCreateV2[]` | Savollar |

### QuestionCreateV2

| Maydon | Type | Izoh |
| --- | --- | --- |
| `question_type`* | enum | Yuqoridagi `question_type`lardan biri |
| `text`* | string | Savol matni |
| `options` | array yoki `null` | Variantlar, matching juftliklari va hokazo |
| `correct_answer` | any yoki `null` | Typega qarab string, array yoki object bo'lishi mumkin |
| `explanation` | string yoki `null` | Javob izohi |
| `image_url` | string yoki `null` | Savol rasmi |
| `points` | number | default `1` |
| `order` | integer | default `0` |
| `metadata` | object yoki `null` | Group, label, instruction, allowed values kabi qo'shimcha ma'lumotlar |

Question update uchun shu maydonlarning hammasi ixtiyoriy: `QuestionUpdateV2`.

### Reorder questions

`PUT /admin/sections/parts/{part_id}/questions/reorder`

```json
[
  {
    "question_id": "00000000-0000-0000-0000-000000000001",
    "order": 0
  },
  {
    "question_id": "00000000-0000-0000-0000-000000000002",
    "order": 1
  }
]
```

## Mock exams

### MockExamCreate

| Maydon | Type | Izoh |
| --- | --- | --- |
| `title`* | string | 1-200 belgi |
| `exam_type` | enum | default `academic` |
| `description` | string yoki `null` | max 2000 belgi |
| `duration_minutes` | integer | default `170`, max 300 |
| `sections`* | object | Kalitlar section type, qiymatlar section UUID |

Request:

```json
{
  "title": "Full IELTS Mock 1",
  "exam_type": "academic",
  "description": "Full mock exam",
  "duration_minutes": 165,
  "sections": {
    "listening": "00000000-0000-0000-0000-000000000001",
    "reading": "00000000-0000-0000-0000-000000000002",
    "writing": "00000000-0000-0000-0000-000000000003",
    "speaking": "00000000-0000-0000-0000-000000000004"
  }
}
```

OpenAPI description bo'yicha create endpoint `422 Must provide all 4 sections` qaytarishi mumkin, demak `sections` ichida 4 ta section bo'lishi kerak.

### MockExamUpdate

```json
{
  "title": "Full IELTS Mock 1 updated",
  "description": "Updated description",
  "duration_minutes": 170
}
```

Live detail response maydonlari:

```json
{
  "id": "uuid",
  "title": "Mock",
  "mode": "mock",
  "exam_type": "academic",
  "description": null,
  "status": "draft",
  "duration_minutes": 165,
  "total_questions": 39,
  "sections": [
    {
      "order": 0,
      "section_type": "SectionType.LISTENING",
      "section_id": "uuid",
      "title": "Listening section title",
      "question_count": 10
    }
  ],
  "created_at": "2026-04-08T12:08:14.602858Z",
  "updated_at": "2026-04-08T12:08:14.602858Z"
}
```

## Contests

### ContestCreate

| Maydon | Type | Izoh |
| --- | --- | --- |
| `title`* | string | 1-200 belgi |
| `exam_type` | enum | default `academic` |
| `scheduled_at`* | ISO datetime | Masalan `2026-07-01T09:00:00Z` |
| `duration_minutes` | integer | default `170`, max 300 |
| `registration_deadline` | ISO datetime yoki `null` | Ro'yxatdan o'tish deadline |
| `max_participants` | integer yoki `null` | 1 dan katta, max 10000 |
| `description` | string yoki `null` | max 2000 belgi |
| `sections`* | object | Mock exam kabi 4 ta section UUID |

Request:

```json
{
  "title": "July IELTS Contest",
  "exam_type": "academic",
  "scheduled_at": "2026-07-01T09:00:00Z",
  "duration_minutes": 170,
  "registration_deadline": "2026-06-30T18:00:00Z",
  "max_participants": 100,
  "description": "Online contest",
  "sections": {
    "listening": "00000000-0000-0000-0000-000000000001",
    "reading": "00000000-0000-0000-0000-000000000002",
    "writing": "00000000-0000-0000-0000-000000000003",
    "speaking": "00000000-0000-0000-0000-000000000004"
  }
}
```

### ContestUpdate

```json
{
  "title": "July IELTS Contest updated",
  "description": "Updated description",
  "scheduled_at": "2026-07-01T10:00:00Z",
  "duration_minutes": 170,
  "registration_deadline": "2026-06-30T18:00:00Z",
  "max_participants": 120
}
```

Contest action endpointlari:

| Endpoint | Izoh |
| --- | --- |
| `POST /admin/contests/{contest_id}/publish` | Contestni publish qiladi |
| `POST /admin/contests/{contest_id}/start` | `scheduled` holatdan `live` holatga o'tkazadi |
| `POST /admin/contests/{contest_id}/end` | `live` contestni tugatadi |
| `POST /admin/contests/{contest_id}/finalize` | Grade va rankingni final qiladi |

## Users

### GET `/admin/users`

Query params:

| Param | Type | Izoh |
| --- | --- | --- |
| `search` | string | Email bo'yicha case-insensitive qidirish |
| `auth_provider` | enum | `google`, `apple`, `email` |
| `is_admin` | boolean | Admin/user filter |
| `page` | integer | default `1` |
| `size` | integer | default `20`, max `100` |

`UserResponse` maydonlari:

| Maydon | Type |
| --- | --- |
| `id` | UUID |
| `email` | string |
| `full_name` | string yoki `null` |
| `first_name` | string yoki `null` |
| `last_name` | string yoki `null` |
| `avatar` | string yoki `null` |
| `date_of_birth` | date yoki `null` |
| `gender` | string yoki `null` |
| `phone` | string yoki `null` |
| `phone_country_code` | string yoki `null` |
| `country` | string yoki `null` |
| `country_region_of_residence` | string yoki `null` |
| `country_region_code` | string yoki `null` |
| `target_band` | string yoki `null` |
| `auth_provider` | `google`, `apple`, `email`, yoki `null` |
| `token_balance` | integer |
| `is_admin` | boolean |
| `created_at` | ISO datetime |
| `updated_at` | ISO datetime yoki `null` |

### PATCH `/admin/users/{user_id}`

Admin user ma'lumotini update qilish. Hamma maydon ixtiyoriy.

Eslatma: live schema bo'yicha `UserAdminUpdate` ichida `avatar` maydoni yo'q. `POST /admin/media/upload` file upload qiladi va URL qaytaradi, lekin hozirgi backendda bu URL'ni user profiliga avatar sifatida bog'laydigan admin endpoint mavjud emas. Faqat `{ "avatar": "..." }` yuborilsa backend `400 No fields to update` qaytaradi.

```json
{
  "full_name": "User Full Name",
  "first_name": "User",
  "last_name": "Name",
  "phone": "+998901234567",
  "country": "Uzbekistan",
  "target_band": "7.5",
  "token_balance": 100,
  "is_admin": false
}
```

## Attempt grading

### POST `/admin/attempts/{attempt_id}/grade-writing`

```json
{
  "task1": {
    "task_response": 7,
    "coherence": 7,
    "vocabulary": 7,
    "grammar": 7,
    "feedback": "Task 1 feedback"
  },
  "task2": {
    "task_response": 7.5,
    "coherence": 7,
    "vocabulary": 7.5,
    "grammar": 7,
    "feedback": "Task 2 feedback"
  }
}
```

Score maydonlari `0-9` oralig'ida bo'ladi. Schema description bo'yicha 0.5 qadamlar ishlatiladi.

### POST `/admin/attempts/{attempt_id}/grade-speaking`

```json
{
  "criteria": {
    "fluency": 7,
    "vocabulary": 7,
    "grammar": 7,
    "pronunciation": 7,
    "feedback": "Speaking feedback"
  }
}
```

## Media

### POST `/admin/media/upload`

`multipart/form-data` yuboriladi:

| Field | Type | Izoh |
| --- | --- | --- |
| `file`* | binary | Image yoki audio file |

`curl` namunasi:

```bash
curl -X POST "https://mockapi.mock4ielts.uz/api/v1/admin/media/upload" \
  -H "Authorization: Bearer <access_token>" \
  -F "file=@/path/to/file.png"
```

### POST `/admin/media/upload-multiple`

`multipart/form-data` yuboriladi:

| Field | Type | Izoh |
| --- | --- | --- |
| `files`* | binary[] | Max 10 file |

### GET `/admin/media`

Query params: `page`, `size`.

`MediaResponse` maydonlari:

| Maydon | Type |
| --- | --- |
| `id` | UUID |
| `url` | string |
| `content_type` | string |
| `size` | integer, bytes |
| `filename` | string yoki `null` |
| `media_type` | string yoki `null`, masalan `image` |
| `category` | string yoki `null` |
| `description` | string yoki `null` |
| `width` | integer yoki `null` |
| `height` | integer yoki `null` |
| `created_at` | ISO datetime |

## Live tekshiruv natijalari

2026-06-18 kuni berilgan admin login orqali quyidagi read-only endpointlar chaqirildi. Token va parol hujjatga yozilmadi.

| So'rov | Status | Natija |
| --- | --- | --- |
| `POST /admin/auth/login` | `200` | `access_token`, `refresh_token`, `token_type` qaytdi |
| `GET /users/me` | `200` | Login qilingan user `is_admin: true`, `auth_provider: email` |
| `GET /admin/sections?page=1&size=3` | `200` | 3 ta section, pagination `total: 3` |
| `GET /admin/sections/{section_id}` | `200` | Detail ichida `parts[]`, `questions[]`, `correct_answer`, `metadata` bor |
| `GET /admin/mock-exams?page=1&size=3` | `200` | 2 ta mock exam, pagination `total: 2` |
| `GET /admin/mock-exams/{exam_id}` | `200` | Detail ichida 4 ta `sections[]` keladi |
| `GET /admin/contests?page=1&size=3` | `200` | Data bo'sh, pagination `total: 0` |
| `GET /admin/users?page=1&size=3` | `200` | 3 ta user qaytdi, pagination `total: 7` |
| `GET /admin/users/{user_id}` | `200` | `UserResponse` wrapper bilan qaytdi |
| `GET /admin/media?page=1&size=3` | `200` | 3 ta media qaytdi, pagination `total: 26` |

Production ma'lumotlarini o'zgartirmaslik uchun `POST /admin/sections`, `PATCH`, `DELETE`, publish/start/end/finalize va upload endpointlar live mutatsiya sifatida bajarilmadi. Ularning body formatlari OpenAPI schema asosida yuqorida yozildi.

## Frontend endpoint mosligi

`src/lib/axios.ts` ichida endpointlar `/admin/...` ko'rinishida yozilgan. `CONFIG.serverUrl` qiymati `https://mockapi.mock4ielts.uz/api/v1` bo'lsa, frontend to'g'ri live endpointlarga boradi.

E'tibor beriladigan joylar:

| Frontend endpoint | Live API holati |
| --- | --- |
| `endpoints.auth.signIn = /admin/auth/login` | Mos |
| `endpoints.auth.refresh = /admin/auth/refresh` | Mos |
| `endpoints.auth.logout = /auth/logout` | Public auth logout, admin logout alohida Swaggerda yo'q |
| axios refresh interceptor ichidagi `/auth/refresh` | Live admin refresh endpoint `/admin/auth/refresh`, koddagi ikkinchi refresh joyi tekshirilishi kerak |
| `endpoints.profile.me = /users/me` | Mos, admin token bilan ham ishlaydi |
