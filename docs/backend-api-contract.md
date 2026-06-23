# Mock4IELTS Backend API Contract

Manba: `https://mockapi.mock4ielts.uz/docs#/` va frontenddagi API adapterlar.

Sana: 2026-06-18

## Asosiy Qoidalar

Backend base URL:

```txt
https://mockapi.mock4ielts.uz/api/v1
```

Frontend `CONFIG.serverUrl` orqali shu base URL bilan ishlaydi. `src/lib/axios.ts` ichida endpointlar base URL ga nisbatan yozilgan: masalan `sections` endpointi backendda `/api/v1/sections` bo‘ladi.

Protected endpointlar uchun header:

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

File upload endpointlarda `Content-Type: multipart/form-data` ishlatiladi.

Backend response odatda shu wrapper bilan qaytadi:

```json
{
  "success": true,
  "data": {},
  "message": "OK",
  "pagination": {
    "page": 1,
    "size": 20,
    "total": 100,
    "pages": 5
  }
}
```

Error response:

```json
{
  "success": false,
  "error_code": "NOT_FOUND",
  "message": "Resource not found"
}
```

Frontend ba'zi joylarda `data` wrapper bo‘lmasa ham root obyektni o‘qiy oladi, lekin backenddan kutiladigan toza format yuqoridagi wrapper.

## Enumlar

```ts
type SectionType = 'listening' | 'reading' | 'writing' | 'speaking';
type Difficulty = 'easy' | 'medium' | 'hard';
type ExamType = 'academic' | 'general_training';
type ContestStatus = 'scheduled' | 'live' | 'grading' | 'finished';
```

Question type qiymatlari frontendda shular bilan ishlaydi:

```ts
type ListeningQuestionType =
  | 'single_choice'
  | 'multiple_choice'
  | 'matching'
  | 'note_completion'
  | 'table_completion'
  | 'map_labeling'
  | 'flow_chart_completion'
  | 'summary_completion_free'
  | 'diagram_completion'
  | 'sentence_completion'
  | 'short_answer';

type ReadingQuestionType =
  | 'true_false_not_given'
  | 'yes_no_not_given'
  | 'matching_information'
  | 'matching_headings'
  | 'matching_sentence_endings'
  | 'diagram_completion'
  | 'sentence_completion'
  | 'short_answer'
  | 'note_completion'
  | 'table_completion'
  | 'map_labeling'
  | 'map_labelling'
  | 'summary_completion_list'
  | 'multiple_choice'
  | 'single_choice';

type WritingQuestionType = 'essay' | 'graph_description';

type SpeakingQuestionType =
  | 'speaking_short'
  | 'speaking_cue_card'
  | 'speaking_discussion';
```

## Auth

### POST `/auth/email`

Emailga OTP yuboradi.

Request:

```json
{
  "email": "user@example.com"
}
```

Frontendda `invitation_code` ham yuborilishi mumkin, lekin Swagger schema hozir uni ko‘rsatmaydi:

```json
{
  "email": "user@example.com",
  "invitation_code": "INVITE123"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "message": "OTP sent"
  },
  "message": "OK"
}
```

### POST `/auth/verify-otp`

Request:

```json
{
  "email": "user@example.com",
  "otp_code": "123456"
}
```

Frontendda `invitation_code` ham yuborilishi mumkin.

Response:

```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbG...",
    "refresh_token": "eyJhbG...",
    "token_type": "bearer"
  },
  "message": "OK"
}
```

Frontend tokenlarni `data.access_token` va `data.refresh_token` dan o‘qiydi. Fallback sifatida rootdagi `access_token`, `refresh_token` ni ham qabul qiladi.

### POST `/auth/google`

Request:

