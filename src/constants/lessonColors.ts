// Shared lesson colour map — instructors pick a colour to tag lessons however they like
export const LESSON_COLORS = [
  { id: 'purple', hex: '#8B5CF6', bg: 'bg-violet-500', text: 'text-white' },
  { id: 'blue',   hex: '#3B82F6', bg: 'bg-blue-500',   text: 'text-white' },
  { id: 'green',  hex: '#22C55E', bg: 'bg-green-500',  text: 'text-white' },
  { id: 'orange', hex: '#F97316', bg: 'bg-orange-500', text: 'text-white' },
  { id: 'pink',   hex: '#EC4899', bg: 'bg-pink-500',   text: 'text-white' },
] as const;

export type LessonColor = typeof LESSON_COLORS[number]['id'];

export const getLessonColorConfig = (color?: string | null) => {
  return LESSON_COLORS.find(c => c.id === color) || LESSON_COLORS[0]; // default purple
};
