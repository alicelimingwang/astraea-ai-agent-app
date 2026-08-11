// Bazi (Four Pillars of Destiny) Engine

const HEAVENLY_STEMS = [
  { name: 'Jia (甲)', element: 'Wood', polarity: 'Yang', char: '甲' },
  { name: 'Yi (乙)', element: 'Wood', polarity: 'Yin', char: '乙' },
  { name: 'Bing (丙)', element: 'Fire', polarity: 'Yang', char: '丙' },
  { name: 'Ding (丁)', element: 'Fire', polarity: 'Yin', char: '丁' },
  { name: 'Wu (戊)', element: 'Earth', polarity: 'Yang', char: '戊' },
  { name: 'Ji (己)', element: 'Earth', polarity: 'Yin', char: '己' },
  { name: 'Geng (庚)', element: 'Metal', polarity: 'Yang', char: '庚' },
  { name: 'Xin (辛)', element: 'Metal', polarity: 'Yin', char: '辛' },
  { name: 'Ren (壬)', element: 'Water', polarity: 'Yang', char: '壬' },
  { name: 'Gui (癸)', element: 'Water', polarity: 'Yin', char: '癸' },
];

const EARTHLY_BRANCHES = [
  { name: 'Zi (子 - Rat)', element: 'Water', animal: 'Rat', char: '子' },
  { name: 'Chou (丑 - Ox)', element: 'Earth', animal: 'Ox', char: '丑' },
  { name: 'Yin (寅 - Tiger)', element: 'Wood', animal: 'Tiger', char: '寅' },
  { name: 'Mao (卯 - Rabbit)', element: 'Wood', animal: 'Rabbit', char: '卯' },
  { name: 'Chen (辰 - Dragon)', element: 'Earth', animal: 'Dragon', char: '辰' },
  { name: 'Si (巳 - Snake)', element: 'Fire', animal: 'Snake', char: '巳' },
  { name: 'Wu (午 - Horse)', element: 'Fire', animal: 'Horse', char: '午' },
  { name: 'Wei (未 - Goat)', element: 'Earth', animal: 'Goat', char: '未' },
  { name: 'Shen (申 - Monkey)', element: 'Metal', animal: 'Monkey', char: '申' },
  { name: 'You (酉 - Rooster)', element: 'Metal', animal: 'Rooster', char: '酉' },
  { name: 'Xu (戌 - Dog)', element: 'Earth', animal: 'Dog', char: '戌' },
  { name: 'Hai (亥 - Pig)', element: 'Water', animal: 'Pig', char: '亥' },
];

/**
 * Calculates Bazi Pillars based on birth date and time.
 * Supports 4-Pillar mode and 3-Pillar mode when time is unknown.
 */
export function calculateBazi(dateStr, timeStr, unknownTimeMode = 'default_horse') {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    throw new Error('Invalid birth date');
  }

  const year = date.getFullYear();
  const month = date.getMonth() + 1; // 1-12
  const day = date.getDate();

  // Year Pillar calculation
  // Base offset: Year 4 AD was Jia-Zi (Stem 0, Branch 0)
  const yearStemIdx = (year - 4) % 10 < 0 ? ((year - 4) % 10) + 10 : (year - 4) % 10;
  const yearBranchIdx = (year - 4) % 12 < 0 ? ((year - 4) % 12) + 12 : (year - 4) % 12;

  // Month Pillar calculation (simplified solar term approximation)
  const monthBranchIdx = (month + 1) % 12; // Yin month starts roughly Feb
  const monthStemIdx = (yearStemIdx * 2 + month) % 10;

  // Day Pillar calculation (Julian day number algorithm for day stem/branch)
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  const julianDay = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  const dayStemIdx = (julianDay + 9) % 10;
  const dayBranchIdx = (julianDay + 1) % 12;

  // Hour Pillar calculation
  let hourBranchIdx = null;
  let hourStemIdx = null;
  let isHourPillarAvailable = true;
  let unknownTimeNotice = null;

  if (!timeStr || timeStr === 'unknown') {
    if (unknownTimeMode === 'default_horse') {
      // Default to 12:00 PM (Horse Hour / 午时)
      hourBranchIdx = 6; // Wu / Horse
      hourStemIdx = (dayStemIdx * 2 + hourBranchIdx) % 10;
      unknownTimeNotice = 'Birth time was unknown. System defaulted to peak solar Hour (11:00 AM - 1:00 PM / 午时) for complete 4-Pillar estimation.';
    } else {
      // 3-Pillars Mode (Exclude Hour)
      isHourPillarAvailable = false;
      unknownTimeNotice = 'Birth time was unknown. Executing 3-Pillars Bazi Analysis (Year, Month, Day). Hour Pillar is omitted to maximize baseline accuracy.';
    }
  } else {
    const [hours] = timeStr.split(':').map(Number);
    // Convert 24-hour time to 12 Earthly Branches (2-hour windows)
    hourBranchIdx = Math.floor((hours + 1) / 2) % 12;
    hourStemIdx = (dayStemIdx * 2 + hourBranchIdx) % 10;
  }

  // Structure Pillars
  const yearPillar = {
    stem: HEAVENLY_STEMS[yearStemIdx],
    branch: EARTHLY_BRANCHES[yearBranchIdx],
    label: 'Year Pillar (Ancestor & Roots)',
  };

  const monthPillar = {
    stem: HEAVENLY_STEMS[monthStemIdx],
    branch: EARTHLY_BRANCHES[monthBranchIdx],
    label: 'Month Pillar (Parents & Youth)',
  };

  const dayPillar = {
    stem: HEAVENLY_STEMS[dayStemIdx],
    branch: EARTHLY_BRANCHES[dayBranchIdx],
    label: 'Day Pillar (Self & Spouse / Day Master)',
  };

  const hourPillar = isHourPillarAvailable ? {
    stem: HEAVENLY_STEMS[hourStemIdx],
    branch: EARTHLY_BRANCHES[hourBranchIdx],
    label: 'Hour Pillar (Children & Late Life)',
  } : null;

  // Day Master (Ri Zhu) is the Heavenly Stem of the Day Pillar
  const dayMaster = dayPillar.stem;

  // Calculate Wu Xing (Five Elements) Balance
  const pillarsList = [yearPillar, monthPillar, dayPillar];
  if (hourPillar) pillarsList.push(hourPillar);

  const elementCounts = { Wood: 0, Fire: 0, Earth: 0, Metal: 0, Water: 0 };
  pillarsList.forEach(p => {
    elementCounts[p.stem.element] += 1;
    elementCounts[p.branch.element] += 1;
  });

  const totalElements = Object.values(elementCounts).reduce((a, b) => a + b, 0);
  const wuxingDistribution = {};
  Object.keys(elementCounts).forEach(elem => {
    wuxingDistribution[elem] = Math.round((elementCounts[elem] / totalElements) * 100);
  });

  // Determine dominant and lacking elements
  const sortedElements = Object.entries(elementCounts).sort((a, b) => b[1] - a[1]);
  const dominantElement = sortedElements[0][0];
  const lackingElement = sortedElements[sortedElements.length - 1][0];

  return {
    mode: isHourPillarAvailable ? '4-Pillars (Bazi)' : '3-Pillars (Bazi)',
    yearPillar,
    monthPillar,
    dayPillar,
    hourPillar,
    dayMaster,
    wuxingDistribution,
    elementCounts,
    dominantElement,
    lackingElement,
    unknownTimeNotice,
  };
}
