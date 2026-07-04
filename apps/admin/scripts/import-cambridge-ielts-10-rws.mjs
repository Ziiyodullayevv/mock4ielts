import fs from 'node:fs';

const API_BASE = 'https://mockapi.mock4ielts.uz/api/v1';
const EMAIL = process.env.MOCK4IELTS_ADMIN_EMAIL;
const PASSWORD = process.env.MOCK4IELTS_ADMIN_PASSWORD;
const OCR_FILES = [
  '/tmp/cambridge10_ocr_014_019.txt',
  '/tmp/cambridge10_ocr_020_080.txt',
  '/tmp/cambridge10_ocr_081_120.txt',
  '/tmp/cambridge10_ocr_100_125.txt',
];

if (!EMAIL || !PASSWORD) throw new Error('Set MOCK4IELTS_ADMIN_EMAIL and MOCK4IELTS_ADMIN_PASSWORD.');

const pageCache = new Map();

function loadOcrPages() {
  for (const file of OCR_FILES) {
    if (!fs.existsSync(file)) continue;
    const text = fs.readFileSync(file, 'utf8');
    const chunks = text.split(/\n--- p(\d{3})\.png ---\n/g);
    for (let index = 1; index < chunks.length; index += 2) {
      pageCache.set(Number(chunks[index]), cleanOcrText(chunks[index + 1] || ''));
    }
  }
}

