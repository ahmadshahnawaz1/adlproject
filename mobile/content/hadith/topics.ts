/**
 * content/hadith/topics.ts — browsable themes across the library.
 *
 * Each topic is metadata only; membership is computed in lib/hadith from every
 * hadith's `topics` array, so a theme automatically gathers matching narrations
 * from any bundled collection. Icons are lucide names resolved in the UI.
 */
import type { HadithTopic } from './types';

export const HADITH_TOPICS: HadithTopic[] = [
  {
    id: 'intention',
    title: 'Intention & Sincerity',
    arabic: 'الإخلاص والنية',
    subtitle: 'Doing deeds for Allah alone',
    icon: 'Target',
  },
  {
    id: 'faith',
    title: 'Faith & Creed',
    arabic: 'الإيمان',
    subtitle: 'The foundations of belief',
    icon: 'Gem',
  },
  {
    id: 'worship',
    title: 'Worship',
    arabic: 'العبادة',
    subtitle: 'Prayer, fasting and the pillars',
    icon: 'Sparkles',
  },
  {
    id: 'character',
    title: 'Character',
    arabic: 'حسن الخلق',
    subtitle: 'The manners of the believer',
    icon: 'Smile',
  },
  {
    id: 'mercy',
    title: 'Mercy & Compassion',
    arabic: 'الرحمة',
    subtitle: 'Gentleness with creation',
    icon: 'Heart',
  },
  {
    id: 'brotherhood',
    title: 'Brotherhood',
    arabic: 'الأخوة',
    subtitle: 'Rights of one another',
    icon: 'Users',
  },
  {
    id: 'taqwa',
    title: 'God-consciousness',
    arabic: 'التقوى',
    subtitle: 'Mindfulness of Allah',
    icon: 'ShieldCheck',
  },
  {
    id: 'charity',
    title: 'Charity',
    arabic: 'الصدقة',
    subtitle: 'Giving in every form',
    icon: 'HandCoins',
  },
  {
    id: 'knowledge',
    title: 'Knowledge',
    arabic: 'العلم',
    subtitle: 'Seeking and acting on it',
    icon: 'GraduationCap',
  },
  {
    id: 'dhikr',
    title: 'Remembrance',
    arabic: 'الذكر',
    subtitle: 'Keeping the heart connected',
    icon: 'BookOpenText',
  },
  {
    id: 'forgiveness',
    title: 'Hope & Forgiveness',
    arabic: 'المغفرة',
    subtitle: 'The vastness of Allah’s pardon',
    icon: 'Sun',
  },
  {
    id: 'zuhd',
    title: 'Detachment',
    arabic: 'الزهد',
    subtitle: 'Putting the world in its place',
    icon: 'Feather',
  },
  {
    id: 'justice',
    title: 'Justice & Rights',
    arabic: 'العدل والحقوق',
    subtitle: 'Fairness and sanctity',
    icon: 'Scale',
  },
  {
    id: 'paradise',
    title: 'Paradise',
    arabic: 'الجنة',
    subtitle: 'What Allah has prepared',
    icon: 'Trees',
  },
];