```json
{
  "id_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Response OTP verify bilan bir xil: `TokenResponse`.

### POST `/auth/apple`

Swagger bo‘yicha request:

```json
{
  "id_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Muhim: frontendning hozirgi `requestProviderLogin` kodi Apple uchun `id_token` yubormaydi, faqat `invitation_code` yuborishi mumkin. Apple login ishlatilsa, frontend yoki backend kontraktini bir xil qilish kerak.

### POST `/auth/refresh`

Request:

```json
{
  "refresh_token": "eyJhbG..."
}
```

Response:

```json
{
  "success": true,
  "data": {
    "access_token": "new-access-token",
    "refresh_token": "new-refresh-token",
    "token_type": "bearer"
  },
  "message": "OK"
}
```

### POST `/auth/logout`

Swaggerda body optional `refresh_token`, frontend esa hozir body yubormaydi.

```json
{
  "refresh_token": "eyJhbG..."
}
```

## User Profile

### GET `/users/me`

Response:

```json
{
  "success": true,
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "email": "user@example.com",
    "full_name": "Ali Valiyev",
    "first_name": "Ali",
    "last_name": "Valiyev",
    "avatar": "/media/avatar.png",
    "date_of_birth": "2000-01-15",
    "gender": "male",
    "phone": "+998901234567",
    "phone_country_code": "UZ",
    "country": "Uzbekistan",
    "country_region_of_residence": "Tashkent",
    "country_region_code": "UZ-TK",
    "target_band": "7.5",
    "auth_provider": "email",
    "token_balance": 150,
    "is_admin": false,
    "created_at": "2026-06-18T10:00:00Z",
    "updated_at": "2026-06-18T10:10:00Z"
  },
  "message": "OK"
}
```

Frontend kutayotgan normalized model:

```ts
type UserProfile = {
  id: string;
  email: string;
  fullName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  avatar?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  phone?: string | null;
  phoneCountryCode?: string | null;
  country?: string | null;
  countryRegionOfResidence?: string | null;
  countryRegionCode?: string | null;
  targetBand?: string | null;
  authProvider?: string | null;
  tokenBalance: number;
  createdAt?: string | null;
  updatedAt?: string | null;
};
```

### PATCH `/users/me`

Request:

```json
{
  "full_name": "Ali Valiyev",
  "first_name": "Ali",
  "last_name": "Valiyev",
  "date_of_birth": "2000-01-15",
  "gender": "male",
  "phone": "+998901234567",
  "phone_country_code": "UZ",
  "country": "Uzbekistan",
  "country_region_of_residence": "Tashkent",
  "country_region_code": "UZ-TK",
  "target_band": 7.5
}
```

Response `GET /users/me` bilan bir xil.

### POST `/users/me/avatar`

Request: `multipart/form-data`

```txt
file=<image file>
```

Swagger bo‘yicha response `UserResponse`. Frontend avatar URL ni `data.avatar`, `data.avatar_url`, `data.url`, `data.path`, `data.user.avatar`, `data.profile.avatar` kabi joylardan qidiradi.

### DELETE `/users/me/avatar`

Avatarni o‘chiradi. Response `UserResponse`.

### DELETE `/users/me`

Accountni o‘chiradi.

## Sections

### GET `/sections`

Published practice sectionlar ro‘yxati.

Query:

```txt
section_type=listening|reading|writing|speaking
difficulty=easy|medium|hard
q=<title search>
page=1
size=20
```

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      "title": "Listening Practice Test 1",
      "section_type": "listening",
      "difficulty": "medium",
      "duration_minutes": 30,
      "question_count": 40
    }
  ],
  "pagination": {
    "page": 1,
    "size": 20,
    "total": 1,
    "pages": 1
  },
  "message": "OK"
}
```

Frontend list card uchun aynan shu maydonlarni kutadi:

```ts
type PublishedSectionDto = {
  id: string;
  title: string;
  section_type: SectionType;
  difficulty: string;
  duration_minutes: number;
  question_count: number;
};
```

### GET `/sections/{section_id}`

Published section detail. Swagger summary: "no correct answers", lekin frontend parserlari `correct_answer` bor bo‘lsa ham o‘qiy oladi. User test view uchun backend correct answer bermasligi kerak; result/review uchun submit/result endpointlaridan kelishi kerak.

Umumiy response:

```json
{
  "success": true,
  "data": {
    "id": "section-uuid",
    "title": "IELTS Listening Test 1",
    "section_type": "listening",
    "difficulty": "medium",
    "duration_minutes": 30,
    "instructions": "Answer all questions.",
    "audio_url": "/media/listening/test-1.mp3",
    "parts": [
      {
        "title": "Part 1",
        "instructions": "Questions 1-10",
        "audio_start_time": 0,
        "audio_end_time": 420,
        "passage_text": "Reading passage text",
        "duration_minutes": 10,
        "part_key": "part1",
        "questions": []
      }
    ]
  },
  "message": "OK"
}
```

Media URLlar absolute yoki relative bo‘lishi mumkin. Frontend relative URLni backend origin bilan to‘ldiradi.

### Listening section detail

Section:

```ts
type ListeningSectionDetail = {
  id: string;
  title: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  duration_minutes?: number;
  instructions?: string;
  audio_url?: string;
  parts: ListeningPart[];
};

