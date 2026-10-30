/**
 * content/learn/newmuslim.ts — a guided path for the new Muslim.
 *
 * A short, ordered track that carries someone from the testimony of faith to
 * their first prayer and first habits of worship. Several steps offer a jump
 * into a dedicated feature of the app (Wudū, How to Pray, the Qurʾān, Adhkār).
 * Evidence-cited; pending final scholarly review.
 */
import type { Track } from './types';

export const NEW_MUSLIM_TRACK: Track = {
  id: 'new-muslim',
  title: 'Your First Steps in Islam',
  arabic: 'خطواتك الأولى',
  subtitle: 'A gentle, guided path from the shahādah to your first prayer.',
  steps: [
    {
      id: 'nm-welcome',
      title: 'Welcome',
      arabic: 'أهلاً وسهلاً',
      summary: 'A warm beginning — and the good news of a fresh start.',
      body: [
        {
          kind: 'para',
          text: 'Welcome to Islam, or to the journey of learning about it. Whatever brought you here, know that taking even one step toward your Creator is a beautiful thing. This path will walk you gently through the first essentials — one small step at a time, with no rush.',
        },
        {
          kind: 'callout',
          tone: 'wisdom',
          title: 'A clean slate',
          text: 'The Prophet ﷺ taught that accepting Islam erases whatever sins came before it. You begin completely fresh, beloved to your Lord.',
        },
        {
          kind: 'hadith',
          daleel: {
            source: 'hadith',
            reference: 'Ṣaḥīḥ Muslim 121',
            narrator: 'ʿAmr ibn al-ʿĀṣ',
            grade: 'Ṣaḥīḥ',
            text: '"Do you not know that Islam wipes out what came before it?"',
          },
        },
      ],
    },
    {
      id: 'nm-shahadah',
      title: 'The Testimony of Faith',
      arabic: 'الشهادة',
      summary: 'The few words that open the door to Islam, and their meaning.',
      body: [
        {
          kind: 'para',
          text: 'A person enters Islam by believing in, and saying, the two testimonies. They affirm that worship belongs to Allah alone, and that Muḥammad ﷺ is His final Messenger whose guidance we follow.',
        },
        {
          kind: 'dua',
          arabic: 'أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا رَسُولُ اللَّهِ',
          transliteration: 'Ashhadu an lā ilāha illā Allāh, wa ashhadu anna Muḥammadan rasūlu-llāh',
          translation: 'I bear witness that there is no deity but Allah, and that Muḥammad is the Messenger of Allah.',
        },
        {
          kind: 'callout',
          tone: 'note',
          text: 'If saying these words is new for you, it is recommended to make ghusl (a full bath) as you begin your life as a Muslim, purified inside and out.',
        },
      ],
    },
    {
      id: 'nm-purity',
      title: 'Purifying Yourself',
      arabic: 'الطهارة',
      summary: 'Cleanliness is the key to prayer — learn how to make wuḍūʾ.',
      body: [
        {
          kind: 'para',
          text: 'Before we stand to pray, we purify ourselves with wuḍūʾ — a simple, prescribed washing of the face, arms, head, and feet. It is easy to learn and quickly becomes second nature.',
        },
        {
          kind: 'ayah',
          reference: 'al-Baqarah 2:222',
          arabic: 'إِنَّ ٱللَّهَ يُحِبُّ ٱلتَّوَّٰبِينَ وَيُحِبُّ ٱلْمُتَطَهِّرِينَ',
          translation: 'Indeed, Allah loves those who turn to Him and those who purify themselves.',
        },
      ],
      action: { label: 'Open the Wudū guide', target: 'wudu' },
    },
    {
      id: 'nm-salah',
      title: 'Your First Prayer',
      arabic: 'الصلاة',
      summary: 'The five daily prayers — and a step-by-step guide to perform them.',
      body: [
        {
          kind: 'para',
          text: 'Prayer (ṣalāh) is the heart of a Muslim\u2019s day — five short appointments with Allah at dawn, midday, afternoon, sunset, and night. Do not worry about learning everything at once; begin, and Allah will make it easy. The "How to Pray" guide teaches each movement and saying with its evidence.',
        },
        {
          kind: 'hadith',
          daleel: {
            source: 'hadith',
            reference: 'Ṣaḥīḥ al-Bukhārī 631',
            narrator: 'Mālik ibn al-Ḥuwayrith',
            grade: 'Ṣaḥīḥ',
            text: '"Pray as you have seen me praying."',
          },
        },
      ],
      action: { label: 'Open How to Pray', target: 'salah' },
    },
    {
      id: 'nm-quran',
      title: 'The Qurʾān — Your Guide',
      arabic: 'القرآن',
      summary: 'Begin a lifelong relationship with the Book of Allah.',
      body: [
        {
          kind: 'para',
          text: 'The Qurʾān is Allah\u2019s own words, your direct connection to Him and your guide for life. Start small — even a few short sūrahs you can learn for your prayer, like al-Fātiḥah and the last short chapters. The reward of reciting it is immense.',
        },
        {
          kind: 'hadith',
          daleel: {
            source: 'hadith',
            reference: 'Sunan al-Tirmidhī 2910',
            narrator: 'Ibn Masʿūd',
            grade: 'Ṣaḥīḥ',
            text: '"Whoever recites a letter of the Book of Allah has a reward, and that reward is multiplied by ten."',
          },
        },
      ],
      action: { label: 'Open the Qurʾān', target: 'quran' },
    },
    {
      id: 'nm-adhkar',
      title: 'Remembering Allah Daily',
      arabic: 'الأذكار',
      summary: 'Short, simple phrases that keep the heart connected all day.',
      body: [
        {
          kind: 'para',
          text: 'Beyond the five prayers, the believer keeps the tongue and heart moist with the remembrance of Allah (dhikr) — simple phrases said in the morning and evening and throughout the day. They are light on the tongue and heavy on the scale.',
        },
        {
          kind: 'dua',
          arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ',
          transliteration: 'Subḥāna-llāhi wa bi-ḥamdih, subḥāna-llāhi-l-ʿaẓīm',
          translation: 'Glory be to Allah and His is the praise; glory be to Allah the Magnificent.',
          reference: 'Ṣaḥīḥ al-Bukhārī 6406',
        },
      ],
      action: { label: 'Open Adhkār', target: 'adhkar' },
    },
    {
      id: 'nm-halal',
      title: 'Halal & Harām Basics',
      arabic: 'الحلال والحرام',
      summary: 'A simple compass for daily choices, built on ease.',
      body: [
        {
          kind: 'para',
          text: 'Islam guides our choices in food, earnings, and conduct toward what is pure (ḥalāl) and away from what is harmful (ḥarām). The default in worldly things is permissibility, so do not be overwhelmed — learn the clear matters first: avoiding pork, intoxicants, and interest, and choosing ḥalāl food. The rest you will learn step by step.',
        },
        {
          kind: 'ayah',
          reference: 'al-Baqarah 2:168',
          arabic: 'يَـٰٓأَيُّهَا ٱلنَّاسُ كُلُوا۟ مِمَّا فِى ٱلْأَرْضِ حَلَـٰلًا طَيِّبًا',
          translation: 'O people, eat from whatever is on earth that is lawful and good.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          text: 'When something is unclear, ask a trusted, knowledgeable person. Seeking knowledge gently and steadily is itself an act of worship.',
        },
      ],
    },
    {
      id: 'nm-character',
      title: 'Beautiful Character & Community',
      arabic: 'حسن الخلق',
      summary: 'Faith shows in how we treat others — and in good company.',
      body: [
        {
          kind: 'para',
          text: 'The Prophet ﷺ taught that the believers most complete in faith are the best in character. Kindness to parents, honesty, gentleness, and patience are at the core of Islam. Seek out good company and a local community or mosque — faith grows strong among brothers and sisters who support one another.',
        },
        {
          kind: 'hadith',
          daleel: {
            source: 'hadith',
            reference: 'Sunan al-Tirmidhī 2018',
            narrator: 'Abū Hurayrah',
            grade: 'Ṣaḥīḥ',
            text: '"The most complete of the believers in faith are those best in character."',
          },
        },
      ],
      action: { label: 'Find a mosque nearby', target: 'mosques' },
    },
    {
      id: 'nm-keep-going',
      title: 'Keep Growing',
      arabic: 'الاستمرار',
      summary: 'Steady, small steps — the deeds most beloved to Allah.',
      body: [
        {
          kind: 'para',
          text: 'You do not need to become a scholar overnight. The most beloved deeds to Allah are the consistent ones, even if small. Keep your prayers, keep learning a little each day, ask Allah to keep your heart firm, and be gentle with yourself. You have already taken the most important step of all.',
        },
        {
          kind: 'dua',
          arabic: 'يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ',
          transliteration: 'Yā muqalliba-l-qulūb, thabbit qalbī ʿalā dīnik',
          translation: 'O Turner of hearts, keep my heart firm upon Your religion.',
          reference: 'Sunan al-Tirmidhī 2140',
        },
        {
          kind: 'callout',
          tone: 'wisdom',
          text: 'Explore the Learning Hub\u2019s lessons on belief and worship, and the life of the Prophet ﷺ, whenever you are ready for the next step.',
        },
      ],
    },
  ],
};
