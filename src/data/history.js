// What the world around the Bible looked like in each period: who ruled, the main culture, the religion of
// the region, and how the Hebrews, the Jews and later the Christians were seen by their neighbors.
// Dates before about 900 BC are approximate, and scholars debate some of them (the date of the Exodus most
// of all); where they disagree, the text says so. Each period lists the Scriptures that show it.
//   [id, name, years, power, rulers, culture, religion, seen, scripture]

const ROWS = [
  ['early', 'Before Abraham: Mesopotamia', 'before c. 2100 BC',
    'City-states in Sumer and Akkad, in the land between the Tigris and Euphrates rivers (modern Iraq), each ruled by its own king.',
    'Sumerian and Akkadian kings such as Sargon of Akkad (about 2300 BC). The Bible names Nimrod as a founder of Babel, Erech and Akkad (Genesis 10:10).',
    'The first cities, writing (cuneiform on clay tablets), irrigation farming, and temple towers called ziggurats built of baked brick.',
    'Many gods, each city with its own patron god housed in a temple: Enlil, Anu, Inanna, and Nanna, the moon god of Ur.',
    'There were no Hebrews yet. Genesis tells this time as the story of all nations, scattered at Babel.',
    'Genesis 10–11'],
  ['patriarchs', 'Abraham, Isaac and Jacob', 'about 2100–1800 BC',
    'No empire held Canaan. Small city-states each had a king (Genesis 14 names several), while Egypt\'s Middle Kingdom ruled the Nile and Amorite kingdoms ruled Mesopotamia.',
    'Local kings such as Melchizedek of Salem and Abimelech of Gerar; the pharaohs of Egypt; in Mesopotamia, later in this period, Hammurabi of Babylon (about 1792–1750 BC).',
    'Farmers in walled towns and herders moving with their flocks. Abraham lived as a wealthy herdsman in tents, moving between towns.',
    'Canaanites worshiped El, Baal and Asherah; Ur and Haran were centers of the moon god Sin. Abraham alone was called to worship the one God.',
    'Abraham was respected as a foreign sojourner: the Hittites of Hebron called him "a prince of God among us." In Egypt, eating with Hebrews was "an abomination," and shepherds were looked down on.',
    'Genesis 14:18; 23:4–6; 43:32; 46:34'],
  ['egypt', 'Israel in Egypt and the Exodus', 'about 1876–1406 BC (the traditional dates; many scholars place the Exodus in the 1200s BC)',
    'Egypt, the greatest power of the age, ruled by pharaohs from the Nile delta to Canaan.',
    'The Bible does not name the pharaohs. Those often suggested are Thutmose III or Amenhotep II for the earlier date, and Ramesses II for the later one.',
    'Huge building projects in brick and stone, a strong central state, scribes and an army with chariots. Israel lived in Goshen, in the delta.',
    'Many gods (Ra the sun, Osiris, Hathor, the Nile), with Pharaoh himself honored as divine. The plagues were judgment "against all the gods of Egypt."',
    'At first welcomed because of Joseph; later feared because they were many, and made slaves building store cities.',
    'Exodus 1:8–14; 12:12'],
  ['judges', 'The conquest and the judges', 'about 1406–1050 BC',
    'No single ruler. Canaanite city-states, then local peoples took turns pressing Israel: Moabites, Midianites, Ammonites and, after about 1175 BC, the Philistines on the coast.',
    'Canaanite kings such as Jabin of Hazor; Eglon of Moab; Philistine lords of five cities (Gaza, Ashkelon, Ashdod, Ekron, Gath). Israel was led by judges such as Deborah, Gideon and Samson.',
    'Village farming in the hill country. The Philistines had iron weapons and kept that skill from Israel.',
    'Baal and Asherah in Canaan, Dagon of the Philistines, Chemosh of Moab and Molech of Ammon. Israel kept falling into the worship of these gods.',
    'At first feared (Rahab said the people of Jericho\'s "hearts melted"); later raided, oppressed and mocked by neighbors whenever Israel turned from God.',
    'Joshua 2:9–11; Judges 2:11–15; 1 Samuel 13:19–22'],
  ['united', 'The kingdom of Saul, David and Solomon', 'about 1050–931 BC',
    'Israel itself: a united kingdom, at its height under David and Solomon, while Egypt and Assyria were weak.',
    'Kings Saul, David and Solomon. Neighbors: Achish, Philistine king of Gath; Hiram, king of Tyre, Solomon\'s ally; the Queen of Sheba.',
    'A royal court in Jerusalem, the temple, trade by land and sea, and a golden age of psalms and wisdom writing.',
    'Israel worshiped the Lord at the temple, but Solomon built shrines for his foreign wives\' gods, such as Ashtoreth of Sidon and Milcom of Ammon.',
    'A respected power: kings sent gifts and allies traded with Solomon; the Philistines remained enemies until David defeated them.',
    '2 Samuel 5:11; 1 Kings 10:1–9; 11:4–8'],
  ['divided', 'Two kingdoms: Israel and Judah', '931–722 BC',
    'Two kingdoms: Israel in the north (capital Samaria) and Judah in the south (capital Jerusalem). Aram (Syria) fought Israel, and the Assyrian Empire grew until it destroyed Samaria in 722 BC.',
    'In Israel, Jeroboam, Omri and Ahab with his Sidonian queen Jezebel, and Jehu; in Judah, kings from David\'s line such as Jehoshaphat and Uzziah. Assyrian kings Shalmaneser III, Tiglath-pileser III, Shalmaneser V and Sargon II.',
    'Ivory-decorated palaces and wealth for some, poverty and injustice for many, which the prophets Amos and Hosea condemned.',
    'Golden calves at Bethel and Dan, and Baal worship pushed by Jezebel; Assyria\'s chief god was Ashur. Elijah and Elisha called Israel back to the Lord.',
    'To Assyria, Israel was a small kingdom to be taxed and, when it rebelled, deported. Some foreigners came to honor Israel\'s God, like Naaman, and Nineveh repented at Jonah\'s preaching.',
    '1 Kings 12:28–30; 16:31–33; 2 Kings 5; 17:5–6; Amos 6:4–6'],
  ['judah', 'Judah alone: Assyria and Babylon', '722–586 BC',
    'Assyria ruled the region until Nineveh fell in 612 BC; then Babylon (the Chaldeans) took over. Judah survived as a small kingdom paying tribute.',
    'Assyrian kings Sennacherib (who besieged Jerusalem in 701 BC) and Esarhaddon; Babylonian king Nebuchadnezzar II. Judah\'s kings Hezekiah, Manasseh and Josiah.',
    'Great imperial cities, fortified towns like Lachish, and the deportation of rebel peoples across the empire.',
    'Assyria\'s Ashur and Babylon\'s Marduk; in Judah, kings swung between idol worship (Manasseh) and reform (Hezekiah, Josiah).',
    'A tribute-paying vassal. Sennacherib\'s officer mocked Hezekiah\'s trust in God; Babylon treated Judah\'s revolts harshly.',
    '2 Kings 18:19–35; 22–23; Jeremiah 27'],
  ['exile', 'The exile in Babylon', '586–539 BC',
    'The Neo-Babylonian Empire, which destroyed Jerusalem and the temple in 586 BC and took many of its people to Babylon.',
    'Nebuchadnezzar II, and later Nabonidus with his son Belshazzar.',
    'Babylon was the greatest city of its day, with the Ishtar Gate, ziggurats and canals. Exiles were settled in communities along the canals, like the river Chebar.',
    'Marduk and Nabu, honored in great festivals. Without the temple, the exiles held to the Sabbath, circumcision, prayer and the Scriptures.',
    'From this time the people of Judah are called Jews (Yehudim). Some rose high, like Daniel; others were mocked by captors who demanded "one of the songs of Zion."',
    'Jeremiah 29:4–7; Psalm 137:1–4; Daniel 1–6'],
  ['persia', 'The Persian Empire and the return', '539–332 BC',
    'The Persian (Achaemenid) Empire, from India to Egypt. Judah was a small province called Yehud.',
    'Cyrus the Great, who let the exiles go home in 538 BC; Darius I, under whom the temple was finished; Xerxes (Ahasuerus), husband of Esther; Artaxerxes I, who sent Ezra and Nehemiah.',
    'Royal roads, an imperial postal system, and Aramaic as the common language of government.',
    'The Persian kings honored Ahura Mazda (Zoroastrianism) but let peoples keep their own gods and temples.',
    'Generally tolerated and even helped by the kings, but opposed by local rivals such as Sanballat and Tobiah, and nearly destroyed by Haman\'s plot.',
    'Ezra 1:1–4; Nehemiah 4:1–3; Esther 3:8–9'],
  ['greek', 'Alexander and the Greek kingdoms', '332–167 BC',
    'Alexander the Great conquered the region in 332 BC. After his death, the Ptolemies of Egypt ruled Judea until about 200 BC, then the Seleucids of Syria.',
    'Alexander; Ptolemy I and Ptolemy IV of Egypt; the Seleucid kings Antiochus III and Antiochus IV Epiphanes.',
    'Hellenism: Greek language, cities, gymnasiums and theaters. In Alexandria the Hebrew Scriptures were translated into Greek (the Septuagint), the Old Testament the Orthodox Church still reads.',
    'The Greek gods (Zeus, Apollo, Dionysus) and ruler cults. Many Jews kept apart from idol worship; some adopted Greek ways.',
    'Greeks thought Jews strange for refusing idols, pork and work on the Sabbath. Antiochus IV outlawed the Jewish faith, set up an idol in the temple and martyred the faithful in 167 BC.',
    '1 Maccabees 1:41–64; 2 Maccabees 6–7; 3 Maccabees 2'],
  ['maccabees', 'The Maccabees and the Hasmonean kings', '167–63 BC',
    'An independent Jewish kingdom ruled by the Hasmonean family, after the Maccabean revolt against the Seleucids.',
    'Mattathias and his sons Judas Maccabeus, Jonathan and Simon; later Hasmonean kings and high priests such as John Hyrcanus and Alexander Jannaeus.',
    'A Jewish state with Greek influences. The temple was cleansed in 164 BC, remembered every year at Hanukkah.',
    'The worship of the Lord restored at the temple. The Pharisees, Sadducees and Essenes appear in this period.',
    'Now the ones in power, the Jews fought neighboring peoples and forced some, like the Idumeans, to convert. Rome was at first an ally, then the master: Pompey took Jerusalem in 63 BC.',
    '1 Maccabees 4:36–59; 8'],
  ['rome', 'Roman Judea in the time of Jesus', '63 BC–AD 33',
    'The Roman Empire. Judea was ruled through client kings (the Herods) and Roman governors.',
    'Emperors Augustus and Tiberius; Herod the Great (died 4 BC); his sons Herod Antipas in Galilee and Archelaus in Judea; the prefect Pontius Pilate (AD 26–36); the high priests Annas and Caiaphas.',
    'Roman roads, taxes and soldiers, Greek-speaking cities, and Herod\'s rebuilt temple, one of the wonders of its day. Most Jews in the land spoke Aramaic.',
    'Romans honored their gods and the emperor, but Judaism was a legal, ancient religion, and Jews were excused from emperor worship. Within Judaism: Pharisees, Sadducees, Essenes and Zealots; Jews and Samaritans avoided each other.',
    'Romans saw Jews as a stubborn but tolerated people. Tax collectors who worked for Rome were despised by their own people, and Samaritans and Jews looked down on one another.',
    'Luke 2:1–2; 3:1–2; John 4:9; Luke 19:1–10'],
  ['church', 'The early Church in the Roman Empire', 'AD 33–100',
    'The Roman Empire, from Spain to Syria, at peace (the Pax Romana) and linked by roads and sea routes that carried the apostles.',
    'Emperors Claudius (who expelled Jews from Rome about AD 49), Nero (who blamed Christians for the fire of Rome in AD 64, when Peter and Paul are remembered as martyred), Vespasian and Titus (who destroyed the temple in AD 70), and Domitian.',
    'Greek was the common language; cities like Ephesus, Corinth and Antioch were crowded, rich and full of trade, philosophy and theater.',
    'The Greco-Roman gods (Artemis of Ephesus, Zeus), the emperor cult, mystery religions, and philosophies such as the Stoics and Epicureans.',
    'At first Christians were seen as a Jewish sect, "the Way," and Roman officials like Gallio called it a Jewish quarrel. Some synagogues opposed them. Romans grew suspicious of Christians for refusing the gods and the emperor cult, calling them atheists and disloyal, and Nero made them scapegoats.',
    'Acts 17:16–34; 18:2, 12–17; 19:23–41; 24:5; 1 Peter 4:12–16'],
];

