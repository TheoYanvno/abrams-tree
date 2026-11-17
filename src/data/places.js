// Places in the Bible, with their location (longitude, latitude; ancient sites by their usual
// identification), and events in the order they happened, each tied to a place and a chapter.
// Eras group the events so the map can be filtered and played through era by era.

export const ERAS = [
  { id: 'patriarchs', name: 'Abraham, Isaac and Jacob' },
  { id: 'exodus', name: 'The Exodus and the promised land' },
  { id: 'kings', name: 'Judges and kings' },
  { id: 'exile', name: 'Exile and return' },
  { id: 'jesus', name: 'The life of Jesus' },
  { id: 'church', name: 'The early Church' },
];

// id: [name, longitude, latitude]
const P = {
  ur: ['Ur', 46.10, 30.96], haran: ['Haran', 39.03, 36.86], shechem: ['Shechem', 35.28, 32.21],
  bethel: ['Bethel', 35.22, 31.93], hebron: ['Hebron (Mamre)', 35.10, 31.53], sodom: ['Sodom (south of the Dead Sea)', 35.40, 31.05],
  jerusalem: ['Jerusalem', 35.23, 31.78], memphis: ['Memphis, Egypt', 31.25, 29.85], goshen: ['Goshen', 31.80, 30.60],
  redsea: ['The Red Sea crossing', 32.60, 29.90], sinai: ['Mount Sinai', 33.98, 28.54], kadesh: ['Kadesh Barnea', 34.42, 30.69],
  nebo: ['Mount Nebo', 35.73, 31.77], jericho: ['Jericho', 35.44, 31.87], shiloh: ['Shiloh', 35.29, 32.06],
  bethlehem: ['Bethlehem', 35.20, 31.70], elah: ['Valley of Elah', 34.96, 31.69], carmel: ['Mount Carmel', 35.05, 32.73],
  zarephath: ['Zarephath', 35.30, 33.46], damascus: ['Damascus', 36.29, 33.51], joppa: ['Joppa', 34.75, 32.05],
  nineveh: ['Nineveh', 43.15, 36.36], samaria: ['Samaria', 35.19, 32.28], babylon: ['Babylon', 44.42, 32.54],
  susa: ['Susa', 48.25, 32.19], nazareth: ['Nazareth', 35.30, 32.70], jordan: ['Bethany beyond the Jordan', 35.55, 31.84],
  cana: ['Cana', 35.34, 32.75], capernaum: ['Capernaum', 35.57, 32.88], galilee: ['The Sea of Galilee', 35.59, 32.82],
  bethany: ['Bethany', 35.26, 31.77], emmaus: ['Emmaus', 35.00, 31.84], caesarea: ['Caesarea', 34.89, 32.50],
  antioch: ['Antioch', 36.16, 36.20], paphos: ['Paphos, Cyprus', 32.41, 34.76], philippi: ['Philippi', 24.29, 41.01],
  athens: ['Athens', 23.73, 37.97], corinth: ['Corinth', 22.88, 37.91], ephesus: ['Ephesus', 27.34, 37.94],
  malta: ['Malta', 14.40, 35.92], rome: ['Rome', 12.49, 41.89], patmos: ['Patmos', 26.55, 37.31],
};

export const PLACES = Object.entries(P).map(([id, [name, lon, lat]]) => ({ id, name, lon, lat }));

