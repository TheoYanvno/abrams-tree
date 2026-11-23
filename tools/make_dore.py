"""Builds the Doré illustrations for the Study Bible and the app from the high-resolution scans of
Gustave Doré's La Grande Bible de Tours (1866, public domain), as distributed by Nainoia Inc.
(github.com/Nainoia-Inc/AionianBible_GustaveDore_LaGrandeBibledeTours, compiled by Felix Just, S.J.).

  python3 tools/make_dore.py <path to a clone of that repository>

Writes src/data/dore.json (each plate's title and the verse it is placed at), print copies in
tools/data/dore/print/ (grayscale, 300 dpi at a column's width) and small copies for the app in public/dore/.
"""
import io, json, re, subprocess, sys, gzip
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent

# plate number -> (book, chapter, verse) where it goes in the Bible text. Plates left out are the most
# graphic scenes (beheadings, slaughter, corpses), a bathing scene, and a few that would sit a verse or two
# from another plate of the same moment.
PLACE = {
  1: ('Genesis', 1, 3), 2: ('Genesis', 2, 21), 3: ('Genesis', 3, 23), 4: ('Genesis', 4, 3), 5: ('Genesis', 4, 8),
  6: ('Genesis', 7, 17), 8: ('Genesis', 8, 8), 9: ('Genesis', 9, 25), 10: ('Genesis', 11, 4), 11: ('Genesis', 12, 5),
  12: ('Genesis', 18, 2), 13: ('Genesis', 19, 24), 15: ('Genesis', 21, 15), 16: ('Genesis', 22, 6), 17: ('Genesis', 23, 19),
  18: ('Genesis', 24, 15), 19: ('Genesis', 24, 63), 20: ('Genesis', 27, 27), 21: ('Genesis', 28, 12), 22: ('Genesis', 29, 10),
  23: ('Genesis', 32, 9), 24: ('Genesis', 32, 24), 25: ('Genesis', 33, 4), 26: ('Genesis', 37, 28), 27: ('Genesis', 41, 25),
  28: ('Genesis', 45, 3), 29: ('Genesis', 46, 5), 30: ('Exodus', 2, 3), 31: ('Exodus', 2, 6), 32: ('Exodus', 7, 10),
  33: ('Exodus', 9, 3), 34: ('Exodus', 10, 22), 36: ('Exodus', 12, 31), 37: ('Exodus', 14, 27), 38: ('Exodus', 17, 6),
  39: ('Exodus', 19, 18), 41: ('Exodus', 32, 19), 40: ('Exodus', 34, 29), 42: ('Numbers', 13, 23), 43: ('Numbers', 16, 32),
  44: ('Numbers', 21, 9), 45: ('Numbers', 22, 31), 49: ('Joshua', 2, 15), 46: ('Joshua', 3, 17), 48: ('Joshua', 6, 20),
  51: ('Joshua', 8, 28), 53: ('Joshua', 10, 12), 47: ('Judges', 2, 1), 55: ('Judges', 5, 1), 56: ('Judges', 7, 5),
  57: ('Judges', 7, 21), 60: ('Judges', 11, 34), 62: ('Judges', 14, 6), 63: ('Judges', 15, 15), 64: ('Judges', 16, 3),
  65: ('Judges', 16, 19), 66: ('Judges', 16, 30), 70: ('Ruth', 1, 14), 71: ('Ruth', 2, 8), 72: ('1 Samuel', 6, 13),
  73: ('1 Samuel', 10, 1), 76: ('1 Samuel', 18, 11), 77: ('1 Samuel', 19, 12), 78: ('1 Samuel', 20, 41), 79: ('1 Samuel', 24, 8),
  80: ('1 Samuel', 28, 13), 83: ('2 Samuel', 2, 16), 84: ('2 Samuel', 12, 29), 85: ('2 Samuel', 18, 9), 86: ('2 Samuel', 18, 33),
  89: ('2 Samuel', 21, 17), 88: ('2 Samuel', 24, 16), 90: ('1 Kings', 3, 24), 91: ('1 Kings', 5, 6), 92: ('1 Kings', 10, 1),
  93: ('1 Kings', 11, 4), 94: ('1 Kings', 13, 24), 95: ('1 Kings', 17, 22), 97: ('1 Kings', 19, 5), 100: ('1 Kings', 22, 35),
  101: ('2 Kings', 1, 10), 102: ('2 Kings', 2, 11), 104: ('2 Kings', 6, 25), 130: ('Ezra', 1, 7), 135: ('Ezra', 3, 10),
  131: ('Ezra', 7, 11), 132: ('Ezra', 9, 5), 134: ('Nehemiah', 2, 13), 133: ('Nehemiah', 8, 3), 140: ('Tobit', 6, 1),
  141: ('Tobit', 12, 15), 142: ('Judith', 13, 6), 119: ('Esther', 1, 12), 144: ('Esther', 5, 1), 120: ('Esther', 6, 11),
  121: ('Esther', 7, 6), 149: ('1 Maccabees', 2, 24), 151: ('1 Maccabees', 5, 34), 152: ('1 Maccabees', 6, 46),
  153: ('1 Maccabees', 10, 84), 154: ('2 Maccabees', 3, 25), 155: ('2 Maccabees', 5, 2), 156: ('2 Maccabees', 6, 18),
  157: ('2 Maccabees', 7, 20), 159: ('2 Maccabees', 11, 8), 160: ('2 Maccabees', 15, 21), 136: ('Job', 1, 13), 137: ('Job', 2, 11),
  109: ('Amos', 1, 1), 111: ('Micah', 6, 1), 138: ('Jonah', 2, 10), 139: ('Jonah', 3, 4), 129: ('Zechariah', 6, 1),
  110: ('Isaiah', 1, 1), 127: ('Isaiah', 13, 19), 128: ('Isaiah', 27, 1), 112: ('Isaiah', 37, 36), 114: ('Jeremiah', 1, 1),
  115: ('Jeremiah', 36, 4), 145: ('Baruch', 1, 1), 116: ('Lamentations', 1, 1), 117: ('Ezekiel', 2, 1), 118: ('Ezekiel', 37, 1),
  122: ('Daniel', 1, 6), 123: ('Daniel', 3, 21), 124: ('Daniel', 5, 5), 125: ('Daniel', 6, 16), 126: ('Daniel', 7, 3),
  147: ('sus', 1, 45), 148: ('Bel and the Dragon', 1, 19),
  163: ('Matthew', 2, 9), 164: ('Matthew', 2, 14), 167: ('Matthew', 3, 1), 169: ('Matthew', 4, 8), 175: ('Matthew', 5, 1),
  179: ('Matthew', 8, 26), 184: ('Matthew', 14, 19), 186: ('Matthew', 15, 30), 187: ('Matthew', 17, 2), 199: ('Matthew', 21, 12),
  200: ('Matthew', 22, 19), 203: ('Matthew', 26, 39), 208: ('Matthew', 27, 29), 215: ('Matthew', 27, 38), 218: ('Matthew', 27, 59),
  168: ('Mark', 1, 10), 176: ('Mark', 2, 23), 174: ('Mark', 4, 1), 173: ('Mark', 5, 6), 180: ('Mark', 5, 41), 185: ('Mark', 6, 48),
  188: ('Mark', 9, 20), 192: ('Mark', 10, 13), 201: ('Mark', 12, 42), 205: ('Mark', 14, 45), 207: ('Mark', 15, 15), 214: ('Mark', 15, 25),
  220: ('Mark', 16, 5),
  161: ('Luke', 1, 28), 162: ('Luke', 2, 7), 166: ('Luke', 2, 46), 172: ('Luke', 4, 16), 183: ('Luke', 6, 17), 177: ('Luke', 7, 37),
  190: ('Luke', 10, 30), 181: ('Luke', 10, 40), 194: ('Luke', 15, 20), 195: ('Luke', 16, 20), 196: ('Luke', 18, 10), 198: ('Luke', 19, 36),
  202: ('Luke', 22, 19), 204: ('Luke', 22, 43), 209: ('Luke', 22, 63), 211: ('Luke', 23, 26), 213: ('Luke', 23, 33), 216: ('Luke', 23, 44),
  219: ('Luke', 23, 53), 221: ('Luke', 24, 15),
  170: ('John', 2, 7), 171: ('John', 4, 7), 189: ('John', 8, 3), 178: ('John', 9, 6), 197: ('John', 11, 43), 206: ('John', 18, 25),
  210: ('John', 19, 5), 212: ('John', 19, 17), 217: ('John', 19, 38), 222: ('John', 21, 6),
  223: ('Acts', 1, 9), 224: ('Acts', 2, 3), 226: ('Acts', 3, 6), 227: ('Acts', 5, 5), 225: ('Acts', 5, 42), 228: ('Acts', 7, 59),
  229: ('Acts', 9, 4), 230: ('Acts', 10, 34), 231: ('Acts', 12, 7), 232: ('Acts', 17, 2), 233: ('Acts', 19, 8), 234: ('Acts', 21, 32),
  235: ('Acts', 27, 41),
  236: ('Revelation', 1, 9), 237: ('Revelation', 6, 8), 238: ('Revelation', 12, 1), 239: ('Revelation', 18, 2), 240: ('Revelation', 20, 12),
  241: ('Revelation', 21, 10),
}