type ListeningPart = {
  title?: string;
  instructions?: string;
  audio_start_time?: number;
  audio_end_time?: number;
  questions: ListeningQuestion[];
};
```

Question:

```ts
type ListeningQuestion = {
  id: string;
  order?: number;
  question_type: ListeningQuestionType;
  text?: string;
  image_url?: string;
  options?: Array<{ value: string; text: string; label?: string }>;
  correct_answer?: string | string[] | Record<string, string | string[]>;
  metadata?: Record<string, unknown>;
};
```

Listening uchun metadata namunalar:

```json
{
  "word_limit": 2,
  "notes_html": "<h3>Hotel booking</h3><p>Name: ___1___</p>",
  "table": {
    "headers": ["Name", "Value"],
    "rows": [["Address", "___1___"]]
  },
  "map_image_url": "/media/maps/map-1.png",
  "image_width": 1200,
  "image_height": 800,
  "labels_on_image": [
    { "number": 1, "x": 42, "y": 55 }
  ],
  "flow_steps": [
    { "text": "Arrive at ___1___" }
  ],
  "summary_text": "The speaker says ___1___ and ___2___.",
  "instruction": "Write no more than two words."
}
```

Blank marker formati: `___1___`, `___2___`. Parser yangi HTML formatdagi `<b>1</b> ______` ni ham `___1___` ga aylantiradi.

### Reading section detail

```ts
type ReadingSectionDetail = {
  id: string;
  title?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  duration_minutes?: number;
  instructions?: string;
  parts?: ReadingPart[];
};

type ReadingPart = {
  title?: string;
  instructions?: string;
  passage_text?: string;
  questions?: ReadingQuestion[];
};

