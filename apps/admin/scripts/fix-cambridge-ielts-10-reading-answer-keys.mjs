const API_BASE = 'https://mockapi.mock4ielts.uz/api/v1';
const EMAIL = process.env.MOCK4IELTS_ADMIN_EMAIL;
const PASSWORD = process.env.MOCK4IELTS_ADMIN_PASSWORD;

const READING_SECTIONS = {
  2: 'a1ce8c24-ca57-4b6a-8b29-cf2bac31d2f7',
  3: '9641ef4c-7ca4-4ed3-a57a-89df758cc450',
  4: '8f305663-938c-419b-8eb4-f855170170f4',
};

const grouped = (entries) =>
  Object.fromEntries(entries.map(([key, value]) => [String(key), Array.isArray(value) ? value : [value]]));

const ANSWER_KEYS = {
  2: {
    1: grouped([
      [1, 'iv'],
      [2, 'viii'],
      [3, 'vii'],
      [4, 'i'],
      [5, 'vi'],
      [6, 'ix'],
      [7, 'ii'],
    ]),
    8: 'NOT GIVEN',
    9: 'TRUE',
    10: 'FALSE',
    11: 'FALSE',
    12: 'NOT GIVEN',
    13: 'TRUE',
    14: grouped([
      [14, 'A'],
      [15, 'D'],
      [16, 'F'],
      [17, 'D'],
    ]),
    18: grouped([
      [18, 'B'],
      [19, 'D'],
      [20, 'E'],
      [21, 'A'],
      [22, 'C'],
    ]),
    23: grouped([
      [23, ['books and activities', 'books activities']],
      [24, ['internal regulation', 'self-regulation']],
      [25, 'emotional awareness'],
      [26, 'spoon-feeding'],
    ]),
    27: grouped([
      [27, 'B'],
      [28, 'H'],
      [29, 'L'],
      [30, 'G'],
      [31, 'D'],
    ]),
    32: 'C',
    33: 'D',
    34: 'A',
    35: 'D',
    36: 'NOT GIVEN',
    37: 'NO',
    38: 'YES',
    39: 'NOT GIVEN',
    40: 'NO',
  },
  3: {
    1: grouped([
      [1, 'ii'],
      [2, 'i'],
      [3, 'v'],
      [4, 'vii'],
    ]),
    5: 'TRUE',
    6: 'NOT GIVEN',
    7: 'NOT GIVEN',
    8: 'TRUE',
    9: 'NOT GIVEN',
    10: 'FALSE',
    11: grouped([
      [11, ['source of income', 'industry']],
      [12, 'employer'],
      [13, 'domestic tourism'],
    ]),
    14: grouped([
      [14, 'C'],
      [15, 'B'],
      [16, 'H'],
      [17, 'B'],
      [18, 'E'],
    ]),
    19: grouped([
      [19, ['sunlight', 'sun']],
      [20, 'upper'],
      [21, 'dry'],
      [22, 'north'],
    ]),
    23: 'FALSE',
    24: 'TRUE',
    25: 'NOT GIVEN',
    26: 'B',
    27: grouped([
      [27, 'B'],
      [28, 'F'],
      [29, 'I'],
      [30, 'G'],
      [31, 'D'],
    ]),
    32: 'C',
    33: 'A',
    34: 'D',
    35: 'C',
    36: 'NO',
    37: 'YES',
    38: 'NOT GIVEN',
    39: 'YES',
    40: 'NOT GIVEN',
  },
  4: {
    1: grouped([
      [1, 'spread'],
      [2, ['10 times', 'ten times']],
      [3, 'below'],
      [4, 'fuel'],
      [5, 'seasons'],
      [6, ['homes', 'housing']],
    ]),
    7: 'TRUE',
    8: 'FALSE',
    9: 'TRUE',
    10: 'TRUE',
    11: 'NOT GIVEN',
    12: 'FALSE',
    13: 'FALSE',
    14: grouped([
      [14, ['transformation', 'change']],
      [15, 'young age'],
      [16, 'optimism'],
      [17, ['skills', 'techniques']],
      [18, ['negative emotions', 'negative feelings']],
    ]),
    19: grouped([
      [19, 'E'],
      [20, 'C'],
      [21, 'G'],
      [22, 'A'],
    ]),
    23: grouped([
      [23, 'E'],
      [24, 'C'],
      [25, 'G'],
      [26, 'H'],
    ]),
    27: 'C',
    28: 'D',
    29: 'C',
    30: 'B',
    31: 'A',
    32: grouped([
      [32, 'F'],
      [33, 'G'],
      [34, 'A'],
      [35, 'B'],
      [36, 'D'],
    ]),
    37: 'NOT GIVEN',
    38: 'YES',
    39: 'NO',
    40: 'YES',
  },
};

if (!EMAIL || !PASSWORD) {
  throw new Error('Set MOCK4IELTS_ADMIN_EMAIL and MOCK4IELTS_ADMIN_PASSWORD.');
}

async function api(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(`${options.method || 'GET'} ${path} ${response.status}: ${JSON.stringify(body)}`);
  }
  return body;
}

function isEmptyAnswer(answer) {
  if (answer == null || answer === '') return true;
  if (Array.isArray(answer)) return answer.length === 0 || answer.every(isEmptyAnswer);
  if (typeof answer === 'object') {
    return Object.values(answer).some(isEmptyAnswer);
  }
  return false;
}

function normalizeAnswer(answer) {
  if (typeof answer === 'string') return answer.trim();
  if (Array.isArray(answer)) return answer.map((item) => String(item).trim()).filter(Boolean);
  if (answer && typeof answer === 'object') {
    return Object.fromEntries(
      Object.entries(answer).map(([key, value]) => [
        key,
        Array.isArray(value) ? value.map((item) => String(item).trim()).filter(Boolean) : [String(value).trim()],
      ])
    );
  }
  return answer;
}

async function main() {
  const login = await api('/admin/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const headers = { Authorization: `Bearer ${login.data.access_token}` };
  const report = [];

  for (const [test, sectionId] of Object.entries(READING_SECTIONS)) {
    const section = await api(`/admin/sections/${sectionId}`, { headers });
    const key = ANSWER_KEYS[test];

    for (const part of section.data.parts) {
      for (const question of part.questions) {
        const expected = key[question.order];
        if (expected === undefined) {
          throw new Error(`Missing answer key for Test ${test} question order ${question.order}.`);
        }

        const payload = {
          question_type: question.question_type,
          text: question.text,
          options: question.options,
          correct_answer: normalizeAnswer(expected),
          explanation: question.explanation,
          points: question.points,
          order: question.order,
          metadata: question.metadata,
          image_url: question.image_url,
        };

        const updated = await api(`/admin/sections/parts/${part.id}/questions/${question.id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify(payload),
        });

        report.push({
          test: Number(test),
          part: part.order + 1,
          order: question.order,
          type: question.question_type,
          answer: updated.data.correct_answer,
        });
      }
    }
  }

  const failures = report.filter((item) => isEmptyAnswer(item.answer));
  console.log(JSON.stringify({ updated: report.length, failures, sample: report.slice(0, 8) }, null, 2));
  if (failures.length) {
    throw new Error(`Answer key audit failed: ${JSON.stringify(failures)}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