export const PERIODS = ROWS.map(([id, name, years, power, rulers, culture, religion, seen, scripture]) =>
  ({ id, name, years, power, rulers, culture, religion, seen, scripture }));

// Which period each map event belongs to, by event id. Events in the Psalms, Proverbs and the prophets
// go with the time they were written in.
const RANGES = [
  [1, 2, 'early'], [3, 17, 'patriarchs'], [18, 32, 'egypt'], [33, 43, 'judges'],
  [44, 53, 'united'], [54, 59, 'divided'], [60, 63, 'united'], [64, 64, 'divided'], [65, 66, 'judah'],
  [67, 84, 'united'], [81, 81, 'judah'], [85, 89, 'divided'], [90, 90, 'judah'], [91, 92, 'divided'],
  [93, 95, 'judah'], [96, 97, 'divided'], [98, 102, 'judah'], [103, 117, 'exile'], [118, 120, 'judah'],
  [121, 121, 'exile'], [122, 132, 'persia'], [133, 133, 'greek'], [134, 139, 'maccabees'],
  [140, 146, 'greek'],
];

/** The period an event belongs to; Jesus and the Church eras map by era. Later ranges override earlier ones. */
export function periodIdFor(event) {
  if (event.era === 'jesus') return 'rome';
  if (event.era === 'church') return 'church';
  let id = null;
  for (const [from, to, p] of RANGES) if (event.id >= from && event.id <= to) id = p;
  return id;
}

// Who "God's people" were called in each period, for the heading over how their neighbors saw them.
const PEOPLE = { early: 'the first peoples', patriarchs: 'the Hebrews', egypt: 'the Hebrews', judges: 'the Israelites',
  united: 'the Israelites', divided: 'the Israelites', judah: 'the Israelites', exile: 'the Jews', persia: 'the Jews',
  greek: 'the Jews', maccabees: 'the Jews', rome: 'the Jews', church: 'Jews and Christians' };
export const peopleOf = (id) => PEOPLE[id] || "God's people";

export const periodById = (id) => PERIODS.find((p) => p.id === id) || null;
