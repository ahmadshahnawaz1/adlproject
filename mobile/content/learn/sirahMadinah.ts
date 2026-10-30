/**
 * content/learn/sirahMadinah.ts — the Sīrah, part two: from the Hijrah through
 * the Madinan years, the opening of Makkah, and the farewell.
 *
 * Continues the ordered timeline begun in sirahMakkah.ts. Drawn from the
 * Qurʾān, the authentic Sunnah, and the classical Sīrah literature. Narrative
 * in nature; pending final scholarly review.
 */
import type { SirahEvent } from './types';

export const SIRAH_MADINAH: SirahEvent[] = [
  {
    id: 'sirah-hijrah',
    order: 17,
    year: '622 CE / 1 AH',
    era: 'hijrah',
    title: 'The Hijrah to Madīnah',
    arabic: 'الهجرة',
    place: 'Makkah → Madīnah',
    summary: 'With Abū Bakr, he migrates; the cave of Thawr shelters them.',
    tags: ['hijrah', 'migration', 'thawr', 'abu bakr', 'medina', 'calendar'],
    body: [
      {
        kind: 'para',
        text: 'As Quraysh plotted to kill him, Allah permitted the Hijrah. The Prophet ﷺ left with Abū Bakr, hiding three days in the cave of Thawr as searchers stood at its mouth. Abū Bakr feared for them, but the Prophet ﷺ reassured him with the words Allah recorded in the Qurʾān. They reached Madīnah to a joyous welcome.',
      },
      {
        kind: 'ayah',
        reference: 'al-Tawbah 9:40',
        arabic: 'لَا تَحْزَنْ إِنَّ ٱللَّهَ مَعَنَا',
        translation: 'Do not grieve; indeed Allah is with us.',
      },
      {
        kind: 'callout',
        tone: 'note',
        text: 'The Hijrah was so pivotal that ʿUmar later made it the start of the Islamic calendar.',
      },
    ],
  },
  {
    id: 'sirah-mosque-brotherhood',
    order: 18,
    year: '1 AH',
    era: 'madinah',
    title: 'The Mosque & the Brotherhood',
    arabic: 'المسجد والمؤاخاة',
    place: 'Madīnah',
    summary: 'He builds the mosque and pairs the Muhājirūn with the Anṣār.',
    tags: ['mosque', 'brotherhood', 'muakhah', 'muhajirun', 'ansar', 'community'],
    body: [
      {
        kind: 'para',
        text: 'Among his first acts was building the Prophet\u2019s Mosque — a centre of worship, learning, and governance. He then bound the emigrants (Muhājirūn) and the helpers (Anṣār) in a brotherhood so profound that the Anṣār shared their homes and wealth, one of the most remarkable acts of generosity in history.',
      },
      {
        kind: 'ayah',
        reference: 'al-Ḥashr 59:9',
        arabic: 'وَيُؤْثِرُونَ عَلَىٰٓ أَنفُسِهِمْ وَلَوْ كَانَ بِهِمْ خَصَاصَةٌ',
        translation: 'And they give preference over themselves, even though they are in need.',
      },
    ],
  },
  {
    id: 'sirah-constitution',
    order: 19,
    year: '1 AH',
    era: 'madinah',
    title: 'The Constitution of Madīnah',
    arabic: 'صحيفة المدينة',
    place: 'Madīnah',
    summary: 'A written covenant orders the life of the new city-state.',
    tags: ['constitution', 'covenant', 'sahifah', 'governance', 'justice'],
    body: [
      {
        kind: 'para',
        text: 'The Prophet ﷺ drew up a written covenant uniting the Muhājirūn, the Anṣār, and the Jewish tribes of Madīnah into one community (ummah) with shared defence, mutual rights, and freedom of religion under agreed law. It established justice and security as the foundation of the city.',
      },
      {
        kind: 'callout',
        tone: 'wisdom',
        text: 'The document shows Islam ordering communal life with clear rights, responsibilities, and protection for all who lived under its covenant.',
      },
    ],
  },
  {
    id: 'sirah-badr',
    order: 20,
    year: '2 AH',
    era: 'madinah',
    title: 'The Battle of Badr',
    arabic: 'غزوة بدر',
    place: 'Badr',
    summary: 'A small, outnumbered force is granted a decisive victory.',
    tags: ['badr', 'battle', 'victory', 'angels', 'furqan'],
    body: [
      {
        kind: 'para',
        text: 'About three hundred believers met a Makkan army of roughly a thousand at the wells of Badr. The Prophet ﷺ spent the night in prayer, imploring his Lord. Allah sent angels to support the believers, and the Quraysh were routed — a victory the Qurʾān calls the Day of Criterion (al-Furqān), distinguishing truth from falsehood.',
      },
      {
        kind: 'ayah',
        reference: 'Āl ʿImrān 3:123',
        arabic: 'وَلَقَدْ نَصَرَكُمُ ٱللَّهُ بِبَدْرٍ وَأَنتُمْ أَذِلَّةٌ',
        translation: 'And already had Allah given you victory at Badr while you were few [in number].',
      },
    ],
  },
  {
    id: 'sirah-uhud',
    order: 21,
    year: '3 AH',
    era: 'madinah',
    title: 'The Battle of Uḥud',
    arabic: 'غزوة أحد',
    place: 'Mount Uḥud, Madīnah',
    summary: 'A hard lesson in obedience and patience after early success.',
    tags: ['uhud', 'battle', 'archers', 'hamzah', 'obedience', 'lesson'],
    body: [
      {
        kind: 'para',
        text: 'The Quraysh returned for revenge. The believers had the upper hand until the archers, stationed to guard a pass, left their post for the spoils — and the enemy cavalry swept around behind them. Many were martyred, including the Prophet\u2019s beloved uncle Ḥamzah, and the Prophet ﷺ himself was wounded. The Qurʾān turned the day into lasting guidance on obedience, sincerity, and patience.',
      },
      {
        kind: 'ayah',
        reference: 'Āl ʿImrān 3:152',
        arabic: 'حَتَّىٰٓ إِذَا فَشِلْتُمْ وَتَنَـٰزَعْتُمْ فِى ٱلْأَمْرِ وَعَصَيْتُم',
        translation: '…until, when you lost courage, disputed about the order, and disobeyed…',
      },
    ],
  },
  {
    id: 'sirah-khandaq',
    order: 22,
    year: '5 AH',
    era: 'madinah',
    title: 'The Battle of the Trench',
    arabic: 'غزوة الخندق',
    place: 'Madīnah',
    summary: 'A defensive trench and a fierce wind turn back the confederates.',
    tags: ['khandaq', 'trench', 'ahzab', 'salman', 'siege', 'wind'],
    body: [
      {
        kind: 'para',
        text: 'A vast coalition (al-Aḥzāb) marched on Madīnah. On the advice of Salmān al-Fārisī, the believers dug a trench around the exposed flank of the city — a strategy that bewildered the Arabs. After a tense siege, Allah sent a bitter wind and unseen forces that scattered the confederates, and they withdrew without victory.',
      },
      {
        kind: 'ayah',
        reference: 'al-Aḥzāb 33:9',
        arabic: 'فَأَرْسَلْنَا عَلَيْهِمْ رِيحًا وَجُنُودًا لَّمْ تَرَوْهَا',
        translation: 'So We sent upon them a wind and armies [of angels] you did not see.',
      },
    ],
  },
  {
    id: 'sirah-hudaybiyyah',
    order: 23,
    year: '6 AH',
    era: 'madinah',
    title: 'The Treaty of Ḥudaybiyyah',
    arabic: 'صلح الحديبية',
    place: 'Ḥudaybiyyah, near Makkah',
    summary: 'A truce that seemed a setback proves a "clear victory."',
    tags: ['hudaybiyyah', 'treaty', 'truce', 'clear victory', 'patience'],
    body: [
      {
        kind: 'para',
        text: 'Setting out for ʿUmrah, the believers were stopped at Ḥudaybiyyah. The Prophet ﷺ agreed to a ten-year truce on terms that seemed unfavourable — even turning back that year. Yet the peace it brought allowed Islam to spread rapidly, and Allah called it a "clear victory."',
      },
      {
        kind: 'ayah',
        reference: 'al-Fatḥ 48:1',
        arabic: 'إِنَّا فَتَحْنَا لَكَ فَتْحًا مُّبِينًا',
        translation: 'Indeed, We have given you a clear conquest.',
      },
      {
        kind: 'callout',
        tone: 'wisdom',
        text: 'Ḥudaybiyyah teaches that the wisest path is not always the one that looks like victory in the moment.',
      },
    ],
  },
  {
    id: 'sirah-letters-kings',
    order: 24,
    year: '6–7 AH',
    era: 'madinah',
    title: 'Letters to the Kings',
    arabic: 'رسائل إلى الملوك',
    place: 'Madīnah → the world',
    summary: 'The Prophet ﷺ invites the rulers of the world to Islam.',
    tags: ['letters', 'kings', 'heraclius', 'najashi', 'dawah', 'global'],
    body: [
      {
        kind: 'para',
        text: 'With the truce in place, the Prophet ﷺ sent envoys bearing letters to the great rulers of his age — among them Heraclius of Byzantium, the Negus of Abyssinia, and the Muqawqis of Egypt — inviting them to Islam. The message was no longer for Arabia alone, but a mercy addressed to all the worlds.',
      },
      {
        kind: 'ayah',
        reference: 'al-Anbiyāʾ 21:107',
        arabic: 'وَمَآ أَرْسَلْنَـٰكَ إِلَّا رَحْمَةً لِّلْعَـٰلَمِينَ',
        translation: 'And We have not sent you except as a mercy to the worlds.',
      },
    ],
  },
  {
    id: 'sirah-khaybar',
    order: 25,
    year: '7 AH',
    era: 'madinah',
    title: 'The Opening of Khaybar',
    arabic: 'فتح خيبر',
    place: 'Khaybar',
    summary: 'The fortified oasis is opened; security returns to the north.',
    tags: ['khaybar', 'ali', 'fortress', 'victory'],
    body: [
      {
        kind: 'para',
        text: 'The fortresses of Khaybar, a base of hostility against Madīnah, were opened after a determined campaign. The Prophet ﷺ gave the banner to ʿAlī ibn Abī Ṭālib, of whom he said that Allah would grant victory through his hands. Peace and stability were restored to the region.',
      },
    ],
  },
  {
    id: 'sirah-umrah-qada',
    order: 26,
    year: '7 AH',
    era: 'madinah',
    title: 'The ʿUmrah of Fulfilment',
    arabic: 'عمرة القضاء',
    place: 'Makkah',
    summary: 'The believers return to perform the ʿUmrah they had been denied.',
    tags: ['umrah', 'fulfilment', 'qada', 'makkah'],
    body: [
      {
        kind: 'para',
        text: 'As the terms of Ḥudaybiyyah allowed, the Prophet ﷺ and the believers returned the following year to perform the ʿUmrah they had been turned back from. For three days they made ṭawāf around the Kaʿbah as the Quraysh watched from the hills — a powerful sign of how far Islam had come.',
      },
    ],
  },
  {
    id: 'sirah-conquest-makkah',
    order: 27,
    year: '8 AH',
    era: 'conquest',
    title: 'The Conquest of Makkah',
    arabic: 'فتح مكة',
    place: 'Makkah',
    summary: 'Makkah is opened almost without bloodshed; a great amnesty is given.',
    tags: ['conquest', 'makkah', 'amnesty', 'forgiveness', 'idols', 'victory'],
    body: [
      {
        kind: 'para',
        text: 'When Quraysh broke the truce, the Prophet ﷺ marched on Makkah with ten thousand believers, and the city was opened almost without a fight. Entering humbly, head bowed in gratitude, he cleansed the Kaʿbah of its idols. To the very people who had persecuted and expelled him, he declared a general amnesty: "Go, for you are free."',
      },
      {
        kind: 'ayah',
        reference: 'al-Isrāʾ 17:81',
        arabic: 'وَقُلْ جَآءَ ٱلْحَقُّ وَزَهَقَ ٱلْبَـٰطِلُ ۚ إِنَّ ٱلْبَـٰطِلَ كَانَ زَهُوقًا',
        translation: 'And say, "Truth has come and falsehood has departed. Indeed falsehood is bound to depart."',
      },
    ],
  },
  {
    id: 'sirah-hunayn',
    order: 28,
    year: '8 AH',
    era: 'conquest',
    title: 'The Battle of Ḥunayn',
    arabic: 'غزوة حنين',
    place: 'Valley of Ḥunayn',
    summary: 'A lesson that victory comes from Allah, not numbers.',
    tags: ['hunayn', 'battle', 'numbers', 'reliance', 'lesson'],
    body: [
      {
        kind: 'para',
        text: 'Soon after Makkah, the large Muslim army was ambushed in the valley of Ḥunayn and nearly scattered in the opening moments. The Prophet ﷺ stood firm and called the believers back, and Allah granted victory — a reminder that triumph is by Allah\u2019s help, never by numbers alone.',
      },
      {
        kind: 'ayah',
        reference: 'al-Tawbah 9:25',
        arabic: 'وَيَوْمَ حُنَيْنٍ ۙ إِذْ أَعْجَبَتْكُمْ كَثْرَتُكُمْ فَلَمْ تُغْنِ عَنكُمْ شَيْـًٔا',
        translation: 'And on the day of Ḥunayn, when your great number pleased you, but it availed you nothing.',
      },
    ],
  },
  {
    id: 'sirah-tabuk-delegations',
    order: 29,
    year: '9 AH',
    era: 'conquest',
    title: 'Tabūk & the Year of Delegations',
    arabic: 'تبوك وعام الوفود',
    place: 'Tabūk → Madīnah',
    summary: 'A test of sincerity, then delegations enter Islam in crowds.',
    tags: ['tabuk', 'delegations', 'wufud', 'sincerity', 'expansion'],
    body: [
      {
        kind: 'para',
        text: 'In the heat and hardship of the Tabūk expedition, the sincere were distinguished from the hypocrites. Afterwards, tribes from across Arabia came to Madīnah in delegations to accept Islam — so many that the year is called ʿĀm al-Wufūd, the Year of Delegations, fulfilling the promise that people would enter Allah\u2019s religion in crowds.',
      },
      {
        kind: 'ayah',
        reference: 'al-Naṣr 110:2',
        arabic: 'وَرَأَيْتَ ٱلنَّاسَ يَدْخُلُونَ فِى دِينِ ٱللَّهِ أَفْوَاجًا',
        translation: 'And you see the people entering into the religion of Allah in multitudes.',
      },
    ],
  },
  {
    id: 'sirah-farewell',
    order: 30,
    year: '10 AH',
    era: 'farewell',
    title: 'The Farewell Pilgrimage',
    arabic: 'حجة الوداع',
    place: 'ʿArafah, Makkah',
    summary: 'The final sermon proclaims rights, justice, and the completed faith.',
    tags: ['farewell', 'hajj', 'arafah', 'sermon', 'completion', 'rights'],
    body: [
      {
        kind: 'para',
        text: 'In the tenth year the Prophet ﷺ led the believers in ḥajj and delivered his Farewell Sermon at ʿArafah before a vast gathering. He affirmed the sanctity of life and wealth, abolished the practices of ignorance, enjoined the good treatment of women, declared all people equal before Allah, and left the believers with the Qurʾān and his Sunnah.',
      },
      {
        kind: 'ayah',
        reference: 'al-Māʾidah 5:3',
        arabic: 'ٱلْيَوْمَ أَكْمَلْتُ لَكُمْ دِينَكُمْ وَأَتْمَمْتُ عَلَيْكُمْ نِعْمَتِى',
        translation: 'This day I have perfected for you your religion and completed My favour upon you.',
      },
    ],
  },
  {
    id: 'sirah-passing',
    order: 31,
    year: '11 AH',
    era: 'farewell',
    title: 'The Passing of the Prophet ﷺ',
    arabic: 'وفاة النبي ﷺ',
    place: 'Madīnah',
    summary: 'The Messenger ﷺ returns to his Lord, his message complete.',
    tags: ['passing', 'death', 'wafat', 'abu bakr', 'legacy'],
    body: [
      {
        kind: 'para',
        text: 'Not long after the Farewell Pilgrimage, the Prophet ﷺ fell ill and passed away in the apartment of ʿĀʾishah, at the age of sixty-three. As grief overwhelmed the believers, Abū Bakr steadied them with timeless words: whoever worshipped Muḥammad, Muḥammad has died; but whoever worships Allah, Allah is Ever-Living and never dies.',
      },
      {
        kind: 'ayah',
        reference: 'Āl ʿImrān 3:144',
        arabic: 'وَمَا مُحَمَّدٌ إِلَّا رَسُولٌ قَدْ خَلَتْ مِن قَبْلِهِ ٱلرُّسُلُ',
        translation: 'Muḥammad is but a messenger; [other] messengers have passed on before him.',
      },
      {
        kind: 'callout',
        tone: 'wisdom',
        text: 'He left behind no gold or silver, but the greatest legacy in history: a preserved Book, a living Sunnah, and a community carrying his message to the world.',
      },
    ],
  },
  {
    id: 'sirah-legacy',
    order: 32,
    year: 'After 11 AH',
    era: 'farewell',
    title: 'A Mercy to the Worlds',
    arabic: 'رحمة للعالمين',
    place: 'The whole earth',
    summary: 'His character and message endure as guidance for all people.',
    tags: ['legacy', 'character', 'sunnah', 'mercy', 'example'],
    body: [
      {
        kind: 'para',
        text: 'The life of the Prophet ﷺ remains the finest example for humanity — in worship, in mercy, in justice, in family, and in forbearance. To follow him is to follow the path Allah loves, and in his character the believer finds a guide for every situation of life.',
      },
      {
        kind: 'ayah',
        reference: 'al-Aḥzāb 33:21',
        arabic: 'لَّقَدْ كَانَ لَكُمْ فِى رَسُولِ ٱللَّهِ أُسْوَةٌ حَسَنَةٌ',
        translation: 'There has certainly been for you in the Messenger of Allah an excellent example.',
      },
      {
        kind: 'hadith',
        daleel: {
          source: 'hadith',
          reference: 'Muwaṭṭaʾ Mālik 1661',
          grade: 'Ḥasan',
          text: '"I have left among you two things; you will never go astray as long as you hold to them: the Book of Allah and the Sunnah of His Prophet."',
        },
      },
    ],
  },
];
