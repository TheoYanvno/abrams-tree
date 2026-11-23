// People of the Bible and when they lived, for the Timeline tab.
//
// From Adam to Joseph the years are counted from creation using the ages Genesis gives: how old each
// father was when his son was born and how long each one lived. These are the Hebrew numbers, the
// ones in every translation AbramsTree reads (the Greek Septuagint gives some fathers 100 years more).
// Each person stores only what the chapter says; src/lib/timeline.js adds them up.
//
// From Abraham to the apostles the years are BC and AD, worked back from Solomon's temple: it was begun
// "in the 480th year after the children of Israel came out of Egypt", in Solomon's fourth year, about
// 966 BC (1 Kings 6:1), so the Exodus was about 1446 BC, and Israel had been in Egypt 430 years
// (Exodus 12:40). Most dates here are approximate (`about: true`) and are shown with "c.".
// A year BC is a negative number: -1446 is 1446 BC.

// [id, name, father id, father's age at the birth, years lived, book, chapter, note]
export const GENESIS_LINE = [
  ['adam', 'Adam', null, 0, 930, 'Genesis', 5, 'The first man, made by God from the dust.'],
  ['seth', 'Seth', 'adam', 130, 912, 'Genesis', 5, 'Born after Abel died, "another child instead of Abel".'],
  ['enosh', 'Enosh', 'seth', 105, 905, 'Genesis', 5, 'In his days people began to call on the name of the Lord.'],
  ['kenan', 'Kenan', 'enosh', 90, 910, 'Genesis', 5, ''],
  ['mahalalel', 'Mahalalel', 'kenan', 70, 895, 'Genesis', 5, ''],
  ['jared', 'Jared', 'mahalalel', 65, 962, 'Genesis', 5, ''],
  ['enoch', 'Enoch', 'jared', 162, 365, 'Genesis', 5, 'He walked with God, and God took him: he did not die.'],
  ['methuselah', 'Methuselah', 'enoch', 65, 969, 'Genesis', 5, 'The longest life in the Bible. He died in the year of the Flood.'],
  ['lamech', 'Lamech', 'methuselah', 187, 777, 'Genesis', 5, 'Father of Noah.'],
  ['noah', 'Noah', 'lamech', 182, 950, 'Genesis', 9, 'Built the ark. He was 600 when the Flood came.'],
  // Shem was 100 "two years after the Flood", and the Flood came when Noah was 600 (Genesis 7:6, 11:10).
  ['shem', 'Shem', 'noah', 502, 600, 'Genesis', 11, 'Son of Noah, saved in the ark.'],
  ['arphaxad', 'Arphaxad', 'shem', 100, 438, 'Genesis', 11, 'Born two years after the Flood.'],
  ['shelah', 'Shelah', 'arphaxad', 35, 433, 'Genesis', 11, ''],
  ['eber', 'Eber', 'shelah', 30, 464, 'Genesis', 11, 'The Hebrews are named after him.'],
  ['peleg', 'Peleg', 'eber', 34, 239, 'Genesis', 11, 'In his days the earth was divided.'],
  ['reu', 'Reu', 'peleg', 30, 239, 'Genesis', 11, ''],
  ['serug', 'Serug', 'reu', 32, 230, 'Genesis', 11, ''],
  ['nahor', 'Nahor', 'serug', 30, 148, 'Genesis', 11, 'Grandfather of Abraham.'],
  ['terah', 'Terah', 'nahor', 29, 205, 'Genesis', 11, 'Father of Abraham. He left Ur and died in Haran.'],
  // Terah died at 205 in Haran and Abram left Haran after that, aged 75 (Genesis 11:32, 12:4; Acts 7:4).
  ['abraham', 'Abraham', 'terah', 130, 175, 'Genesis', 25, 'God called him and promised to bless every nation through him.'],
  ['isaac', 'Isaac', 'abraham', 100, 180, 'Genesis', 35, 'The son God promised to Abraham and Sarah.'],
  ['jacob', 'Jacob (Israel)', 'isaac', 60, 147, 'Genesis', 47, 'Father of the twelve tribes of Israel.'],
  // Jacob was 130 when he came to Egypt (Genesis 47:9); Joseph was 30 at Genesis 41:46, then 7 years of
  // plenty and 2 of famine (Genesis 45:6), so 39.
  ['joseph', 'Joseph', 'jacob', 91, 110, 'Genesis', 50, 'Sold into Egypt, he saved his family from the famine.'],
];

// Others in Genesis placed by their age beside someone in the line: [id, name, relative, years after them, lived, book, chapter, note]
export const GENESIS_OTHERS = [
  ['sarah', 'Sarah', 'abraham', 10, 127, 'Genesis', 23, 'Ten years younger than Abraham. Mother of Isaac at 90.'],
  ['ishmael', 'Ishmael', 'abraham', 86, 137, 'Genesis', 25, 'Son of Abraham and Hagar.'],
];

// The Flood came in Noah's 600th year (Genesis 7:6).
export const FLOOD = { after: 'noah', years: 600, book: 'Genesis', chapter: 7 };