FIX = {"Abrahams": "Abraham’s", "Labans": "Laban’s", "Jacobs": "Jacob’s", "Pharaohs": "Pharaoh’s", "Gideons": "Gideon’s",
  "Jephthahs": "Jephthah’s", "Davids": "David’s", "Ezekiels": "Ezekiel’s", "Daniels": "Daniel’s", "Isaiahs": "Isaiah’s",
  "Zechariahs": "Zechariah’s", "Jerusalems": "Jerusalem’s", "Fathers": "Father’s", "Rich Mans": "Rich Man’s", "Lions Den": "Lions’ Den",
  "Jesus Body": "Jesus’ Body", "Jeremiahs": "Jeremiah’s", "Sennacheribs": "Sennacherib’s", "Widows Mite": "Widow’s Mite",
  "Ass Jawbone": "Donkey’s Jawbone", "Tables of the Law": "Tablets of the Law", "Jabesh gilead": "Jabesh-gilead", "Beth shemesh": "Beth-shemesh"}
SMALL = {'a', 'an', 'the', 'of', 'in', 'on', 'to', 'by', 'and', 'from', 'with', 'for', 'at', 'out', 'before', 'over', 'into', 'outside', 'about', 'among', 'through', 'away', 'up', 'down', 'is', 'are', 'as'}

