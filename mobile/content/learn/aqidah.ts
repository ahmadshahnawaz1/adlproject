/**
 * content/learn/aqidah.ts — the foundations of belief.
 *
 * A grounded set of lessons on tawḥīd (the Oneness of Allah), the six pillars
 * of īmān, and the testimony that opens Islam. Every lesson is built from the
 * shared block vocabulary and carries its evidence from the Qurʾān and the
 * authentic Sunnah. Pending final scholarly review.
 */
import type { Lesson } from './types';

export const AQIDAH_LESSONS: Lesson[] = [
  {
    id: 'aqidah-what',
    topicId: 'aqidah',
    group: 'Foundations',
    title: 'What is ʿAqīdah?',
    arabic: 'العقيدة',
    summary: 'Belief is the root; deeds are the branches. Why creed comes first.',
    minutes: 3,
    tags: ['aqidah', 'belief', 'creed', 'iman', 'foundation'],
    body: [
      {
        kind: 'para',
        text: 'ʿAqīdah is what the heart firmly ties itself to and rests upon — the settled convictions a Muslim holds about Allah, the unseen, and the purpose of life. It is the root from which all worship grows: when belief is sound, deeds are accepted and the heart is at peace; when belief is corrupted, even great deeds are undermined.',
      },
      {
        kind: 'para',
        text: 'This is why the Prophet ﷺ spent the first thirteen years in Makkah calling people, above all, to correct their belief about Allah before the detailed laws of worship were revealed.',
      },
      {
        kind: 'ayah',
        reference: 'Muḥammad 47:19',
        arabic: 'فَٱعْلَمْ أَنَّهُۥ لَآ إِلَـٰهَ إِلَّا ٱللَّهُ',
        translation: 'So know that there is no deity except Allah.',
      },
      {
        kind: 'callout',
        tone: 'note',
        title: 'Knowledge before action',
        text: 'Scholars note that this āyah commands knowledge ("know") before action — a sign that sound belief precedes and directs righteous deeds.',
      },
    ],
  },
  {
    id: 'aqidah-tawhid-rububiyyah',
    topicId: 'aqidah',
    group: 'Tawḥīd',
    title: 'Tawḥīd of Lordship',
    arabic: 'توحيد الربوبية',
    summary: 'Allah alone creates, sustains, and controls all that exists.',
    minutes: 3,
    tags: ['tawhid', 'rububiyyah', 'lordship', 'creator', 'oneness'],
    body: [
      {
        kind: 'para',
        text: 'Tawḥīd al-Rubūbiyyah is to single out Allah in His actions: He alone is the Creator, the Sustainer, the Giver of life and death, the One who owns and governs the entire universe. Nothing happens in the heavens or the earth except by His will.',
      },
      {
        kind: 'ayah',
        reference: 'al-Fātiḥah 1:2',
        arabic: 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ',
        translation: 'All praise is due to Allah, Lord of all the worlds.',
      },
      {
        kind: 'para',
        text: 'Even the pagans of Makkah affirmed this kind of tawḥīd — they admitted Allah created them. Yet that admission alone did not make them Muslims, because they still directed worship to others besides Him. This shows that affirming the Lordship of Allah must lead to worshipping Him alone.',
      },
      {
        kind: 'ayah',
        reference: 'al-Zukhruf 43:87',
        arabic: 'وَلَئِن سَأَلْتَهُم مَّنْ خَلَقَهُمْ لَيَقُولُنَّ ٱللَّهُ',
        translation: 'And if you asked them who created them, they would surely say, "Allah."',
      },
    ],
  },
  {
    id: 'aqidah-tawhid-uluhiyyah',
    topicId: 'aqidah',
    group: 'Tawḥīd',
    title: 'Tawḥīd of Worship',
    arabic: 'توحيد الألوهية',
    summary: 'Every act of worship is for Allah alone — the heart of the message.',
    minutes: 4,
    tags: ['tawhid', 'uluhiyyah', 'worship', 'ibadah', 'shirk'],
    body: [
      {
        kind: 'para',
        text: 'Tawḥīd al-Ulūhiyyah is to direct every act of worship — love, hope, fear, reliance, supplication, sacrifice, vows — to Allah alone. This is the tawḥīd that the messengers were sent to establish and over which nations were divided.',
      },
      {
        kind: 'ayah',
        reference: 'al-Naḥl 16:36',
        arabic: 'وَلَقَدْ بَعَثْنَا فِى كُلِّ أُمَّةٍ رَّسُولًا أَنِ ٱعْبُدُوا۟ ٱللَّهَ وَٱجْتَنِبُوا۟ ٱلطَّـٰغُوتَ',
        translation: 'We sent to every nation a messenger, [saying], "Worship Allah and avoid false objects of worship."',
      },
      {
        kind: 'para',
        text: 'The testimony "lā ilāha illā Allāh" is precisely this: there is no one truly deserving of worship except Allah. Its meaning is not merely that Allah exists or that He is the Creator, but that He alone is to be worshipped.',
      },
      {
        kind: 'callout',
        tone: 'caution',
        title: 'The opposite of tawḥīd',
        text: 'Shirk — associating partners with Allah in worship — is the one sin Allah has said He will not forgive if a person dies upon it without repentance (al-Nisāʾ 4:48). Guarding worship for Allah alone is therefore the most important matter of all.',
      },
    ],
  },
  {
    id: 'aqidah-tawhid-asma',
    topicId: 'aqidah',
    group: 'Tawḥīd',
    title: 'Tawḥīd of Names & Attributes',
    arabic: 'توحيد الأسماء والصفات',
    summary: 'Affirming what Allah affirmed for Himself, without distortion.',
    minutes: 4,
    tags: ['tawhid', 'names', 'attributes', 'asma', 'sifat'],
    body: [
      {
        kind: 'para',
        text: 'Tawḥīd al-Asmāʾ wa al-Ṣifāt is to affirm for Allah the names and attributes He affirmed for Himself, and that His Messenger ﷺ affirmed for Him — without distorting their meaning, without denying them, without asking "how", and without likening Allah to His creation.',
      },
      {
        kind: 'ayah',
        reference: 'al-Shūrā 42:11',
        arabic: 'لَيْسَ كَمِثْلِهِۦ شَىْءٌ ۖ وَهُوَ ٱلسَّمِيعُ ٱلْبَصِيرُ',
        translation: 'There is nothing like unto Him, and He is the Hearing, the Seeing.',
      },
      {
        kind: 'para',
        text: 'This single āyah holds the balanced path: "There is nothing like unto Him" negates any resemblance to creation, while "He is the Hearing, the Seeing" affirms His attributes. We affirm that Allah truly hears and sees, while knowing His hearing and seeing are befitting His majesty and unlike ours.',
      },
      {
        kind: 'ayah',
        reference: 'al-Aʿrāf 7:180',
        arabic: 'وَلِلَّهِ ٱلْأَسْمَآءُ ٱلْحُسْنَىٰ فَٱدْعُوهُ بِهَا',
        translation: 'And to Allah belong the most beautiful names, so call upon Him by them.',
      },
    ],
  },
  {
    id: 'aqidah-iman-allah',
    topicId: 'aqidah',
    group: 'The Six Pillars of Īmān',
    title: 'Belief in Allah',
    arabic: 'الإيمان بالله',
    summary: 'The first pillar of faith — knowing and affirming the One.',
    minutes: 3,
    tags: ['iman', 'pillars', 'belief in allah', 'faith'],
    body: [
      {
        kind: 'para',
        text: 'When the angel Jibrīl came to teach the religion, he asked the Prophet ﷺ about īmān. The answer named six pillars — the unseen realities a believer affirms with certainty. The first and greatest is belief in Allah.',
      },
      {
        kind: 'hadith',
        daleel: {
          source: 'hadith',
          reference: 'Ṣaḥīḥ Muslim 8',
          narrator: 'ʿUmar ibn al-Khaṭṭāb',
          grade: 'Ṣaḥīḥ',
          text: '"…that you believe in Allah, His angels, His books, His messengers, the Last Day, and that you believe in divine decree, its good and its bad."',
        },
      },
      {
        kind: 'para',
        text: 'Belief in Allah includes affirming His existence, His exclusive Lordship, His sole right to be worshipped, and His perfect names and attributes — the three categories of tawḥīd brought together as living conviction.',
      },
    ],
  },
  {
    id: 'aqidah-iman-angels',
    topicId: 'aqidah',
    group: 'The Six Pillars of Īmān',
    title: 'Belief in the Angels',
    arabic: 'الإيمان بالملائكة',
    summary: 'Honoured servants of light who never disobey their Lord.',
    minutes: 3,
    tags: ['iman', 'angels', 'malaikah', 'jibril', 'unseen'],
    body: [
      {
        kind: 'para',
        text: 'The angels are a creation of Allah made from light, hidden from our sight. They carry out His commands perfectly and never tire of His worship. We believe in them in general, and in those named to us specifically — such as Jibrīl, who brought the revelation; Mīkāʾīl; and Isrāfīl.',
      },
      {
        kind: 'ayah',
        reference: 'al-Anbiyāʾ 21:19–20',
        arabic: 'لَا يَسْتَكْبِرُونَ عَنْ عِبَادَتِهِۦ وَلَا يَسْتَحْسِرُونَ ۝ يُسَبِّحُونَ ٱلَّيْلَ وَٱلنَّهَارَ لَا يَفْتُرُونَ',
        translation: 'They are not too proud to worship Him, nor do they tire. They glorify [Him] night and day, never slackening.',
      },
      {
        kind: 'callout',
        tone: 'wisdom',
        text: 'Knowing that honoured angels record our words and deeds (al-Infiṭār 82:10–12) plants watchfulness (murāqabah) in the heart and dignity in our private moments.',
      },
    ],
  },
  {
    id: 'aqidah-iman-books',
    topicId: 'aqidah',
    group: 'The Six Pillars of Īmān',
    title: 'Belief in the Books',
    arabic: 'الإيمان بالكتب',
    summary: 'Allah revealed guidance through scripture, sealed by the Qurʾān.',
    minutes: 3,
    tags: ['iman', 'books', 'quran', 'revelation', 'scripture'],
    body: [
      {
        kind: 'para',
        text: 'Allah revealed books to His messengers as light and guidance for humanity. We believe in those He named — the Scrolls of Ibrāhīm, the Tawrāh given to Mūsā, the Zabūr given to Dāwūd, the Injīl given to ʿĪsā — and that the Qurʾān is His final revelation, confirming and guarding what came before it.',
      },
      {
        kind: 'ayah',
        reference: 'al-Māʾidah 5:48',
        arabic: 'وَأَنزَلْنَآ إِلَيْكَ ٱلْكِتَـٰبَ بِٱلْحَقِّ مُصَدِّقًا لِّمَا بَيْنَ يَدَيْهِ مِنَ ٱلْكِتَـٰبِ وَمُهَيْمِنًا عَلَيْهِ',
        translation: 'And We revealed to you the Book in truth, confirming the scripture before it and as a guardian over it.',
      },
      {
        kind: 'para',
        text: 'The earlier scriptures were for their nations and times; the Qurʾān alone has been preserved unchanged and is the standard by which all earlier revelation is now measured.',
      },
    ],
  },
  {
    id: 'aqidah-iman-messengers',
    topicId: 'aqidah',
    group: 'The Six Pillars of Īmān',
    title: 'Belief in the Messengers',
    arabic: 'الإيمان بالرسل',
    summary: 'A chain of mercy from Nūḥ to Muḥammad ﷺ, the final Prophet.',
    minutes: 3,
    tags: ['iman', 'messengers', 'prophets', 'rusul', 'muhammad'],
    body: [
      {
        kind: 'para',
        text: 'Allah sent messengers to every nation, all calling to the same core message: worship Allah alone. We believe in all of them, love them, and make no distinction in believing in them — from Ādam, Nūḥ, Ibrāhīm, Mūsā and ʿĪsā, to the last of them, Muḥammad ﷺ, after whom there is no prophet.',
      },
      {
        kind: 'ayah',
        reference: 'al-Aḥzāb 33:40',
        arabic: 'مَّا كَانَ مُحَمَّدٌ أَبَآ أَحَدٍ مِّن رِّجَالِكُمْ وَلَـٰكِن رَّسُولَ ٱللَّهِ وَخَاتَمَ ٱلنَّبِيِّـۧنَ',
        translation: 'Muḥammad is not the father of any of your men, but the Messenger of Allah and the seal of the prophets.',
      },
      {
        kind: 'callout',
        tone: 'note',
        text: 'The messengers were human beings — they ate, slept, and felt — chosen and protected by Allah in delivering His message. They are not to be worshipped, but believed, loved, and obeyed.',
      },
    ],
  },
  {
    id: 'aqidah-iman-lastday',
    topicId: 'aqidah',
    group: 'The Six Pillars of Īmān',
    title: 'Belief in the Last Day',
    arabic: 'الإيمان باليوم الآخر',
    summary: 'Resurrection, the reckoning, and the eternal life to come.',
    minutes: 4,
    tags: ['iman', 'last day', 'akhirah', 'resurrection', 'judgment'],
    body: [
      {
        kind: 'para',
        text: 'We believe that this life will end, that the dead will be raised, and that all will stand before Allah to account for their deeds — then to Paradise or the Fire. Belief in the Last Day includes what the Prophet ﷺ told us of the questioning in the grave, the gathering, the scales, the bridge, and the intercession.',
      },
      {
        kind: 'ayah',
        reference: 'al-Zalzalah 99:7–8',
        arabic: 'فَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُۥ ۝ وَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ شَرًّا يَرَهُۥ',
        translation: 'So whoever does an atom\u2019s weight of good will see it, and whoever does an atom\u2019s weight of evil will see it.',
      },
      {
        kind: 'callout',
        tone: 'wisdom',
        text: 'Certainty in the Hereafter reframes every choice: no good is too small to matter, and no wrong is hidden. It is the believer\u2019s answer to both despair and heedlessness.',
      },
    ],
  },
  {
    id: 'aqidah-iman-qadar',
    topicId: 'aqidah',
    group: 'The Six Pillars of Īmān',
    title: 'Belief in Divine Decree',
    arabic: 'الإيمان بالقدر',
    summary: 'Allah knows, has written, wills, and creates all that is — its good and bad.',
    minutes: 4,
    tags: ['iman', 'qadar', 'decree', 'destiny', 'predestination'],
    body: [
      {
        kind: 'para',
        text: 'Belief in al-qadar rests on four levels: that Allah knows all things; that He wrote all things in the Preserved Tablet; that nothing occurs except by His will; and that He is the Creator of all things, including the actions of His servants. Yet Allah gave us real choice and the ability to act, and He never burdens a soul beyond its capacity.',
      },
      {
        kind: 'ayah',
        reference: 'al-Qamar 54:49',
        arabic: 'إِنَّا كُلَّ شَىْءٍ خَلَقْنَـٰهُ بِقَدَرٍ',
        translation: 'Indeed, all things We created with [precise] decree.',
      },
      {
        kind: 'para',
        text: 'The believer therefore strives and takes the means, trusts Allah with the outcome, is grateful in ease and patient in hardship — for both are from a Lord who is perfect in wisdom and mercy.',
      },
      {
        kind: 'hadith',
        daleel: {
          source: 'hadith',
          reference: 'Ṣaḥīḥ Muslim 2999',
          narrator: 'Ṣuhayb',
          grade: 'Ṣaḥīḥ',
          text: '"Wondrous is the affair of the believer: there is good for him in every matter. If ease comes he is grateful, and that is good for him; if hardship comes he is patient, and that is good for him."',
        },
      },
    ],
  },
  {
    id: 'aqidah-shahadatayn',
    topicId: 'aqidah',
    group: 'The Testimony',
    title: 'The Two Testimonies',
    arabic: 'الشهادتان',
    summary: 'The key to Islam: its meaning, conditions, and weight.',
    minutes: 4,
    tags: ['shahada', 'testimony', 'la ilaha illa allah', 'conversion'],
    body: [
      {
        kind: 'para',
        text: 'A person enters Islam with the two testimonies: "Ashhadu an lā ilāha illā Allāh, wa ashhadu anna Muḥammadan rasūl Allāh" — I bear witness that there is no deity worthy of worship except Allah, and that Muḥammad is the Messenger of Allah.',
      },
      {
        kind: 'dua',
        arabic: 'أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا رَسُولُ اللَّهِ',
        transliteration: 'Ashhadu an lā ilāha illā Allāh, wa ashhadu anna Muḥammadan rasūlu-llāh',
        translation: 'I bear witness that there is no deity but Allah, and that Muḥammad is the Messenger of Allah.',
      },
      {
        kind: 'para',
        text: 'The first testimony commits one to worship Allah alone; the second commits one to follow the Prophet ﷺ as the way that worship is done. Scholars mention conditions that give the testimony its life — among them knowledge of its meaning, certainty, sincerity, truthfulness, love, acceptance, and submission.',
      },
      {
        kind: 'hadith',
        daleel: {
          source: 'hadith',
          reference: 'Ṣaḥīḥ al-Bukhārī 128',
          narrator: 'Muʿādh ibn Jabal',
          grade: 'Ṣaḥīḥ',
          text: '"There is no one who testifies that there is no deity but Allah and that Muḥammad is His Messenger, truthfully from his heart, except that Allah forbids the Fire for him."',
        },
      },
    ],
  },
];
