const API_BASE = 'https://mockapi.mock4ielts.uz/api/v1';
const EMAIL = process.env.MOCK4IELTS_ADMIN_EMAIL;
const PASSWORD = process.env.MOCK4IELTS_ADMIN_PASSWORD;

if (!EMAIL || !PASSWORD) throw new Error('Set MOCK4IELTS_ADMIN_EMAIL and MOCK4IELTS_ADMIN_PASSWORD.');

const OLD_IDS = {
  2: '37b3a11f-5f44-4ab5-9954-75ff696a0f84',
  3: 'add7a432-3d50-4d6d-9d44-c719878b8f94',
  4: '8e6e6134-13ec-493b-a10a-cec4d5942821',
};

const options = (items) => items.map(([label, text]) => ({ label, text }));
const blankAnswers = (numbers) => Object.fromEntries(numbers.map((number) => [String(number), ['']]));

function statementQ({ order, text, type = 'true_false_not_given', groupId, instruction }) {
  return {
    question_type: type,
    text,
    options: null,
    correct_answer: '',
    explanation: null,
    points: 1,
    order,
    metadata: { group_id: groupId, group_instruction: instruction },
    image_url: null,
  };
}

function singleChoiceQ(order, text, opts, instruction = 'Choose the correct letter, A, B, C or D.') {
  return {
    question_type: 'single_choice',
    text,
    options: options(opts),
    correct_answer: '',
    explanation: null,
    points: 1,
    order,
    metadata: { instruction },
    image_url: null,
  };
}

function matchingQ({ type, order, text, opts, items, instruction }) {
  return {
    question_type: type,
    text,
    options: options(opts),
    correct_answer: blankAnswers(items.map((item) => item.order)),
    explanation: null,
    points: items.length,
    order,
    metadata: { items, input_mode: 'select', instruction, reuse_options: true },
    image_url: null,
  };
}

function sentenceQ({ order, text, numbers, sentences, instruction, wordLimit = 3 }) {
  return {
    question_type: 'sentence_completion',
    text,
    options: null,
    correct_answer: blankAnswers(numbers),
    explanation: null,
    points: numbers.length,
    order,
    metadata: { sentences, instruction, word_limit: wordLimit },
    image_url: null,
  };
}

function noteQ({ order, text, numbers, notesHtml, instruction, wordLimit = 2 }) {
  return {
    question_type: 'note_completion',
    text,
    options: null,
    correct_answer: blankAnswers(numbers),
    explanation: null,
    points: numbers.length,
    order,
    metadata: { notes_html: notesHtml, instruction, word_limit: wordLimit, slot_ids: numbers.map(String) },
    image_url: null,
  };
}

function summaryQ({ type = 'summary_completion_free', order, text, numbers, summaryText, opts, instruction, wordLimit = 2 }) {
  return {
    question_type: type,
    text,
    options: opts ? options(opts) : null,
    correct_answer: blankAnswers(numbers),
    explanation: null,
    points: numbers.length,
    order,
    metadata: { summary_text: summaryText, instruction, word_limit: wordLimit },
    image_url: null,
  };
}

function section(test, passages, questions) {
  return {
    section_type: 'reading',
    exam_type: 'academic',
    title: `Cambridge IELTS 10 Test ${test} - Reading`,
    instructions: `Cambridge IELTS 10 Test ${test} Academic Reading.`,
    duration_minutes: 60,
    difficulty: 'medium',
    tags: ['cambridge-ielts-10', `test-${test}`, 'reading', 'fixed-format'],
    parts: passages.map((passage, index) => ({
      title: `Reading Passage ${index + 1}`,
      passage_text: passage,
      passage_source: 'Cambridge IELTS 10',
      instructions: index === 0 ? 'Questions 1-13' : index === 1 ? 'Questions 14-26' : 'Questions 27-40',
      order: index,
      questions: questions[index],
    })),
  };
}

const tfng = 'Do the following statements agree with the information given in the reading passage?';
const ynng = 'Do the following statements agree with the views or claims of the writer?';

