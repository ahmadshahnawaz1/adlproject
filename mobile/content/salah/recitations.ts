/**
 * recitations.ts — every word said in the prayer, gathered in one reviewable
 * place: the opening takbīr, the opening supplication, the seeking of refuge,
 * al-Fātiḥah, an example short sūrah, the tasbīḥ of bowing and prostration, the
 * rising, the sitting between prostrations, the tashahhud, the ṣalāh upon the
 * Prophet ﷺ, the supplication before the salām, the qunūt of Witr, and the
 * closing salām.
 *
 * Arabic is written with full diacritics (ḥarakāt). Transliteration follows a
 * light academic scheme. Each text carries its evidence where a primary proof
 * is well known. The engine in lib/salah.ts selects from these by context.
 */
import type { Recitation } from './types';

/* ------------------------------------------------------------------ *
 * Opening
 * ------------------------------------------------------------------ */

/** Takbīrat al-iḥrām — the takbīr that opens and enters the prayer. */
export const TAKBIR: Recitation = {
  id: 'takbir',
  label: 'Entering the prayer',
  arabic: 'اللَّهُ أَكْبَر',
  transliteration: 'Allāhu akbar',
  translation: 'Allah is the Greatest.',
  rank: 'rukn',
  daleel: {
    source: 'hadith',
    reference: 'Sunan Abī Dāwūd 61, Jāmiʿ at-Tirmidhī 3',
    narrator: 'ʿAlī ibn Abī Ṭālib',
    grade: 'Ṣaḥīḥ',
    text: '“The key to prayer is purification, its sanctity is entered by the takbīr, and it is released by the taslīm.”',
  },
};

/** Duʿāʾ al-istiftāḥ — the opening supplication, said quietly after the takbīr. */
export const ISTIFTAH: Recitation = {
  id: 'istiftah',
  label: 'Opening supplication',
  arabic:
    'سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، وَتَبَارَكَ اسْمُكَ، وَتَعَالَى جَدُّكَ، وَلَا إِلَهَ غَيْرُكَ',
  transliteration:
    'Subḥānaka Llāhumma wa biḥamdika, wa tabāraka smuka, wa taʿālā jadduka, wa lā ilāha ghayruk.',
  translation:
    'Glory is to You, O Allah, and praise; blessed is Your name, exalted is Your majesty, and there is no god but You.',
  rank: 'sunnah',
  daleel: {
    source: 'hadith',
    reference: 'Sunan Abī Dāwūd 775, Jāmiʿ at-Tirmidhī 243',
    narrator: 'ʿĀʾishah & ʿUmar ibn al-Khaṭṭāb',
    grade: 'Ṣaḥīḥ',
    text: 'The Prophet ﷺ would open his prayer with this glorification before reciting.',
  },
};

/** Taʿawwudh — seeking refuge before the first recitation. */
export const TAAWWUDH: Recitation = {
  id: 'taawwudh',
  label: 'Seeking refuge',
  arabic: 'أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ',
  transliteration: 'Aʿūdhu billāhi mina sh-shayṭāni r-rajīm.',
  translation: 'I seek refuge in Allah from Satan, the accursed.',
  rank: 'sunnah',
  daleel: {
    source: 'quran',
    reference: 'an-Naḥl 16:98',
    text: '“So when you recite the Qurʾān, seek refuge in Allah from Satan, the accursed.”',
  },
};

/** The Basmalah — said quietly before al-Fātiḥah. */
export const BASMALAH: Recitation = {
  id: 'basmalah',
  label: 'Before al-Fātiḥah',
  arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
  transliteration: 'Bismi Llāhi r-Raḥmāni r-Raḥīm.',
  translation: 'In the name of Allah, the Most Gracious, the Most Merciful.',
  rank: 'sunnah',
};

/* ------------------------------------------------------------------ *
 * Al-Fātiḥah — the obligatory recitation in every rakʿah
 * ------------------------------------------------------------------ */

