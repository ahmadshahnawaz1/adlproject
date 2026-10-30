/**
 * content/sirah/people.ts — the companions and family linked from Sīrah events.
 *
 * Short, sourced biographies of those central to the Prophet's ﷺ life. Drawn
 * from the Ṣaḥīḥ collections and the classical biographies (Ibn Saʿd's Ṭabaqāt,
 * al-Iṣāba); pending final scholarly review.
 */
import type { SirahPerson } from './types';

export const SIRAH_PEOPLE: SirahPerson[] = [
  {
    id: 'khadijah',
    name: 'Khadījah bint Khuwaylid',
    arabic: 'خديجة بنت خويلد',
    epithet: 'Umm al-Muʾminīn',
    relation: 'The Prophet’s ﷺ first wife and the first person to believe in him.',
    bio: 'A noble, honourable and successful merchant of Makkah who married the Prophet ﷺ before revelation. She was his greatest comfort and support, the first to accept Islam, and mother to most of his children. Jibrīl conveyed to her Allah’s greetings and glad tidings of a house in Paradise.',
  },
  {
    id: 'abu-bakr',
    name: 'Abū Bakr al-Ṣiddīq',
    arabic: 'أبو بكر الصديق',
    epithet: 'al-Ṣiddīq',
    relation: 'The Prophet’s ﷺ closest friend and companion of the cave; the first caliph.',
    bio: 'The first free man to embrace Islam, he spent his wealth freeing the enslaved believers and accompanied the Prophet ﷺ on the Hijrah. Titled al-Ṣiddīq (the ever-truthful) for instantly affirming the Night Journey, he led the ummah after the Prophet ﷺ passed.',
  },
  {
    id: 'umar',
    name: 'ʿUmar ibn al-Khaṭṭāb',
    arabic: 'عمر بن الخطاب',
    epithet: 'al-Fārūq',
    relation: 'A mighty companion whose Islam strengthened the believers; the second caliph.',
    bio: 'Once among the fiercest opponents of Islam, his heart was softened by hearing the Qurʾān, and his acceptance let the believers pray openly at the Kaʿbah. Known for his justice and firmness, he was called al-Fārūq — the one who distinguishes truth from falsehood.',
  },
  {
    id: 'uthman',
    name: 'ʿUthmān ibn ʿAffān',
    arabic: 'عثمان بن عفان',
    epithet: 'Dhū al-Nūrayn',
    relation: 'An early believer of great modesty and generosity; the third caliph.',
    bio: 'A wealthy and gentle merchant who accepted Islam early through Abū Bakr, migrated to Abyssinia and then Madīnah, and funded the army of Tabūk and the well of Rūmah. He married two of the Prophet’s ﷺ daughters in turn, earning the title Dhū al-Nūrayn.',
  },
  {
    id: 'ali',
    name: 'ʿAlī ibn Abī Ṭālib',
    arabic: 'علي بن أبي طالب',
    epithet: 'Abū al-Ḥasan',
    relation: 'The Prophet’s ﷺ cousin, raised in his home; the fourth caliph.',
    bio: 'The first young person to accept Islam, raised in the Prophet’s ﷺ household. He slept in the Prophet’s ﷺ bed on the night of the Hijrah, carried the banner at Khaybar, and was renowned for his knowledge and courage.',
  },
  {
    id: 'hamza',
    name: 'Ḥamza ibn ʿAbd al-Muṭṭalib',
    arabic: 'حمزة بن عبد المطلب',
    epithet: 'Asad Allāh',
    relation: 'The Prophet’s ﷺ uncle and foster-brother; "the Lion of Allah".',
    bio: 'A brave and respected man whose acceptance of Islam emboldened the believers in Makkah. He fought valiantly at Badr and was martyred at Uḥud, mourned deeply by the Prophet ﷺ, who named him the Chief of the Martyrs.',
  },
  {
    id: 'abu-talib',
    name: 'Abū Ṭālib',
    arabic: 'أبو طالب',
    relation: 'The Prophet’s ﷺ uncle who raised and protected him.',
    bio: 'The uncle who took the Prophet ﷺ into his care after his grandfather’s death and shielded him from the Quraysh for years. His death in the year of sorrow removed a key protector, though he did not openly accept the faith.',
  },
  {
    id: 'zayd',
    name: 'Zayd ibn Ḥārithah',
    arabic: 'زيد بن حارثة',
    relation: 'The Prophet’s ﷺ freed servant and beloved companion.',
    bio: 'Freed and then loved so dearly that he chose the Prophet ﷺ over returning to his own family. Among the very first to believe, he was entrusted with commands and is the only companion named in the Qurʾān.',
  },
  {
    id: 'bilal',
    name: 'Bilāl ibn Rabāḥ',
    arabic: 'بلال بن رباح',
    relation: 'An early believer, tortured for his faith; the first muʾadhdhin.',
    bio: 'Enslaved and tortured on the burning sand for saying "Aḥad, Aḥad" (One, One), he was freed by Abū Bakr. Chosen as the first to call the adhān, his voice rang out over Madīnah and, at the conquest, from atop the Kaʿbah.',
  },
  {
    id: 'aisha',
    name: 'ʿĀʾishah bint Abī Bakr',
    arabic: 'عائشة بنت أبي بكر',
    epithet: 'Umm al-Muʾminīn',
    relation: 'The Prophet’s ﷺ wife and one of the greatest scholars of the ummah.',
    bio: 'Beloved wife of the Prophet ﷺ and daughter of Abū Bakr, she became one of the foremost narrators of hadith and a teacher of the companions in fiqh, Qurʾān and the details of the Prophet’s ﷺ life.',
  },
  {
    id: 'jafar',
    name: 'Jaʿfar ibn Abī Ṭālib',
    arabic: 'جعفر بن أبي طالب',
    epithet: 'Dhū al-Janāḥayn',
    relation: 'The Prophet’s ﷺ cousin; spokesman of the migrants to Abyssinia.',
    bio: 'He spoke for the believers before the Negus, describing how Islam raised them from ignorance and reciting Sūrat Maryam. He was later martyred at Muʾtah and named "the two-winged" for the wings Allah granted him in Paradise.',
  },
  {
    id: 'musab',
    name: 'Muṣʿab ibn ʿUmayr',
    arabic: 'مصعب بن عمير',
    relation: 'The first teacher sent to Madīnah.',
    bio: 'A pampered youth of Makkah who gave up luxury for Islam, he was sent ahead to teach the Qurʾān to the people of Yathrib, and Islam spread swiftly through their households. He carried the banner at Uḥud, where he was martyred.',
  },
  {
    id: 'salman',
    name: 'Salmān al-Fārisī',
    arabic: 'سلمان الفارسي',
    relation: 'A companion who sought the truth across lands; adviser at the Trench.',
    bio: 'A Persian seeker of truth who journeyed through faiths until he found the Prophet ﷺ in Madīnah. His counsel to dig a trench around the city bewildered the confederates and helped save Madīnah at the Battle of the Trench.',
  },
  {
    id: 'abu-hurayrah',
    name: 'Abū Hurayrah',
    arabic: 'أبو هريرة',
    relation: 'The companion who narrated the most hadith.',
    bio: 'He accepted Islam around the year of Khaybar and stayed close to the Prophet ﷺ, devoting himself to preserving his words. He became the most prolific narrator of hadith in the ummah.',
  },
  {
    id: 'abdullah',
    name: 'ʿAbdullāh ibn ʿAbd al-Muṭṭalib',
    arabic: 'عبد الله بن عبد المطلب',
    relation: 'The father of the Prophet ﷺ.',
    bio: 'The father of the Prophet ﷺ, of the clan of Banū Hāshim. He passed away on a journey before his son was born, so the Prophet ﷺ entered the world an orphan.',
  },
  {
    id: 'aminah',
    name: 'Āminah bint Wahb',
    arabic: 'آمنة بنت وهب',
    relation: 'The mother of the Prophet ﷺ.',
    bio: 'The mother of the Prophet ﷺ. She passed away when he was about six years old, at al-Abwāʾ while returning from a visit to his relatives in Madīnah.',
  },
  {
    id: 'abdul-muttalib',
    name: 'ʿAbd al-Muṭṭalib',
    arabic: 'عبد المطلب',
    relation: 'The grandfather who cared for the Prophet ﷺ.',
    bio: 'A leading chief of Makkah and custodian of the pilgrims, he took the orphaned Prophet ﷺ into his care and loved him greatly, until his own death two years after Āminah.',
  },
  {
    id: 'halimah',
    name: 'Ḥalīmah al-Saʿdiyyah',
    arabic: 'حليمة السعدية',
    relation: 'The wet-nurse of the Prophet ﷺ.',
    bio: 'Of the tribe of Banū Saʿd, she nursed the infant Prophet ﷺ in the desert. Her household was visibly blessed by his presence during the years he spent in her care.',
  },
];

/** Resolve a person by id. */
export function personById(id: string): SirahPerson | undefined {
  return SIRAH_PEOPLE.find((p) => p.id === id);
}
