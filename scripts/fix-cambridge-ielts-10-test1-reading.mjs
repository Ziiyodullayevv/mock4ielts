const API_BASE = 'https://mockapi.mock4ielts.uz/api/v1';
const EMAIL = process.env.MOCK4IELTS_ADMIN_EMAIL;
const PASSWORD = process.env.MOCK4IELTS_ADMIN_PASSWORD;
const OLD_SECTION_ID = 'c9d84ead-47cf-4551-9e75-a9371e54472a';

if (!EMAIL || !PASSWORD) throw new Error('Set MOCK4IELTS_ADMIN_EMAIL and MOCK4IELTS_ADMIN_PASSWORD.');

const options = (items) => items.map(([label, text]) => ({ label, text }));
const mapAnswers = (entries) => Object.fromEntries(entries.map(([key, value]) => [String(key), Array.isArray(value) ? value : [value]]));

function statementQ({ order, text, answer, type = 'true_false_not_given', groupId, instruction }) {
  return {
    question_type: type,
    text,
    options: null,
    correct_answer: answer,
    explanation: null,
    points: 1,
    order,
    metadata: { group_id: groupId, group_instruction: instruction },
    image_url: null,
  };
}

function singleChoiceQ({ order, text, correct, opts, instruction }) {
  return {
    question_type: 'single_choice',
    text,
    options: options(opts),
    correct_answer: correct,
    explanation: null,
    points: 1,
    order,
    metadata: { instruction },
    image_url: null,
  };
}

function matchingQ({ type, order, text, correct, opts, items, instruction }) {
  return {
    question_type: type,
    text,
    options: options(opts),
    correct_answer: correct,
    explanation: null,
    points: items.length,
    order,
    metadata: { items, input_mode: 'select', instruction, reuse_options: true },
    image_url: null,
  };
}

function shortAnswerQ({ order, text, correct, questions, instruction, wordLimit = 1 }) {
  return {
    question_type: 'short_answer',
    text,
    options: null,
    correct_answer: correct,
    explanation: null,
    points: questions.length,
    order,
    metadata: {
      sub_questions: questions.map((question) => ({ text: question.text, slots: [question.order] })),
      instruction,
      word_limit: wordLimit,
    },
    image_url: null,
  };
}

function tableQ({ order, text, correct, table, instruction, wordLimit = 1 }) {
  return {
    question_type: 'table_completion',
    text,
    options: null,
    correct_answer: correct,
    explanation: null,
    points: Object.keys(correct).length,
    order,
    metadata: { table, instruction, word_limit: wordLimit },
    image_url: null,
  };
}

