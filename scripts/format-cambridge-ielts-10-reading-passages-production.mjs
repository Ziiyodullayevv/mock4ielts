import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const API_BASE = 'https://mockapi.mock4ielts.uz/api/v1';
const EMAIL = process.env.MOCK4IELTS_ADMIN_EMAIL;
const PASSWORD = process.env.MOCK4IELTS_ADMIN_PASSWORD;

const READING_SECTIONS = {
  1: 'ed1ccc12-d049-4f46-90f6-a4908053e5e0',
  2: 'a1ce8c24-ca57-4b6a-8b29-cf2bac31d2f7',
  3: '9641ef4c-7ca4-4ed3-a57a-89df758cc450',
  4: '8f305663-938c-419b-8eb4-f855170170f4',
};

const SOURCE_URLS = {
  1: 'https://ieltstrainingonline.com/practice-cam-10-reading-test-01-with-answer/',
  2: 'https://ieltstrainingonline.com/practice-cam-10-reading-test-02-with-answer/',
  3: 'https://ieltstrainingonline.com/practice-cam-10-reading-test-03-with-answer/',
  4: 'https://ieltstrainingonline.com/practice-cam-10-reading-test-04-with-answer/',
};

const PASSAGES = [
  {
    test: 1,
    passage: 1,
    title: 'Stepwells',
    questionRange: 'Questions 1-13',
    lettered: false,
    lead:
      'A millennium ago, stepwells were fundamental to life in the driest parts of India. Richard Cox travelled to north-western India to document these spectacular monuments from a bygone era',
  },
  {
    test: 1,
    passage: 2,
    title: 'EUROPEAN TRANSPORT SYSTEMS 1990-2010',
    questionRange: 'Questions 14-26',
    lettered: true,
    lead: 'What have been the trends and what are the prospects for European transport systems?',
  },
  {
    test: 1,
    passage: 3,
    title: 'The psychology of innovation',
    questionRange: 'Questions 27-40',
    lettered: false,
    lead: 'Why are so few companies truly innovative?',
  },
  {
    test: 2,
    passage: 1,
    title: 'Tea and the Industrial Revolution',
    questionRange: 'Questions 1-13',
    lettered: true,
    lead:
      'A Cambridge professor says that a change in drinking habits was the reason for the Industrial Revolution in Britain. Anjana Ahuja reports',
    footnote: '* Joseph Lister was the first doctor to use antiseptic techniques during surgical operations to prevent infections.',
  },
  {
    test: 2,
    passage: 2,
    title: 'Gifted children and learning',
    questionRange: 'Questions 14-26',
    lettered: true,
  },
  {
    test: 2,
    passage: 3,
    title: 'Museums of fine art and their public',
    questionRange: 'Questions 27-40',
    lettered: false,
    lead:
      "The fact that people go to the Louvre museum in Paris to see the original painting Mona Lisa when they can see a reproduction anywhere leads us to question some assumptions about the role of museums of fine art in today's world",
  },
  {
    test: 3,
    passage: 1,
    title: 'The Context, Meaning and Scope of Tourism',
    questionRange: 'Questions 1-13',
    lettered: true,
  },
  {
    test: 3,
    passage: 2,
    title: 'Autumn leaves',
    questionRange: 'Questions 14-26',
    lettered: true,
    lead: 'Canadian writer Jay Ingram investigates the mystery of why leaves turn red in the fall',
    footnote: '* photosynthesis: the production of new material from sunlight, water and carbon dioxide.',
  },
  {
    test: 3,
    passage: 3,
    title: 'Beyond the blue horizon',
    questionRange: 'Questions 27-40',
    lettered: false,
    lead: 'Ancient voyagers who settled the far-flung islands of the Pacific Ocean',
  },
  {
    test: 4,
    passage: 1,
    title: 'The megafires of California',
    questionRange: 'Questions 1-13',
    lettered: false,
    lead:
      'Drought, housing expansion, and oversupply of tinder make for bigger, hotter fires in the western United States',
  },
  {
    test: 4,
    passage: 2,
    title: 'Second nature',
    questionRange: 'Questions 14-26',
    lettered: true,
    lead:
      "Your personality isn't necessarily set in stone. With a little experimentation, people can reshape their temperaments and inject passion, optimism, joy and courage into their lives",
  },
  {
    test: 4,
    passage: 3,
    title: 'When evolution runs backwards',
    questionRange: 'Questions 27-40',
    lettered: false,
    lead:
      "Evolution isn't supposed to run backwards - yet an increasing number of examples show that it does and that it can sometimes represent the future of a species.",
  },
];