type ReadingQuestion = {
  id: string;
  order?: number;
  question_type: ReadingQuestionType;
  text?: string;
  image_url?: string;
  points?: number;
  options?: Array<{ label?: string; value?: string; text?: string }>;
  correct_answer?: string | string[] | Record<string, string | string[]>;
  metadata?: Record<string, unknown>;
};
```

Reading metadata frontendda ishlatiladigan asosiy maydonlar:

```json
{
  "group_id": "passage1-tfng",
  "group_instruction": "Do the following statements agree with the information?",
  "instruction": "Choose the correct letter.",
  "items": [
    { "number": 1, "text": "Paragraph A", "prompt": "..." }
  ],
  "sub_questions": [
    { "number": 1, "text": "Question text ___1___" }
  ],
  "sentences": [
    { "number": 1, "text": "The answer is ___1___." }
  ],
  "blanks": [
    { "number": 1, "label": "Name", "suffix": "..." }
  ],
  "notes_html": "<p>Title ___1___</p>",
  "table": {
    "headers": ["Column A", "Column B"],
    "rows": [["A", "___1___"]]
  },
  "labels_on_image": [
    { "number": 1, "x": 20, "y": 35 }
  ],
  "summary_text": "The passage says ___1___.",
  "select_count": 2,
  "word_limit": 3
}
```

### Writing section detail

Frontend har part ichidagi birinchi questionni writing task deb oladi.

```json
{
  "success": true,
  "data": {
    "id": "section-uuid",
    "title": "Academic Writing",
    "difficulty": "medium",
    "duration_minutes": 60,
    "instructions": "You will have 1 hour to complete both tasks.",
    "parts": [
      {
        "title": "Task 1",
        "instructions": "You should spend about 20 minutes on this task.",
        "questions": [
          {
            "id": "question-uuid",
            "order": 1,
            "question_type": "graph_description",
            "text": "The chart below shows ...",
            "image_url": "/media/writing/chart.png",
            "metadata": {
              "word_limit_min": 150,
              "time_recommended_minutes": 20,
              "model_answer": "Sample answer..."
            }
          }
        ]
      },
      {
        "title": "Task 2",
        "questions": [
          {
            "id": "question-uuid-2",
            "order": 2,
            "question_type": "essay",
            "text": "Some people believe ...",
            "metadata": {
              "word_limit_min": 250,
              "time_recommended_minutes": 40
            }
          }
        ]
      }
    ]
  }
}
```

### Speaking section detail

Eslatma: frontend hozir `get-speaking-section-detail.ts` ichida backend o‘rniga local `local-ielts-test.json` ishlatyapti. Backendga ulanganda format quyidagicha bo‘lishi kerak.

```json
{
  "success": true,
  "data": {
    "id": "section-uuid",
    "title": "Speaking Practice",
    "difficulty": "medium",
    "duration_minutes": 14,
    "exam_type": "academic",
    "instructions": "The speaking test lasts 11-14 minutes.",
    "tags": ["ielts", "speaking"],
    "agent_config": {
      "ai_model": "gpt-4o-realtime-preview",
      "ai_voice": "alloy",
      "ai_role": "IELTS speaking examiner",
      "language": "en",
      "opening_script": "Good morning. My name is ...",
      "closing_script": "Thank you. This is the end of the test.",
      "system_prompt": "You are an IELTS examiner.",
      "vad_config": {
        "silence_threshold_ms": 1200,
        "min_speech_duration_ms": 300
      },
      "part_behaviors": {
        "part1": {
          "ai_behavior": "Ask short interview questions",
          "can_probe_deeper": true,
          "max_follow_ups_per_question": 1,
          "silence_before_warning_ms": 4000,
          "silence_before_advance_ms": 8000
        }
      }
    },
    "grading_config": {
      "method": "ielts_speaking_band",
      "transcript_source": "livekit_agent",
      "description": "IELTS speaking criteria",
      "criteria": [
        { "id": "fluency_coherence", "name": "Fluency and coherence" },
        { "id": "lexical_resource", "name": "Lexical resource" }
      ],
      "grading_prompt_template": "Grade this transcript..."
    },
    "parts": [
      {
        "part_key": "part1",
        "title": "Part 1",
        "instructions": "Answer naturally.",
        "duration_minutes": 5,
        "questions": [
          {
            "id": "question-uuid",
            "order": 1,
            "question_type": "speaking_short",
            "text": "Where do you live?",
            "points": 1,
            "metadata": {
              "topic": "Home",
              "ai_read_text": "Where do you live?",
              "suggested_time_seconds": 30,
              "speaking_min_seconds": 10,
              "speaking_max_seconds": 45,
              "group_id": "home",
              "group_label": "Home and accommodation"
            }
          }
        ]
      },
      {
        "part_key": "part2",
        "title": "Part 2",
        "questions": [
          {
            "id": "cue-card-question",
            "order": 1,
            "question_type": "speaking_cue_card",
            "text": "Describe a book you enjoyed reading.",
            "metadata": {
              "preparation_seconds": 60,
              "speaking_min_seconds": 60,
              "speaking_max_seconds": 120,
              "bullet_points": [
                "what the book was",
                "when you read it",
                "why you enjoyed it"
              ],
              "cue_card_display": {
                "title": "Describe a book you enjoyed reading",
                "points": ["what it was", "when you read it", "why you enjoyed it"]
              },
              "rounding_off_questions": ["Do you often read books?"]
            }
          }
        ]
      }
    ]
  }
}
```

## Practice Attempt Flow

### POST `/sections/{section_id}/start`

Request body yo‘q.

Response:

```json
{
  "success": true,
  "data": {
    "attempt_id": "attempt-uuid"
  },
  "message": "OK"
}
```

Frontend `data.attempt_id`, `data.attemptId`, `root.attempt_id`, `root.attemptId` variantlarini qabul qiladi.

### POST `/sections/{section_id}/submit`

Request:

```json
{
  "attempt_id": "attempt-uuid",
  "answers": [
    {
      "question_id": "question-uuid",
      "answer": "A"
    },
    {
      "question_id": "group-question-uuid",
      "answer": {
        "1": "hotel",
        "2": "station"
      }
    },
    {
      "question_id": "multi-choice-question-uuid",
      "answer": ["A", "C"]
    }
  ]
}
```

Swagger schema:

```ts
type SectionSubmitRequest = {
  attempt_id: string;
  answers: Array<{
    question_id: string;
    answer: unknown;
  }>;
};
```

Listening/reading frontend bitta backend question ichidagi blanklarni `answer` obyektida question number bo‘yicha yuboradi. Multiple choice bir nechta javob bo‘lsa array yoki comma string bo‘lishi mumkin, lekin backend uchun array aniqroq.

Writing submit:

```json
{
  "attempt_id": "attempt-uuid",
  "answers": [
    {
      "question_id": "writing-task-1-question-id",
      "answer": "The chart illustrates ..."
    },
    {
      "question_id": "writing-task-2-question-id",
      "answer": "Some people believe ..."
    }
  ]
}
```

### GET `/sections/{section_id}/result/{attempt_id}`

Frontend bir nechta result formatni qabul qiladi. Tavsiya qilingan format:

```json
{
  "success": true,
  "data": {
    "attempt_id": "attempt-uuid",
    "score": 32,
    "total": 40,
    "overall_band": 7.5,
    "time_spent_seconds": 1800,
    "question_results": [
      {
        "question_id": "question-uuid",
        "user_answer": "A",
        "correct_answer": "A",
        "is_correct": true,
        "score": 1,
        "explanation": "A is correct because ..."
      },
      {
        "question_id": "group-question-uuid",
        "user_answer": {
          "1": "hotel",
          "2": "station"
        },
        "correct_answer": {
          "1": "hotel",
          "2": ["station", "train station"]
        },
        "is_correct": false,
        "score": 1
      }
    ]
  },
  "message": "OK"
}
```

Frontend result collectionlarni `data.answers`, `data.results`, `data.question_results`, `data.questions` yoki `data.parts[].question_results` ichidan qidiradi.

## Speaking Live Session

### POST `/speaking/start-session`

Request:

```json
{
  "section_id": "section-uuid"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "attempt_id": "attempt-uuid",
    "room_name": "mock4ielts-speaking-attempt-uuid",
    "token": "livekit-jwt",
    "url": "wss://livekit.example.com",
    "participant_name": "user-a1b2",
    "dispatch_id": "dispatch-id"
  },
  "message": "OK"
}
```

Frontend `room_name`, `token`, `url` ni majburiy kutadi. Agar backend `url` sifatida internal host (`livekit`, `localhost`, `127.0.0.1`) qaytarsa va `NEXT_PUBLIC_LIVEKIT_URL` mavjud bo‘lsa, frontend public env URLni ishlatadi.

### POST `/speaking/attempts/{attempt_id}/grade`

Bu LiveKit agent yoki server-side integratsiya uchun. Header:

```http
X-API-Key: <agent-api-key>
```

Request:

```json
{
  "section_id": "section-uuid",
  "transcript": "Examiner: ... Candidate: ...",
  "questions_list": "Part 1: ... Part 2: ...",
  "criteria": {
    "fluency_coherence": 7,
    "lexical_resource": 7,
    "grammatical_range": 6.5,
    "pronunciation": 7
  },
  "general_feedback": "Good fluency, improve grammar accuracy.",
  "improvement_tips": ["Use more complex sentences", "Avoid repeated words"]
}
```

Response:

```json
{
  "success": true,
  "data": {
    "attempt_id": "attempt-uuid",
    "speaking_band": 7,
    "criteria": {},
    "feedback": {}
  },
  "message": "OK"
}
```

## Mock Exams

### GET `/mock-exams`

Query:

```txt
q=<title search>
page=1
size=20
```

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "exam-uuid",
      "title": "IELTS Mock Exam 1",
      "description": "Full IELTS simulation",
      "exam_type": "academic",
      "duration_minutes": 165,
      "token_cost": 10,
      "attempt_count": 12600,
      "section_count": 4,
      "sections": [
        {
          "section_id": "listening-section-uuid",
          "section_type": "listening",
          "title": "Listening",
          "order": 1
        },
        {
          "section_id": "reading-section-uuid",
          "section_type": "reading",
          "title": "Reading",
          "order": 2
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "size": 20,
    "total": 1,
    "pages": 1
  }
}
```

