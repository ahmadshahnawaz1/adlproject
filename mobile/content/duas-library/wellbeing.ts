/**
 * wellbeing.ts — the supplications of the body and of sustenance: for the sick,
 * for pain, for well-being, and for lawful provision and relief from debt.
 *
 * Sections: `health`, `provision`. Each is cited to the Sunnah.
 */
import type { Dua } from './types';

/* ------------------------------------------------------------------ *
 * Health & healing
 * ------------------------------------------------------------------ */
export const HEALTH_DUAS: Dua[] = [
  {
    id: 'visiting-sick',
    category: 'health',
    title: 'Visiting the sick',
    when: 'Beside the ill',
    arabic: 'لَا بَأْسَ طَهُورٌ إِنْ شَاءَ اللَّهُ',
    transliteration: 'Lā baʾsa ṭahūrun in shāʾa-llāh',
    translation: 'No harm — (it is) a purification, if Allah wills.',
    tags: ['sick', 'illness', 'visiting', 'healing', 'patient'],
    daleel: {
      source: 'hadith',
      reference: 'Ṣaḥīḥ al-Bukhārī 3616',
      narrator: 'Ibn ʿAbbās',
      grade: 'Ṣaḥīḥ',
      text: 'When the Prophet ﷺ visited a sick person he would say this.',
    },
  },
  {
    id: 'ruqyah-sick',
    category: 'health',
    title: 'Asking Allah to heal',
    when: 'For one who is ill',
    repeat: 7,
    arabic: 'أَسْأَلُ اللَّهَ الْعَظِيمَ، رَبَّ الْعَرْشِ الْعَظِيمِ، أَنْ يَشْفِيَكَ',
    transliteration: 'Asʾalu-llāha-l-ʿaẓīm, rabba-l-ʿarshi-l-ʿaẓīm, an yashfiyak',
    translation: 'I ask Allah the Magnificent, Lord of the Magnificent Throne, to heal you.',
    virtue:
      'Whoever visits a sick person whose time has not come and says it seven times, Allah heals him of that illness.',
    tags: ['sick', 'illness', 'healing', 'ruqyah', 'shifa', 'cure'],
    daleel: {
      source: 'hadith',
      reference: 'Sunan Abī Dāwūd 3106, Jāmiʿ at-Tirmidhī 2083',
      narrator: 'Ibn ʿAbbās',
      grade: 'Ṣaḥīḥ',
      text: 'No servant visits a sick person whose term has not arrived and says it seven times but that Allah cures him.',
    },
  },
  {
    id: 'pain-in-body',
    category: 'health',
    title: 'For pain in the body',
    when: 'Hand on the painful spot',
    repeat: 7,
    arabic: 'أَعُوذُ بِعِزَّةِ اللَّهِ وَقُدْرَتِهِ مِنْ شَرِّ مَا أَجِدُ وَأُحَاذِرُ',
    transliteration: '(Bismillāh ×3, then:) Aʿūdhu bi-ʿizzati-llāhi wa qudratihi min sharri mā ajidu wa uḥādhir',
    translation:
      '(In the name of Allah ×3.) I seek refuge in the might of Allah and His power from the evil of what I feel and fear.',
    virtue: 'Place your hand where it hurts; say “Bismillāh” thrice, then this seven times.',
    tags: ['pain', 'illness', 'healing', 'body', 'refuge', 'ache'],
    daleel: {
      source: 'hadith',
      reference: 'Ṣaḥīḥ Muslim 2202',
      narrator: 'ʿUthmān ibn Abi-l-ʿĀṣ',
      grade: 'Ṣaḥīḥ',
      text: 'The Prophet ﷺ taught this to one who complained of pain in his body.',
    },
  },
  {
    id: 'wellbeing-afiyah',
    category: 'health',
    title: 'Well-being of body & senses',
    when: 'Morning & evening',
    arabic:
      'اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَهَ إِلَّا أَنْتَ',
    transliteration:
      'Allāhumma ʿāfinī fī badanī, Allāhumma ʿāfinī fī samʿī, Allāhumma ʿāfinī fī baṣarī, lā ilāha illā ant',
    translation:
      'O Allah, grant me well-being in my body. O Allah, grant me well-being in my hearing. O Allah, grant me well-being in my sight. There is no deity but You.',
    tags: ['health', 'wellbeing', 'afiyah', 'body', 'hearing', 'sight'],
    daleel: {
      source: 'hadith',
      reference: 'Sunan Abī Dāwūd 5090',
      narrator: 'Abū Bakrah',
      grade: 'Ḥasan',
      text: 'The Prophet ﷺ would say this morning and evening.',
    },
  },
];

/* ------------------------------------------------------------------ *
 * Provision & debt
 * ------------------------------------------------------------------ */
export const PROVISION_DUAS: Dua[] = [
  {
    id: 'debt-relief',
    category: 'provision',
    title: 'Relief from debt',
    when: 'When burdened by debt',
    arabic:
      'اللَّهُمَّ اكْفِنِي بِحَلَالِكَ عَنْ حَرَامِكَ، وَأَغْنِنِي بِفَضْلِكَ عَمَّنْ سِوَاكَ',
    transliteration: 'Allāhumma-kfinī bi-ḥalālika ʿan ḥarāmik, wa aghninī bi-faḍlika ʿamman siwāk',
    translation:
      'O Allah, suffice me with what You have made lawful against what You have forbidden, and make me independent of all besides You.',
    virtue: 'Even were your debt like a mountain, Allah would pay it off for you.',
    tags: ['debt', 'provision', 'rizq', 'money', 'sufficiency', 'loan'],
    daleel: {
      source: 'hadith',
      reference: 'Jāmiʿ at-Tirmidhī 3563',
      narrator: 'ʿAlī ibn Abī Ṭālib',
      grade: 'Ḥasan',
      text: 'The Prophet ﷺ taught this to one weighed down by debt.',
    },
  },
  {
    id: 'rizq-tayyib',
    category: 'provision',
    title: 'Beneficial provision',
    when: 'In the morning',
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا',
    transliteration: 'Allāhumma innī asʾaluka ʿilman nāfiʿā, wa rizqan ṭayyibā, wa ʿamalan mutaqabbalā',
    translation:
      'O Allah, I ask You for beneficial knowledge, good provision, and accepted deeds.',
    tags: ['provision', 'rizq', 'knowledge', 'sustenance', 'morning', 'work'],
    daleel: {
      source: 'hadith',
      reference: 'Sunan Ibn Mājah 925',
      narrator: 'Umm Salamah',
      grade: 'Ṣaḥīḥ',
      text: 'The Prophet ﷺ would say this after the morning prayer.',
    },
  },
];