function payload(passages) {
  return {
    section_type: 'reading',
    exam_type: 'academic',
    title: 'Cambridge IELTS 10 Test 1 - Reading',
    instructions: 'Cambridge IELTS 10 Test 1 Academic Reading.',
    duration_minutes: 60,
    difficulty: 'medium',
    tags: ['cambridge-ielts-10', 'test-1', 'reading', 'fixed-format'],
    parts: [
      {
        title: 'Reading Passage 1',
        passage_text: passages[0],
        passage_source: 'Cambridge IELTS 10',
        instructions: 'Questions 1-13',
        order: 0,
        questions: [
          ...[
            [1, 'Examples of ancient stepwells can be found all over the world.', 'FALSE'],
            [2, 'Stepwells had a range of functions, in addition to those related to water collection.', 'TRUE'],
            [3, 'The few existing stepwells in Delhi are more attractive than those found elsewhere.', 'NOT GIVEN'],
            [4, 'It took workers many years to build the stone steps characteristic of stepwells.', 'NOT GIVEN'],
            [5, 'The number of steps above the water level in a stepwell altered during the course of a year.', 'TRUE'],
          ].map(([order, text, answer]) =>
            statementQ({
              order,
              text,
              answer,
              groupId: 'test1-p1-q1-5',
              instruction: 'Do the following statements agree with the information given in Reading Passage 1?',
            })
          ),
          shortAnswerQ({
            order: 6,
            text: 'Questions 6-8',
            instruction: 'Answer the questions below. Choose ONE WORD ONLY from the passage for each answer.',
            correct: mapAnswers([[6, 'pavilions'], [7, 'drought'], [8, 'tourists']]),
            questions: [
              { order: 6, text: 'Which part of some stepwells provided shade for people?' },
              { order: 7, text: 'What type of serious climatic event, which took place in southern Rajasthan, is mentioned in the article?' },
              { order: 8, text: 'Who are frequent visitors to stepwells nowadays?' },
            ],
          }),
          tableQ({
            order: 9,
            text: 'Stepwells',
            instruction: 'Complete the table below. Choose ONE WORD AND/OR A NUMBER from the passage for each answer.',
            correct: mapAnswers([[9, 'earthquake'], [10, 'four sides'], [11, 'tank'], [12, 'verandas/verandahs'], [13, 'underwater']]),
            table: {
              headers: ['Stepwell', 'Date', 'Features', 'Other notes'],
              rows: [
                ['Rani Ki Vav', 'Late 11th century', 'As many as 500 sculptures decorate the monument', 'Restored in the 1960s; excellent condition, despite the ___9___ of 2001'],
                ['Surya Kund', '1026', 'Steps on the ___10___ produce a geometrical pattern; carved shrines', 'Looks more like a ___11___ than a well'],
                ['Raniji Ki Baori', '1699', 'Intricately carved monument', ''],
                ['Chand Baori', '850 AD', 'Steps take you down 11 storeys to the bottom', 'Old, deep and very dramatic; has ___12___ which provide a view of the steps'],
                ['Neemrana Ki Baori', '1700', 'Used by public today', 'Has two ___13___ levels'],
              ],
            },
          }),
        ],
      },
      {
        title: 'Reading Passage 2',
        passage_text: passages[1],
        passage_source: 'Cambridge IELTS 10',
        instructions: 'Questions 14-26',
        order: 1,
        questions: [
          matchingQ({
            type: 'matching_headings',
            order: 14,
            text: 'Questions 14-21',
            instruction: 'Reading Passage 2 has nine paragraphs, A-I. Choose the correct heading for paragraphs A-E and G-I from the list of headings below.',
            opts: [
              ['i', 'A fresh and important long-term goal'],
              ['ii', 'Charging for roads and improving other transport methods'],
              ['iii', 'Changes affecting the distances goods may be transported'],
              ['iv', 'Taking all the steps necessary to change transport patterns'],
              ['v', 'The environmental costs of road transport'],
              ['vi', 'The escalating cost of rail transport'],
              ['vii', 'The need to achieve transport rebalance'],
              ['viii', 'The rapid growth of private transport'],
              ['ix', 'Plans to develop major road networks'],
              ['x', 'Restricting road use through charging policies alone'],
              ['xi', 'Transport trends in countries awaiting EU admission'],
            ],
            items: [
              { order: 14, text: 'Paragraph A' },
              { order: 15, text: 'Paragraph B' },
              { order: 16, text: 'Paragraph C' },
              { order: 17, text: 'Paragraph D' },
              { order: 18, text: 'Paragraph E' },
              { order: 19, text: 'Paragraph G' },
              { order: 20, text: 'Paragraph H' },
              { order: 21, text: 'Paragraph I' },
            ],
            correct: { 14: 'viii', 15: 'iii', 16: 'xi', 17: 'i', 18: 'v', 19: 'x', 20: 'ii', 21: 'iv' },
          }),
          ...[
            [22, 'The need for transport is growing, despite technological developments.', 'TRUE'],
            [23, 'To reduce production costs, some industries have been moved closer to their relevant consumers.', 'FALSE'],
            [24, 'Cars are prohibitively expensive in some EU candidate countries.', 'NOT GIVEN'],
            [25, 'The Gothenburg European Council was set up 30 years ago.', 'NOT GIVEN'],
            [26, 'By the end of this decade, CO2 emissions from transport are predicted to reach 739 billion tonnes.', 'FALSE'],
          ].map(([order, text, answer]) =>
            statementQ({
              order,
              text,
              answer,
              groupId: 'test1-p2-q22-26',
              instruction: 'Do the following statements agree with the information given in Reading Passage 2?',
            })
          ),
        ],
      },
      {
        title: 'Reading Passage 3',
        passage_text: passages[2],
        passage_source: 'Cambridge IELTS 10',
        instructions: 'Questions 27-40',
        order: 2,
        questions: [
          ...[
            [27, "The example of the 'million-dollar quartet' underlines the writer's point about", 'C', [['A', 'recognising talent'], ['B', 'working as a team'], ['C', 'having a shared objective'], ['D', 'being an effective leader']]],
            [28, 'James Watson suggests that he and Francis Crick won the race to discover the DNA code because they', 'A', [['A', 'were conscious of their own limitations'], ['B', 'brought complementary skills to their partnership'], ['C', 'were determined to outperform their brighter rivals'], ['D', 'encouraged each other to realise their joint ambition']]],
            [29, 'The writer mentions competitions on breakfast cereal packets as an example of how to', 'D', [['A', 'inspire creative thinking'], ['B', 'generate concise writing'], ['C', 'promote loyalty to a group'], ['D', 'strengthen commitment to an idea']]],
            [30, 'In the last paragraph, the writer suggests that it is important for employees to', 'B', [['A', "be aware of their company's goals"], ['B', 'feel that their contributions are valued'], ['C', "have respect for their co-workers' achievements"], ['D', 'understand why certain management decisions are made']]],
          ].map(([order, text, correct, opts]) =>
            singleChoiceQ({
              order,
              text,
              correct,
              opts,
              instruction: 'Choose the correct letter, A, B, C or D.',
            })
          ),
          matchingQ({
            type: 'matching_sentence_endings',
            order: 31,
            text: 'Questions 31-35',
            instruction: 'Complete each sentence with the correct ending, A-G, below.',
            opts: [
              ['A', 'take chances'],
              ['B', 'share their ideas'],
              ['C', 'become competitive'],
              ['D', 'get promotion'],
              ['E', 'avoid risk'],
              ['F', 'ignore their duties'],
              ['G', 'remain in their jobs'],
            ],
            items: [
              { order: 31, text: 'Employees whose values match those of their employers are more likely to' },
              { order: 32, text: 'At times of change, people tend to' },
              { order: 33, text: 'If people are aware of what they might lose, they will often' },
              { order: 34, text: 'People working under a dominant boss are liable to' },
              { order: 35, text: 'Employees working in organisations with few rules are more likely to' },
            ],
            correct: { 31: 'G', 32: 'E', 33: 'A', 34: 'F', 35: 'B' },
          }),
          ...[
            [36, 'The physical surroundings in which a person works play a key role in determining their creativity.', 'NO'],
            [37, 'Most people have the potential to be creative.', 'YES'],
            [38, 'Teams work best when their members are of equally matched intelligence.', 'NOT GIVEN'],
            [39, 'It is easier for smaller companies to be innovative.', 'NOT GIVEN'],
            [40, "A manager's approval of an idea is more persuasive than that of a colleague.", 'NO'],
          ].map(([order, text, answer]) =>
            statementQ({
              order,
              text,
              answer,
              type: 'yes_no_not_given',
              groupId: 'test1-p3-q36-40',
              instruction: 'Do the following statements agree with the claims of the writer in Reading Passage 3?',
            })
          ),
        ],
      },
    ],
  };
}

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
  const current = await api(`/admin/sections/${OLD_SECTION_ID}`, { headers });
  const passages = current.data.parts.map((part) => part.passage_text);
  await api(`/admin/sections/${OLD_SECTION_ID}`, { method: 'DELETE', headers });
  const created = await api('/admin/sections', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload(passages)),
  });
  await api(`/admin/sections/${created.data.id}/publish`, { method: 'POST', headers });
  console.log(JSON.stringify({ id: created.data.id, title: created.data.title, total: created.data.total_questions }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