def title(name):
    t = re.sub(r'^Gustave-Dore-Bible-Tour-(Hebrew-OT|NT-Gospel)-\d+-', '', name)[:-4].replace('-', ' ')
    for a, b in FIX.items(): t = t.replace(a, b)
    return t

def main(repo):
    repo = Path(repo)
    names = subprocess.run(['git', '-C', repo, 'ls-tree', '--name-only', 'HEAD'], capture_output=True, text=True, check=True).stdout.split()
    by_num = {int(re.search(r'-(\d{3})-', n).group(1)): n for n in names if n.endswith('.jpg')}
    bible = json.load(gzip.open(ROOT / 'tools/data/web.json.gz'))
    out, pr, app = {}, ROOT / 'tools/data/dore/print', ROOT / 'public/dore'
    pr.mkdir(parents=True, exist_ok=True); app.mkdir(parents=True, exist_ok=True)
    for num, (book, ch, v) in sorted(PLACE.items()):
        verses = {x[0] for kind, parts in bible[book][str(ch)] for x in parts}
        assert v in verses, (num, book, ch, v)
        name = by_num[num]
        raw = subprocess.run(['git', '-C', repo, 'show', f'HEAD:{name}'], capture_output=True, check=True).stdout
        im = Image.open(io.BytesIO(raw)).convert('L')
        im = ImageOps.crop(im, border=int(min(im.size) * 0.012))          # trim the scan's ragged edge
        p = im.copy(); p.thumbnail((720, 1100), Image.LANCZOS); p = ImageOps.autocontrast(p, cutoff=0.3)
        p.save(pr / f'{num:03d}.jpg', quality=84, optimize=True, progressive=True)
        a = im.copy(); a.thumbnail((520, 800), Image.LANCZOS); a = ImageOps.autocontrast(a, cutoff=0.3)
        a.save(app / f'{num:03d}.jpg', quality=72, optimize=True, progressive=True)
        out[str(num)] = {'title': title(name), 'book': book, 'chapter': ch, 'verse': v, 'w': p.width, 'h': p.height}
        print(num, out[str(num)]['title'])
    (ROOT / 'src/data/dore.json').write_text(json.dumps(out, ensure_ascii=False, indent=1))

if __name__ == '__main__':
    main(sys.argv[1])