// [title, era, place, book, chapter]
const E = [
  ['Abram leaves Ur', 'patriarchs', 'ur', 'Genesis', 11],
  ['God calls Abram from Haran', 'patriarchs', 'haran', 'Genesis', 12],
  ['God promises the land at Shechem', 'patriarchs', 'shechem', 'Genesis', 12],
  ['Three visitors at Mamre', 'patriarchs', 'hebron', 'Genesis', 18],
  ['Sodom is destroyed', 'patriarchs', 'sodom', 'Genesis', 19],
  ['Abraham and Isaac on Mount Moriah', 'patriarchs', 'jerusalem', 'Genesis', 22],
  ["Jacob's dream at Bethel", 'patriarchs', 'bethel', 'Genesis', 28],
  ['Joseph rules in Egypt', 'patriarchs', 'memphis', 'Genesis', 41],
  ["Jacob's family settles in Goshen", 'patriarchs', 'goshen', 'Genesis', 47],
  ['Baby Moses in the Nile', 'exodus', 'memphis', 'Exodus', 2],
  ['Crossing the Red Sea', 'exodus', 'redsea', 'Exodus', 14],
  ['The Ten Commandments', 'exodus', 'sinai', 'Exodus', 20],
  ['Twelve spies are sent out', 'exodus', 'kadesh', 'Numbers', 13],
  ['Moses sees the promised land', 'exodus', 'nebo', 'Deuteronomy', 34],
  ['The walls of Jericho fall', 'exodus', 'jericho', 'Joshua', 6],
  ['God calls young Samuel', 'kings', 'shiloh', '1 Samuel', 3],
  ['Ruth gleans in Bethlehem', 'kings', 'bethlehem', 'Ruth', 2],
  ['David and Goliath', 'kings', 'elah', '1 Samuel', 17],
  ['David becomes king in Jerusalem', 'kings', 'jerusalem', '2 Samuel', 5],
  ['Solomon builds the temple', 'kings', 'jerusalem', '1 Kings', 6],
  ['Elijah and the widow of Zarephath', 'kings', 'zarephath', '1 Kings', 17],
  ['Fire falls on Mount Carmel', 'kings', 'carmel', '1 Kings', 18],
  ['Naaman of Damascus is healed', 'kings', 'damascus', '2 Kings', 5],
  ['Jonah runs away from Joppa', 'kings', 'joppa', 'Jonah', 1],
  ['Nineveh turns back to God', 'kings', 'nineveh', 'Jonah', 3],
  ['Samaria falls', 'kings', 'samaria', '2 Kings', 17],
  ['Jerusalem falls and the people go to Babylon', 'exile', 'babylon', '2 Kings', 25],
  ["Daniel in the lions' den", 'exile', 'babylon', 'Daniel', 6],
  ['Queen Esther speaks up', 'exile', 'susa', 'Esther', 4],
  ['Nehemiah rebuilds the walls', 'exile', 'jerusalem', 'Nehemiah', 6],
  ['The angel comes to Mary', 'jesus', 'nazareth', 'Luke', 1],
  ['Jesus is born', 'jesus', 'bethlehem', 'Luke', 2],
  ['Jesus is baptized', 'jesus', 'jordan', 'Matthew', 3],
  ['Water into wine', 'jesus', 'cana', 'John', 2],
  ['Jesus calls the fishermen', 'jesus', 'capernaum', 'Mark', 1],
  ['Jesus calms the storm', 'jesus', 'galilee', 'Mark', 4],
  ['Lazarus is raised', 'jesus', 'bethany', 'John', 11],
  ['The cross and the empty tomb', 'jesus', 'jerusalem', 'Luke', 24],
  ['The road to Emmaus', 'jesus', 'emmaus', 'Luke', 24],
  ['The Holy Spirit comes at Pentecost', 'church', 'jerusalem', 'Acts', 2],
  ['Saul meets Jesus on the road', 'church', 'damascus', 'Acts', 9],
  ['Peter visits Cornelius', 'church', 'caesarea', 'Acts', 10],
  ['First called Christians', 'church', 'antioch', 'Acts', 11],
  ['Paul and Barnabas in Cyprus', 'church', 'paphos', 'Acts', 13],
  ['Lydia believes in Philippi', 'church', 'philippi', 'Acts', 16],
  ['Paul speaks in Athens', 'church', 'athens', 'Acts', 17],
  ['Paul stays in Corinth', 'church', 'corinth', 'Acts', 18],
  ['Paul teaches in Ephesus', 'church', 'ephesus', 'Acts', 19],
  ['Shipwrecked on Malta', 'church', 'malta', 'Acts', 28],
  ['Paul preaches in Rome', 'church', 'rome', 'Acts', 28],
  ['John sees the Revelation on Patmos', 'church', 'patmos', 'Revelation', 1],
];

export const EVENTS = E.map(([title, era, place, book, chapter], i) => ({ id: i + 1, title, era, place, book, chapter }));