export const FATIHAH: Recitation = {
  id: 'fatihah',
  label: 'The Opening — recited in every rakʿah',
  arabic:
    'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ۝ الرَّحْمَٰنِ الرَّحِيمِ ۝ مَالِكِ يَوْمِ الدِّينِ ۝ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ۝ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ۝ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ ۝ آمِين',
  transliteration:
    'Al-ḥamdu lillāhi rabbi l-ʿālamīn · ar-Raḥmāni r-Raḥīm · māliki yawmi d-dīn · iyyāka naʿbudu wa iyyāka nastaʿīn · ihdina ṣ-ṣirāṭa l-mustaqīm · ṣirāṭa lladhīna anʿamta ʿalayhim ghayri l-maghḍūbi ʿalayhim wa la ḍ-ḍāllīn · āmīn.',
  translation:
    'All praise is for Allah, Lord of all worlds — the Most Gracious, the Most Merciful — Master of the Day of Judgement. You alone we worship, and You alone we ask for help. Guide us to the straight path — the path of those You have blessed, not of those who earned anger, nor of those who went astray. Āmīn.',
  rank: 'rukn',
  daleel: {
    source: 'hadith',
    reference: 'Ṣaḥīḥ al-Bukhārī 756, Ṣaḥīḥ Muslim 394',
    narrator: 'ʿUbādah ibn aṣ-Ṣāmit',
    grade: 'Ṣaḥīḥ',
    text: '“There is no prayer for the one who does not recite the Opening of the Book (al-Fātiḥah).”',
  },
};

/**
 * An example short sūrah recited after al-Fātiḥah in the first two rakaʿāt —
 * here al-Ikhlāṣ. Any portion of the Qurʾān may be recited.
 */
export const SURAH_IKHLAS: Recitation = {
  id: 'surah-ikhlas',
  label: 'A sūrah after al-Fātiḥah — e.g. al-Ikhlāṣ',
  arabic:
    'قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ',
  transliteration:
    'Qul huwa Llāhu aḥad · Allāhu ṣ-ṣamad · lam yalid wa lam yūlad · wa lam yakun lahu kufuwan aḥad.',
  translation:
    'Say: He is Allah, the One. Allah, the Eternal Refuge. He neither begets nor is born, and there is none comparable to Him.',
  rank: 'sunnah',
  daleel: {
    source: 'hadith',
    reference: 'Ṣaḥīḥ al-Bukhārī 776',
    narrator: 'Abū Qatādah',
    grade: 'Ṣaḥīḥ',
    text: 'The Prophet ﷺ would recite al-Fātiḥah and a sūrah in the first two rakaʿāt, and al-Fātiḥah alone in the last two.',
  },
};

/* ------------------------------------------------------------------ *
 * Bowing, rising, prostrating, sitting
 * ------------------------------------------------------------------ */

/** Tasbīḥ of the bow. */
export const TASBIH_RUKU: Recitation = {
  id: 'tasbih-ruku',
  label: 'In the bow',
  arabic: 'سُبْحَانَ رَبِّيَ الْعَظِيمِ',
  transliteration: 'Subḥāna rabbiya l-ʿaẓīm.',
  translation: 'Glory is to my Lord, the Most Great.',
  repeat: 3,
  rank: 'wajib',
  daleel: {
    source: 'hadith',
    reference: 'Ṣaḥīḥ Muslim 772, Sunan Abī Dāwūd 871',
    narrator: 'Ḥudhayfah ibn al-Yamān',
    grade: 'Ṣaḥīḥ',
    text: 'In his bowing he would say, “Subḥāna rabbiya l-ʿaẓīm,” and in his prostration, “Subḥāna rabbiya l-aʿlā.”',
  },
};

