import type { ListeningTest } from '../types';

const DEMO_LISTENING_AUDIO_URL = '/listening/c57cfedc33f14f49870e978fbe231211.mp3';

export const test1: ListeningTest = {
  id: '1',
  title: 'IELTS Listening Practice Test 1',
  difficulty: 'medium',
  description:
    'Sports facility booking · Museum tour · University project · Marine biology lecture',
  parts: [
    // ── PART 1 ─ Form Completion ─────────────────────────────────────────────
    {
      number: 1,
      title: 'Part 1 — Sports Centre Booking',
      scenario: 'A woman calls a sports centre to book a swimming course.',
      audioUrl: DEMO_LISTENING_AUDIO_URL,
      groups: [
        {
          type: 'form-completion',
          instructions:
            'Complete the form below. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.',
          formTitle: 'Riverside Sports Centre — Course Registration',
          sections: [
            {
              heading: 'Personal Details',
              fields: [
                { id: 'q1', number: 1, label: 'First name:', answerLength: 5, answer: 'Helen' },
                { id: 'q2', number: 2, label: 'Surname:', answerLength: 8, answer: 'Morrison' },
                {
                  id: 'q3',
                  number: 3,
                  label: 'Phone number:',
                  answerLength: 11,
                  answer: '07842 396501',
                },
                {
                  id: 'q4',
                  number: 4,
                  label: 'Email:',
                  answerLength: 9,
                  answer: 'hmorrison',
                  suffix: '@gmail.com',
                },
              ],
            },
            {
              heading: 'Course Details',
              fields: [
                {
                  id: 'q5',
                  number: 5,
                  label: 'Course type:',
                  answerLength: 12,
                  answer: 'intermediate',
                },
                {
                  id: 'q6',
                  number: 6,
                  label: 'Preferred day:',
                  answerLength: 9,
                  answer: 'Wednesday',
                },
                { id: 'q7', number: 7, label: 'Session time:', answerLength: 7, answer: '6:30 pm' },
                {
                  id: 'q8',
                  number: 8,
                  label: 'Number of sessions:',
                  answerLength: 2,
                  answer: '12',
                },
              ],
            },
            {
              heading: 'Payment',
              fields: [
                { id: 'q9', number: 9, label: 'Total cost: £', answerLength: 5, answer: '84.00' },
                {
                  id: 'q10',
                  number: 10,
                  label: 'Payment method:',
                  answerLength: 10,
                  answer: 'debit card',
                },
              ],
            },
          ],
        },
      ],
    },

    // ── PART 2 ─ Multiple Choice + Map Labelling ─────────────────────────────
    {
      number: 2,
      title: 'Part 2 — City Museum Visitor Tour',
      scenario: 'A museum guide introduces the layout and facilities to a visitor group.',
      audioUrl: DEMO_LISTENING_AUDIO_URL,
      groups: [
        {
          type: 'multiple-choice',
          instructions: 'Choose the correct letter, A, B or C.',
          questions: [
            {
              id: 'q11',
              number: 11,
              text: 'The museum was originally built as a',
              options: [
                { value: 'A', text: 'railway station' },
                { value: 'B', text: 'textile factory' },
                { value: 'C', text: 'government building' },
              ],
              answer: 'B',
            },
            {
              id: 'q12',
              number: 12,
              text: 'The new east wing will open in',
              options: [
                { value: 'A', text: 'six months' },
                { value: 'B', text: 'one year' },
                { value: 'C', text: 'two years' },
              ],
              answer: 'A',
            },
            {
              id: 'q13',
              number: 13,
              text: 'Which item is NOT available in the museum shop?',
              options: [
                { value: 'A', text: 'postcards' },
                { value: 'B', text: 'replica artefacts' },
                { value: 'C', text: 'art prints' },
              ],
              answer: 'C',
            },
            {
              id: 'q14',
              number: 14,
              text: 'The museum café closes at',
              options: [
                { value: 'A', text: '4:30 pm' },
                { value: 'B', text: '5:00 pm' },
                { value: 'C', text: '5:30 pm' },
              ],
              answer: 'B',
            },
            {
              id: 'q15',
              number: 15,
              text: 'Group discounts apply to parties of more than',
              options: [
                { value: 'A', text: '8 people' },
                { value: 'B', text: '10 people' },
                { value: 'C', text: '15 people' },
              ],
              answer: 'C',
            },
          ],
        },
        {
          type: 'map-labelling',
          instructions: 'Label the museum map. Choose FIVE answers from the box.',
          data: {
            wordBank: [
              'Café',
              'Gift shop',
              'Lecture room',
              'Reception',
              'Toilets',
              'Ancient Egypt gallery',
              'Modern art gallery',
            ],
            pins: [
              { id: 'q16', number: 16, x: 18, y: 20, answer: 'Reception', answerLength: 9 },
              { id: 'q17', number: 17, x: 75, y: 20, answer: 'Gift shop', answerLength: 9 },
              { id: 'q18', number: 18, x: 18, y: 70, answer: 'Café', answerLength: 4 },
              { id: 'q19', number: 19, x: 50, y: 50, answer: 'Lecture room', answerLength: 12 },
              {
                id: 'q20',
                number: 20,
                x: 75,
                y: 70,
                answer: 'Ancient Egypt gallery',
                answerLength: 21,
              },
            ],
          },
        },
      ],
    },

    // ── PART 3 ─ Matching + Note Completion ──────────────────────────────────
    {
      number: 3,
      title: 'Part 3 — University Group Project',
      scenario:
        'Two students, James and Priya, discuss their environmental science project with their tutor.',
      audioUrl: DEMO_LISTENING_AUDIO_URL,
      groups: [
        {
          type: 'matching',
          instructions:
            'What does each student think about the following aspects? Choose from the options A–F. You may use any letter more than once.',
          data: {
            options: [
              { value: 'A', label: 'A  needs more research' },
              { value: 'B', label: 'B  well organised' },
              { value: 'C', label: 'C  too narrow in scope' },
              { value: 'D', label: 'D  very effective' },
              { value: 'E', label: 'E  confusing for readers' },
              { value: 'F', label: 'F  could be improved' },
            ],
            pairs: [
              { id: 'q21', number: 21, text: 'the introduction', answer: 'B' },
              { id: 'q22', number: 22, text: 'the data analysis', answer: 'A' },
              { id: 'q23', number: 23, text: 'the case studies', answer: 'C' },
              { id: 'q24', number: 24, text: 'the conclusion', answer: 'F' },
              { id: 'q25', number: 25, text: 'the visual charts', answer: 'D' },
            ],
          },
        },
        {
          type: 'note-completion',
          instructions: 'Complete the notes below. Write NO MORE THAN TWO WORDS for each answer.',
          noteTitle: 'Project Revision Plan',
          sections: [
            {
              heading: 'Data section',
              bullets: [
                {
                  text: 'Add surveys from',
                  field: {
                    id: 'q26',
                    number: 26,
                    label: '',
                    answerLength: 11,
                    answer: 'rural areas',
                  },
                },
                {
                  text: 'Include latest',
                  field: {
                    id: 'q27',
                    number: 27,
                    label: '',
                    answerLength: 10,
                    answer: 'government',
                    suffix: 'report',
                  },
                },
              ],
            },
            {
              heading: 'Conclusion',
              bullets: [
                {
                  text: 'Add a clear',
                  field: {
                    id: 'q28',
                    number: 28,
                    label: '',
                    answerLength: 14,
                    answer: 'recommendation',
                  },
                },
                {
                  text: 'Remove',
                  field: {
                    id: 'q29',
                    number: 29,
                    label: '',
                    answerLength: 10,
                    answer: 'repetition',
                  },
                },
              ],
            },
            {
              heading: 'Submission',
              bullets: [
                {
                  text: 'Final deadline:',
                  field: {
                    id: 'q30',
                    number: 30,
                    label: '',
                    answerLength: 10,
                    answer: '14th March',
                  },
                },
              ],
            },
          ],
        },
      ],
    },

    // ── PART 4 ─ Sentence Completion + Short Answer ───────────────────────────
    {
      number: 4,
      title: 'Part 4 — Lecture: Coral Reef Ecosystems',
      scenario: 'A university lecturer talks about threats facing coral reef ecosystems worldwide.',
      audioUrl: DEMO_LISTENING_AUDIO_URL,
      groups: [
        {
          type: 'sentence-completion',
          instructions:
            'Complete the sentences below. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.',
          questions: [
            {
              id: 'q31',
              number: 31,
              label: 'Coral reefs cover less than',
              suffix: '% of the ocean floor.',
              answerLength: 1,
              answer: '1',
            },
            {
              id: 'q32',
              number: 32,
              label: 'The Great Barrier Reef has lost over',
              suffix: '% of its coral since 1995.',
              answerLength: 2,
              answer: '50',
            },
            {
              id: 'q33',
              number: 33,
              label: 'The main cause of bleaching is rising',
              suffix: '.',
              answerLength: 16,
              answer: 'water temperature',
            },
            {
              id: 'q34',
              number: 34,
              label: 'Ocean acidification is caused by',
              suffix: 'in the atmosphere.',
              answerLength: 3,
              answer: 'CO2',
            },
            {
              id: 'q35',
              number: 35,
              label: 'Coral reefs support approximately',
              suffix: 'million species.',
              answerLength: 1,
              answer: '2',
            },
          ],
        },
        {
          type: 'short-answer',
          instructions: 'Answer the questions below. Write NO MORE THAN TWO WORDS for each answer.',
          questions: [
            {
              id: 'q36',
              number: 36,
              label: 'What method do scientists use to monitor reef health remotely?',
              answerLength: 16,
              answer: 'satellite imaging',
            },
            {
              id: 'q37',
              number: 37,
              label: 'Which country leads current coral restoration projects?',
              answerLength: 9,
              answer: 'Australia',
            },
            {
              id: 'q38',
              number: 38,
              label: 'What is the process used to grow new coral in labs?',
              answerLength: 13,
              answer: 'coral farming',
            },
            {
              id: 'q39',
              number: 39,
              label: 'Which chemical protects reefs from crown-of-thorns starfish?',
              answerLength: 10,
              answer: 'bile salts',
            },
            {
              id: 'q40',
              number: 40,
              label: 'By what year do scientists hope to restore 30% of damaged reefs?',
              answerLength: 4,
              answer: '2050',
            },
          ],
        },
      ],
    },
  ],
};
