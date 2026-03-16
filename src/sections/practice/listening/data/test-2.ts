import type { ListeningTest } from '../types';

const DEMO_LISTENING_AUDIO_URL = '/listening/c57cfedc33f14f49870e978fbe231211.mp3';

export const test2: ListeningTest = {
  id: '2',
  title: 'IELTS Listening Practice Test 2',
  difficulty: 'hard',
  description: 'Hotel booking · Community centre · Research discussion · Renewable energy lecture',
  parts: [
    // ── PART 1 ─ Form Completion ─────────────────────────────────────────────
    {
      number: 1,
      title: 'Part 1 — Hotel Reservation',
      scenario: 'A man calls a hotel to make a reservation for a family holiday.',
      audioUrl: DEMO_LISTENING_AUDIO_URL,
      groups: [
        {
          type: 'form-completion',
          instructions:
            'Complete the form below. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.',
          formTitle: 'Grand Harbour Hotel — Booking Form',
          sections: [
            {
              heading: 'Guest Information',
              fields: [
                {
                  id: 'q1',
                  number: 1,
                  label: 'Title & surname:',
                  answerLength: 9,
                  answer: 'Mr Davies',
                },
                { id: 'q2', number: 2, label: 'Number of guests:', answerLength: 1, answer: '4' },
                {
                  id: 'q3',
                  number: 3,
                  label: 'Contact number:',
                  answerLength: 11,
                  answer: '07731 200845',
                },
              ],
            },
            {
              heading: 'Stay Details',
              fields: [
                {
                  id: 'q4',
                  number: 4,
                  label: 'Check-in date:',
                  answerLength: 10,
                  answer: '3rd August',
                },
                { id: 'q5', number: 5, label: 'Number of nights:', answerLength: 1, answer: '7' },
                {
                  id: 'q6',
                  number: 6,
                  label: 'Room type:',
                  answerLength: 12,
                  answer: 'family suite',
                },
                {
                  id: 'q7',
                  number: 7,
                  label: 'Special request:',
                  answerLength: 10,
                  answer: 'sea view',
                },
              ],
            },
            {
              heading: 'Extras',
              fields: [
                {
                  id: 'q8',
                  number: 8,
                  label: 'Breakfast included:',
                  answerLength: 3,
                  answer: 'yes',
                },
                {
                  id: 'q9',
                  number: 9,
                  label: 'Deposit paid: £',
                  answerLength: 6,
                  answer: '150.00',
                },
                {
                  id: 'q10',
                  number: 10,
                  label: 'Booking reference:',
                  answerLength: 7,
                  answer: 'GH7821X',
                },
              ],
            },
          ],
        },
      ],
    },

    // ── PART 2 ─ Multiple Choice + Flow Chart ────────────────────────────────
    {
      number: 2,
      title: 'Part 2 — Westfield Community Centre',
      scenario:
        'The manager of a community centre describes new programmes and the application process.',
      audioUrl: DEMO_LISTENING_AUDIO_URL,
      groups: [
        {
          type: 'multiple-choice',
          instructions: 'Choose the correct letter, A, B or C.',
          questions: [
            {
              id: 'q11',
              number: 11,
              text: 'The community centre was refurbished',
              options: [
                { value: 'A', text: 'last winter' },
                { value: 'B', text: 'two years ago' },
                { value: 'C', text: 'earlier this year' },
              ],
              answer: 'C',
            },
            {
              id: 'q12',
              number: 12,
              text: 'The new sports hall can accommodate up to',
              options: [
                { value: 'A', text: '80 people' },
                { value: 'B', text: '120 people' },
                { value: 'C', text: '200 people' },
              ],
              answer: 'B',
            },
            {
              id: 'q13',
              number: 13,
              text: 'The evening language classes are aimed at',
              options: [
                { value: 'A', text: 'complete beginners only' },
                { value: 'B', text: 'adults of all levels' },
                { value: 'C', text: 'business professionals' },
              ],
              answer: 'B',
            },
            {
              id: 'q14',
              number: 14,
              text: 'The childcare service is available',
              options: [
                { value: 'A', text: 'on weekends only' },
                { value: 'B', text: 'every morning' },
                { value: 'C', text: 'weekday afternoons' },
              ],
              answer: 'C',
            },
            {
              id: 'q15',
              number: 15,
              text: 'Members receive a discount of',
              options: [
                { value: 'A', text: '10%' },
                { value: 'B', text: '15%' },
                { value: 'C', text: '20%' },
              ],
              answer: 'A',
            },
          ],
        },
        {
          type: 'flow-chart',
          instructions:
            'Complete the flow chart below. Write NO MORE THAN TWO WORDS for each answer.',
          chartTitle: 'How to Join a Programme',
          steps: [
            { isBlank: false, content: 'Visit the website or call reception' },
            { isBlank: false, content: '↓' },
            {
              id: 'q16',
              number: 16,
              isBlank: true,
              answerLength: 14,
              answer: 'online form',
              content: 'Complete the _______',
            },
            { isBlank: false, content: '↓' },
            {
              id: 'q17',
              number: 17,
              isBlank: true,
              answerLength: 8,
              answer: 'passport',
              content: 'Provide photo ID (e.g. _______ or driving licence)',
            },
            { isBlank: false, content: '↓' },
            {
              id: 'q18',
              number: 18,
              isBlank: true,
              answerLength: 7,
              answer: 'deposit',
              content: 'Pay a _______ to secure your place',
            },
            { isBlank: false, content: '↓' },
            {
              id: 'q19',
              number: 19,
              isBlank: true,
              answerLength: 13,
              answer: 'confirmation',
              content: 'Receive _______ email within 48 hours',
            },
            { isBlank: false, content: '↓' },
            {
              id: 'q20',
              number: 20,
              isBlank: true,
              answerLength: 12,
              answer: 'welcome pack',
              content: 'Collect _______ from front desk',
            },
          ],
        },
      ],
    },

    // ── PART 3 ─ Table Completion + Matching ─────────────────────────────────
    {
      number: 3,
      title: 'Part 3 — Research Methods Discussion',
      scenario:
        'Two postgraduate students, Anna and Ben, discuss their research methodology with their supervisor.',
      audioUrl: DEMO_LISTENING_AUDIO_URL,
      groups: [
        {
          type: 'table-completion',
          instructions: 'Complete the table below. Write NO MORE THAN TWO WORDS for each answer.',
          tableTitle: 'Research Methods Overview',
          data: {
            headers: ['Method', 'Advantage', 'Limitation'],
            rows: [
              [
                { isBlank: false, content: 'Interviews' },
                { isBlank: false, content: 'detailed responses' },
                {
                  id: 'q21',
                  number: 21,
                  isBlank: true,
                  answerLength: 10,
                  answer: 'time consuming',
                },
              ],
              [
                { isBlank: false, content: 'Surveys' },
                { id: 'q22', number: 22, isBlank: true, answerLength: 12, answer: 'large samples' },
                { isBlank: false, content: 'superficial data' },
              ],
              [
                { id: 'q23', number: 23, isBlank: true, answerLength: 13, answer: 'Observation' },
                { isBlank: false, content: 'natural behaviour' },
                { isBlank: false, content: 'observer bias' },
              ],
              [
                { isBlank: false, content: 'Case studies' },
                {
                  id: 'q24',
                  number: 24,
                  isBlank: true,
                  answerLength: 13,
                  answer: 'in-depth detail',
                },
                { isBlank: false, content: 'hard to generalise' },
              ],
              [
                { isBlank: false, content: 'Experiments' },
                { isBlank: false, content: 'controlled variables' },
                { id: 'q25', number: 25, isBlank: true, answerLength: 10, answer: 'artificial' },
              ],
            ],
          },
        },
        {
          type: 'matching',
          instructions: 'Match each research challenge (26–30) with the solution suggested (A–F).',
          data: {
            options: [
              { value: 'A', label: 'A  use a pilot study' },
              { value: 'B', label: 'B  increase sample size' },
              { value: 'C', label: 'C  change research setting' },
              { value: 'D', label: 'D  use mixed methods' },
              { value: 'E', label: 'E  revise the questionnaire' },
              { value: 'F', label: 'F  consult a statistician' },
            ],
            pairs: [
              { id: 'q26', number: 26, text: 'low response rate', answer: 'B' },
              { id: 'q27', number: 27, text: 'unclear survey questions', answer: 'E' },
              { id: 'q28', number: 28, text: 'contradictory results', answer: 'D' },
              { id: 'q29', number: 29, text: 'complex statistical data', answer: 'F' },
              { id: 'q30', number: 30, text: 'untested methodology', answer: 'A' },
            ],
          },
        },
      ],
    },

    // ── PART 4 ─ Note Completion + Multiple Choice ────────────────────────────
    {
      number: 4,
      title: 'Part 4 — Lecture: Renewable Energy Sources',
      scenario: 'A lecturer explains types of renewable energy and their global adoption.',
      audioUrl: DEMO_LISTENING_AUDIO_URL,
      groups: [
        {
          type: 'note-completion',
          instructions:
            'Complete the notes. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.',
          noteTitle: 'Renewable Energy — Key Facts',
          sections: [
            {
              heading: 'Solar Energy',
              bullets: [
                {
                  text: 'Solar panels convert sunlight into electricity using',
                  field: {
                    id: 'q31',
                    number: 31,
                    label: '',
                    answerLength: 11,
                    answer: 'photovoltaic',
                    suffix: 'cells',
                  },
                },
                {
                  text: 'Efficiency rate has improved to around',
                  field: { id: 'q32', number: 32, label: '', answerLength: 3, answer: '23%' },
                },
                {
                  text: 'Biggest challenge:',
                  field: { id: 'q33', number: 33, label: '', answerLength: 7, answer: 'storage' },
                },
              ],
            },
            {
              heading: 'Wind Energy',
              bullets: [
                {
                  text: 'Offshore turbines produce more',
                  field: {
                    id: 'q34',
                    number: 34,
                    label: '',
                    answerLength: 11,
                    answer: 'electricity',
                    suffix: 'than onshore',
                  },
                },
                {
                  text: 'Leading producer globally:',
                  field: { id: 'q35', number: 35, label: '', answerLength: 5, answer: 'China' },
                },
              ],
            },
            {
              heading: 'Hydropower',
              bullets: [
                {
                  text: 'Generates approximately',
                  field: {
                    id: 'q36',
                    number: 36,
                    label: '',
                    answerLength: 3,
                    answer: '16%',
                    suffix: 'of global electricity',
                  },
                },
                {
                  text: 'Main environmental concern:',
                  field: {
                    id: 'q37',
                    number: 37,
                    label: '',
                    answerLength: 11,
                    answer: 'river damage',
                  },
                },
              ],
            },
          ],
        },
        {
          type: 'multiple-choice',
          instructions: 'Choose the correct letter, A, B or C.',
          questions: [
            {
              id: 'q38',
              number: 38,
              text: 'By 2030, renewables are expected to supply what percentage of global electricity?',
              options: [
                { value: 'A', text: '40%' },
                { value: 'B', text: '50%' },
                { value: 'C', text: '60%' },
              ],
              answer: 'B',
            },
            {
              id: 'q39',
              number: 39,
              text: 'The lecturer suggests the BIGGEST barrier to renewable expansion is',
              options: [
                { value: 'A', text: 'lack of technology' },
                { value: 'B', text: 'government policy' },
                { value: 'C', text: 'investment costs' },
              ],
              answer: 'C',
            },
            {
              id: 'q40',
              number: 40,
              text: 'Which country has the highest percentage of renewables in its national grid?',
              options: [
                { value: 'A', text: 'Denmark' },
                { value: 'B', text: 'Iceland' },
                { value: 'C', text: 'Norway' },
              ],
              answer: 'B',
            },
          ],
        },
      ],
    },
  ],
};
