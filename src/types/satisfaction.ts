// Shared satisfaction rating types and constants

export interface SatisfactionLevel {
  value: number;
  emoji: string;
  label: string;
}

export const satisfactionEmojis: SatisfactionLevel[] = [
  { value: 1, emoji: '😤', label: 'Frustrating' },
  { value: 2, emoji: '😕', label: 'Below expectations' },
  { value: 3, emoji: '😐', label: 'Standard' },
  { value: 4, emoji: '😊', label: 'Smooth' },
  { value: 5, emoji: '🚀', label: 'Exceptional' },
];

// Helper function to get satisfaction by value
export const getSatisfactionByValue = (
  value: number
): SatisfactionLevel | undefined => {
  return satisfactionEmojis.find(s => s.value === value);
};

// Helper function to get satisfaction display text
export const getSatisfactionDisplay = (value: number): string => {
  const satisfaction = getSatisfactionByValue(value);
  return satisfaction
    ? `${satisfaction.emoji} ${satisfaction.label}`
    : 'Unknown';
};