Frontend `sections` ni array sifatida yoki obyekt sifatida ham qabul qiladi:

```json
{
  "sections": {
    "listening": "listening-section-uuid",
    "reading": "reading-section-uuid",
    "writing": "writing-section-uuid",
    "speaking": "speaking-section-uuid"
  }
}
```

Array format tavsiya qilinadi, chunki title/order ham aniq bo‘ladi.

### GET `/mock-exams/{exam_id}`

Response bitta exam obyekt, `GET /mock-exams` item formatiga o‘xshaydi. `sections` majburiy, aks holda frontend "Mock exam detail did not include section ids." error beradi.

### POST `/mock-exams/{exam_id}/start`

Response:

```json
{
  "success": true,
  "data": {
    "attempt_id": "attempt-uuid"
  }
}
```

### POST `/mock-exams/{exam_id}/submit-section`

Request:

```json
{
  "attempt_id": "attempt-uuid",
  "section_id": "section-uuid",
  "answers": [
    {
      "question_id": "question-uuid",
      "answer": "A"
    }
  ]
}
```

### POST `/mock-exams/{exam_id}/finish`

Query:

```txt
attempt_id=attempt-uuid
```

Response:

```json
{
  "success": true,
  "data": {
    "attempt_id": "attempt-uuid",
    "finished": true
  }
}
```

