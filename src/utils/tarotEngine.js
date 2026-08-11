// Tarot Deck & Draw Engine

const TAROT_CARDS = [
  { id: 1, name: 'The Fool', arcana: 'Major', keywords: 'New beginnings, innocence, spontaneity, free spirit', image: '✨' },
  { id: 2, name: 'The Magician', arcana: 'Major', keywords: 'Manifestation, resourcefulness, power, inspired action', image: '🪄' },
  { id: 3, name: 'The High Priestess', arcana: 'Major', keywords: 'Intuition, sacred knowledge, divine feminine, subconscious', image: '🌙' },
  { id: 4, name: 'The Empress', arcana: 'Major', keywords: 'Femininity, beauty, nature, nurturing, abundance', image: '👑' },
  { id: 5, name: 'The Emperor', arcana: 'Major', keywords: 'Authority, structure, stability, leadership, discipline', image: '🏛️' },
  { id: 6, name: 'The Hierophant', arcana: 'Major', keywords: 'Spiritual wisdom, traditions, institutions, mentorship', image: '📜' },
  { id: 7, name: 'The Lovers', arcana: 'Major', keywords: 'Love, harmony, relationships, values alignment, choices', image: '💖' },
  { id: 8, name: 'The Chariot', arcana: 'Major', keywords: 'Control, willpower, success, action, determination', image: '🏎️' },
  { id: 9, name: 'Strength', arcana: 'Major', keywords: 'Inner strength, courage, persuasion, influence, compassion', image: '🦁' },
  { id: 10, name: 'The Hermit', arcana: 'Major', keywords: 'Soul-searching, introspective, inner guidance, solitude', image: '🕯️' },
  { id: 11, name: 'Wheel of Fortune', arcana: 'Major', keywords: 'Good luck, karma, life cycles, destiny, turning point', image: '☸️' },
  { id: 12, name: 'Justice', arcana: 'Major', keywords: 'Fairness, truth, cause and effect, law, accountability', image: '⚖️' },
  { id: 13, name: 'The Hanged Man', arcana: 'Major', keywords: 'Surrender, letting go, new perspective, pausing', image: '🙃' },
  { id: 14, name: 'Death', arcana: 'Major', keywords: 'Endings, change, transformation, transition, rebirth', image: '🦋' },
  { id: 15, name: 'Temperance', arcana: 'Major', keywords: 'Balance, moderation, patience, purpose, alignment', image: '🍷' },
  { id: 16, name: 'The Star', arcana: 'Major', keywords: 'Hope, faith, purpose, renewal, inspiration, healing', image: '🌟' },
  { id: 17, name: 'The Sun', arcana: 'Major', keywords: 'Positivity, fun, warmth, success, vitality, clarity', image: '☀️' },
  { id: 18, name: 'The World', arcana: 'Major', keywords: 'Completion, integration, accomplishment, travel, fulfillment', image: '🌍' },
  { id: 19, name: 'Ace of Cups', arcana: 'Minor', keywords: 'Overflowing love, emotional awakening, spiritual connection', image: '🏆' },
  { id: 20, name: 'Ace of Pentacles', arcana: 'Minor', keywords: 'New financial opportunity, prosperity, manifestation', image: '🪙' },
  { id: 21, name: 'Ace of Swords', arcana: 'Minor', keywords: 'Breakthrough, mental clarity, sharp mind, truth', image: '⚔️' },
  { id: 22, name: 'Ace of Wands', arcana: 'Minor', keywords: 'Inspiration, spark, passion, new creative pursuit', image: '🔥' },
];

/**
 * Shuffles deck and draws a 3-Card Spread (Past/Foundation, Present State, Future Potential)
 */
export function drawTarotSpread(spreadType = 'three_card') {
  const shuffled = [...TAROT_CARDS].sort(() => Math.random() - 0.5);

  const drawnCards = [
    {
      position: 'Past / Foundation',
      card: shuffled[0],
      isUpright: Math.random() > 0.25,
    },
    {
      position: 'Present State & Challenge',
      card: shuffled[1],
      isUpright: Math.random() > 0.25,
    },
    {
      position: 'Future Outlook & Guidance',
      card: shuffled[2],
      isUpright: Math.random() > 0.25,
    }
  ];

  return {
    spreadType,
    cards: drawnCards,
  };
}
