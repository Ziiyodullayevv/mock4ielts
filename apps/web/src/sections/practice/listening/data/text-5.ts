import type { ListeningTest } from '../types';

const DEMO_LISTENING_AUDIO_URL = '/listening/c57cfedc33f14f49870e978fbe231211.mp3';

export const test5: ListeningTest = {
  id: 'test-5',
  title: 'IELTS Listening Practice Test 5',
  difficulty: 'hard',
  description:
    'Travel agency enquiry · University open day · Research grant discussion · Neuroscience lecture',

  parts: [
    // ── PART 1 ─ Form Completion (different format — two columns of info) ────
    {
      number: 1,
      title: 'Part 1 — Travel Agency Booking',
      scenario: 'A woman contacts a travel agency to enquire about a holiday package to Japan.',
      audioUrl: DEMO_LISTENING_AUDIO_URL,
      groups: [
        {
          type: 'form-completion',
          instructions:
            'Complete the form below. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.',
          formTitle: 'Horizon Travel — Customer Enquiry Form',
          sections: [
            {
              heading: 'Customer details',
              fields: [
                {
                  id: 'q1',
                  number: 1,
                  label: 'Customer name:',
                  answerLength: 11,
                  answer: 'Paula Inman',
                },
                { id: 'q2', number: 2, label: 'Mobile:', answerLength: 11, answer: '07900 114378' },
                {
                  id: 'q3',
                  number: 3,
                  label: 'Preferred contact time:',
                  answerLength: 9,
                  answer: 'after 6 pm',
                },
              ],
            },
            {
              heading: 'Holiday requirements',
              fields: [
                { id: 'q4', number: 4, label: 'Destination:', answerLength: 5, answer: 'Japan' },
                {
                  id: 'q5',
                  number: 5,
                  label: 'Departure month:',
                  answerLength: 8,
                  answer: 'November',
                },
                { id: 'q6', number: 6, label: 'Duration (days):', answerLength: 2, answer: '14' },
                {
                  id: 'q7',
                  number: 7,
                  label: 'Number of travellers:',
                  answerLength: 1,
                  answer: '2',
                },
                {
                  id: 'q8',
                  number: 8,
                  label: 'Accommodation type:',
                  answerLength: 9,
                  answer: 'ryokan inn',
                },
              ],
            },
            {
              heading: 'Budget',
              fields: [
                { id: 'q9', number: 9, label: 'Total budget: £', answerLength: 6, answer: '4,500' },
                {
                  id: 'q10',
                  number: 10,
                  label: 'Flexible on dates?',
                  answerLength: 3,
                  answer: 'yes',
                },
              ],
            },
          ],
        },
      ],
    },

    // ── PART 2 ─ Multi-select MC + Note Completion ───────────────────────────
    {
      number: 2,
      title: 'Part 2 — Brentfield University Open Day',
      scenario:
        'A university admissions officer presents information about the university open day programme.',
      audioUrl: DEMO_LISTENING_AUDIO_URL,
      groups: [
        {
          type: 'multiple-choice',
          instructions: 'Choose the correct letter, A, B or C.',
          questions: [
            {
              id: 'q11',
              number: 11,
              text: 'The open day registration deadline is',
              options: [
                { value: 'A', text: 'one week before' },
                { value: 'B', text: 'three days before' },
                { value: 'C', text: 'the day before' },
              ],
              answer: 'B',
            },
            {
              id: 'q12',
              number: 12,
              text: 'Students can book campus accommodation for open day at',
              options: [
                { value: 'A', text: 'no charge' },
                { value: 'B', text: 'a reduced rate' },
                { value: 'C', text: 'the standard price' },
              ],
              answer: 'A',
            },
          ],
        },
        {
          type: 'multiple-choice',
          instructions: 'Choose TWO letters, A–E.',
          questions: [
            {
              id: 'q13',
              number: 13,
              text: 'Which TWO events are available ONLY to applicants (not parents)?',
              multiSelect: true,
              selectCount: 2,
              options: [
                { value: 'A', text: 'subject taster lectures' },
                { value: 'B', text: 'sports facility tour' },
                { value: 'C', text: 'student panel Q&A' },
                { value: 'D', text: 'research lab visit' },
                { value: 'E', text: 'finance talk' },
              ],
              answer: 'A,D',
            },
            {
              id: 'q14',
              number: 14,
              text: 'Which TWO things should visitors bring on the day?',
              multiSelect: true,
              selectCount: 2,
              options: [
                { value: 'A', text: 'photo ID' },
                { value: 'B', text: 'a laptop' },
                { value: 'C', text: 'confirmation email' },
                { value: 'D', text: 'proof of grades' },
                { value: 'E', text: 'a printed campus map' },
              ],
              answer: 'A,C',
            },
          ],
        },
        {
          type: 'note-completion',
          instructions: 'Complete the notes below. Write NO MORE THAN TWO WORDS for each answer.',
          noteTitle: 'Open Day Schedule Highlights',
          sections: [
            {
              heading: 'Morning',
              bullets: [
                {
                  text: '9:30 am — Welcome talk in the',
                  field: {
                    id: 'q15',
                    number: 15,
                    label: '',
                    answerLength: 12,
                    answer: 'main auditorium',
                  },
                },
                {
                  text: '10:30 am — Campus tours depart from',
                  field: {
                    id: 'q16',
                    number: 16,
                    label: '',
                    answerLength: 9,
                    answer: 'South Gate',
                  },
                },
              ],
            },
            {
              heading: 'Afternoon',
              bullets: [
                {
                  text: '1:00 pm — Subject talks (book via',
                  field: { id: 'q17', number: 17, label: '', answerLength: 3, answer: 'app' },
                },
                {
                  text: '3:00 pm — Q&A with',
                  field: {
                    id: 'q18',
                    number: 18,
                    label: '',
                    answerLength: 12,
                    answer: 'current students',
                  },
                },
                {
                  text: '4:30 pm — Close — pick up a free',
                  field: {
                    id: 'q19',
                    number: 19,
                    label: '',
                    answerLength: 11,
                    answer: 'prospectus',
                  },
                },
              ],
            },
            {
              heading: 'Accessibility',
              bullets: [
                {
                  text: 'Wheelchair access available — contact',
                  field: {
                    id: 'q20',
                    number: 20,
                    label: '',
                    answerLength: 10,
                    answer: 'disability team',
                    suffix: 'in advance',
                  },
                },
              ],
            },
          ],
        },
      ],
    },

    // ── PART 3 ─ Matching (features) + Summary (word bank) ──────────────────
    {
      number: 3,
      title: 'Part 3 — Research Grant Application',
      scenario:
        'Two PhD students, Ana and Ben, discuss their grant applications with their supervisor, Professor Kwan.',
      audioUrl: DEMO_LISTENING_AUDIO_URL,
      groups: [
        {
          // Matching: match grant type to its key FEATURE
          type: 'matching',
          instructions:
            'Match each grant type (21–25) with its key feature (A–G). You may use any letter more than once.',
          data: {
            options: [
              { value: 'A', label: 'A  requires industry partnership' },
              { value: 'B', label: 'B  open to all disciplines' },
              { value: 'C', label: 'C  funds travel only' },
              { value: 'D', label: 'D  limited to early-career researchers' },
              { value: 'E', label: 'E  requires a pilot study first' },
              { value: 'F', label: 'F  covers equipment costs' },
              { value: 'G', label: 'G  linked to public engagement' },
            ],
            pairs: [
              { id: 'q21', number: 21, text: 'Innovate UK grant', answer: 'A' },
              { id: 'q22', number: 22, text: 'AHRC fellowship', answer: 'D' },
              { id: 'q23', number: 23, text: 'British Academy small grant', answer: 'B' },
              { id: 'q24', number: 24, text: 'conference travel bursary', answer: 'C' },
              { id: 'q25', number: 25, text: 'Impact Acceleration award', answer: 'G' },
            ],
          },
        },
        {
          type: 'summary-completion',
          instructions:
            'Complete the summary. Choose NO MORE THAN ONE WORD from the box for each answer.',
          summaryTitle: 'Grant Application Tips',
          wordBank: [
            'concise',
            'lengthy',
            'original',
            'funded',
            'rejected',
            'impact',
            'budget',
            'timeline',
          ],
          paragraphs: [
            {
              heading: 'Writing the proposal',
              segments: [
                { type: 'text', content: 'Professor Kwan advises students to keep the abstract ' },
                {
                  type: 'blank',
                  field: { id: 'q26', number: 26, label: '', answerLength: 7, answer: 'concise' },
                },
                {
                  type: 'text',
                  content:
                    ' — panels read dozens of applications. The research question must be clearly ',
                },
                {
                  type: 'blank',
                  field: { id: 'q27', number: 27, label: '', answerLength: 8, answer: 'original' },
                },
                { type: 'text', content: ' and not duplicate previously ' },
                {
                  type: 'blank',
                  field: { id: 'q28', number: 28, label: '', answerLength: 6, answer: 'funded' },
                },
                { type: 'text', content: ' projects.' },
              ],
            },
            {
              heading: 'Common mistakes',
              segments: [
                { type: 'text', content: 'Applications are often ' },
                {
                  type: 'blank',
                  field: { id: 'q29', number: 29, label: '', answerLength: 8, answer: 'rejected' },
                },
                { type: 'text', content: ' because the ' },
                {
                  type: 'blank',
                  field: { id: 'q30', number: 30, label: '', answerLength: 6, answer: 'budget' },
                },
                { type: 'text', content: ' is not adequately justified or the proposed ' },
                {
                  type: 'blank',
                  field: { id: 'q31', number: 31, label: '', answerLength: 8, answer: 'timeline' },
                },
                { type: 'text', content: ' is unrealistic.' },
              ],
            },
          ],
        },
      ],
    },

    // ── PART 4 ─ Sentence Completion + Short Answer ───────────────────────────
    {
      number: 4,
      title: 'Part 4 — Lecture: The Neuroscience of Sleep',
      scenario:
        'A neuroscience lecturer explains the stages and functions of sleep and the effects of sleep deprivation.',
      audioUrl: DEMO_LISTENING_AUDIO_URL,
      groups: [
        {
          type: 'sentence-completion',
          instructions:
            'Complete the sentences below. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.',
          questions: [
            {
              id: 'q32',
              number: 32,
              label: 'A complete sleep cycle lasts approximately',
              suffix: 'minutes.',
              answerLength: 3,
              answer: '90',
            },
            {
              id: 'q33',
              number: 33,
              label: 'The stage responsible for emotional memory consolidation is called',
              answerLength: 3,
              answer: 'REM',
            },
            {
              id: 'q34',
              number: 34,
              label: 'During deep sleep, the brain releases',
              suffix: 'hormone.',
              answerLength: 6,
              answer: 'growth',
            },
            {
              id: 'q35',
              number: 35,
              label: 'People who sleep fewer than 6 hours show reduced',
              suffix: 'performance.',
              answerLength: 9,
              answer: 'cognitive',
            },
            {
              id: 'q36',
              number: 36,
              label: 'Chronic sleep deprivation has been linked to increased risk of',
              answerLength: 8,
              answer: 'diabetes',
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
              label: 'What chemical in the brain promotes drowsiness as it accumulates?',
              answerLength: 9,
              answer: 'adenosine',
            },
            {
              id: 'q38',
              number: 38,
              label: 'What term is used for the internal body clock that regulates sleep cycles?',
              answerLength: 18,
              answer: 'circadian rhythm',
            },
            {
              id: 'q39',
              number: 39,
              label: 'Which colour of light is most disruptive to melatonin production?',
              answerLength: 4,
              answer: 'blue light',
            },
            {
              id: 'q40',
              number: 40,
              label:
                'According to the lecturer, what is the single most effective tip for better sleep?',
              answerLength: 15,
              answer: 'consistent schedule',
            },
          ],
        },
      ],
    },
  ],
};
