import type { ListeningTest } from '../types';

const DEMO_LISTENING_AUDIO_URL = '/listening/c57cfedc33f14f49870e978fbe231211.mp3';

export const test4: ListeningTest = {
  id: 'test-4',
  title: 'IELTS Listening Practice Test 4',
  difficulty: 'hard',
  description:
    'Gym induction · Recycling programme · Academic writing seminar · Archaeology lecture',

  parts: [
    // ── PART 1 ─ Note Completion (bulleted, nested) ──────────────────────────
    {
      number: 1,
      title: 'Part 1 — Gym Induction Booking',
      scenario: 'A new member calls a gym to book an induction session with a personal trainer.',
      audioUrl: DEMO_LISTENING_AUDIO_URL,
      groups: [
        {
          type: 'note-completion',
          instructions:
            'Complete the notes below. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.',
          noteTitle: 'FitLife Gym — Induction Notes',
          sections: [
            {
              heading: 'Booking details',
              bullets: [
                {
                  text: 'Member name:',
                  field: {
                    id: 'q1',
                    number: 1,
                    label: '',
                    answerLength: 10,
                    answer: 'Rosa Campos',
                  },
                },
                {
                  text: 'Membership number:',
                  field: { id: 'q2', number: 2, label: '', answerLength: 6, answer: 'FL4821' },
                },
                {
                  text: 'Preferred trainer:',
                  field: { id: 'q3', number: 3, label: '', answerLength: 8, answer: 'Mitchell' },
                },
                {
                  text: 'Appointment time:',
                  field: { id: 'q4', number: 4, label: '', answerLength: 7, answer: '10:30 am' },
                },
                {
                  text: 'Day:',
                  field: { id: 'q5', number: 5, label: '', answerLength: 8, answer: 'Thursday' },
                },
              ],
            },
            {
              heading: 'Health information',
              bullets: [
                {
                  text: 'Current activity level:',
                  field: { id: 'q6', number: 6, label: '', answerLength: 10, answer: 'sedentary' },
                },
                {
                  text: 'Main goal:',
                  field: {
                    id: 'q7',
                    number: 7,
                    label: '',
                    answerLength: 12,
                    answer: 'weight loss',
                  },
                },
                {
                  text: 'Existing condition:',
                  field: {
                    id: 'q8',
                    number: 8,
                    label: '',
                    answerLength: 10,
                    answer: 'lower back',
                    suffix: 'pain',
                  },
                },
              ],
            },
            {
              heading: 'Equipment to bring',
              bullets: [
                {
                  text: 'Wear appropriate',
                  field: { id: 'q9', number: 9, label: '', answerLength: 8, answer: 'trainers' },
                },
                {
                  text: 'Bring a',
                  field: {
                    id: 'q10',
                    number: 10,
                    label: '',
                    answerLength: 9,
                    answer: 'water bottle',
                  },
                },
              ],
            },
          ],
        },
      ],
    },

    // ── PART 2 ─ Flow Chart (complex branching) + MC ─────────────────────────
    {
      number: 2,
      title: 'Part 2 — Eastbridge Recycling Programme',
      scenario:
        'A council officer explains the new recycling collection system to local residents.',
      audioUrl: DEMO_LISTENING_AUDIO_URL,
      groups: [
        {
          type: 'multiple-choice',
          instructions: 'Choose the correct letter, A, B or C.',
          questions: [
            {
              id: 'q11',
              number: 11,
              text: 'The new recycling scheme starts on',
              options: [
                { value: 'A', text: '1st September' },
                { value: 'B', text: '15th September' },
                { value: 'C', text: '1st October' },
              ],
              answer: 'C',
            },
            {
              id: 'q12',
              number: 12,
              text: 'Residents will receive their recycling bins by',
              options: [
                { value: 'A', text: 'collecting from the council office' },
                { value: 'B', text: 'home delivery' },
                { value: 'C', text: 'ordering online' },
              ],
              answer: 'B',
            },
            {
              id: 'q13',
              number: 13,
              text: 'The council officer says the most common recycling mistake is',
              options: [
                { value: 'A', text: 'placing food in paper bags' },
                { value: 'B', text: 'mixing glass with other materials' },
                { value: 'C', text: 'not rinsing containers' },
              ],
              answer: 'C',
            },
          ],
        },
        {
          type: 'flow-chart',
          instructions: 'Complete the flow chart. Write NO MORE THAN TWO WORDS for each answer.',
          chartTitle: 'How Recycling is Processed',
          steps: [
            { isBlank: false, content: 'Resident sorts waste into colour-coded bins' },
            { isBlank: false, content: '↓' },
            {
              id: 'q14',
              number: 14,
              isBlank: true,
              content: '_______ vehicle collects bins weekly',
              answerLength: 10,
              answer: 'Specialist',
            },
            { isBlank: false, content: '↓' },
            {
              id: 'q15',
              number: 15,
              isBlank: true,
              content: 'Taken to a _______ facility',
              answerLength: 12,
              answer: 'sorting',
            },
            { isBlank: false, content: '↓' },
            {
              id: 'q16',
              number: 16,
              isBlank: true,
              content: 'Materials separated by _______ and weight',
              answerLength: 4,
              answer: 'size',
            },
            { isBlank: false, content: '↓' },
            {
              id: 'q17',
              number: 17,
              isBlank: true,
              content: 'Compressed into _______ for transport',
              answerLength: 6,
              answer: 'bales',
            },
            { isBlank: false, content: '↓' },
            {
              id: 'q18',
              number: 18,
              isBlank: true,
              content: 'Sold to _______ who manufacture new products',
              answerLength: 11,
              answer: 'processors',
            },
            { isBlank: false, content: '↓' },
            {
              id: 'q19',
              number: 19,
              isBlank: true,
              content: 'Council receives _______ payment',
              answerLength: 8,
              answer: 'quarterly',
            },
            { isBlank: false, content: '↓' },
            {
              id: 'q20',
              number: 20,
              isBlank: true,
              content: 'Funds used to improve local _______ services',
              answerLength: 11,
              answer: 'environment',
            },
          ],
        },
      ],
    },

    // ── PART 3 ─ Table Completion (complex) + Matching (purposes) ────────────
    {
      number: 3,
      title: 'Part 3 — Academic Writing Seminar',
      scenario:
        'Two students, Marcus and Yuki, attend a seminar on academic writing styles with their tutor.',
      audioUrl: DEMO_LISTENING_AUDIO_URL,
      groups: [
        {
          type: 'table-completion',
          instructions: 'Complete the table below. Write NO MORE THAN TWO WORDS for each answer.',
          tableTitle: 'Academic Writing Genres Comparison',
          data: {
            headers: ['Genre', 'Main purpose', 'Key feature', 'Common weakness'],
            rows: [
              [
                { isBlank: false, content: 'Essay' },
                { isBlank: false, content: 'argue a position' },
                { id: 'q21', number: 21, isBlank: true, answerLength: 12, answer: 'clear thesis' },
                { isBlank: false, content: 'lack of evidence' },
              ],
              [
                { isBlank: false, content: 'Report' },
                {
                  id: 'q22',
                  number: 22,
                  isBlank: true,
                  answerLength: 14,
                  answer: 'present findings',
                },
                { isBlank: false, content: 'structured sections' },
                { isBlank: false, content: 'passive overuse' },
              ],
              [
                {
                  id: 'q23',
                  number: 23,
                  isBlank: true,
                  answerLength: 12,
                  answer: 'Literature review',
                },
                { isBlank: false, content: 'survey existing work' },
                { isBlank: false, content: 'critical evaluation' },
                {
                  id: 'q24',
                  number: 24,
                  isBlank: true,
                  answerLength: 14,
                  answer: 'poor synthesis',
                },
              ],
              [
                { isBlank: false, content: 'Case study' },
                { isBlank: false, content: 'analyse a specific example' },
                {
                  id: 'q25',
                  number: 25,
                  isBlank: true,
                  answerLength: 13,
                  answer: 'detailed context',
                },
                { isBlank: false, content: 'over-generalising' },
              ],
            ],
          },
        },
        {
          // Matching: match writing task to its purpose
          type: 'matching',
          instructions:
            'Match each writing task (26–30) with its primary purpose (A–F). You may NOT use any letter more than once.',
          data: {
            options: [
              { value: 'A', label: 'A  to persuade the reader' },
              { value: 'B', label: 'B  to describe a process' },
              { value: 'C', label: 'C  to compare two viewpoints' },
              { value: 'D', label: 'D  to evaluate sources critically' },
              { value: 'E', label: 'E  to summarise key findings' },
              { value: 'F', label: 'F  to propose a solution' },
            ],
            pairs: [
              { id: 'q26', number: 26, text: 'argumentative essay', answer: 'A' },
              { id: 'q27', number: 27, text: 'annotated bibliography', answer: 'D' },
              { id: 'q28', number: 28, text: 'process description', answer: 'B' },
              { id: 'q29', number: 29, text: 'executive summary', answer: 'E' },
              { id: 'q30', number: 30, text: 'problem–solution essay', answer: 'F' },
            ],
          },
        },
      ],
    },

    // ── PART 4 ─ Summary (free-write) + Short Answer ──────────────────────────
    {
      number: 4,
      title: 'Part 4 — Lecture: Ancient Roman Archaeology',
      scenario: 'A lecturer discusses recent excavations at a Roman site in Britain.',
      audioUrl: DEMO_LISTENING_AUDIO_URL,
      groups: [
        {
          // Summary completion — FREE WRITE (no word bank)
          type: 'summary-completion',
          instructions: 'Complete the summary. Write NO MORE THAN TWO WORDS for each answer.',
          summaryTitle: 'Excavation at Thorngate Roman Villa',
          paragraphs: [
            {
              heading: 'Discovery',
              segments: [
                { type: 'text', content: 'The site was first identified in 2018 using ' },
                {
                  type: 'blank',
                  field: {
                    id: 'q31',
                    number: 31,
                    label: '',
                    answerLength: 12,
                    answer: 'aerial survey',
                  },
                },
                { type: 'text', content: '. Archaeologists found evidence of a large ' },
                {
                  type: 'blank',
                  field: {
                    id: 'q32',
                    number: 32,
                    label: '',
                    answerLength: 10,
                    answer: 'bath house',
                  },
                },
                { type: 'text', content: ' and a mosaic floor.' },
              ],
            },
            {
              heading: 'Key finds',
              segments: [
                {
                  type: 'text',
                  content: 'Among the most significant discoveries were a collection of ',
                },
                {
                  type: 'blank',
                  field: { id: 'q33', number: 33, label: '', answerLength: 5, answer: 'coins' },
                },
                { type: 'text', content: ' dating to the 3rd century and a ' },
                {
                  type: 'blank',
                  field: { id: 'q34', number: 34, label: '', answerLength: 9, answer: 'sculpture' },
                },
                { type: 'text', content: ' of a Roman deity.' },
              ],
            },
            {
              heading: 'Ongoing work',
              segments: [
                { type: 'text', content: 'The team plans to use ' },
                {
                  type: 'blank',
                  field: {
                    id: 'q35',
                    number: 35,
                    label: '',
                    answerLength: 11,
                    answer: 'ground radar',
                  },
                },
                { type: 'text', content: ' to map underground structures without further ' },
                {
                  type: 'blank',
                  field: {
                    id: 'q36',
                    number: 36,
                    label: '',
                    answerLength: 10,
                    answer: 'excavation',
                  },
                },
                { type: 'text', content: '.' },
              ],
            },
          ],
        },
        {
          type: 'short-answer',
          instructions: 'Answer the questions below. Write NO MORE THAN TWO WORDS for each answer.',
          questions: [
            {
              id: 'q37',
              number: 37,
              label: 'What material were the villa walls primarily built from?',
              answerLength: 9,
              answer: 'limestone',
            },
            {
              id: 'q38',
              number: 38,
              label: 'What does the size of the dining room suggest about the owner?',
              answerLength: 12,
              answer: 'high status',
            },
            {
              id: 'q39',
              number: 39,
              label: 'What type of heating system was found under the floors?',
              answerLength: 10,
              answer: 'hypocaust',
            },
            {
              id: 'q40',
              number: 40,
              label: 'Where will the artefacts be displayed once conservation is complete?',
              answerLength: 14,
              answer: 'local museum',
            },
          ],
        },
      ],
    },
  ],
};