### GET `/mock-exams/{exam_id}/result/{attempt_id}`

Response:

```json
{
  "success": true,
  "data": {
    "attempt_id": "attempt-uuid",
    "finished": true,
    "finished_at": "2026-06-18T10:30:00Z",
    "overall_band": 7,
    "score": 120,
    "total_score": 160,
    "time_spent_seconds": 9900
  }
}
```

Frontend `overall_band`, `band_score`, `band`, `overallBand`, `bandScore` variantlarini qabul qiladi.

## Favorites

### GET `/favorites`

Query:

```txt
page=1
size=100
```

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "favorite-uuid",
      "created_at": "2025-01-15T10:30:00Z",
      "section_id": "section-uuid"
    }
  ],
  "pagination": {
    "page": 1,
    "size": 100,
    "total": 1,
    "pages": 1
  }
}
```

Frontend fallback sifatida `question_id` ni ham `sectionId` deb qabul qiladi, lekin backend `section_id` qaytargani to‘g‘ri.

### POST `/favorites/{section_id}`

Toggle qiladi.

Response:

```json
{
  "success": true,
  "data": {
    "added": true,
    "message": "Added to favorites"
  }
}
```

### GET `/favorites/{section_id}/status`

Response:

```json
{
  "success": true,
  "data": {
    "is_favorited": true
  }
}
```

## Statistics

### GET `/statistics/me`

Response:

```json
{
  "success": true,
  "data": {
    "total_solved": 42,
    "listening_avg": "7.0",
    "reading_avg": "7.5",
    "writing_avg": "6.5",
    "speaking_avg": "7.0",
    "overall_avg": "7.0",
    "total_active_time_seconds": 36000,
    "updated_at": "2026-06-18T10:00:00Z"
  }
}
```

Frontend qo‘shimcha fallbacklarni ham o‘qiydi: `accuracy_percentage`, `accuracy_percent`, `overall_accuracy`, `correct_answers`, `total_correct`, `questions_attempted`, `total_practice_sessions`.

### GET `/statistics/me/sections`

Response:

```json
{
  "success": true,
  "data": [
    {
      "section": "listening",
      "solved_count": 12,
      "average_band": "7.0",
      "last_practiced_at": "2026-06-18T10:00:00Z"
    }
  ]
}
```

### GET `/statistics/me/exams`

Response:

```json
{
  "success": true,
  "data": {
    "total_mocks_taken": 3,
    "contests_participated": 1,
    "highest_overall_band": "7.5",
    "average_overall_band": "7.0",
    "updated_at": "2026-06-18T10:00:00Z"
  }
}
```

### GET `/statistics/global`

Response:

```json
{
  "success": true,
  "data": [
    {
      "section": "listening",
      "total_questions": 1200
    }
  ]
}
```

### Qo‘shimcha statistics endpointlar

Swaggerda quyidagilar ham bor, frontendda hozir ishlatilmayapti:

```txt
GET /statistics/me/sections/{section_type}
GET /statistics/me/mock-exams
GET /statistics/me/contests
GET /statistics/me/overview
```

## Tokens

Frontendda hozir ulanmagan, lekin Swaggerda bor.

### GET `/tokens/balance`

Response:

```json
{
  "success": true,
  "data": {
    "balance": 150
  }
}
```

### GET `/tokens/history`

Query: `page`, `size`.

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "transaction-uuid",
      "created_at": "2025-01-15T10:30:00Z",
      "user_id": "user-uuid",
      "amount": 50,
      "type": "purchased",
      "description": "Token purchase"
    }
  ],
  "pagination": {
    "page": 1,
    "size": 20,
    "total": 1,
    "pages": 1
  }
}
```

