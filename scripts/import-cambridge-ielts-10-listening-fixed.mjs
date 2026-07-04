const API_BASE = 'https://mockapi.mock4ielts.uz/api/v1';
const EMAIL = process.env.MOCK4IELTS_ADMIN_EMAIL;
const PASSWORD = process.env.MOCK4IELTS_ADMIN_PASSWORD;

if (!EMAIL || !PASSWORD) throw new Error('Set MOCK4IELTS_ADMIN_EMAIL and MOCK4IELTS_ADMIN_PASSWORD.');

const A = (value) =>
  typeof value === 'string' && value.includes('/')
    ? value.split('/').map((item) => item.trim()).filter(Boolean)
    : [value];

const options = (items) => items.map(([label, text]) => ({ label, text }));
const mapAnswers = (entries) => Object.fromEntries(entries.map(([key, value]) => [String(key), A(value)]));

function blankQ({ type = 'note_completion', text, order, correct, metadata }) {
  return {
    question_type: type,
    text,
    options: null,
    correct_answer: correct,
    explanation: null,
    points: 1,
    order,
    metadata,
    image_url: null,
  };
}

function choiceQ({ text, order, correct, opts, group }) {
  return {
    question_type: 'single_choice',
    text,
    options: options(opts),
    correct_answer: correct,
    explanation: null,
    points: 1,
    order,
    metadata: group || null,
    image_url: null,
  };
}

function multiQ({ text, order, correct, opts, selectCount = 2, instruction }) {
  return {
    question_type: 'multiple_choice',
    text,
    options: options(opts),
    correct_answer: correct,
    explanation: null,
    points: 1,
    order,
    metadata: { select_count: selectCount, instruction },
    image_url: null,
  };
}

function matchingQ({ text, order, correct, opts, items, instruction }) {
  return {
    question_type: 'matching',
    text,
    options: options(opts),
    correct_answer: correct,
    explanation: null,
    points: 1,
    order,
    metadata: { items, input_mode: 'select', instruction, reuse_options: true },
    image_url: null,
  };
}

function section(test, parts) {
  return {
    section_type: 'listening',
    exam_type: 'academic',
    title: `Cambridge IELTS 10 Test ${test} - Listening`,
    instructions: `Cambridge IELTS 10 Test ${test} Listening.`,
    duration_minutes: 30,
    difficulty: 'medium',
    tags: ['cambridge-ielts-10', `test-${test}`, 'listening', 'fixed-format'],
    parts,
  };
}

function toBackendBlankHtml(value) {
  if (typeof value === 'string') {
    return value
      .replace(/___(\d+)___/g, '<b>$1</b> _____')
      .replace(/24\s+<b>1<\/b> _____ Road/g, 'House number: 24; Street: <b>1</b> _____ Road');
  }
  if (Array.isArray(value)) return value.map(toBackendBlankHtml);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [key, toBackendBlankHtml(child)])
    );
  }
  return value;
}

