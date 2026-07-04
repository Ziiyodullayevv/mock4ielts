import type { ListeningTest } from '../types';

const DEMO_LISTENING_AUDIO_URL = '/listening/c57cfedc33f14f49870e978fbe231211.mp3';

export const test3: ListeningTest = {
  id: 'test-3',
  title: 'IELTS Listening Practice Test 3',
  difficulty: 'medium',
  description:
    'Library membership · Nature reserve tour · Psychology experiment · Climate change lecture',

  parts: [
    // ── PART 1 ─ Form Completion ─────────────────────────────────────────────
    {
      number: 1,
      title: 'Part 1 — Library Membership Application',
      scenario: 'A student is applying for a library membership over the phone.',
      audioUrl: DEMO_LISTENING_AUDIO_URL,
      groups: [
        {
          type: 'form-completion',
          instructions:
            'Complete the form below. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.',
          formTitle: 'Greenfield Public Library — New Member Form',
          sections: [
            {
              heading: 'Applicant Details',
              fields: [
                {
                  id: 'q1',
                  number: 1,
                  label: 'Full name:',
                  answerLength: 12,
                  answer: 'Daniel Watts',
                },
                {
                  id: 'q2',
                  number: 2,
                  label: 'Date of birth:',
                  answerLength: 10,
                  answer: '9th February',
                },
                {
                  id: 'q3',
                  number: 3,
                  label: 'Address:',
                  answerLength: 13,
                  answer: '14 Maple Close',
                },
                { id: 'q4', number: 4, label: 'Postcode:', answerLength: 7, answer: 'SE4 7RJ' },
              ],
            },
            {
              heading: 'Membership Details',
              fields: [
                {
                  id: 'q5',
                  number: 5,
                  label: 'Membership type:',
                  answerLength: 8,
                  answer: 'standard',
                },
                { id: 'q6', number: 6, label: 'Books allowed:', answerLength: 2, answer: '8' },
                {
                  id: 'q7',
                  number: 7,
                  label: 'Loan period (weeks):',
                  answerLength: 1,
                  answer: '3',
                },
                { id: 'q8', number: 8, label: 'Annual fee: £', answerLength: 2, answer: '20' },
              ],
            },
            {
              heading: 'Other',
              fields: [
                {
                  id: 'q9',
                  number: 9,
                  label: 'ID type provided:',
                  answerLength: 11,
                  answer: 'driving licence',
                },
                {
                  id: 'q10',
                  number: 10,
                  label: 'Card ready date:',
                  answerLength: 9,
                  answer: 'next Monday',
                },
              ],
            },
          ],
        },
      ],
    },

    // ── PART 2 ─ Multi-select MC + Map labelling (write-in, no word bank) ───
    {
      number: 2,
      title: 'Part 2 — Lynwood Nature Reserve',
      scenario:
        'A ranger gives a talk to visitors about the nature reserve and its wildlife trail.',
      audioUrl: DEMO_LISTENING_AUDIO_URL,
      groups: [
        {
          type: 'multiple-choice',
          instructions: 'Choose the correct letter, A, B or C.',
          questions: [
            {
              id: 'q11',
              number: 11,
              text: 'The nature reserve was established to protect',
              options: [
                { value: 'A', text: 'migratory bird species' },
                { value: 'B', text: 'ancient woodland habitat' },
                { value: 'C', text: 'a rare wetland ecosystem' },
              ],
              answer: 'C',
            },
            {
              id: 'q12',
              number: 12,
              text: 'Visitors must NOT do which of the following?',
              options: [
                { value: 'A', text: 'bring dogs on leads' },
                { value: 'B', text: 'take photographs' },
                { value: 'C', text: 'pick wildflowers' },
              ],
              answer: 'C',
            },
            {
              id: 'q13',
              number: 13,
              text: 'The new visitor centre will include',
              options: [
                { value: 'A', text: 'a café and gift shop' },
                { value: 'B', text: 'an interactive exhibition' },
                { value: 'C', text: "a children's play area" },
              ],
              answer: 'B',
            },
          ],
        },
        {
          // MULTI-SELECT: pick TWO from FIVE
          type: 'multiple-choice',
          instructions:
            'Choose TWO letters, A–E. Which TWO facilities are available at the reserve entrance?',
          questions: [
            {
              id: 'q14',
              number: 14,
              text: 'Which TWO facilities are available at the reserve entrance?',
              multiSelect: true,
              selectCount: 2,
              options: [
                { value: 'A', text: 'bicycle hire' },
                { value: 'B', text: 'free parking' },
                { value: 'C', text: 'picnic area' },
                { value: 'D', text: 'first aid post' },
                { value: 'E', text: 'guided tour booking' },
              ],
              answer: 'B,D',
            },
            {
              id: 'q15',
              number: 15,
              text: 'Which TWO animals are most commonly seen on the morning trail?',
              multiSelect: true,
              selectCount: 2,
              options: [
                { value: 'A', text: 'otters' },
                { value: 'B', text: 'red kites' },
                { value: 'C', text: 'badgers' },
                { value: 'D', text: 'foxes' },
                { value: 'E', text: 'kingfishers' },
              ],
              answer: 'A,E',
            },
          ],
        },
        {
          // Map labelling — FREE WRITE (no word bank)
          type: 'map-labelling',
          instructions:
            'Label the map of the nature reserve below. Write NO MORE THAN TWO WORDS for each answer.',
          data: {
            wordBank: [], // empty = free write
            pins: [
              { id: 'q16', number: 16, x: 15, y: 18, answer: 'Car park', answerLength: 8 },
              { id: 'q17', number: 17, x: 50, y: 18, answer: 'Information', answerLength: 11 },
              { id: 'q18', number: 18, x: 82, y: 18, answer: 'Bird hide', answerLength: 9 },
              { id: 'q19', number: 19, x: 20, y: 68, answer: 'Pond', answerLength: 4 },
              { id: 'q20', number: 20, x: 70, y: 68, answer: 'Picnic area', answerLength: 10 },
            ],
          },
        },
      ],
    },

    // ── PART 3 ─ Matching (statements) + Summary with word bank ─────────────
    {
      number: 3,
      title: 'Part 3 — Psychology Experiment Discussion',
      scenario:
        'Two students, Lily and Tom, discuss a memory experiment they conducted with their tutor, Dr Patel.',
      audioUrl: DEMO_LISTENING_AUDIO_URL,
      groups: [
        {
          // Matching: match speakers to statements
          type: 'matching',
          instructions:
            'What does each speaker say about the experiment? Match each person (21–25) with a statement (A–G). You may use any letter more than once.',
          data: {
            options: [
              { value: 'A', label: 'A  the results were unexpected' },
              { value: 'B', label: 'B  the sample size was too small' },
              { value: 'C', label: 'C  the procedure needs repeating' },
              { value: 'D', label: 'D  the findings support existing theory' },
              { value: 'E', label: 'E  there was a clear methodological flaw' },
              { value: 'F', label: 'F  the data was difficult to analyse' },
              { value: 'G', label: 'G  participants were not fully briefed' },
            ],
            pairs: [
              { id: 'q21', number: 21, text: 'Lily — about the initial hypothesis', answer: 'A' },
              { id: 'q22', number: 22, text: 'Tom — about participant selection', answer: 'B' },
              { id: 'q23', number: 23, text: 'Dr Patel — about the test conditions', answer: 'E' },
              { id: 'q24', number: 24, text: 'Lily — about the statistical results', answer: 'F' },
              { id: 'q25', number: 25, text: 'Tom — about next steps', answer: 'C' },
            ],
          },
        },
        {
          // Summary completion WITH word bank (drag & drop)
          type: 'summary-completion',
          instructions:
            'Complete the summary below. Choose NO MORE THAN ONE WORD from the box for each answer.',
          summaryTitle: 'Summary of the Memory Experiment',
          wordBank: [
            'visual',
            'auditory',
            'longer',
            'shorter',
            'accurate',
            'random',
            'structured',
            'written',
          ],
          paragraphs: [
            {
              heading: 'Design',
              segments: [
                { type: 'text', content: 'The experiment used a ' },
                {
                  type: 'blank',
                  field: {
                    id: 'q26',
                    number: 26,
                    label: '',
                    answerLength: 10,
                    answer: 'structured',
                  },
                },
                { type: 'text', content: ' approach in which participants were shown ' },
                {
                  type: 'blank',
                  field: { id: 'q27', number: 27, label: '', answerLength: 6, answer: 'visual' },
                },
                { type: 'text', content: ' stimuli for two minutes.' },
              ],
            },
            {
              heading: 'Results',
              segments: [
                {
                  type: 'text',
                  content: 'Participants who reviewed material before sleep gave more ',
                },
                {
                  type: 'blank',
                  field: { id: 'q28', number: 28, label: '', answerLength: 8, answer: 'accurate' },
                },
                { type: 'text', content: ' responses. Recall was also ' },
                {
                  type: 'blank',
                  field: { id: 'q29', number: 29, label: '', answerLength: 6, answer: 'longer' },
                },
                { type: 'text', content: ' than in the control group.' },
              ],
            },
            {
              heading: 'Conclusion',
              segments: [
                { type: 'text', content: 'The team concluded that ' },
                {
                  type: 'blank',
                  field: { id: 'q30', number: 30, label: '', answerLength: 8, answer: 'auditory' },
                },
                {
                  type: 'text',
                  content: ' cues during encoding did not significantly improve outcomes.',
                },
              ],
            },
          ],
        },
      ],
    },

    // ── PART 4 ─ Sentence Completion + Multi-select MC ────────────────────────
    {
      number: 4,
      title: 'Part 4 — Lecture: Climate Change Adaptation',
      scenario:
        'A lecturer discusses how communities and governments are adapting to the effects of climate change.',
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
              label: 'Sea levels have risen by approximately',
              suffix: 'cm since 1900.',
              answerLength: 2,
              answer: '20',
            },
            {
              id: 'q32',
              number: 32,
              label: 'The biggest threat to coastal cities is',
              answerLength: 8,
              answer: 'flooding',
            },
            {
              id: 'q33',
              number: 33,
              label: 'The Netherlands has invested in',
              suffix: 'to protect low-lying areas.',
              answerLength: 9,
              answer: 'sea walls',
            },
            {
              id: 'q34',
              number: 34,
              label: '"Green roofs" help reduce',
              suffix: 'in urban areas.',
              answerLength: 12,
              answer: 'heat islands',
            },
            {
              id: 'q35',
              number: 35,
              label: 'The Paris Agreement targets a maximum temperature rise of',
              suffix: '°C.',
              answerLength: 3,
              answer: '1.5',
            },
          ],
        },
        {
          type: 'multiple-choice',
          instructions:
            'Choose the correct letter, A, B or C for questions 36–37. For questions 38–40, choose TWO letters, A–E.',
          questions: [
            {
              id: 'q36',
              number: 36,
              text: 'Which sector produces the MOST greenhouse gases globally?',
              options: [
                { value: 'A', text: 'transport' },
                { value: 'B', text: 'energy production' },
                { value: 'C', text: 'agriculture' },
              ],
              answer: 'B',
            },
            {
              id: 'q37',
              number: 37,
              text: 'The lecturer says the most cost-effective adaptation strategy is',
              options: [
                { value: 'A', text: 'relocating coastal populations' },
                { value: 'B', text: 'improving early warning systems' },
                { value: 'C', text: 'planting mangrove forests' },
              ],
              answer: 'C',
            },
            {
              id: 'q38',
              number: 38,
              text: 'Which TWO countries are cited as leading examples of renewable transition?',
              multiSelect: true,
              selectCount: 2,
              options: [
                { value: 'A', text: 'Germany' },
                { value: 'B', text: 'Brazil' },
                { value: 'C', text: 'Japan' },
                { value: 'D', text: 'Costa Rica' },
                { value: 'E', text: 'India' },
              ],
              answer: 'A,D',
            },
            {
              id: 'q39',
              number: 39,
              text: 'Which TWO obstacles to adaptation does the lecturer mention?',
              multiSelect: true,
              selectCount: 2,
              options: [
                { value: 'A', text: 'lack of public awareness' },
                { value: 'B', text: 'political resistance' },
                { value: 'C', text: 'shortage of land' },
                { value: 'D', text: 'insufficient funding' },
                { value: 'E', text: 'poor data collection' },
              ],
              answer: 'B,D',
            },
            {
              id: 'q40',
              number: 40,
              text: 'Which TWO benefits of urban tree planting are mentioned?',
              multiSelect: true,
              selectCount: 2,
              options: [
                { value: 'A', text: 'reducing noise pollution' },
                { value: 'B', text: 'improving air quality' },
                { value: 'C', text: 'lowering temperatures' },
                { value: 'D', text: 'preventing soil erosion' },
                { value: 'E', text: 'increasing property value' },
              ],
              answer: 'B,C',
            },
          ],
        },
      ],
    },
  ],
};