const OCR_STEPWELLS_BODY = [
  'During the sixth and seventh centuries, the inhabitants of the modern-day states of Gujarat and Rajasthan in north-western India developed a method of gaining access to clean, fresh groundwater during the dry season for drinking, bathing, watering animals and irrigation. However, the significance of this invention - the stepwell - goes beyond its utilitarian application.',
  'Unique to this region, stepwells are often architecturally complex and vary widely in size and shape. During their heyday, they were places of gathering, of leisure and relaxation and of worship for villagers of all but the lowest classes. Most stepwells are found dotted round the desert areas of Gujarat (where they are called vav) and Rajasthan (where they are called baori), while a few also survive in Delhi. Some were located in or near villages as public spaces for the community; others were positioned beside roads as resting places for travellers.',
  'As their name suggests, stepwells comprise a series of stone steps descending from ground level to the water source (normally an underground aquifer) as it recedes following the rains. When the water level was high, the user needed only to descend a few steps to reach it; when it was low, several levels would have to be negotiated.',
  'Some wells are vast, open craters with hundreds of steps paving each sloping side, often in tiers. Others are more elaborate, with long stepped passages leading to the water via several storeys. Built from stone and supported by pillars, they also included pavilions that sheltered visitors from the relentless heat. But perhaps the most impressive features are the intricate decorative sculptures that embellish many stepwells, showing activities from fighting and dancing to everyday acts such as women combing their hair or churning butter.',
  "Down the centuries, thousands of wells were constructed throughout north-western India, but the majority have now fallen into disuse; many are derelict and dry, as groundwater has been diverted for industrial use and the wells no longer reach the water table. Their condition hasn't been helped by recent dry spells: southern Rajasthan suffered an eight-year drought between 1996 and 2004.",
  'However, some important sites in Gujarat have recently undergone major restoration, and the state government announced in June last year that it plans to restore the stepwells throughout the state.',
  "In Patan, the state's ancient capital, the stepwell of Rani Ki Vav (Queen's Stepwell) is perhaps the finest current example. It was built by Queen Udayamati during the late 11th century, but became silted up following a flood during the 13th century. But the Archaeological Survey of India began restoring it in the 1960s, and today it is in pristine condition. At 65 metres long, 20 metres wide and 27 metres deep, Rani Ki Vav features 500 sculptures carved into niches throughout the monument. Incredibly, in January 2001, this ancient structure survived an earthquake that measured 7.6 on the Richter scale.",
  'Another example is the Surya Kund in Modhera, northern Gujarat, next to the Sun Temple, built by King Bhima I in 1026 to honour the sun god Surya. It actually resembles a tank (kund means reservoir or pond) rather than a well, but displays the hallmarks of stepwell architecture, including four sides of steps that descend to the bottom in a stunning geometrical formation. The terraces house 108 small, intricately carved shrines between the sets of steps.',
  'Rajasthan also has a wealth of wells. The ancient city of Bundi, 200 kilometres south of Jaipur, is renowned for its architecture, including its stepwells. One of the larger examples is Raniji Ki Baori, which was built by the queen of the region, Nathavatji, in 1699. At 46 metres deep, 20 metres wide and 40 metres long, the intricately carved monument is one of 21 baoris commissioned in the Bundi area by Nathavatji.',
  "In the old ruined town of Abhaneri, about 95 kilometres east of Jaipur, is Chand Baori, one of India's oldest and deepest wells; aesthetically it is perhaps one of the most dramatic. Built in around 850 AD next to the temple of Harshat Mata, the baori comprises hundreds of zigzagging steps that run along three of its sides, steeply descending 11 storeys, resulting in a striking pattern when seen from afar. On the fourth side, verandas which are supported by ornate pillars overlook the steps.",
  'Still in public use is Neemrana Ki Baori, located just off the Jaipur-Delhi highway. Constructed in around 1700, it is nine storeys deep, with the last two being underwater. At ground level, there are 86 colonnaded openings from where the visitor descends 170 steps to the deepest water source.',
  "Today, following years of neglect, many of these monuments to medieval engineering have been saved by the Archaeological Survey of India, which has recognised the importance of preserving them as part of the country's rich history. Tourists flock to wells in far-flung corners of north-western India to gaze in wonder at these architectural marvels from hundreds of years ago, which serve as a reminder of both the ingenuity and artistry of ancient civilisations and of the value of water to human existence.",
];