function payloadFor(test, passages) {
  if (test === 2) {
    return section(test, passages, [
      [
        matchingQ({
          type: 'matching_headings',
          order: 1,
          text: 'Questions 1-7',
          instruction: 'Reading Passage 1 has seven paragraphs, A-G. Choose the correct heading for each paragraph from the list of headings below.',
          opts: [['i', 'The search for the reasons for an increase in population'], ['ii', 'Industrialisation and the fear of unemployment'], ['iii', 'The development of cities in Japan'], ['iv', 'The time and place of the Industrial Revolution'], ['v', 'The cases of Holland, France and China'], ['vi', 'Changes in drinking habits in Britain'], ['vii', "Two keys to Britain's industrial revolution"], ['viii', 'Conditions required for industrialisation'], ['ix', 'Comparisons with Japan lead to the answer']],
          items: ['A', 'B', 'C', 'D', 'E', 'F', 'G'].map((letter, index) => ({ order: index + 1, text: `Paragraph ${letter}` })),
        }),
        ...[
          [8, "China's transport system was not suitable for industry in the 18th century."],
          [9, 'Tea and beer both helped to prevent dysentery in Britain.'],
          [10, "Roy Porter disagrees with Professor Macfarlane's findings."],
          [11, 'After 1740, there was a reduction in population in Britain.'],
          [12, 'People in Britain used to make beer at home.'],
          [13, 'The tax on malt indirectly caused a rise in the death rate.'],
        ].map(([order, text]) => statementQ({ order, text, groupId: 'test2-p1-q8-13', instruction: tfng })),
      ],
      [
        matchingQ({
          type: 'matching_information',
          order: 14,
          text: 'Questions 14-17',
          instruction: 'Which paragraph contains the following information? Write the correct letter, A-F.',
          opts: ['A', 'B', 'C', 'D', 'E', 'F'].map((letter) => [letter, `Paragraph ${letter}`]),
          items: [
            { order: 14, text: 'a reference to the influence of the domestic background on the gifted child' },
            { order: 15, text: 'a reference to what can be lost if learners are given too much guidance' },
            { order: 16, text: 'a reference to the damaging effects of anxiety' },
            { order: 17, text: 'examples of classroom techniques which favour socially-disadvantaged children' },
          ],
        }),
        matchingQ({
          type: 'matching_features',
          order: 18,
          text: 'Questions 18-22',
          instruction: 'Match each statement with the correct person or people, A-E.',
          opts: [['A', 'Freeman'], ['B', 'Shore and Kanevsky'], ['C', 'Elshout'], ['D', 'Simonton'], ['E', 'Boekaerts']],
          items: [
            { order: 18, text: 'Less time can be spent on exercises with gifted pupils who produce accurate work.' },
            { order: 19, text: 'Self-reliance is a valuable tool that helps gifted students reach their goals.' },
            { order: 20, text: 'Gifted children know how to channel their feelings to assist their learning.' },
            { order: 21, text: 'The very gifted child benefits from appropriate support from close relatives.' },
            { order: 22, text: 'Really successful students have learnt a considerable amount about their subject.' },
          ],
        }),
        sentenceQ({
          order: 23,
          text: 'Questions 23-26',
          numbers: [23, 24, 25, 26],
          instruction: 'Complete the sentences below. Choose NO MORE THAN TWO WORDS from the passage for each answer.',
          sentences: [
            { order: 23, text: "One study found a strong connection between children's IQ and the availability of ___23___ at home." },
            { order: 24, text: 'Children of average ability seem to need more direction from teachers because they do not have ___24___.' },
            { order: 25, text: 'Metacognition involves children understanding their own learning strategies, as well as developing ___25___.' },
            { order: 26, text: 'Teachers who rely on what is known as ___26___ often produce impressive grades in class tests.' },
          ],
          wordLimit: 2,
        }),
      ],
      [
        summaryQ({
          type: 'summary_completion_list',
          order: 27,
          text: 'The value attached to original works of art',
          numbers: [27, 28, 29, 30, 31],
          instruction: 'Complete the summary using the list of words, A-L, below.',
          summaryText: 'People go to art museums because they accept the value of seeing an original work of art. But they do not go to museums to read original manuscripts of novels, perhaps because the availability of novels has depended on ___27___ for so long, and also because with novels, the ___28___ are the most important thing. However, in historical times artists such as Leonardo were happy to instruct ___29___ to produce copies of their work and these days new methods of reproduction allow excellent replication of surface relief features as well as colour and ___30___. It is regrettable that museums still promote the superiority of original works of art, since this may not be in the interests of the ___31___.',
          opts: [['A', 'institution'], ['B', 'mass production'], ['C', 'mechanical processes'], ['D', 'public'], ['E', 'paints'], ['F', 'artist'], ['G', 'size'], ['H', 'underlying ideas'], ['I', 'basic technology'], ['J', 'readers'], ['K', 'picture frames'], ['L', 'assistants']],
        }),
        ...[
          [32, "The writer mentions London's National Gallery to illustrate", [['A', 'the undesirable cost to a nation of maintaining a huge collection of art'], ['B', 'the conflict that may arise in society between financial and artistic values'], ['C', "the negative effect a museum can have on visitors' opinions of themselves"], ['D', 'the need to put individual well-being above large-scale artistic schemes']]],
          [33, 'The writer says that today, viewers may be unwilling to criticise a work because', [['A', 'they lack the knowledge needed to support an opinion'], ['B', 'they fear it may have financial implications'], ['C', "they have no real concept of the work's value"], ['D', 'they feel their personal reaction is of no significance']]],
          [34, "According to the writer, the 'displacement effect' on the visitor is caused by", [['A', 'the variety of works on display and the way they are arranged'], ['B', 'the impossibility of viewing particular works of art over a long period'], ['C', 'the similar nature of the paintings and the lack of great works'], ['D', 'the inappropriate nature of the individual works selected for exhibition']]],
          [35, 'The writer says that unlike other forms of art, a painting does not', [['A', 'involve direct contact with an audience'], ['B', 'require a specific location for a performance'], ['C', 'need the involvement of other professionals'], ['D', 'have a specific beginning or end']]],
        ].map(([order, text, opts]) => singleChoiceQ(order, text, opts)),
        ...[
          [36, 'Art history should focus on discovering the meaning of art using a range of media.'],
          [37, 'The approach of art historians conflicts with that of art museums.'],
          [38, 'People should be encouraged to give their opinions openly on works of art.'],
          [39, 'Reproductions of fine art should only be sold to the public if they are of high quality.'],
          [40, 'In the future, those with power are likely to encourage more people to enjoy art.'],
        ].map(([order, text]) => statementQ({ order, text, type: 'yes_no_not_given', groupId: 'test2-p3-q36-40', instruction: ynng })),
      ],
    ]);
  }

  if (test === 3) {
    return section(test, passages, [
      [
        matchingQ({
          type: 'matching_headings',
          order: 1,
          text: 'Questions 1-4',
          instruction: 'Reading Passage 1 has five paragraphs, A-E. Choose the correct heading for paragraphs B-E.',
          opts: [['i', 'Economic and social significance of tourism'], ['ii', 'The development of mass tourism'], ['iii', 'Travel for the wealthy'], ['iv', 'Earning foreign exchange through tourism'], ['v', 'Difficulty in recognising the economic effects of tourism'], ['vi', 'The contribution of air travel to tourism'], ['vii', 'The world impact of tourism'], ['viii', 'The history of travel']],
          items: ['B', 'C', 'D', 'E'].map((letter, index) => ({ order: index + 1, text: `Paragraph ${letter}` })),
        }),
        ...[
          [5, 'The largest employment figures in the world are found in the travel and tourism industry.'],
          [6, 'Tourism contributes over six per cent of the Australian gross national product.'],
          [7, 'Tourism has a social impact because it promotes recreation.'],
          [8, 'Two main features of the travel and tourism industry make its economic significance difficult to ascertain.'],
          [9, 'Visitor spending is always greater than the spending of residents in tourist areas.'],
          [10, 'It is easy to show statistically how tourism affects individual economies.'],
        ].map(([order, text]) => statementQ({ order, text, groupId: 'test3-p1-q5-10', instruction: tfng })),
        sentenceQ({
          order: 11,
          text: 'Questions 11-13',
          numbers: [11, 12, 13],
          instruction: 'Complete the sentences below. Choose NO MORE THAN THREE WORDS from the passage for each answer.',
          sentences: [
            { order: 11, text: 'In Greece, tourism is the most important ___11___.' },
            { order: 12, text: 'The travel and tourism industry in Jamaica is the major ___12___.' },
            { order: 13, text: 'The problems associated with measuring international tourism are often reflected in the measurement of ___13___.' },
          ],
          wordLimit: 3,
        }),
      ],
      [
        matchingQ({
          type: 'matching_information',
          order: 14,
          text: 'Questions 14-18',
          instruction: 'Which paragraph contains the following information? Write the correct letter, A-I.',
          opts: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'].map((letter) => [letter, `Paragraph ${letter}`]),
          items: [
            { order: 14, text: 'a description of the substance responsible for the red colouration of leaves' },
            { order: 15, text: 'the reason why trees drop their leaves in autumn' },
            { order: 16, text: 'some evidence to confirm a theory about the purpose of the red leaves' },
            { order: 17, text: 'an explanation of the function of chlorophyll' },
            { order: 18, text: 'a suggestion that the red colouration in leaves could serve as a warning signal' },
          ],
        }),
        noteQ({
          order: 19,
          text: "Why believe the 'light screen' hypothesis?",
          numbers: [19, 20, 21, 22],
          instruction: 'Complete the notes below. Choose ONE WORD ONLY from the passage for each answer.',
          wordLimit: 1,
          notesHtml: '<h4>Why believe the light screen hypothesis?</h4><ul><li>The most vividly coloured red leaves are found on the side of the tree facing the <b>19</b> _____.</li><li>The <b>20</b> _____ surfaces of leaves contain the most red pigment.</li><li>Red leaves are most abundant when daytime weather conditions are <b>21</b> _____ and sunny.</li><li>The intensity of the red colour of leaves increases as you go further <b>22</b> _____.</li></ul>',
        }),
        ...[
          [23, 'It is likely that the red pigments help to protect the leaf from freezing temperatures.'],
          [24, "The 'light screen' hypothesis would initially seem to contradict what is known about chlorophyll."],
          [25, 'Leaves which turn colours other than red are more likely to be damaged by sunlight.'],
        ].map(([order, text]) => statementQ({ order, text, groupId: 'test3-p2-q23-25', instruction: tfng })),
        singleChoiceQ(26, 'For which of the following questions does the writer offer an explanation?', [['A', 'why conifers remain green in winter'], ['B', 'how leaves turn orange and yellow in autumn'], ['C', 'how herbivorous insects choose which trees to lay their eggs in'], ['D', 'why anthocyanins are restricted to certain trees']]),
      ],
      [
        summaryQ({
          type: 'summary_completion_list',
          order: 27,
          text: 'The Efaté burial site',
          numbers: [27, 28, 29, 30, 31],
          instruction: 'Complete the summary using the list of words and phrases, A-J, below.',
          summaryText: 'A 3,000-year-old burial ground of a seafaring people called the Lapita has been found on an abandoned ___27___ on the Pacific island of Efaté. The cemetery, which is a significant ___28___, was uncovered accidentally by an agricultural worker. The Lapita explored and colonised many Pacific islands over several centuries. They took many things with them on their voyages including ___29___ and tools. Spriggs believes the ___30___ which was found at the site is very important since it confirms that the ___31___ found inside are Lapita.',
          opts: [['A', 'proof'], ['B', 'plantation'], ['C', 'harbour'], ['D', 'bones'], ['E', 'data'], ['F', 'archaeological discovery'], ['G', 'burial urn'], ['H', 'source'], ['I', 'animals'], ['J', 'maps']],
        }),
        ...[
          [32, 'According to the writer, there are difficulties explaining how the Lapita accomplished their journeys because', [['A', 'the canoes that have been discovered offer relatively few clues'], ['B', 'archaeologists have shown limited interest in this area of research'], ['C', 'little information relating to this period can be relied upon for accuracy'], ['D', 'technological advances have altered the way such achievements are viewed']]],
          [33, 'According to the sixth paragraph, what was extraordinary about the Lapita?', [['A', 'They sailed beyond the point where land was visible'], ['B', 'Their cultural heritage discouraged the expression of fear'], ['C', 'They were able to build canoes that withstood ocean voyages'], ['D', 'Their navigational skills were passed on from one generation to the next']]],
          [34, "What does 'This' refer to in the seventh paragraph?", [['A', "the Lapita's seafaring talent"], ['B', "the Lapita's ability to detect signs of land"], ['C', "the Lapita's extensive knowledge of the region"], ['D', 'the Lapita’s belief they would be able to return home']]],
          [35, 'According to the eighth paragraph, how was the geography of the region significant?', [['A', 'It played an important role in Lapita culture'], ['B', 'It meant there were relatively few storms at sea'], ['C', 'It provided a navigational aid for the Lapita'], ['D', 'It made a large number of islands habitable']]],
        ].map(([order, text, opts]) => singleChoiceQ(order, text, opts)),
        ...[
          [36, 'It is now clear that the Lapita could sail into a prevailing wind.'],
          [37, 'Extreme climate conditions may have played a role in Lapita migration.'],
          [38, 'The Lapita learnt to predict the duration of El Ninos.'],
          [39, 'It remains unclear why the Lapita halted their expansion across the Pacific.'],
          [40, 'It is likely that the majority of Lapita settled on Fiji.'],
        ].map(([order, text]) => statementQ({ order, text, type: 'yes_no_not_given', groupId: 'test3-p3-q36-40', instruction: ynng })),
      ],
    ]);
  }

  return section(test, passages, [
    [
      noteQ({
        order: 1,
        text: 'Wildfires',
        numbers: [1, 2, 3, 4, 5, 6],
        instruction: 'Complete the notes below. Choose ONE WORD AND/OR A NUMBER from the passage for each answer.',
        notesHtml: '<h4>Wildfires</h4><p>Characteristics of wildfires and wildfire conditions today compared to the past:</p><ul><li>movement: <b>1</b> _____ more unpredictably</li><li>size of fires: <b>2</b> _____ greater on average than two decades ago</li></ul><p>Reasons wildfires cause more damage today compared to the past:</p><ul><li>rainfall: <b>3</b> _____ average</li><li>more brush to act as <b>4</b> _____</li><li>extended fire <b>5</b> _____</li><li>more building of <b>6</b> _____ in vulnerable places</li></ul>',
        wordLimit: 2,
      }),
      ...[
        [7, 'The amount of open space in California has diminished over the last ten years.'],
        [8, 'Many experts believe California has made little progress in readying itself to fight fires.'],
        [9, 'Personnel in the past have been criticised for mishandling fire containment.'],
        [10, 'California has replaced a range of firefighting tools.'],
        [11, 'More firefighters have been hired to improve firefighting capacity.'],
        [12, 'Citizens and government groups disapprove of the efforts of different states and agencies working together.'],
        [13, 'Randy Jacobs believes that loss of life from fires will continue at the same levels, despite changes made.'],
      ].map(([order, text]) => statementQ({ order, text, groupId: 'test4-p1-q7-13', instruction: tfng })),
    ],
    [
      summaryQ({
        order: 14,
        text: 'Second nature',
        numbers: [14, 15, 16, 17, 18],
        instruction: 'Complete the summary below. Choose NO MORE THAN TWO WORDS from the passage for each answer.',
        summaryText: 'Psychologists have traditionally believed that a personality ___14___ was impossible and that by a ___15___, a person’s character tends to be fixed. Positive psychologists say one of the easiest qualities to acquire is ___16___. However, it is necessary to learn a wide variety of different ___17___ in order for a new quality to develop; for example, a person must understand and feel some ___18___ in order to increase their happiness.',
      }),
      matchingQ({
        type: 'matching_features',
        order: 19,
        text: 'Questions 19-22',
        instruction: 'Match each statement with the correct person, A-G.',
        opts: [['A', 'Christopher Peterson'], ['B', 'David Fajgenbaum'], ['C', 'Suzanne Segerstrom'], ['D', 'Tanya Streeter'], ['E', 'Todd Kashdan'], ['F', 'Kenneth Pedeleose'], ['G', 'Cynthia Pury']],
        items: [
          { order: 19, text: 'People must accept that they do not know much when first trying something new.' },
          { order: 20, text: 'It is important for people to actively notice when good things happen.' },
          { order: 21, text: 'Courage can be learned once its origins in a sense of responsibility are understood.' },
          { order: 22, text: 'It is possible to overcome shyness when faced with the need to speak in public.' },
        ],
      }),
      matchingQ({
        type: 'matching_information',
        order: 23,
        text: 'Questions 23-26',
        instruction: 'Reading Passage 2 has eight sections, A-H. Which section contains the following information?',
        opts: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((letter) => [letter, `Section ${letter}`]),
        items: [
          { order: 23, text: 'a mention of how rational thinking enabled someone to achieve physical goals' },
          { order: 24, text: 'an account of how someone overcame a sad experience' },
          { order: 25, text: 'a description of how someone decided to rethink their academic career path' },
          { order: 26, text: 'an example of how someone risked his career out of a sense of duty' },
        ],
      }),
    ],
    [
      ...[
        [27, 'When discussing the theory developed by Louis Dollo, the writer says that', [['A', "it was immediately referred to as Dollo's law"], ['B', 'it supported the possibility of evolutionary throwbacks'], ['C', 'it was modified by biologists in the early twentieth century'], ['D', 'it was based on many years of research']]],
        [28, 'The humpback whale caught off Vancouver Island is mentioned because of', [['A', 'the exceptional size of its body'], ['B', "the way it exemplifies Dollo's law"], ['C', 'the amount of local controversy it caused'], ['D', 'the reason given for its unusual features']]],
        [29, 'What is said about silent genes?', [['A', 'Their numbers vary according to species'], ['B', 'Raff disagreed with the use of the term'], ['C', 'They could lead to the re-emergence of certain characteristics'], ['D', 'They can have an unlimited life span']]],
        [30, 'The writer mentions the mole salamander because', [['A', 'it exemplifies what happens in the development of most amphibians'], ['B', "it suggests that Raff's theory is correct"], ['C', 'it has lost and regained more than one ability'], ['D', 'its ancestors have become the subject of extensive research']]],
        [31, 'Which of the following does Wagner claim?', [['A', 'Members of the Bachia lizard family have lost and regained certain features several times'], ['B', 'Evidence shows that the evolution of the Bachia lizard is due to the environment'], ['C', "His research into South American lizards supports Raff's assertions"], ['D', 'His findings will apply to other species of South American lizards']]],
      ].map(([order, text, opts]) => singleChoiceQ(order, text, opts)),
      matchingQ({
        type: 'matching_sentence_endings',
        order: 32,
        text: 'Questions 32-36',
        instruction: 'Complete each sentence with the correct ending, A-G, below.',
        opts: [['A', 'the question of how certain long-lost traits could reappear'], ['B', 'the occurrence of a particular feature in different species'], ['C', 'parallels drawn between behaviour and appearance'], ['D', 'the continued existence of certain genetic information'], ['E', 'the doubts felt about evolutionary throwbacks'], ['F', 'the possibility of evolution being reversible'], ['G', "Dollo's findings and the convictions held by Lombroso"]],
        items: [
          { order: 32, text: 'For a long time biologists rejected' },
          { order: 33, text: 'Opposing views on evolutionary throwbacks are represented by' },
          { order: 34, text: 'Examples of evolutionary throwbacks have led to' },
          { order: 35, text: 'The shark and killer whale are mentioned to exemplify' },
          { order: 36, text: "One explanation for the findings of Wagner's research is" },
        ],
      }),
      ...[
        [37, 'Wagner was the first person to do research on South American lizards.'],
        [38, 'Wagner believes that Bachia lizards with toes had toeless ancestors.'],
        [39, 'The temporary occurrence of long-lost traits in embryos is rare.'],
        [40, 'Evolutionary throwbacks might be caused by developmental problems in the womb.'],
      ].map(([order, text]) => statementQ({ order, text, type: 'yes_no_not_given', groupId: 'test4-p3-q37-40', instruction: ynng })),
    ],
  ]);
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
  const login = await api('/admin/auth/login', { method: 'POST', body: JSON.stringify({ email: EMAIL, password: PASSWORD }) });
  const headers = { Authorization: `Bearer ${login.data.access_token}` };
  const results = [];
  for (const [testText, sectionId] of Object.entries(OLD_IDS)) {
    const test = Number(testText);
    const current = await api(`/admin/sections/${sectionId}`, { headers });
    const passages = current.data.parts.map((part) => part.passage_text);
    await api(`/admin/sections/${sectionId}`, { method: 'DELETE', headers });
    const created = await api('/admin/sections', {
      method: 'POST',
      headers,
      body: JSON.stringify(payloadFor(test, passages)),
    });
    await api(`/admin/sections/${created.data.id}/publish`, { method: 'POST', headers });
    results.push({ test, id: created.data.id, total: created.data.total_questions });
  }
  console.log(JSON.stringify(results, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
