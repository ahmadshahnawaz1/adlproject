/**
 * content/learn/sirahMakkah.ts — the Sīrah, part one: from before revelation
 * through the Makkan years to the eve of the Hijrah.
 *
 * An ordered set of the well-known events in the life of the Prophet ﷺ, drawn
 * from the Qurʾān, the authentic Sunnah, and the classical Sīrah literature
 * (Ibn Isḥāq / Ibn Hishām). Narrative in nature; pending final scholarly review.
 */
import type { SirahEvent } from './types';

export const SIRAH_MAKKAH: SirahEvent[] = [
  {
    id: 'sirah-birth',
    order: 1,
    year: '≈ 570 CE',
    era: 'before-revelation',
    title: 'The Year of the Elephant & the Birth',
    arabic: 'عام الفيل',
    place: 'Makkah',
    summary: 'Muḥammad ﷺ is born into the Quraysh in the year Abrahah\u2019s army was destroyed.',
    tags: ['birth', 'elephant', 'abrahah', 'quraysh', 'abdullah', 'aminah'],
    body: [
      {
        kind: 'para',
        text: 'In the year an Abyssinian army marched on Makkah with an elephant to destroy the Kaʿbah — and was turned back by Allah, as recounted in Sūrat al-Fīl — the Prophet Muḥammad ﷺ was born into the noble clan of Banū Hāshim of the Quraysh. His father ʿAbdullāh had already passed away before his birth.',
      },
      {
        kind: 'ayah',
        reference: 'al-Fīl 105:1',
        arabic: 'أَلَمْ تَرَ كَيْفَ فَعَلَ رَبُّكَ بِأَصْحَـٰبِ ٱلْفِيلِ',
        translation: 'Have you not seen how your Lord dealt with the companions of the elephant?',
      },
    ],
  },
  {
    id: 'sirah-childhood',
    order: 2,
    year: '≈ 570–582 CE',
    era: 'before-revelation',
    title: 'An Orphan Raised in Makkah',
    arabic: 'اليتم والنشأة',
    place: 'Makkah',
    summary: 'Orphaned young, he is raised by his grandfather then his uncle Abū Ṭālib.',
    tags: ['orphan', 'abdul-muttalib', 'abu talib', 'halimah', 'childhood'],
    body: [
      {
        kind: 'para',
        text: 'As an infant he was nursed in the desert by Ḥalīmah of Banū Saʿd. His mother Āminah passed away when he was about six, and his grandfather ʿAbd al-Muṭṭalib two years later. His uncle Abū Ṭālib then took him into his care and loved him dearly.',
      },
      {
        kind: 'ayah',
        reference: 'al-Ḍuḥā 93:6',
        arabic: 'أَلَمْ يَجِدْكَ يَتِيمًا فَـَٔاوَىٰ',
        translation: 'Did He not find you an orphan and give [you] refuge?',
      },
      {
        kind: 'callout',
        tone: 'wisdom',
        text: 'Even before prophethood, Allah was shaping His Messenger — teaching him reliance and protecting his character among a people of idols.',
      },
    ],
  },
  {
    id: 'sirah-al-amin',
    order: 3,
    year: '≈ 595 CE',
    era: 'before-revelation',
    title: 'Al-Amīn & Marriage to Khadījah',
    arabic: 'الأمين وزواج خديجة',
    place: 'Makkah',
    summary: 'Known for his honesty, he marries Khadījah bint Khuwaylid.',
    tags: ['al-amin', 'khadijah', 'marriage', 'trade', 'honesty'],
    body: [
      {
        kind: 'para',
        text: 'Even in a city of idolatry, Muḥammad ﷺ was known to all as al-Ṣādiq al-Amīn — the truthful, the trustworthy. Trading on behalf of the noble and wealthy Khadījah bint Khuwaylid, his honesty and character so impressed her that she proposed marriage. He was about twenty-five and she about forty; theirs was a marriage of deep love and support.',
      },
      {
        kind: 'callout',
        tone: 'note',
        text: 'Khadījah would become the first to believe in him and his greatest comfort in the hardest years of the mission.',
      },
    ],
  },
  {
    id: 'sirah-kaaba-arbitration',
    order: 4,
    year: '≈ 605 CE',
    era: 'before-revelation',
    title: 'The Black Stone Arbitration',
    arabic: 'تحكيم الحجر الأسود',
    place: 'Makkah',
    summary: 'His wisdom averts bloodshed when the Quraysh rebuild the Kaʿbah.',
    tags: ['kaaba', 'black stone', 'hajar al-aswad', 'wisdom', 'quraysh'],
    body: [
      {
        kind: 'para',
        text: 'When the Quraysh rebuilt the Kaʿbah, the clans nearly came to war over who would have the honour of setting the Black Stone in place. They agreed to accept the judgement of the next man to enter — and it was Muḥammad ﷺ. He placed the stone upon his cloak and had a chief of each clan lift a corner, then set it himself, satisfying all and averting bloodshed.',
      },
      {
        kind: 'callout',
        tone: 'wisdom',
        text: 'His God-given wisdom and the trust of his people were evident long before the first revelation.',
      },
    ],
  },
  {
    id: 'sirah-first-revelation',
    order: 5,
    year: '610 CE',
    era: 'makkah',
    title: 'The First Revelation in Ḥirāʾ',
    arabic: 'بدء الوحي',
    place: 'Cave of Ḥirāʾ, Makkah',
    summary: 'Jibrīl brings the first words of the Qurʾān: "Read!"',
    tags: ['revelation', 'hira', 'jibril', 'iqra', 'first', 'wahy'],
    body: [
      {
        kind: 'para',
        text: 'Drawn to solitude and reflection, he would retreat to the cave of Ḥirāʾ. At the age of forty, the angel Jibrīl came to him and commanded, "Read!" Three times he pressed him, then revealed the opening āyāt of Sūrat al-ʿAlaq — the first words of the Qurʾān.',
      },
      {
        kind: 'ayah',
        reference: 'al-ʿAlaq 96:1',
        arabic: 'ٱقْرَأْ بِٱسْمِ رَبِّكَ ٱلَّذِى خَلَقَ',
        translation: 'Read in the name of your Lord who created.',
      },
      {
        kind: 'hadith',
        daleel: {
          source: 'hadith',
          reference: 'Ṣaḥīḥ al-Bukhārī 3',
          narrator: 'ʿĀʾishah',
          grade: 'Ṣaḥīḥ',
          text: 'The revelation began with true visions, then the angel came to him in Ḥirāʾ and said, "Read," and he replied, "I am not one who reads."',
        },
      },
    ],
  },
  {
    id: 'sirah-khadijah-waraqah',
    order: 6,
    year: '610 CE',
    era: 'makkah',
    title: 'Khadījah\u2019s Faith & Waraqah',
    arabic: 'تثبيت خديجة وورقة',
    place: 'Makkah',
    summary: 'Khadījah believes and reassures him; Waraqah recognises the sign.',
    tags: ['khadijah', 'waraqah', 'first believer', 'reassurance'],
    body: [
      {
        kind: 'para',
        text: 'Returning home trembling, he said, "Cover me!" Khadījah wrapped him and reassured him with words of certainty: "Never! By Allah, Allah will never disgrace you. You keep ties of kinship, bear the burdens of others, and help those in need." She took him to her cousin Waraqah ibn Nawfal, who recognised this as the same revelation that had come to Mūsā.',
      },
      {
        kind: 'hadith',
        daleel: {
          source: 'hadith',
          reference: 'Ṣaḥīḥ al-Bukhārī 3',
          narrator: 'ʿĀʾishah',
          grade: 'Ṣaḥīḥ',
          text: 'Khadījah said, "By Allah, Allah will never disgrace you. You uphold the ties of kinship and help those in need…"',
        },
      },
    ],
  },
  {
    id: 'sirah-secret-call',
    order: 7,
    year: '610–613 CE',
    era: 'makkah',
    title: 'The Quiet Beginning',
    arabic: 'الدعوة السرية',
    place: 'Makkah',
    summary: 'The first to believe: Khadījah, Abū Bakr, ʿAlī, and Zayd.',
    tags: ['secret', 'abu bakr', 'ali', 'zayd', 'first muslims', 'dawah'],
    body: [
      {
        kind: 'para',
        text: 'For about three years the call was given quietly. The first to believe were those closest to him: his wife Khadījah; his friend Abū Bakr al-Ṣiddīq; the young ʿAlī ibn Abī Ṭālib; and his freed servant Zayd ibn Ḥārithah. Through Abū Bakr, many noble companions entered Islam, including ʿUthmān, al-Zubayr, ʿAbd al-Raḥmān ibn ʿAwf, Saʿd ibn Abī Waqqāṣ, and Ṭalḥah.',
      },
      {
        kind: 'callout',
        tone: 'note',
        text: 'They met and learned in the house of al-Arqam at the foot of Mount Ṣafā — the first quiet school of Islam.',
      },
    ],
  },
  {
    id: 'sirah-open-call',
    order: 8,
    year: '613 CE',
    era: 'makkah',
    title: 'The Open Call on Mount Ṣafā',
    arabic: 'الجهر بالدعوة',
    place: 'Makkah',
    summary: 'Commanded to proclaim openly, he warns his closest kin.',
    tags: ['open call', 'safa', 'warning', 'quraysh', 'public'],
    body: [
      {
        kind: 'para',
        text: 'When Allah commanded, "And warn your closest kindred" (al-Shuʿarāʾ 26:214), the Prophet ﷺ climbed Mount Ṣafā and called the clans of Quraysh. He asked, "If I told you an army was about to attack from behind this hill, would you believe me?" They said, "We have never known you to lie." He said, "Then I am a warner to you before a severe punishment."',
      },
      {
        kind: 'ayah',
        reference: 'al-Ḥijr 15:94',
        arabic: 'فَٱصْدَعْ بِمَا تُؤْمَرُ وَأَعْرِضْ عَنِ ٱلْمُشْرِكِينَ',
        translation: 'So proclaim openly what you are commanded, and turn away from the polytheists.',
      },
    ],
  },
  {
    id: 'sirah-persecution',
    order: 9,
    year: '613–615 CE',
    era: 'makkah',
    title: 'The Trial of the Believers',
    arabic: 'اضطهاد المستضعفين',
    place: 'Makkah',
    summary: 'The weak among the believers are tortured for their faith.',
    tags: ['persecution', 'bilal', 'yasir', 'sumayyah', 'patience', 'torture'],
    body: [
      {
        kind: 'para',
        text: 'As the message spread, the Quraysh turned to cruelty against the vulnerable. Bilāl ibn Rabāḥ was laid on the burning sand with a rock on his chest, yet repeated, "Aḥad, Aḥad" — "One, One." The family of Yāsir was tortured; Sumayyah became the first martyr of Islam. Abū Bakr spent his wealth freeing those enslaved for their faith.',
      },
      {
        kind: 'hadith',
        daleel: {
          source: 'hadith',
          reference: 'Ṣaḥīḥ al-Bukhārī 3856',
          narrator: 'ʿAmmār ibn Yāsir',
          grade: 'Ṣaḥīḥ',
          text: 'The Prophet ﷺ passed by the family of Yāsir as they were being tortured and said, "Be patient, family of Yāsir, for your appointed place is Paradise."',
        },
      },
    ],
  },
  {
    id: 'sirah-abyssinia',
    order: 10,
    year: '615 CE',
    era: 'makkah',
    title: 'The Migration to Abyssinia',
    arabic: 'الهجرة إلى الحبشة',
    place: 'Abyssinia (Ethiopia)',
    summary: 'Believers find refuge with the just Christian king, the Negus.',
    tags: ['abyssinia', 'habashah', 'najashi', 'migration', 'jafar'],
    body: [
      {
        kind: 'para',
        text: 'To escape persecution, a group of believers crossed the sea to Abyssinia, whose king (the Negus) was known for justice. When the Quraysh sent envoys to demand their return, Jaʿfar ibn Abī Ṭālib spoke for the believers, describing how Islam raised them from ignorance, and recited verses of Sūrat Maryam. Moved to tears, the Negus refused to surrender them.',
      },
      {
        kind: 'callout',
        tone: 'wisdom',
        text: 'This first hijrah taught that seeking safety and justice — even under a righteous non-Muslim ruler — is a legitimate means of preserving faith.',
      },
    ],
  },
  {
    id: 'sirah-umar-hamzah',
    order: 11,
    year: '≈ 616 CE',
    era: 'makkah',
    title: 'ʿUmar & Ḥamzah Embrace Islam',
    arabic: 'إسلام عمر وحمزة',
    place: 'Makkah',
    summary: 'Two mighty men accept Islam, strengthening the believers.',
    tags: ['umar', 'hamzah', 'strength', 'conversion'],
    body: [
      {
        kind: 'para',
        text: 'Allah answered the Prophet\u2019s duʿāʾ to strengthen Islam through one of two men named ʿUmar. ʿUmar ibn al-Khaṭṭāb set out to harm the Prophet ﷺ but, hearing the Qurʾān recited in his sister\u2019s home, was overcome and went straight to declare his faith. With ʿUmar and the Prophet\u2019s uncle Ḥamzah now among them, the believers prayed openly at the Kaʿbah for the first time.',
      },
      {
        kind: 'hadith',
        daleel: {
          source: 'hadith',
          reference: 'Sunan al-Tirmidhī 3681',
          narrator: 'Ibn ʿUmar',
          grade: 'Ḥasan',
          text: '"O Allah, strengthen Islam with the dearer of these two men to You: with Abū Jahl or with ʿUmar ibn al-Khaṭṭāb." And ʿUmar was the dearer of them to Him.',
        },
      },
    ],
  },
  {
    id: 'sirah-boycott',
    order: 12,
    year: '≈ 617–619 CE',
    era: 'makkah',
    title: 'The Boycott of Banū Hāshim',
    arabic: 'حصار الشعب',
    place: 'Valley of Abū Ṭālib, Makkah',
    summary: 'Three harsh years of social and economic siege.',
    tags: ['boycott', 'siege', 'banu hashim', 'hardship', 'patience'],
    body: [
      {
        kind: 'para',
        text: 'Unable to stop the message, the Quraysh imposed a total boycott on Banū Hāshim — no trade, no marriage, no contact. For about three years the clan was confined to a mountain valley, enduring such hunger that they ate leaves. The pact was finally broken when several fair-minded men of Quraysh objected, and it was found that worms had eaten the document of boycott, sparing only the name of Allah.',
      },
    ],
  },
  {
    id: 'sirah-year-of-sorrow',
    order: 13,
    year: '≈ 619 CE',
    era: 'makkah',
    title: 'The Year of Sorrow',
    arabic: 'عام الحزن',
    place: 'Makkah',
    summary: 'The Prophet ﷺ loses both Khadījah and Abū Ṭālib.',
    tags: ['year of sorrow', 'khadijah death', 'abu talib death', 'grief'],
    body: [
      {
        kind: 'para',
        text: 'Within a short span the Prophet ﷺ lost his devoted wife Khadījah — his first believer and comfort — and his protecting uncle Abū Ṭālib. With their loss, the persecution of Quraysh grew bolder. This year of grief is remembered as ʿĀm al-Ḥuzn.',
      },
      {
        kind: 'callout',
        tone: 'note',
        text: 'Allah honoured Khadījah with greetings of peace conveyed through Jibrīl, and the glad tidings of a house in Paradise.',
      },
    ],
  },
  {
    id: 'sirah-taif',
    order: 14,
    year: '≈ 619 CE',
    era: 'makkah',
    title: 'The Journey to Ṭāʾif',
    arabic: 'رحلة الطائف',
    place: 'Ṭāʾif',
    summary: 'Rejected and stoned, he answers cruelty with mercy.',
    tags: ['taif', 'rejection', 'mercy', 'angel of mountains', 'patience'],
    body: [
      {
        kind: 'para',
        text: 'Seeking new ground for the message, the Prophet ﷺ travelled to Ṭāʾif, but its leaders refused him and set their children to stone him until his feet bled. As he withdrew in grief, Jibrīl came with the Angel of the Mountains, offering to crush the town between the two hills. The Prophet ﷺ declined, hoping their descendants would one day worship Allah alone.',
      },
      {
        kind: 'hadith',
        daleel: {
          source: 'hadith',
          reference: 'Ṣaḥīḥ al-Bukhārī 3231',
          narrator: 'ʿĀʾishah',
          grade: 'Ṣaḥīḥ',
          text: 'He said, "Rather, I hope that Allah will bring forth from their loins those who worship Allah alone, associating nothing with Him."',
        },
      },
    ],
  },
  {
    id: 'sirah-isra-miraj',
    order: 15,
    year: '≈ 620 CE',
    era: 'makkah',
    title: 'The Night Journey & Ascension',
    arabic: 'الإسراء والمعراج',
    place: 'Makkah → Jerusalem → the Heavens',
    summary: 'A miraculous night journey; the five daily prayers are ordained.',
    tags: ['isra', 'miraj', 'al-aqsa', 'ascension', 'five prayers', 'night journey'],
    body: [
      {
        kind: 'para',
        text: 'In a single night, Allah carried His servant from the Sacred Mosque in Makkah to al-Masjid al-Aqṣā in Jerusalem, where he led the prophets in prayer, then ascended through the heavens. It was on this night that the five daily prayers were made obligatory — the only act of worship ordained directly in the heavens.',
      },
      {
        kind: 'ayah',
        reference: 'al-Isrāʾ 17:1',
        arabic: 'سُبْحَـٰنَ ٱلَّذِىٓ أَسْرَىٰ بِعَبْدِهِۦ لَيْلًا مِّنَ ٱلْمَسْجِدِ ٱلْحَرَامِ إِلَى ٱلْمَسْجِدِ ٱلْأَقْصَا',
        translation: 'Exalted is He who took His servant by night from the Sacred Mosque to the Farthest Mosque.',
      },
    ],
  },
  {
    id: 'sirah-aqabah',
    order: 16,
    year: '621–622 CE',
    era: 'makkah',
    title: 'The Pledges of ʿAqabah',
    arabic: 'بيعتا العقبة',
    place: 'ʿAqabah, near Makkah',
    summary: 'The people of Yathrib accept Islam and pledge their protection.',
    tags: ['aqabah', 'pledge', 'ansar', 'yathrib', 'medina', 'musab'],
    body: [
      {
        kind: 'para',
        text: 'Pilgrims from Yathrib (later Madīnah) met the Prophet ﷺ at ʿAqabah and embraced Islam. In two successive years they pledged their faith and their protection, inviting him and the believers to their city. He sent Muṣʿab ibn ʿUmayr ahead to teach them the Qurʾān, and Islam spread swiftly through the households of Yathrib.',
      },
      {
        kind: 'callout',
        tone: 'note',
        text: 'These pledges opened the door to the Hijrah — and to the first community where Islam could be lived freely.',
      },
    ],
  },
];