if (!EMAIL || !PASSWORD) {
  throw new Error('Set MOCK4IELTS_ADMIN_EMAIL and MOCK4IELTS_ADMIN_PASSWORD.');
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function normalizePlainText(value) {
  return String(value)
    .replace(/\r\n/g, '\n')
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function normalizeLine(value) {
  return value
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function sourceTextForTest(test) {
  const cachedPath = `/tmp/cam10_reading_test${test}.txt`;
  if (fs.existsSync(cachedPath)) {
    return fs.readFileSync(cachedPath, 'utf8');
  }

  const html = execFileSync('curl', ['-L', '-s', SOURCE_URLS[test]], {
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 10,
  });

  return execFileSync('textutil', ['-convert', 'txt', '-stdin', '-stdout'], {
    input: html,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 10,
  });
}

function extractPassageText(test, passage) {
  const text = normalizePlainText(sourceTextForTest(test));
  const lines = text.split('\n').map((line) => line.trim());
  const heading = `READING PASSAGE ${passage}`;
  const start = lines.findIndex((line) => line === heading);
  if (start < 0) throw new Error(`Cannot find ${heading} in test ${test}.`);

  const end = lines.findIndex((line, index) => index > start && /^Questions\b/i.test(line));
  if (end < 0) throw new Error(`Cannot find question boundary after ${heading} in test ${test}.`);

  return lines.slice(start + 1, end).join('\n').trim();
}

function compact(value) {
  return normalizeLine(value).toLowerCase();
}

function removeLeadingInstruction(lines) {
  const firstContent = lines.findIndex((line) => line && !/^You should spend about 20 minutes/i.test(line));
  return firstContent < 0 ? [] : lines.slice(firstContent);
}

function removeTitle(lines, title) {
  const titleNeedle = compact(title);
  const index = lines.findIndex((line) => compact(line) === titleNeedle);
  if (index < 0) {
    throw new Error(`Cannot find title "${title}" in extracted source.`);
  }
  return lines.slice(index + 1);
}

function removeLead(lines, lead) {
  if (!lead) return lines;
  const leadNeedle = compact(lead);
  const index = lines.findIndex((line) => compact(line) === leadNeedle);
  if (index >= 0) return lines.slice(index + 1);

  const firstMeaningful = lines.findIndex(Boolean);
  if (firstMeaningful >= 0) return lines.slice(firstMeaningful + 1);
  return lines;
}

function applyTextCorrections(text) {
  const replacements = [
    [/\bAnjana Abuja\b/g, 'Anjana Ahuja'],
    [/\balmost even kitchen cupboard\b/g, 'almost every kitchen cupboard'],
    [/\bMacfarlanes\b/g, "Macfarlane's"],
    [/\bcountries our of\b/g, 'countries out of'],
    [/\bthey would put people our of work\b/g, 'they would put people out of work'],
    [/\bIO tests\b/g, 'IQ tests'],
    [/\bteachers o pupils\b/g, 'teachers help pupils'],
    [/\bknowledge is a so vital\b/g, 'knowledge is also vital'],
    [/\bexpertise se mixed\b/g, 'expertise mixed'],
    [/\bcreative aspects of earning\b/g, 'creative aspects of learning'],
    [/\bemotion the learning\b/g, 'emotion in the learning'],
    [/\baudience encourage an opera\b/g, 'audience encounters an opera'],
    [/\bmuseum s function\b/g, "museum's function"],
    [/\bparticipators criticism\b/g, 'participatory criticism'],
    [/\bThe Lap it as thrust\b/g, "The Lapita's thrust"],
    [/\bharbors\b/g, 'harbours'],
    [/\b6 to million years\b/g, '6 to 10 million years'],
    [/\b10million-year\b/g, '10-million-year'],
    [/\bDollo's law\./g, "Dollo's law'."],
    [/\bWest Germany\b/g, 'West Germany'],
    [/\bthe almost 130 million jobs\b/g, 'with almost 130 million jobs'],
    [/\bemployer the almost\b/g, 'employer, with almost'],
    [/\$422 billion m direct indirect and personal taxes/g, '$422 billion in direct, indirect and personal taxes'],
  ];

  return replacements.reduce((current, [pattern, replacement]) => current.replace(pattern, replacement), text);
}

function parseBody(config) {
  if (config.test === 1 && config.passage === 1) {
    return { paragraphs: OCR_STEPWELLS_BODY, footnotes: [] };
  }

  const raw = extractPassageText(config.test, config.passage);
  let lines = raw
    .split('\n')
    .map(normalizeLine)
    .filter((line) => line && line !== 'Advertisements');

  lines = removeLeadingInstruction(lines);
  lines = removeTitle(lines, config.title);
  lines = removeLead(lines, config.lead);

  const footnotes = [];
  const cleanLines = lines.filter((line) => {
    if (/^[-\u2014\u2013]+$/.test(line)) return false;
    if (/^\*\s+/.test(line)) {
      footnotes.push(line);
      return false;
    }
    if (line === config.footnote) return false;
    return true;
  });

  if (!config.lettered) {
    return {
      paragraphs: cleanLines.map(applyTextCorrections).filter(Boolean),
      footnotes,
    };
  }

  const paragraphs = [];
  let current = null;

  const flush = () => {
    if (!current) return;
    const text = applyTextCorrections(current.lines.join(' ')).trim();
    if (text) paragraphs.push({ label: current.label, text });
    current = null;
  };

  cleanLines.forEach((line) => {
    const labelOnly = line.match(/^([A-I])$/);
    const labelWithText = line.match(/^([A-I])\s+(.+)$/);

    if (labelOnly || labelWithText) {
      flush();
      current = {
        label: labelOnly?.[1] ?? labelWithText?.[1],
        lines: labelWithText?.[2] ? [labelWithText[2]] : [],
      };
      return;
    }

    if (!current) {
      current = { label: null, lines: [] };
    }
    current.lines.push(line);
  });

  flush();

  return {
    paragraphs,
    footnotes,
  };
}

function htmlParagraph(text, attrs = '') {
  return `<p${attrs}>${escapeHtml(applyTextCorrections(text))}</p>`;
}

function buildPassageHtml(config) {
  const { paragraphs, footnotes } = parseBody(config);
  const instruction = `You should spend about 20 minutes on ${config.questionRange}, which are based on Reading Passage ${config.passage} below.`;
  const body = paragraphs
    .map((paragraph) => {
      if (typeof paragraph === 'string') return htmlParagraph(paragraph);
      if (!paragraph.label) return htmlParagraph(paragraph.text);
      return `<p><strong>${escapeHtml(paragraph.label)}</strong> ${escapeHtml(paragraph.text)}</p>`;
    })
    .join('\n');

  const notes = [...footnotes, config.footnote].filter(Boolean);

  return [
    `<article data-source="cambridge-ielts-10" data-test="${config.test}" data-passage="${config.passage}">`,
    `<p><strong>READING PASSAGE ${config.passage}</strong></p>`,
    `<p><em>${escapeHtml(instruction)}</em></p>`,
    `<h1>${escapeHtml(config.title)}</h1>`,
    config.lead ? `<p><em>${escapeHtml(config.lead)}</em></p>` : '',
    body,
    notes.length ? notes.map((note) => htmlParagraph(note)).join('\n') : '',
    '</article>',
  ]
    .filter(Boolean)
    .join('\n');
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

function auditHtml(config, html) {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const errors = [];
  if (!html.includes(`<h1>${escapeHtml(config.title)}</h1>`)) errors.push('missing-title');
  if (!html.includes('<em>')) errors.push('missing-italic');
  if (/<strong>A<\/strong>\s+millennium/i.test(html)) errors.push('bad-stepwells-label');
  if (/<p>[^<]*Reading Passage \d+ below\.\s+[A-Z][^<]*<\/p>/i.test(html)) {
    errors.push('instruction-title-merged');
  }
  if (!config.lettered && /<p><strong>[A-I]<\/strong>/.test(html)) errors.push('unexpected-letter-label');
  if (config.lettered && !/<p><strong>A<\/strong>/.test(html)) errors.push('missing-letter-labels');
  if (config.test === 2 && config.passage === 3 && /National Gallery is housed in numerous/.test(text.slice(0, 220))) {
    errors.push('missing-passage-start');
  }
  if (text.length < 1500) errors.push('too-short');
  return errors;
}

async function main() {
  const login = await api('/admin/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const headers = { Authorization: `Bearer ${login.data.access_token}` };
  const report = [];

  for (const sectionId of Object.values(READING_SECTIONS)) {
    const section = await api(`/admin/sections/${sectionId}`, { headers });
    const test = Number(section.data.title.match(/Test\s+(\d+)/)?.[1]);
    if (!test) throw new Error(`Cannot determine test number from ${section.data.title}.`);

    for (const part of [...section.data.parts].sort((a, b) => a.order - b.order)) {
      const config = PASSAGES.find((item) => item.test === test && item.passage === part.order + 1);
      if (!config) throw new Error(`Missing passage config for test ${test} part ${part.order + 1}.`);

      const passageText = buildPassageHtml(config);
      const preflightErrors = auditHtml(config, passageText);
      if (preflightErrors.length) {
        throw new Error(`Preflight failed for Test ${test} Passage ${config.passage}: ${preflightErrors.join(', ')}`);
      }

      const updated = await api(`/admin/sections/${sectionId}/parts/${part.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          title: part.title,
          passage_text: passageText,
          passage_source: part.passage_source,
          audio_url: part.audio_url,
          audio_start_time: part.audio_start_time,
          audio_end_time: part.audio_end_time,
          image_url: part.image_url,
          instructions: part.instructions,
          order: part.order,
        }),
      });

      const finalErrors = auditHtml(config, updated.data.passage_text);
      report.push({
        test,
        passage: config.passage,
        part_id: part.id,
        title: config.title,
        lettered: config.lettered,
        paragraphs: parseBody(config).paragraphs.length,
        chars: updated.data.passage_text.length,
        errors: finalErrors,
      });
    }
  }

  const failed = report.filter((item) => item.errors.length);
  console.log(JSON.stringify(report, null, 2));
  if (failed.length) {
    throw new Error(`Post-update audit failed: ${JSON.stringify(failed)}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
