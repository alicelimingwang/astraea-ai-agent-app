// Zi Wei Dou Shu Palace Calculation Engine

const PALACES = [
  'Life Palace (命宫)',
  'Brothers & Siblings (兄弟宫)',
  'Spouse & Romance (夫妻宫)',
  'Children & Legacy (子女宫)',
  'Wealth & Asset (财帛宫)',
  'Health & Well-being (疾厄宫)',
  'Travel & Social (迁移宫)',
  'Friends & Allies (交友宫)',
  'Career & Ambition (官禄宫)',
  'Property & Real Estate (田宅宫)',
  'Karma & Mindset (福德宫)',
  'Parents & Elders (父母宫)',
];

const PRIMARY_STARS = [
  { name: 'Zi Wei (Emperor Star / 紫微)', nature: 'Leadership, Noble, Wisdom, Authority' },
  { name: 'Tian Ji (Heavenly Secret / 天机)', nature: 'Intelligence, Strategy, Agility, Planning' },
  { name: 'Tai Yang (The Sun / 太阳)', nature: 'Warmth, Charisma, Generosity, Public Fame' },
  { name: 'Wu Qu (Financial General / 武曲)', nature: 'Wealth Creation, Determination, Pragmatism' },
  { name: 'Tian Tong (Heavenly Enjoyment / 天同)', nature: 'Peace, Comfort, Harmony, Leisure' },
  { name: 'Lian Zhen (Wild Fire / 廉贞)', nature: 'Passion, Magnetism, Ambition, Creativity' },
  { name: 'Tian Fu (Heavenly Treasury / 天府)', nature: 'Stability, Financial Security, Storage, Reserve' },
  { name: 'Tai Yin (The Moon / 太阴)', nature: 'Gentleness, Intuition, Maternal Care, Real Estate' },
  { name: 'Tan Lang (Flirting Star / 贪狼)', nature: 'Desire, Eloquence, Social Skill, Multi-talented' },
  { name: 'Ju Men (Gigantic Gate / 巨门)', nature: 'Communication, Eloquence, Analysis, Debate' },
  { name: 'Tian Xiang (Minister / 天相)', nature: 'Service, Diplomacy, Loyalty, Reputation' },
  { name: 'Tian Liang (Heavenly Beam / 天梁)', nature: 'Protection, Longevity, Mentorship, Medicine' },
  { name: 'Qi Sha (Seven Swords / 七杀)', nature: 'Courage, Breakthrough, Independence, Action' },
  { name: 'Po Jun (Broken Army / 破军)', nature: 'Innovation, Transformation, Reset, Boldness' },
];

export function calculateZiWei(birthDateStr, baziData) {
  const date = new Date(birthDateStr);
  const day = date.getDate();

  // Map 12 Palaces with Primary Stars distributed based on Day Master / Bazi
  const mappedPalaces = PALACES.map((palaceName, idx) => {
    const starIdx1 = (day + idx * 3) % PRIMARY_STARS.length;
    const starIdx2 = (day * 2 + idx * 5) % PRIMARY_STARS.length;

    const primaryStar = PRIMARY_STARS[starIdx1];
    const secondaryStar = starIdx1 !== starIdx2 ? PRIMARY_STARS[starIdx2] : null;

    return {
      id: idx + 1,
      name: palaceName,
      primaryStar,
      secondaryStar,
      brightness: (day + idx) % 2 === 0 ? 'Bright (庙/旺)' : 'Neutral (平/利)',
    };
  });

  // Extract Key Life Palaces for quick summary
  const lifePalace = mappedPalaces[0];
  const careerPalace = mappedPalaces[8];
  const wealthPalace = mappedPalaces[4];
  const spousePalace = mappedPalaces[2];

  return {
    palaces: mappedPalaces,
    keyHighlights: {
      lifePalace,
      careerPalace,
      wealthPalace,
      spousePalace,
    },
    emperorStarPalace: mappedPalaces.find(p => p.primaryStar.name.includes('Zi Wei')) || mappedPalaces[0],
  };
}