### POST `/tokens/purchase`

Swaggerda `PurchaseTokensRequest` bor. Request maydonlarini backend schema bo‘yicha tekshirish kerak, chunki frontendda hozir ishlatilmagan.

## Evaluations

Swaggerda bor, frontendda hozir ulanmagan.

```txt
GET /evaluations/writing/{answer_id}
GET /evaluations/speaking/{answer_id}
```

Writing evaluation response:

```json
{
  "success": true,
  "data": {
    "id": "evaluation-uuid",
    "created_at": "2026-06-18T10:00:00Z",
    "answer_id": "answer-uuid",
    "task_response": "7.0",
    "coherence": "7.0",
    "vocabulary": "7.0",
    "grammar": "6.5",
    "overall_band": "7.0",
    "ai_feedback": "Good structure, improve grammar accuracy."
  }
}
```

## Files

### POST `/files/upload`

Swagger summary: upload audio file.

Request: `multipart/form-data`.

Response:

```json
{
  "success": true,
  "data": {
    "url": "http://minio:9000/mock4ielts/user-id/file-id.mp3",
    "content_type": "audio/mpeg",
    "size": 1048576
  }
}
```

## Contests

Swaggerda public contest flow bor, frontendda hozir ko‘proq static contest data ishlatilgan.

Public endpoints:

```txt
GET  /contests
GET  /contests/{contest_id}
GET  /contests/{contest_id}/stream
POST /contests/{contest_id}/register
POST /contests/{contest_id}/start
POST /contests/{contest_id}/submit-section
POST /contests/{contest_id}/finish
GET  /contests/{contest_id}/leaderboard
GET  /contests/{contest_id}/my-result
```

`GET /contests` query:

```txt
status=scheduled|live|grading|finished
q=<title search>
page=1
size=20
```

Contest create/update admin schema asosida public contest modelida quyidagi maydonlar kutiladi:

```json
{
  "id": "contest-uuid",
  "title": "IELTS Contest",
  "description": "Weekly IELTS challenge",
  "exam_type": "academic",
  "status": "scheduled",
  "scheduled_at": "2026-06-20T09:00:00Z",
  "duration_minutes": 170,
  "registration_deadline": "2026-06-19T18:00:00Z",
  "max_participants": 1000,
  "sections": {
    "listening": "section-uuid",
    "reading": "section-uuid",
    "writing": "section-uuid",
    "speaking": "section-uuid"
  }
}
```

Submit section payload mock exam bilan bir xil bo‘lishi kerak:

```json
{
  "attempt_id": "attempt-uuid",
  "section_id": "section-uuid",
  "answers": [
    {
      "question_id": "question-uuid",
      "answer": "A"
    }
  ]
}
```

SSE endpoint (`/contests/{contest_id}/stream`) browserda EventSource bilan ishlatilishi kerak. Event payload formatini backend bilan alohida kelishish kerak.

## Me Attempts va Notifications

Swaggerda bor, frontendda hozir ishlatilmagan.

```txt
POST   /me/attempts
POST   /me/attempts/{attempt_id}/resume
POST   /me/attempts/{attempt_id}/submit
PATCH  /me/attempts/{attempt_id}/answer
GET    /me/attempts/{attempt_id}
POST   /me/devices
DELETE /me/devices/{device_id}
GET    /me/notifications
PATCH  /me/notifications/{notif_id}/read
PATCH  /me/notifications/mark-all-read
```

`POST /me/attempts` request:

```json
{
  "section_id": "section-uuid",
  "exam_id": null
}
```

Attempt response schema:

```json
{
  "attempt_id": "attempt-uuid",
  "mode": "practice",
  "status": "in_progress",
  "started_at": "2026-06-18T10:00:00Z",
  "last_activity_at": "2026-06-18T10:05:00Z",
  "section_id": "section-uuid",
  "exam_id": null,
  "duration_seconds": 300,
  "resume_url": "/practice/listening/section-uuid?attemptId=attempt-uuid"
}
```