/** Tasmīʿ — said while rising from the bow. */
export const TASMI: Recitation = {
  id: 'tasmi',
  label: 'While rising',
  arabic: 'سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ',
  transliteration: 'Samiʿa Llāhu liman ḥamidah.',
  translation: 'Allah hears the one who praises Him.',
  rank: 'wajib',
  daleel: {
    source: 'hadith',
    reference: 'Ṣaḥīḥ al-Bukhārī 795',
    narrator: 'Abū Hurayrah',
    grade: 'Ṣaḥīḥ',
    text: 'When he raised his head from bowing he would say, “Samiʿa Llāhu liman ḥamidah,” then while standing, “Rabbanā wa laka l-ḥamd.”',
  },
};

/** Taḥmīd — said once standing erect after the bow. */
export const TAHMID: Recitation = {
  id: 'tahmid',
  label: 'Standing erect',
  arabic: 'رَبَّنَا وَلَكَ الْحَمْدُ',
  transliteration: 'Rabbanā wa laka l-ḥamd.',
  translation: 'Our Lord, and to You is all praise.',
  rank: 'wajib',
};

/** Tasbīḥ of prostration. */
export const TASBIH_SUJUD: Recitation = {
  id: 'tasbih-sujud',
  label: 'In prostration',
  arabic: 'سُبْحَانَ رَبِّيَ الْأَعْلَى',
  transliteration: 'Subḥāna rabbiya l-aʿlā.',
  translation: 'Glory is to my Lord, the Most High.',
  repeat: 3,
  rank: 'wajib',
  daleel: {
    source: 'hadith',
    reference: 'Ṣaḥīḥ Muslim 772',
    narrator: 'Ḥudhayfah ibn al-Yamān',
    grade: 'Ṣaḥīḥ',
    text: 'In his prostration he would say, “Subḥāna rabbiya l-aʿlā.”',
  },
};

/** The supplication of the sitting between the two prostrations. */
export const JULUS_DUA: Recitation = {
  id: 'julus-dua',
  label: 'Between the two prostrations',
  arabic: 'رَبِّ اغْفِرْ لِي، رَبِّ اغْفِرْ لِي',
  transliteration: 'Rabbi ghfir lī, rabbi ghfir lī.',
  translation: 'My Lord, forgive me; my Lord, forgive me.',
  rank: 'wajib',
  daleel: {
    source: 'hadith',
    reference: 'Sunan Abī Dāwūd 874, Sunan Ibn Mājah 897',
    narrator: 'Ḥudhayfah ibn al-Yamān',
    grade: 'Ṣaḥīḥ',
    text: 'Between the two prostrations he would say, “Rabbi ghfir lī, rabbi ghfir lī.”',
  },
};

/* ------------------------------------------------------------------ *
 * The sitting — tashahhud, ṣalāh upon the Prophet ﷺ, and the duʿāʾ
 * ------------------------------------------------------------------ */

/** At-Taḥiyyāt — the testimony recited in every sitting. */
export const TASHAHHUD: Recitation = {
  id: 'tashahhud',
  label: 'The testimony',
  arabic:
    'التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ، السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ، السَّلَامُ عَلَيْنَا وَعَلَى عِبَادِ اللَّهِ الصَّالِحِينَ، أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ',
  transliteration:
    'At-taḥiyyātu lillāhi wa ṣ-ṣalawātu wa ṭ-ṭayyibāt, as-salāmu ʿalayka ayyuha n-nabiyyu wa raḥmatu Llāhi wa barakātuh, as-salāmu ʿalaynā wa ʿalā ʿibādi Llāhi ṣ-ṣāliḥīn, ashhadu an lā ilāha illa Llāh, wa ashhadu anna Muḥammadan ʿabduhu wa rasūluh.',
  translation:
    'All greetings, prayers and good things are for Allah. Peace be upon you, O Prophet, and the mercy of Allah and His blessings. Peace be upon us and upon the righteous servants of Allah. I bear witness that there is no god but Allah, and I bear witness that Muḥammad is His servant and Messenger.',
  rank: 'rukn',
  daleel: {
    source: 'hadith',
    reference: 'Ṣaḥīḥ al-Bukhārī 831, Ṣaḥīḥ Muslim 402',
    narrator: 'ʿAbdullāh ibn Masʿūd',
    grade: 'Ṣaḥīḥ',
    text: 'The Prophet ﷺ taught the tashahhud just as he taught a sūrah of the Qurʾān.',
  },
};