const tests = [
  section(1, [
    {
      title: 'Section 1',
      instructions: 'Questions 1-10',
      order: 0,
      questions: [
        blankQ({
          type: 'form_completion',
          text: 'SELF-DRIVE TOURS IN THE USA',
          order: 1,
          correct: mapAnswers([[1, 'Ardleigh'], [2, 'newspaper'], [3, 'theme'], [4, 'tent'], [5, 'castle'], [6, 'beach/beaches']]),
          metadata: {
            slot_ids: ['1', '2', '3', '4', '5', '6'],
            word_limit: 1,
            instruction: 'Complete the notes below. Write ONE WORD for each answer.',
            form_html:
              '<h4>SELF-DRIVE TOURS IN THE USA</h4><p><strong>Example</strong> Name: Andrea Brown</p><p>Address: House number: twenty-four; Street: ___1___ Road</p><p>Postcode: BH5 2OP</p><p>Phone: (mobile) 07786 643091</p><p>Heard about company from: ___2___</p><h5>Possible self-drive tours</h5><p><strong>Trip One:</strong> Los Angeles: customer wants to visit some ___3___ parks with her children.</p><p><strong>Trip One:</strong> Yosemite Park: customer wants to stay in a lodge, not a ___4___.</p><p><strong>Trip Two:</strong> Customer wants to see the ___5___ on the way to Cambria.</p><p><strong>Trip Two:</strong> At Santa Monica: not interested in shopping. At San Diego, wants to spend time on the ___6___.</p>',
          },
        }),
        blankQ({
          type: 'table_completion',
          text: 'Trip details',
          order: 7,
          correct: mapAnswers([[7, '2020'], [8, 'flight'], [9, '429'], [10, 'dinner']]),
          metadata: {
            slot_ids: ['7', '8', '9', '10'],
            word_limit: 1,
            instruction: 'Complete the table below. Write ONE WORD AND/OR A NUMBER for each answer.',
            table: {
              headers: ['Trip', 'Number of days', 'Total distance', 'Price per person', 'Includes'],
              rows: [
                ['Trip One', '12 days', '___7___ km', '£525', 'accommodation; car; one ___8___'],
                ['Trip Two', '9 days', '980 km', '£___9___', 'accommodation; car; ___10___'],
              ],
            },
          },
        }),
      ],
    },
    {
      title: 'Section 2',
      instructions: 'Questions 11-20',
      order: 1,
      questions: [
        multiQ({
          text: 'Which TWO facilities at the leisure club have recently been improved?',
          order: 11,
          correct: ['A', 'C'],
          instruction: 'Choose TWO letters, A-E.',
          opts: [['A', 'the gym'], ['B', 'the tracks'], ['C', 'the indoor pool'], ['D', 'the outdoor pool'], ['E', 'the sports training for children']],
        }),
        blankQ({
          text: 'Joining the leisure club',
          order: 13,
          correct: mapAnswers([[13, 'health problems'], [14, 'safety rules'], [15, 'plan'], [16, 'joining'], [17, 'free entry'], [18, 'peak'], [19, 'guests'], [20, 'photo card/photo cards']]),
          metadata: {
            slot_ids: ['13', '14', '15', '16', '17', '18', '19', '20'],
            word_limit: 2,
            instruction: 'Complete the notes below. Write NO MORE THAN TWO WORDS for each answer.',
            notes_html:
              '<h4>Joining the leisure club</h4><h5>Personal Assessment</h5><ul><li>New members should describe any ___13___.</li><li>The ___14___ will be explained to you before you use the equipment.</li><li>You will be given a six-week ___15___.</li></ul><h5>Types of membership</h5><ul><li>There is a compulsory ninety-pound ___16___ fee for members.</li><li>Gold members are given ___17___ to all the LP clubs.</li><li>Premier members are given priority during ___18___ hours.</li><li>Premier members can bring some ___19___ every month.</li><li>Members should always take their ___20___ with them.</li></ul>',
          },
        }),
      ],
    },
    {
      title: 'Section 3',
      instructions: 'Questions 21-30',
      order: 2,
      questions: [
        ...[
          [21, 'Students entering the design competition have to', 'C', [['A', 'produce an energy-efficient design'], ['B', 'adapt an existing energy-saving appliance'], ['C', 'develop a new use for current technology']]],
          [22, 'John chose a dishwasher because he wanted to make dishwashers', 'A', [['A', 'more appealing'], ['B', 'more common'], ['C', 'more economical']]],
          [23, "The stone in John's 'Rockpool' design is used", 'B', [['A', 'for decoration'], ['B', 'to switch it on'], ['C', 'to stop water escaping']]],
          [24, 'In the holding chamber, the carbon dioxide', 'A', [['A', 'changes back to a gas'], ['B', 'dries the dishes'], ['C', 'is allowed to cool']]],
          [25, 'At the end of the cleaning process, the carbon dioxide', 'C', [['A', 'is released into the air'], ['B', 'is disposed of with the waste'], ['C', 'is collected ready to be re-used']]],
        ].map(([order, text, correct, opts], idx) =>
          choiceQ({
            text,
            order,
            correct,
            opts,
            group: idx === 0 ? { group_label: 'Questions 21-25', group_instruction: 'Choose the correct letter, A, B or C.' } : { group_id: 'q21-25' },
          })
        ),
        blankQ({
          text: 'Global Design Competition notes',
          order: 26,
          correct: mapAnswers([[26, 'presentation'], [27, 'model'], [28, 'material/materials'], [29, 'grant'], [30, 'technical']]),
          metadata: {
            slot_ids: ['26', '27', '28', '29', '30'],
            word_limit: 1,
            instruction: 'Complete the notes below. Write ONE WORD ONLY for each answer.',
            notes_html:
              '<ul><li>John needs help preparing for his ___26___.</li><li>The professor advises John to make a ___27___ of his design.</li><li>John’s main problem is getting good quality ___28___.</li><li>The professor suggests John apply for a ___29___.</li><li>The professor will check the ___30___ information in John’s written report.</li></ul>',
          },
        }),
      ],
    },
    {
      title: 'Section 4',
      instructions: 'Questions 31-40',
      order: 3,
      questions: [
        blankQ({
          text: 'THE SPIRIT BEAR',
          order: 31,
          correct: mapAnswers([[31, 'gene'], [32, 'power/powers'], [33, 'strangers'], [34, 'erosion'], [35, 'islands'], [36, 'roads'], [37, 'fishing'], [38, 'reproduction'], [39, 'method/methods'], [40, 'expansion']]),
          metadata: {
            slot_ids: ['31', '32', '33', '34', '35', '36', '37', '38', '39', '40'],
            word_limit: 1,
            instruction: 'Complete the notes below. Write ONE WORD ONLY for each answer.',
            notes_html:
              '<h4>THE SPIRIT BEAR</h4><h5>General facts</h5><ul><li>Its colour comes from an uncommon ___31___.</li><li>Local people believe that it has unusual ___32___.</li><li>They protect the bear from ___33___.</li></ul><h5>Habitat</h5><ul><li>Tree roots stop ___34___ along salmon streams.</li><li>It is currently found on a small number of ___35___.</li></ul><h5>Threats</h5><ul><li>Habitat is being lost due to deforestation and construction of ___36___ by logging companies.</li><li>Unrestricted ___37___ is affecting the salmon supply.</li><li>The bears’ existence is also threatened by their low rate of ___38___.</li></ul><h5>Going forward</h5><ul><li>Logging companies must improve their ___39___ of logging.</li><li>Maintenance and ___40___ of the spirit bears’ territory is needed.</li></ul>',
          },
        }),
      ],
    },
  ]),
  section(2, [
    {
      title: 'Section 1',
      instructions: 'Questions 1-10',
      order: 0,
      questions: [
        blankQ({
          text: 'Transport Survey',
          order: 1,
          correct: mapAnswers([[1, 'Hardie'], [2, '19'], [3, 'GT8 2LC'], [4, 'hairdresser'], [5, "dentist/dentist's"], [6, 'lighting'], [7, 'trains'], [8, 'safe'], [9, 'shower'], [10, 'training']]),
          metadata: {
            slot_ids: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
            word_limit: 1,
            instruction: 'Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.',
            notes_html:
              '<h4>Transport Survey</h4><p><strong>Example</strong> Travelled to town today: by bus</p><p>Name: Luisa ___1___</p><p>Address: ___2___ White Stone Rd</p><p>Area: Bradfield</p><p>Postcode: ___3___</p><p>Occupation: ___4___</p><p>Reason for visit to town: to go to the ___5___</p><h5>Suggestions for improvement</h5><ul><li>better ___6___</li><li>have more footpaths</li><li>more frequent ___7___</li></ul><h5>Things that would encourage cycling to work</h5><ul><li>having ___8___ parking places for bicycles</li><li>being able to use a ___9___ at work</li><li>the opportunity to have cycling ___10___ on busy roads</li></ul>',
          },
        }),
      ],
    },
    {
      title: 'Section 2',
      instructions: 'Questions 11-20',
      order: 1,
      questions: [
        ...[
          [11, 'The idea for the two new developments in the city came from', 'A', [['A', 'local people'], ['B', 'the City Council'], ['C', 'the SWRDC']]],
          [12, 'What is unusual about Brackenside pool?', 'C', [['A', 'its architectural style'], ['B', 'its heating system'], ['C', 'its method of water treatment']]],
          [13, 'Local newspapers have raised worries about', 'C', [['A', 'the late opening date'], ['B', 'the cost of the project'], ['C', 'the size of the facilities']]],
          [14, 'What decision has not yet been made about the pool?', 'A', [['A', 'whose statue will be at the door'], ['B', 'the exact opening times'], ['C', 'who will open it']]],
        ].map(([order, text, correct, opts], idx) =>
          choiceQ({ text, order, correct, opts, group: idx === 0 ? { group_label: 'Questions 11-14', group_instruction: 'Choose the correct letter, A, B or C.' } : { group_id: 'q11-14' } })
        ),
        matchingQ({
          text: 'Which feature is related to each area of the world represented in the playground?',
          order: 15,
          correct: { 15: 'E', 16: 'C', 17: 'I', 18: 'G', 19: 'A', 20: 'B' },
          opts: [['A', 'ancient forts'], ['B', 'waterways'], ['C', 'ice and snow'], ['D', 'jewels'], ['E', 'local animals'], ['F', 'mountains'], ['G', 'music and film'], ['H', 'space travel'], ['I', 'volcanoes']],
          items: ['Asia', 'Antarctica', 'South America', 'North America', 'Europe', 'Africa'].map((text, i) => ({ order: 15 + i, text })),
          instruction: 'Choose SIX answers from the box and write the correct letter, A-I, next to questions 15-20.',
        }),
      ],
    },
    {
      title: 'Section 3',
      instructions: 'Questions 21-30',
      order: 2,
      questions: [
        multiQ({ text: 'Which TWO hobbies was Thor Heyerdahl very interested in as a youth?', order: 21, correct: ['B', 'C'], instruction: 'Choose TWO letters, A-E.', opts: [['A', 'camping'], ['B', 'climbing'], ['C', 'collecting'], ['D', 'hunting'], ['E', 'reading']] }),
        multiQ({ text: 'Which TWO reasons do the speakers give for why Heyerdahl went to live on an island?', order: 23, correct: ['B', 'E'], instruction: 'Choose TWO letters, A-E.', opts: [['A', 'to examine ancient carvings'], ['B', 'to experience an isolated place'], ['C', 'to formulate a new theory'], ['D', 'to learn survival skills'], ['E', 'to study the impact of an extreme environment']] }),
        ...[
          [25, 'According to Victor and Olivia, academics thought that Polynesian migration from the east was impossible due to', 'A', [['A', 'the fact that Eastern countries were far away'], ['B', 'the lack of materials for boat building'], ['C', 'the direction of the winds and currents']]],
          [26, "Which do the speakers agree was the main reason for Heyerdahl's raft journey?", 'C', [['A', 'to overcome a research setback'], ['B', 'to demonstrate a personal quality'], ['C', 'to test a new theory']]],
          [27, 'What was most important to Heyerdahl about his raft journey?', 'C', [['A', 'the fact that he was the first person to do it'], ['B', 'the speed of crossing the Pacific'], ['C', 'the use of authentic construction methods']]],
          [28, 'Why did Heyerdahl go to Easter Island?', 'A', [['A', 'to build a stone statue'], ['B', 'to sail a reed boat'], ['C', 'to learn the local language']]],
          [29, "In Olivia's opinion, Heyerdahl's greatest influence was on", 'B', [['A', 'theories about Polynesian origins'], ['B', 'the development of archaeological methodology'], ['C', 'establishing archaeology as an academic subject']]],
          [30, "Which criticism do the speakers make of William Oliver's textbook?", 'A', [['A', 'Its style is out of date'], ['B', 'Its content is over-simplified'], ['C', 'Its methodology is flawed']]],
        ].map(([order, text, correct, opts], idx) =>
          choiceQ({ text, order, correct, opts, group: idx === 0 ? { group_label: 'Questions 25-30', group_instruction: 'Choose the correct letter, A, B or C.' } : { group_id: 'q25-30' } })
        ),
      ],
    },
    {
      title: 'Section 4',
      instructions: 'Questions 31-40',
      order: 3,
      questions: [
        blankQ({
          text: 'THE FUTURE OF MANAGEMENT',
          order: 31,
          correct: mapAnswers([[31, 'competition'], [32, 'global'], [33, 'demand'], [34, 'customers'], [35, 'regulation'], [36, 'project'], [37, 'flexible'], [38, 'leadership'], [39, 'women'], [40, 'self-employed']]),
          metadata: {
            slot_ids: ['31', '32', '33', '34', '35', '36', '37', '38', '39', '40'],
            word_limit: 1,
            instruction: 'Complete the notes below. Write ONE WORD ONLY for each answer.',
            notes_html:
              '<h4>THE FUTURE OF MANAGEMENT</h4><h5>Business markets</h5><ul><li>greater ___31___ among companies</li><li>increase in power of large ___32___ companies</li><li>rising ___33___ in certain countries</li></ul><h5>External influences on businesses</h5><ul><li>more discussion with ___34___ before making business decisions</li><li>environmental concerns which may lead to more ___35___</li></ul><h5>Business structures</h5><ul><li>more teams will be formed to work on a particular ___36___</li><li>businesses may need to offer hours that are ___37___, or the chance to work remotely</li></ul><h5>Management styles</h5><ul><li>increasing need for managers to provide good ___38___</li><li>changes influenced by ___39___ taking senior roles</li></ul><h5>Changes in the economy</h5><ul><li>more and more ___40___ workers</li></ul>',
          },
        }),
      ],
    },
  ]),
  section(4, [
    {
      title: 'Section 1',
      instructions: 'Questions 1-10',
      order: 0,
      questions: [
        blankQ({
          type: 'form_completion',
          text: "THORNDYKE'S BUILDERS",
          order: 1,
          correct: mapAnswers([[1, 'Pargetter'], [2, 'East'], [3, 'library'], [4, 'morning/mornings'], [5, 'postbox'], [6, 'prices']]),
          metadata: {
            slot_ids: ['1', '2', '3', '4', '5', '6'],
            word_limit: 1,
            instruction: 'Complete the notes below. Write ONE WORD ONLY for each answer.',
            form_html:
              "<h4>THORNDYKE'S BUILDERS</h4><p><strong>Example</strong> Customer heard about Thorndyke's from a friend</p><p>Name: Edith ___1___</p><p>Address: Flat four, ___2___ Park Flats</p><p>Behind the ___3___</p><p>Phone number: 875934</p><p>Best time to contact customer: during the ___4___</p><p>Where to park: opposite entrance next to the ___5___</p><p>Needs full quote showing all the jobs and the ___6___</p>",
          },
        }),
        blankQ({
          type: 'table_completion',
          text: 'Builders work table',
          order: 7,
          correct: mapAnswers([[7, 'glass'], [8, 'cooker'], [9, 'week'], [10, 'fence']]),
          metadata: {
            slot_ids: ['7', '8', '9', '10'],
            word_limit: 1,
            instruction: 'Complete the table below. Write ONE WORD ONLY for each answer.',
            table: {
              headers: ['Area', 'Work to be done', 'Notes'],
              rows: [
                ['Kitchen', 'Replace the ___7___ in the door', 'Fix tomorrow'],
                ['Kitchen', 'Paint wall above the ___8___', 'Strip paint and plaster approximately one ___9___ in advance'],
                ['Garden', 'One ___10___ needs replacing (end of garden)', ''],
              ],
            },
          },
        }),
      ],
    },
    {
      title: 'Section 2',
      instructions: 'Questions 11-20',
      order: 1,
      questions: [
        ...[
          [11, 'Why did a port originally develop at Manham?', 'B', [['A', 'It was safe from enemy attack'], ['B', 'It was convenient for river transport'], ['C', 'It had a good position on the sea coast']]],
          [12, "What caused Manham's sudden expansion during the Industrial Revolution?", 'B', [['A', 'the improvement in mining techniques'], ['B', 'the increase in demand for metals'], ['C', 'the discovery of tin in the area']]],
          [13, 'Why did rocks have to be sent away from Manham to be processed?', 'A', [['A', 'shortage of fuel'], ['B', 'poor transport systems'], ['C', 'lack of skills among local people']]],
          [14, 'What happened when the port declined in the twentieth century?', 'A', [['A', 'The workers went away'], ['B', 'Traditional skills were lost'], ['C', 'Buildings were used for new purposes']]],
          [15, 'What did the Manham Trust hope to do?', 'C', [['A', 'discover the location of the original port'], ['B', 'provide jobs for the unemployed'], ['C', 'rebuild the port complex']]],
        ].map(([order, text, correct, opts], idx) =>
          choiceQ({ text, order, correct, opts, group: idx === 0 ? { group_label: 'Questions 11-15', group_instruction: 'Choose the correct letter, A, B or C.' } : { group_id: 'q11-15' } })
        ),
        blankQ({
          type: 'table_completion',
          text: 'Tourist attractions in Manham',
          order: 16,
          correct: mapAnswers([[16, 'trains'], [17, 'dark'], [18, 'games'], [19, 'guided tour'], [20, 'ladder/ladders']]),
          metadata: {
            slot_ids: ['16', '17', '18', '19', '20'],
            word_limit: 2,
            instruction: 'Complete the table below. Write NO MORE THAN TWO WORDS for each answer.',
            table: {
              headers: ['Place', 'Features and activities', 'Advice'],
              rows: [
                ['copper mine', 'specially adapted miners’ ___16___ take visitors into the mountain', 'the mine is ___17___ and enclosed - unsuitable for children and animals'],
                ['village school', 'classrooms and a special exhibition of ___18___', ''],
                ['The George (old sailing ship)', 'the ship’s wheel (was lost but has now been restored)', 'a ___19___ is recommended'],
                ['The George (old sailing ship)', '', 'children should not use the ___20___'],
              ],
            },
          },
        }),
      ],
    },
    {
      title: 'Section 3',
      instructions: 'Questions 21-30',
      order: 2,
      questions: [
        multiQ({ text: 'Which TWO skills did Laura improve as a result of her work placement?', order: 21, correct: ['A', 'E'], instruction: 'Choose TWO letters, A-E.', opts: [['A', 'communication'], ['B', 'design'], ['C', 'IT'], ['D', 'marketing'], ['E', 'organisation']] }),
        multiQ({ text: "Which TWO immediate benefits did the company get from Laura's work placement?", order: 23, correct: ['B', 'C'], instruction: 'Choose TWO letters, A-E.', opts: [['A', 'updates for its software'], ['B', 'cost savings'], ['C', 'an improved image'], ['D', 'new clients'], ['E', 'a growth in sales']] }),
        matchingQ({
          text: 'What source of information should Tim use at each stage of the work placement?',
          order: 25,
          correct: { 25: 'D', 26: 'F', 27: 'G', 28: 'B', 29: 'E', 30: 'C' },
          opts: [['A', 'company manager'], ['B', 'company’s personnel department'], ['C', 'personal tutor'], ['D', 'psychology department'], ['E', 'mentor'], ['F', 'university careers officer'], ['G', 'internet']],
          items: ['obtaining booklet', 'discussing options', 'getting updates', 'responding to invitation for interview', 'informing about outcome of interview', 'requesting a reference'].map((text, i) => ({ order: 25 + i, text })),
          instruction: 'Choose SIX answers from the box and write the correct letter, A-G, next to questions 25-30.',
        }),
      ],
    },
    {
      title: 'Section 4',
      instructions: 'Questions 31-40',
      order: 3,
      questions: [
        ...[
          [31, 'The speaker says that one problem with nanotechnology is that', 'C', [['A', 'it could threaten our way of life'], ['B', 'it could be used to spy on people'], ['C', 'it is misunderstood by the public']]],
          [32, 'According to the speaker, some scientists believe that nano-particles', 'B', [['A', 'should be restricted to secure environments'], ['B', 'should be used with more caution'], ['C', 'should only be developed for essential products']]],
          [33, "In the speaker's opinion, research into nanotechnology", 'C', [['A', 'has yet to win popular support'], ['B', 'could be seen as unethical'], ['C', 'ought to be continued']]],
        ].map(([order, text, correct, opts], idx) =>
          choiceQ({ text, order, correct, opts, group: idx === 0 ? { group_label: 'Questions 31-33', group_instruction: 'Choose the correct letter, A, B or C.' } : { group_id: 'q31-33' } })
        ),
        blankQ({
          text: 'Uses of Nanotechnology',
          order: 34,
          correct: mapAnswers([[34, 'metal/metals'], [35, 'space'], [36, 'memory'], [37, 'solar'], [38, 'oil'], [39, 'waste'], [40, 'tests']]),
          metadata: {
            slot_ids: ['34', '35', '36', '37', '38', '39', '40'],
            word_limit: 1,
            instruction: 'Complete the notes below. Write ONE WORD ONLY for each answer.',
            notes_html:
              '<h4>Uses of Nanotechnology</h4><h5>Transport</h5><ul><li>Nanotechnology could allow the development of stronger ___34___.</li><li>___35___ travel will be made available to the masses.</li></ul><h5>Technology</h5><ul><li>Computers will be even smaller, faster, and will have a greater ___36___.</li><li>___37___ energy will become more affordable.</li></ul><h5>The Environment</h5><ul><li>Pollutants such as ___38___ could be removed from water more easily.</li><li>There will be no ___39___ from manufacturing.</li></ul><h5>Health and Medicine</h5><ul><li>Analysis of medical ___40___ will be speeded up.</li></ul>',
          },
        }),
      ],
    },
  ]),
];

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
  const login = await api('/admin/auth/login', { method: 'POST', body: JSON.stringify({ email: EMAIL, password: PASSWORD }) });
  const headers = { Authorization: `Bearer ${login.data.access_token}` };
  const existing = await api('/admin/sections?page=1&size=100&q=Cambridge%20IELTS%2010', { headers });
  const titles = new Set((existing.data || []).map((item) => item.title));
  const results = [];
  for (const payload of tests) {
    if (titles.has(payload.title)) {
      results.push({ title: payload.title, status: 'skipped_existing' });
      continue;
    }
    const created = await api('/admin/sections', {
      method: 'POST',
      headers,
      body: JSON.stringify(toBackendBlankHtml(payload)),
    });
    results.push({ title: payload.title, status: 'created', id: created.data?.id, total: created.data?.total_questions });
  }
  console.log(JSON.stringify(results, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