## Admin Endpointlar

Swaggerda admin API ham bor. Frontend user app hozir bularni ishlatmaydi, lekin backendda mavjud.

Auth:

```txt
POST /admin/auth/login
POST /admin/auth/refresh
```

Sections CRUD:

```txt
POST   /admin/sections
GET    /admin/sections
GET    /admin/sections/{section_id}
PATCH  /admin/sections/{section_id}
DELETE /admin/sections/{section_id}
POST   /admin/sections/{section_id}/publish
POST   /admin/sections/{section_id}/duplicate
POST   /admin/sections/{section_id}/parts
PATCH  /admin/sections/{section_id}/parts/{part_id}
DELETE /admin/sections/{section_id}/parts/{part_id}
POST   /admin/sections/parts/{part_id}/questions
POST   /admin/sections/parts/{part_id}/questions/bulk
PATCH  /admin/sections/parts/{part_id}/questions/{question_id}
DELETE /admin/sections/parts/{part_id}/questions/{question_id}
PUT    /admin/sections/parts/{part_id}/questions/reorder
```

Mock exams:

```txt
POST   /admin/mock-exams
GET    /admin/mock-exams
GET    /admin/mock-exams/{exam_id}
PATCH  /admin/mock-exams/{exam_id}
DELETE /admin/mock-exams/{exam_id}
POST   /admin/mock-exams/{exam_id}/publish
```

Contests:

```txt
POST   /admin/contests
GET    /admin/contests
GET    /admin/contests/{contest_id}
PATCH  /admin/contests/{contest_id}
DELETE /admin/contests/{contest_id}
POST   /admin/contests/{contest_id}/publish
POST   /admin/contests/{contest_id}/start
POST   /admin/contests/{contest_id}/end
POST   /admin/contests/{contest_id}/finalize
```

Users/grading/media:

```txt
GET    /admin/users
GET    /admin/users/{user_id}
PATCH  /admin/users/{user_id}
POST   /admin/attempts/{attempt_id}/grade-writing
POST   /admin/attempts/{attempt_id}/grade-speaking
POST   /admin/media/upload
POST   /admin/media/upload-multiple
GET    /admin/media
DELETE /admin/media/{media_id}
```

Admin media response:

```json
{
  "id": "media-uuid",
  "url": "/media/file.mp3",
  "content_type": "audio/mpeg",
  "size": 1048576,
  "filename": "file.mp3",
  "media_type": "audio",
  "category": "listening",
  "description": "Listening audio",
  "width": null,
  "height": null,
  "created_at": "2026-06-18T10:00:00Z"
}
```

## Health

```txt
GET /health
GET /health/ready
```

Bu endpointlar auth talab qilmasligi kerak.

## Frontend Uchun Muhim Kelishuvlar

1. Backend field naming uchun asosiy format `snake_case`. Frontend ayrim joylarda camelCase fallbackni qabul qiladi, lekin backenddan `snake_case` yuborish kerak.
2. List endpointlarda `data` array, `pagination` esa rootda bo‘lishi kerak.
3. `section_id`, `attempt_id`, `exam_id`, `question_id` UUID string bo‘lishi kerak.
4. Practice start response ichida `attempt_id` majburiy.
5. Speaking live session response ichida `room_name`, `token`, `url` majburiy.
6. Mock exam detail response ichida `sections` majburiy. Har section uchun id va type aniq bo‘lishi kerak.
7. Listening/reading blank savollarda markerlar `___1___` formatida bo‘lsa frontend eng yaxshi ishlaydi.
8. Result endpointda `question_results` ichida `question_id`, `user_answer`, `correct_answer`, `is_correct`, `score` qaytishi review UI uchun eng qulay format.
9. Swaggerda section/mock-exam response schema ayrim joylarda `{}` bo‘lib ochiq ko‘rsatilgan. Shu sabab frontend adapterlaridagi real kutilayotgan maydonlar bu hujjatda alohida yozildi.
10. `GET /sections/{section_id}` public test olishda correct answer bermasligi kerak. Correct answer faqat submit/result/review jarayonida qaytishi kerak.