/** Aṣ-Ṣalāh al-Ibrāhīmiyyah — invoking blessings upon the Prophet ﷺ. */
export const SALAH_NABI: Recitation = {
  id: 'salah-nabi',
  label: 'Blessings upon the Prophet ﷺ',
  arabic:
    'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ، كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ، اللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ، كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ',
  transliteration:
    'Allāhumma ṣalli ʿalā Muḥammad, wa ʿalā āli Muḥammad, kamā ṣallayta ʿalā Ibrāhīm, wa ʿalā āli Ibrāhīm, innaka ḥamīdun majīd. Allāhumma bārik ʿalā Muḥammad, wa ʿalā āli Muḥammad, kamā bārakta ʿalā Ibrāhīm, wa ʿalā āli Ibrāhīm, innaka ḥamīdun majīd.',
  translation:
    'O Allah, send Your grace upon Muḥammad and the family of Muḥammad, as You sent it upon Ibrāhīm and the family of Ibrāhīm; You are Praiseworthy, Glorious. O Allah, send Your blessing upon Muḥammad and the family of Muḥammad, as You blessed Ibrāhīm and the family of Ibrāhīm; You are Praiseworthy, Glorious.',
  rank: 'wajib',
  daleel: {
    source: 'hadith',
    reference: 'Ṣaḥīḥ al-Bukhārī 3370, Ṣaḥīḥ Muslim 406',
    narrator: 'Kaʿb ibn ʿUjrah',
    grade: 'Ṣaḥīḥ',
    text: 'When they asked how to send blessings upon him, the Prophet ﷺ taught them this ṣalāh.',
  },
};

/** A supplication said after the final tashahhud, before the salām. */
export const DUA_BEFORE_SALAM: Recitation = {
  id: 'dua-before-salam',
  label: 'Before the salām',
  arabic:
    'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ عَذَابِ جَهَنَّمَ، وَمِنْ عَذَابِ الْقَبْرِ، وَمِنْ فِتْنَةِ الْمَحْيَا وَالْمَمَاتِ، وَمِنْ شَرِّ فِتْنَةِ الْمَسِيحِ الدَّجَّالِ',
  transliteration:
    'Allāhumma innī aʿūdhu bika min ʿadhābi jahannam, wa min ʿadhābi l-qabr, wa min fitnati l-maḥyā wa l-mamāt, wa min sharri fitnati l-masīḥi d-dajjāl.',
  translation:
    'O Allah, I seek refuge in You from the punishment of Hell, from the punishment of the grave, from the trials of life and death, and from the evil of the trial of the False Messiah.',
  rank: 'sunnah',
  daleel: {
    source: 'hadith',
    reference: 'Ṣaḥīḥ Muslim 588',
    narrator: 'Abū Hurayrah',
    grade: 'Ṣaḥīḥ',
    text: '“When one of you finishes the final tashahhud, let him seek refuge in Allah from four things…”',
  },
};

/* ------------------------------------------------------------------ *
 * Qunūt (Witr) and the closing salām
 * ------------------------------------------------------------------ */