function cleanOcrText(value) {
  return value
    .replace(/AFARINESH IELTS House\s*\|?\s*www\.[^\n]+/gi, '')
    .replace(/AFARINESH\s+IELTS\s+House/gi, '')
    .replace(/www\.IELTS-House\.com/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function pages(...numbers) {
  return numbers
    .map((number) => pageCache.get(number))
    .filter(Boolean)
    .join('\n\n');
}

function questionList(start, end, sourceText) {
  const lines = sourceText.split('\n').map((line) => line.trim()).filter(Boolean);
  const items = [];
  for (let number = start; number <= end; number += 1) {
    const exact = lines.find((line) => line.match(new RegExp(`^${number}\\b`)));
    items.push({
      order: number,
      text: exact?.replace(new RegExp(`^${number}\\s*`), '').trim() || `Question ${number}`,
    });
  }
  return items;
}

const emptyAnswers = (start, end) =>
  Object.fromEntries(Array.from({ length: end - start + 1 }, (_, index) => [String(start + index), ['']]));

function shortAnswerQuestion({ order, text, start, end, source, instruction }) {
  return {
    question_type: 'short_answer',
    text,
    options: null,
    correct_answer: emptyAnswers(start, end),
    explanation: null,
    points: end - start + 1,
    order,
    metadata: {
      instruction,
      questions_list: questionList(start, end, source),
      word_limit: 3,
    },
    image_url: null,
  };
}

function readingSection(test, partDefs) {
  return {
    section_type: 'reading',
    exam_type: 'academic',
    title: `Cambridge IELTS 10 Test ${test} - Reading`,
    instructions: `Cambridge IELTS 10 Test ${test} Academic Reading.`,
    duration_minutes: 60,
    difficulty: 'medium',
    tags: ['cambridge-ielts-10', `test-${test}`, 'reading', 'ocr-structured'],
    parts: partDefs.map((part, index) => ({
      title: `Reading Passage ${index + 1}`,
      passage_text: part.passage,
      passage_source: 'Cambridge IELTS 10',
      instructions: `Questions ${part.start}-${part.end}`,
      order: index,
      questions: [
        shortAnswerQuestion({
          order: part.start,
          text: `Questions ${part.start}-${part.end}`,
          start: part.start,
          end: part.end,
          source: part.questions,
          instruction: part.instruction,
        }),
      ],
    })),
  };
}

function writingQuestion({ type, text, order, instructionHtml, visualType, taskType, minWords, minutes }) {
  return {
    question_type: type,
    text,
    options: null,
    correct_answer: null,
    explanation: null,
    points: 1,
    order,
    metadata: {
      instruction_html: instructionHtml,
      min_words: minWords,
      recommended_minutes: minutes,
      task_type: taskType,
      ...(visualType ? { visual_type: visualType } : {}),
    },
    image_url: null,
  };
}

function writingSection(test, task1, task2) {
  return {
    section_type: 'writing',
    exam_type: 'academic',
    title: `Cambridge IELTS 10 Test ${test} - Writing`,
    instructions: `Cambridge IELTS 10 Test ${test} Academic Writing.`,
    duration_minutes: 60,
    difficulty: 'medium',
    tags: ['cambridge-ielts-10', `test-${test}`, 'writing', 'fixed-format'],
    parts: [
      {
        title: 'Writing Task 1',
        instructions: 'You should spend about 20 minutes on this task. Write at least 150 words.',
        order: 0,
        questions: [writingQuestion({ ...task1, order: 1, type: 'graph_description', taskType: 'task_1_academic', minWords: 150, minutes: 20 })],
      },
      {
        title: 'Writing Task 2',
        instructions: 'You should spend about 40 minutes on this task. Write at least 250 words.',
        order: 1,
        questions: [writingQuestion({ ...task2, order: 2, type: 'essay', taskType: 'task_2', minWords: 250, minutes: 40 })],
      },
    ],
  };
}

function speakingQuestion({ type, text, order, metadata }) {
  return {
    question_type: type,
    text,
    options: null,
    correct_answer: null,
    explanation: null,
    points: 1,
    order,
    metadata,
    image_url: null,
  };
}

function speakingSection(test, data) {
  return {
    section_type: 'speaking',
    exam_type: 'academic',
    title: `Cambridge IELTS 10 Test ${test} - Speaking`,
    instructions: `Cambridge IELTS 10 Test ${test} Speaking.`,
    duration_minutes: 15,
    difficulty: 'medium',
    tags: ['cambridge-ielts-10', `test-${test}`, 'speaking', 'fixed-format'],
    parts: [
      {
        title: 'Part 1: Introduction',
        instructions: 'Answer familiar questions naturally.',
        order: 0,
        questions: [
          speakingQuestion({
            type: 'speaking_short',
            text: `${data.part1Topic}: ${data.part1.join(' ')}`,
            order: 1,
            metadata: {
              topic: data.part1Topic,
              suggested_time_seconds: 90,
              follow_ups: data.part1.map((text) => ({ text })),
            },
          })
        ],
      },
      {
        title: 'Part 2: Cue Card',
        instructions: 'You have one minute to prepare and one to two minutes to speak.',
        order: 1,
        questions: [
          speakingQuestion({
            type: 'speaking_cue_card',
            text: data.cueTitle,
            order: 1,
            metadata: {
              preparation_seconds: 60,
              speaking_min_seconds: 60,
              speaking_max_seconds: 120,
              bullet_points: data.cuePoints.map((text) => ({ text })),
              cue_card_display: { title: data.cueTitle, points: data.cuePoints },
            },
          }),
        ],
      },
      {
        title: 'Part 3: Discussion',
        instructions: 'Discuss more abstract questions connected to Part 2.',
        order: 2,
        questions: [
          speakingQuestion({
            type: 'speaking_discussion',
            text: `${data.part3Topic}: ${data.part3.join(' ')}`,
            order: 1,
            metadata: {
              topic: data.part3Topic,
              suggested_time_seconds: 240,
              depth: 'extended',
              follow_ups: data.part3.map((text) => ({ text })),
            },
          })
        ],
      },
    ],
  };
}

function htmlParagraphs(text) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<p>${line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`)
    .join('');
}

loadOcrPages();
if (!pageCache.size) throw new Error('OCR cache is missing. Run the OCR extraction before importing.');

const readingSections = [
  readingSection(1, [
    { start: 1, end: 13, passage: pages(18, 19), questions: pages(20, 21), instruction: 'Answer Questions 1-13 from Reading Passage 1.' },
    { start: 14, end: 26, passage: pages(23, 24), questions: pages(22, 25), instruction: 'Answer Questions 14-26 from Reading Passage 2.' },
    { start: 27, end: 40, passage: pages(26, 27), questions: pages(28, 29, 30), instruction: 'Answer Questions 27-40 from Reading Passage 3.' },
  ]),
  readingSection(2, [
    { start: 1, end: 13, passage: pages(43, 44), questions: pages(42, 45), instruction: 'Answer Questions 1-13 from Reading Passage 1.' },
    { start: 14, end: 26, passage: pages(46, 47, 48, 49), questions: pages(46, 50), instruction: 'Answer Questions 14-26 from Reading Passage 2.' },
    { start: 27, end: 40, passage: pages(51, 52, 53), questions: pages(54), instruction: 'Answer Questions 27-40 from Reading Passage 3.' },
  ]),
  readingSection(3, [
    { start: 1, end: 13, passage: pages(66, 67), questions: pages(65, 68), instruction: 'Answer Questions 1-13 from Reading Passage 1.' },
    { start: 14, end: 26, passage: pages(69, 70, 71), questions: pages(72), instruction: 'Answer Questions 14-26 from Reading Passage 2.' },
    { start: 27, end: 40, passage: pages(73, 74, 75), questions: pages(76), instruction: 'Answer Questions 27-40 from Reading Passage 3.' },
  ]),
  readingSection(4, [
    { start: 1, end: 13, passage: pages(89, 90), questions: pages(91, 92), instruction: 'Answer Questions 1-13 from Reading Passage 1.' },
    { start: 14, end: 26, passage: pages(93, 94, 95, 96), questions: pages(97), instruction: 'Answer Questions 14-26 from Reading Passage 2.' },
    { start: 27, end: 40, passage: pages(98, 99), questions: pages(100, 101), instruction: 'Answer Questions 27-40 from Reading Passage 3.' },
  ]),
];

const writingSections = [
  writingSection(1, {
    text: 'Australian household energy use and greenhouse gas emissions',
    visualType: 'pie_charts',
    instructionHtml: htmlParagraphs('The first chart below shows how energy is used in an average Australian household. The second chart shows the greenhouse gas emissions which result from this energy use.\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.'),
  }, {
    text: 'Children, right and wrong, and punishment',
    instructionHtml: htmlParagraphs('It is important for children to learn the difference between right and wrong at an early age. Punishment is necessary to help them learn this distinction.\nTo what extent do you agree or disagree with this opinion?\nWhat sort of punishment should parents and teachers be allowed to use to teach good behaviour to children?'),
  }),
  writingSection(2, {
    text: 'Fairtrade-labelled coffee and bananas sales',
    visualType: 'tables',
    instructionHtml: htmlParagraphs('The tables below give information about sales of Fairtrade-labelled coffee and bananas in 1999 and 2004 in five European countries.\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.'),
  }, {
    text: 'University subjects and future usefulness',
    instructionHtml: htmlParagraphs('Some people think that all university students should study whatever they like. Others believe that they should only be allowed to study subjects that will be useful in the future, such as those related to science and technology.\nDiscuss both these views and give your own opinion.'),
  }),
  writingSection(3, {
    text: 'UK graduate and postgraduate destinations in 2008',
    visualType: 'bar_charts',
    instructionHtml: htmlParagraphs('The charts below show what UK graduate and postgraduate students who did not go into full-time work did after leaving college in 2008.\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.'),
  }, {
    text: 'Countries becoming more similar',
    instructionHtml: htmlParagraphs('Countries are becoming more and more similar because people are able to buy the same products anywhere in the world.\nDo you think this is a positive or negative development?'),
  }),
  writingSection(4, {
    text: 'Life cycle of salmon',
    visualType: 'process_diagram',
    instructionHtml: htmlParagraphs('The diagrams below show the life cycle of a species of large fish called the salmon.\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.'),
  }, {
    text: 'Museum admission charges',
    instructionHtml: htmlParagraphs('Many museums charge for admission while others are free.\nDo you think the advantages of charging people for admission to museums outweigh the disadvantages?'),
  }),
];

const speakingSections = [
  speakingSection(1, {
    part1Topic: 'Weekends',
    part1: ['How do you usually spend your weekends?', 'Which is your favourite part of the weekend?', 'Do you think your weekends are long enough?', 'How important do you think it is to have free time at the weekends?'],
    cueTitle: 'Describe someone you know who does something well.',
    cuePoints: ['who this person is', 'how you know this person', 'what they do well', 'why you think this person is so good at doing this'],
    part3Topic: 'Skills and abilities',
    part3: ['What skills and abilities do people most want to have today?', 'Which skills should children learn at school?', 'Which skills do you think will be important in the future?', 'Which kinds of jobs have the highest salaries in your country?', 'Are there any other jobs that you think should have high salaries?', 'Would society be better if everyone got the same salary?'],
  }),
  speakingSection(2, {
    part1Topic: 'Music',
    part1: ['What types of music do you like to listen to?', 'At what times of day do you like to listen to music?', 'Did you learn to play a musical instrument when you were a child?', 'Do you think all children should learn to play a musical instrument?'],
    cueTitle: 'Describe a shop near where you live that you sometimes use.',
    cuePoints: ['what sorts of product or service it sells', 'what the shop looks like', 'where it is located', 'why you use this shop'],
    part3Topic: 'Local business',
    part3: ['What types of local business are there in your neighbourhood?', 'Do you think local businesses are important for a neighbourhood?', 'How do large shopping malls and commercial centres affect small local businesses?', 'Why do some people want to start their own business?', 'What are the disadvantages of running a business?', 'What qualities does a good business person need?'],
  }),
  speakingSection(3, {
    part1Topic: 'Travel',
    part1: ['Do you enjoy travelling?', 'Have you done much travelling?', 'Do you think it is better to travel alone or with other people?', 'Where would you like to travel in the future?'],
    cueTitle: 'Describe a child that you know.',
    cuePoints: ['who this child is and how often you see him or her', 'how old this child is', 'what he or she is like', 'what you feel about this child'],
    part3Topic: 'Relationships between parents and children',
    part3: ['How much time do children spend with their parents in your country?', 'Do you think children should spend more time with their parents?', 'How important are relationships between parents and children?', 'What are common problems between parents and children?', 'How have family relationships changed in recent years?', 'What can parents do to build good relationships with children?'],
  }),
  speakingSection(4, {
    part1Topic: 'School',
    part1: ['Did you go to secondary or high school near where you lived?', 'What did you like about your secondary or high school?', 'Tell me about anything you did not like at your school.', 'How do you think your school could be improved?'],
    cueTitle: 'Describe something you do not have now but would really like to own in the future.',
    cuePoints: ['what this thing is', 'how long you have wanted to own it', 'where you first saw it', 'why you would like to own it'],
    part3Topic: 'Owning things',
    part3: ['What types of things do young people in your country most want to own today?', 'Why do some people feel they need to own things?', 'Do you think owning lots of things makes people happy?', 'Can television and films make people want new possessions?', 'Are there benefits to society when people want new possessions?', 'Will people consider having many possessions a sign of success in the future?'],
  }),
];

const sections = [...readingSections, ...writingSections, ...speakingSections];

async function api(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(`${options.method || 'GET'} ${path} ${response.status}: ${JSON.stringify(body)}`);
  return body;
}

async function main() {
  const login = await api('/admin/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const headers = { Authorization: `Bearer ${login.data.access_token}` };
  const existing = await api('/admin/sections?page=1&size=100&q=Cambridge%20IELTS%2010', { headers });
  const titles = new Set((existing.data || []).map((item) => item.title));
  const results = [];

  for (const payload of sections) {
    if (titles.has(payload.title)) {
      results.push({ title: payload.title, status: 'skipped_existing' });
      continue;
    }

    const created = await api('/admin/sections', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    results.push({
      title: payload.title,
      status: 'created',
      id: created.data?.id,
      total: created.data?.total_questions,
    });
  }

  console.log(JSON.stringify(results, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