// [id, name, born, died, about?, book, chapter, note]
export const LATER = [
  ['abraham', 'Abraham', -2166, -1991, false, 'Genesis', 12, 'Left Haran at 75 when God called him.'],
  ['isaac', 'Isaac', -2066, -1886, false, 'Genesis', 22, ''],
  ['jacob', 'Jacob (Israel)', -2006, -1859, false, 'Genesis', 32, 'Went down to Egypt at 130.'],
  ['joseph', 'Joseph', -1915, -1805, false, 'Genesis', 41, 'Ruled Egypt under Pharaoh.'],
  ['moses', 'Moses', -1526, -1406, false, 'Exodus', 3, 'Led Israel out of Egypt. He was 80 then and 120 when he died.'],
  ['aaron', 'Aaron', -1529, -1407, false, 'Exodus', 28, "Moses' older brother, the first high priest."],
  ['joshua', 'Joshua', -1500, -1390, true, 'Joshua', 1, 'Led Israel into the promised land. Lived 110 years.'],
  ['samuel', 'Samuel', -1105, -1015, true, '1 Samuel', 3, 'The last judge, a prophet who anointed Saul and David.'],
  ['david', 'King David', -1040, -970, false, '2 Samuel', 5, 'King at 30, reigned 40 years. Wrote many of the Psalms.'],
  ['solomon', 'King Solomon', -990, -931, true, '1 Kings', 3, 'Asked God for wisdom and built the temple.'],
  ['elijah', 'Elijah', -900, -850, true, '1 Kings', 18, 'Taken up to heaven in a chariot of fire.'],
  ['elisha', 'Elisha', -880, -795, true, '2 Kings', 2, "Elijah's disciple, who received a double portion of his spirit."],
  ['jonah', 'Jonah', -800, -750, true, 'Jonah', 1, 'Preached to Nineveh in the days of King Jeroboam II.'],
  ['isaiah', 'Isaiah', -760, -680, true, 'Isaiah', 6, 'Foretold the Virgin who would bear Emmanuel.'],
  ['hezekiah', 'King Hezekiah', -740, -686, false, '2 Kings', 18, 'God added fifteen years to his life.'],
  ['josiah', 'King Josiah', -648, -609, false, '2 Kings', 22, 'King at eight. He found the Book of the Law in the temple.'],
  ['jeremiah', 'Jeremiah', -650, -570, true, 'Jeremiah', 1, 'Called as a young man; he saw Jerusalem fall.'],
  ['ezekiel', 'Ezekiel', -623, -570, true, 'Ezekiel', 1, 'A priest and prophet with the exiles in Babylon.'],
  ['daniel', 'Daniel', -620, -535, true, 'Daniel', 6, 'Taken to Babylon as a youth; God shut the lions\' mouths.'],
  ['nehemiah', 'Nehemiah', -480, -410, true, 'Nehemiah', 2, 'Rebuilt the walls of Jerusalem.'],
  ['theotokos', 'The Theotokos (Mary)', -18, 48, true, 'Luke', 1, 'Mother of God. The years of her life are from Church tradition.'],
  ['baptist', 'St. John the Baptist', -5, 29, true, 'Luke', 1, 'Forerunner of the Lord, born six months before Jesus.'],
  ['jesus', 'Jesus Christ', -5, 30, true, 'Luke', 2, 'Born in Bethlehem; died on the Cross, rose on the third day and ascended. He lives forever.'],
  ['peter', 'St. Peter', -1, 65, true, 'Matthew', 16, 'Fisherman, apostle, martyred in Rome.'],
  ['paul', 'St. Paul', 5, 65, true, 'Acts', 9, 'Met the risen Lord on the road to Damascus; martyred in Rome.'],
  ['john', 'St. John the Theologian', 6, 100, true, 'John', 1, 'The beloved disciple. He wrote his Gospel, letters and Revelation.'],
];

// When God speaks about time: "With the Lord one day is as a thousand years, and a thousand years as one day."
// [id, reference, book, chapter, verse text (World English Bible), what it means in God's time]
export const GOD_TIME = [
  ['ps90', 'Psalm 90 (89):4', 'Psalms', 90, 'For a thousand years in your sight are just like yesterday when it is past, like a watch in the night.',
    'A thousand of our years are like one day to God.'],
  ['2pe3', '2 Peter 3:8', '2 Peter', 3, 'But don\'t forget this one thing, beloved, that one day is with the Lord as a thousand years, and a thousand years as one day.',
    'God is not slow: He is patient, and His day is a thousand of our years.'],
  ['gen2', 'Genesis 2:17', 'Genesis', 2, 'But you shall not eat of the tree of the knowledge of good and evil; for in the day that you eat of it, you will surely die.',
    'Adam died at 930, before the first thousand years, God\'s first "day", had ended. St. Justin Martyr and St. Irenaeus both taught this.'],
  ['gen1', 'Genesis 2:2', 'Genesis', 2, 'On the seventh day God finished his work which he had done; and he rested on the seventh day from all his work which he had done.',
    'Six days of creation. Some early Christian writers, among them St. Irenaeus, saw in them six thousand years of the world before God\'s rest.'],
  ['hos6', 'Hosea 6:2', 'Hosea', 6, 'After two days he will revive us. On the third day he will raise us up, and we will live before him.',
    'Two days in God\'s time are 2,000 years. The Church reads this first of Christ rising on the third day.'],
  ['rev20', 'Revelation 20:4', 'Revelation', 20, 'They lived and reigned with Christ for a thousand years.',
    'A thousand years with Christ are, to God, a single day.'],
];