/** The qunūt of Witr. */
export const QUNUT: Recitation = {
  id: 'qunut',
  label: 'The qunūt of Witr',
  arabic:
    'اللَّهُمَّ اهْدِنِي فِيمَنْ هَدَيْتَ، وَعَافِنِي فِيمَنْ عَافَيْتَ، وَتَوَلَّنِي فِيمَنْ تَوَلَّيْتَ، وَبَارِكْ لِي فِيمَا أَعْطَيْتَ، وَقِنِي شَرَّ مَا قَضَيْتَ، إِنَّكَ تَقْضِي وَلَا يُقْضَى عَلَيْكَ، وَإِنَّهُ لَا يَذِلُّ مَنْ وَالَيْتَ، تَبَارَكْتَ رَبَّنَا وَتَعَالَيْتَ',
  transliteration:
    'Allāhumma hdinī fīman hadayt, wa ʿāfinī fīman ʿāfayt, wa tawallanī fīman tawallayt, wa bārik lī fīmā aʿṭayt, wa qinī sharra mā qaḍayt, innaka taqḍī wa lā yuqḍā ʿalayk, wa innahu lā yadhillu man wālayt, tabārakta rabbanā wa taʿālayt.',
  translation:
    'O Allah, guide me among those You have guided, pardon me among those You have pardoned, turn to me in friendship among those You have befriended, bless me in what You have given, and protect me from the evil of what You have decreed. For You decree and none can decree over You; none whom You befriend is humiliated. Blessed and exalted are You, our Lord.',
  rank: 'sunnah',
  daleel: {
    source: 'hadith',
    reference: 'Sunan Abī Dāwūd 1425, Jāmiʿ at-Tirmidhī 464',
    narrator: 'al-Ḥasan ibn ʿAlī',
    grade: 'Ṣaḥīḥ',
    text: 'The Prophet ﷺ taught al-Ḥasan these words to say in the qunūt of Witr.',
  },
};

/** The taslīm — the salām that releases the prayer. */
export const SALAM: Recitation = {
  id: 'salam',
  label: 'To the right, then to the left',
  arabic: 'السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ',
  transliteration: 'As-salāmu ʿalaykum wa raḥmatu Llāh.',
  translation: 'Peace be upon you, and the mercy of Allah.',
  rank: 'rukn',
  daleel: {
    source: 'hadith',
    reference: 'Ṣaḥīḥ Muslim 582, Sunan Abī Dāwūd 996',
    narrator: 'Saʿd ibn Abī Waqqāṣ & ʿĀmir ibn Saʿd',
    grade: 'Ṣaḥīḥ',
    text: 'He would say the salām to his right and to his left until the whiteness of his cheek was seen.',
  },
};

/* ------------------------------------------------------------------ *
 * Janāzah — the supplication for the deceased (after the third takbīr)
 * ------------------------------------------------------------------ */

/** A supplication for the deceased in the funeral prayer. */
export const DUA_MAYYIT: Recitation = {
  id: 'dua-mayyit',
  label: 'For the deceased',
  arabic:
    'اللَّهُمَّ اغْفِرْ لَهُ وَارْحَمْهُ، وَعَافِهِ وَاعْفُ عَنْهُ، وَأَكْرِمْ نُزُلَهُ، وَوَسِّعْ مُدْخَلَهُ، وَاغْسِلْهُ بِالْمَاءِ وَالثَّلْجِ وَالْبَرَدِ، وَنَقِّهِ مِنَ الْخَطَايَا كَمَا يُنَقَّى الثَّوْبُ الْأَبْيَضُ مِنَ الدَّنَسِ',
  transliteration:
    'Allāhumma ghfir lahu wa rḥamh, wa ʿāfihi wa ʿfu ʿanh, wa akrim nuzulah, wa wassiʿ mudkhalah, wa ghsilhu bi l-māʾi wa th-thalji wa l-barad, wa naqqihi mina l-khaṭāyā kamā yunaqqa th-thawbu l-abyaḍu mina d-danas.',
  translation:
    'O Allah, forgive him and have mercy on him, keep him safe and pardon him, honour his resting place and widen his entrance; wash him with water, snow and hail, and cleanse him of sins as a white garment is cleansed of dirt.',
  rank: 'wajib',
  daleel: {
    source: 'hadith',
    reference: 'Ṣaḥīḥ Muslim 963',
    narrator: 'ʿAwf ibn Mālik',
    grade: 'Ṣaḥīḥ',
    text: 'The Prophet ﷺ supplicated with these words in the funeral prayer.',
  },
};
