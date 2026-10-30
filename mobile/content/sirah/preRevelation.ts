/**
 * content/sirah/preRevelation.ts — the Sīrah before prophethood.
 *
 * From the Year of the Elephant to the eve of revelation. Graded and sourced;
 * the spine rests on the Qurʾān and Ṣaḥīḥayn, with the classical Sīrah filling
 * detail under its own grade.
 */
import type { SirahEvent } from './types';

export const SIRAH_PRE_REVELATION: SirahEvent[] = [
  {
    id: 'sr-birth',
    order: 1,
    era: 'pre-prophethood',
    yearLabel: '≈ 570 CE',
    title: 'The Year of the Elephant & the Birth',
    arabic: 'عام الفيل والمولد',
    place: 'Makkah',
    geo: { lat: 21.4225, lng: 39.8262 },
    summary: 'Muḥammad ﷺ is born into the Quraysh in the year Abrahah’s army was destroyed.',
    grade: 'established',
    gradeNote: 'The destruction of the elephant army is in the Qurʾān; the birth in that period is agreed upon.',
    sources: [{ work: 'Qurʾān — Sūrat al-Fīl' }, { work: 'al-Raḥīq al-Makhtūm' }, { work: 'Ibn Hishām' }],
    quranRefs: [{ surah: 105, ayah: 1, label: 'al-Fīl 105:1' }],
    people: ['abdullah', 'aminah', 'abdul-muttalib'],
    tags: ['birth', 'elephant', 'abrahah', 'quraysh', 'banu hashim'],
    lessons: [
      'Allah protected His House before the one who would honour it was even born.',
      'The Prophet ﷺ came from the noblest lineage of the Arabs, yet his honour was in his character, not his ancestry.',
    ],
    body: [
      {
        kind: 'para',
        text: 'In the year an Abyssinian army marched on Makkah with an elephant to destroy the Kaʿbah — and was turned back by Allah, as recounted in Sūrat al-Fīl — the Prophet Muḥammad ﷺ was born into the noble clan of Banū Hāshim of the Quraysh. His father ʿAbdullāh had passed away before his birth, so he entered the world an orphan.',
      },
      {
        kind: 'ayah',
        reference: 'al-Fīl 105:1',
        arabic: 'أَلَمْ تَرَ كَيْفَ فَعَلَ رَبُّكَ بِأَصْحَـٰبِ ٱلْفِيلِ',
        translation: 'Have you not seen how your Lord dealt with the companions of the elephant?',
      },
      {
        kind: 'callout',
        tone: 'note',
        title: 'On the date',
        text: 'He ﷺ was born on a Monday — as he himself affirmed when asked about fasting Mondays (Ṣaḥīḥ Muslim). The exact day of the month is not established with certainty.',
      },
    ],
  },
  {
    id: 'sr-childhood',
    order: 2,
    era: 'pre-prophethood',
    yearLabel: '≈ 570–582 CE',
    title: 'An Orphan Raised in Makkah',
    arabic: 'اليتم والنشأة',
    place: 'Makkah & Banū Saʿd',
    summary: 'Nursed by Ḥalīmah and orphaned young, he is raised by his grandfather then Abū Ṭālib.',
    grade: 'established',
    gradeNote: 'The orphanhood is affirmed in the Qurʾān; the opening of the chest is in Ṣaḥīḥ Muslim.',
    sources: [{ work: 'Qurʾān — Sūrat al-Ḍuḥā' }, { work: 'Ṣaḥīḥ Muslim', location: '162' }, { work: 'Ibn Hishām' }],
    quranRefs: [{ surah: 93, ayah: 6, label: 'al-Ḍuḥā 93:6' }],
    hadithRefs: [{ collectionId: 'muslim', number: 162, label: 'Muslim 162' }],
    people: ['halimah', 'aminah', 'abdul-muttalib', 'abu-talib'],
    tags: ['orphan', 'halimah', 'chest', 'abu talib', 'childhood'],
    lessons: [
      'Allah personally cared for His Messenger through every loss — "Did He not find you an orphan and give refuge?"',
      'Hardship early in life was preparation, not punishment.',
    ],
    body: [
      {
        kind: 'para',
        text: 'As an infant he was nursed in the desert by Ḥalīmah of Banū Saʿd, whose household was blessed by his presence. His mother Āminah passed away when he was about six, and his grandfather ʿAbd al-Muṭṭalib two years later. His uncle Abū Ṭālib then took him into his care and loved him dearly.',
      },
      {
        kind: 'ayah',
        reference: 'al-Ḍuḥā 93:6',
        arabic: 'أَلَمْ يَجِدْكَ يَتِيمًا فَـَٔاوَىٰ',
        translation: 'Did He not find you an orphan and give [you] refuge?',
      },
      {
        kind: 'hadith',
        daleel: {
          source: 'hadith',
          reference: 'Ṣaḥīḥ Muslim 162',
          narrator: 'Anas ibn Mālik',
          grade: 'Ṣaḥīḥ',
          text: 'Jibrīl came to the Prophet ﷺ as a child, opened his chest, and purified his heart — a preparation for the trust he would carry.',
        },
      },
    ],
  },
  {
    id: 'sr-al-amin',
    order: 3,
    era: 'pre-prophethood',
    yearLabel: '≈ 580–595 CE',
    title: 'The Trustworthy Youth & the Pact of Virtue',
    arabic: 'الأمين وحلف الفضول',
    place: 'Makkah',
    summary: 'Known to all as al-Ṣādiq al-Amīn, he joins a pact to defend the wronged.',
    grade: 'well-supported',
    gradeNote: 'His approval of Ḥilf al-Fuḍūl is in a ḥasan report; his reputation for honesty is agreed upon.',
    sources: [{ work: 'Musnad Aḥmad' }, { work: 'al-Raḥīq al-Makhtūm' }, { work: 'Ibn Hishām' }],
    people: ['abu-talib'],
    tags: ['al-amin', 'hilf al-fudul', 'shepherd', 'honesty', 'justice'],
    lessons: [
      'Islam did not invent good character — it perfected it; the Prophet ﷺ was honest and just before revelation.',
      'Standing for the oppressed is praiseworthy even when the ones standing are not yet Muslim.',
    ],
    body: [
      {
        kind: 'para',
        text: 'Even in a city of idols, the young Muḥammad ﷺ was known to everyone as al-Ṣādiq al-Amīn — the truthful, the trustworthy. He tended sheep, as the prophets before him did, and traded with scrupulous honesty.',
      },
      {
        kind: 'para',
        text: 'When the wronged had no redress in Makkah, he joined chiefs of Quraysh in Ḥilf al-Fuḍūl, a pact to stand with the oppressed against the oppressor. Years later he said he would still answer such a call.',
      },
      {
        kind: 'hadith',
        daleel: {
          source: 'hadith',
          reference: 'Musnad Aḥmad',
          grade: 'Ḥasan',
          text: '"I witnessed a pact in the house of ʿAbdullāh ibn Judʿān… were I called to it in Islam I would answer."',
        },
      },
    ],
  },
  {
    id: 'sr-khadijah',
    order: 4,
    era: 'pre-prophethood',
    yearLabel: '≈ 595 CE',
    title: 'Marriage to Khadījah',
    arabic: 'زواج خديجة',
    place: 'Makkah',
    summary: 'Impressed by his honesty, the noble Khadījah proposes; theirs is a marriage of deep love.',
    grade: 'well-supported',
    sources: [{ work: 'Ṣaḥīḥ al-Bukhārī' }, { work: 'Ibn Hishām' }, { work: 'al-Raḥīq al-Makhtūm' }],
    people: ['khadijah'],
    tags: ['khadijah', 'marriage', 'trade', 'love'],
    lessons: [
      'The best of marriages is built on trust, character, and mutual support.',
      'Khadījah’s discernment recognised greatness before the world did.',
    ],
    body: [
      {
        kind: 'para',
        text: 'Trading on behalf of the noble and wealthy Khadījah bint Khuwaylid, his honesty and character so impressed her that she proposed marriage. He was about twenty-five and she about forty. Theirs was a marriage of profound love and loyalty, and she bore most of his children.',
      },
      {
        kind: 'callout',
        tone: 'wisdom',
        text: 'Khadījah would become the first to believe in him and his firmest comfort in the hardest years of the mission — Allah conveyed to her His greetings and news of a home in Paradise (Ṣaḥīḥ al-Bukhārī).',
      },
    ],
  },
  {
    id: 'sr-kaaba-arbitration',
    order: 5,
    era: 'pre-prophethood',
    yearLabel: '≈ 605 CE',
    title: 'The Black Stone Arbitration',
    arabic: 'تحكيم الحجر الأسود',
    place: 'Makkah',
    summary: 'His wisdom averts bloodshed when the Quraysh rebuild the Kaʿbah.',
    grade: 'reported',
    gradeNote: 'Carried by the classical Sīrah (Ibn Isḥāq); widely transmitted, though outside the Ṣaḥīḥayn.',
    sources: [{ work: 'Ibn Hishām' }, { work: 'al-Raḥīq al-Makhtūm' }],
    tags: ['kaaba', 'black stone', 'wisdom', 'quraysh'],
    lessons: ['Wisdom resolves conflict where pride inflames it.', 'Leadership is trusted long before it is formally given.'],
    body: [
      {
        kind: 'para',
        text: 'When the Quraysh rebuilt the Kaʿbah, the clans nearly came to war over who would set the Black Stone in place. They agreed to accept the judgement of the next man to enter — and it was Muḥammad ﷺ. He placed the stone on his cloak and had a chief of each clan lift a corner, then set it himself, satisfying all and averting bloodshed.',
      },
      {
        kind: 'callout',
        tone: 'note',
        text: 'His God-given wisdom and the trust of his people were evident long before the first revelation.',
      },
    ],
  },
  {
    id: 'sr-hira-retreats',
    order: 6,
    era: 'pre-prophethood',
    yearLabel: '≈ 609 CE',
    title: 'Solitude in Ḥirāʾ',
    arabic: 'التحنث في حراء',
    place: 'Cave of Ḥirāʾ, Makkah',
    geo: { lat: 21.4577, lng: 39.8592 },
    summary: 'Drawn to reflection, he withdraws to a cave above Makkah as revelation nears.',
    grade: 'established',
    sources: [{ work: 'Ṣaḥīḥ al-Bukhārī', location: '3' }],
    hadithRefs: [{ collectionId: 'bukhari', number: 3, label: 'Bukhārī 3' }],
    tags: ['hira', 'solitude', 'reflection', 'tahannuth'],
    lessons: [
      'Stillness and reflection prepare the heart for guidance.',
      'True seeking turns away from a corrupt society toward the truth.',
    ],
    body: [
      {
        kind: 'para',
        text: 'As he neared forty, the Prophet ﷺ grew ever more drawn to solitude. He would withdraw to the cave of Ḥirāʾ on a mountain above Makkah for many nights, devoting himself to worship and reflection, far from the idolatry of his people — until the truth came to him there.',
      },
      {
        kind: 'hadith',
        daleel: {
          source: 'hadith',
          reference: 'Ṣaḥīḥ al-Bukhārī 3',
          narrator: 'ʿĀʾishah',
          grade: 'Ṣaḥīḥ',
          text: 'Solitude was made dear to him, and he would seclude himself in the cave of Ḥirāʾ, worshipping for many nights.',
        },
      },
    ],
  },
];
