"""Turn the World English Bible (USFX, public domain, from github.com/seven1m/open-bibles) into the
chapters the study book prints, in the Orthodox order of src/lib/books.js.

Each chapter is a list of blocks: ["p" | "q" | "q2" | "d" | "s", [[verse or 0, text], ...]].
p is a paragraph, q and q2 are lines of poetry (q2 indented), d is a psalm title and s a heading.
The Greek parts the Orthodox Bible keeps are placed where they belong: the Song of the Three Holy
Children inside Daniel 3, the Letter of Jeremiah after Baruch 5 and Psalm 151 after Psalm 150.
Footnotes and cross references are left out. Writes tools/data/web.json.gz.

    python tools/parse_web.py path/to/eng-web.usfx.xml
"""
import gzip, json, re, sys
from pathlib import Path

CODES = {
    'Genesis': 'GEN', 'Exodus': 'EXO', 'Leviticus': 'LEV', 'Numbers': 'NUM', 'Deuteronomy': 'DEU', 'Joshua': 'JOS',
    'Judges': 'JDG', 'Ruth': 'RUT', '1 Samuel': '1SA', '2 Samuel': '2SA', '1 Kings': '1KI', '2 Kings': '2KI',
    '1 Chronicles': '1CH', '2 Chronicles': '2CH', 'Prayer of Manasses': 'MAN', '1 Esdras': '1ES', 'Ezra': 'EZR',
    'Nehemiah': 'NEH', 'Tobit': 'TOB', 'Judith': 'JDT', 'Esther': 'ESG', '1 Maccabees': '1MA', '2 Maccabees': '2MA',
    '3 Maccabees': '3MA', 'Psalms': 'PSA', 'Job': 'JOB', 'Proverbs': 'PRO', 'Ecclesiastes': 'ECC',
    'Song of Solomon': 'SNG', 'Wisdom': 'WIS', 'Sirach': 'SIR', 'Hosea': 'HOS', 'Amos': 'AMO', 'Micah': 'MIC',
    'Joel': 'JOL', 'Obadiah': 'OBA', 'Jonah': 'JON', 'Nahum': 'NAM', 'Habakkuk': 'HAB', 'Zephaniah': 'ZEP',
    'Haggai': 'HAG', 'Zechariah': 'ZEC', 'Malachi': 'MAL', 'Isaiah': 'ISA', 'Jeremiah': 'JER', 'Baruch': 'BAR',
    'Lamentations': 'LAM', 'Ezekiel': 'EZK', 'Daniel': 'DAN', 'sus': 'SUS', 'Bel and the Dragon': 'BEL',
    '4 Maccabees': '4MA', 'Matthew': 'MAT', 'Mark': 'MRK', 'Luke': 'LUK', 'John': 'JHN', 'Acts': 'ACT',
    'Romans': 'ROM', '1 Corinthians': '1CO', '2 Corinthians': '2CO', 'Galatians': 'GAL', 'Ephesians': 'EPH',
    'Philippians': 'PHP', 'Colossians': 'COL', '1 Thessalonians': '1TH', '2 Thessalonians': '2TH',
    '1 Timothy': '1TI', '2 Timothy': '2TI', 'Titus': 'TIT', 'Philemon': 'PHM', 'Hebrews': 'HEB', 'James': 'JAS',
    '1 Peter': '1PE', '2 Peter': '2PE', '1 John': '1JN', '2 John': '2JN', '3 John': '3JN', 'Jude': 'JUD',
    'Revelation': 'REV',
}

def strip_notes(s):
    for tag in ('f', 'x', 'fe'):
        s = re.sub(rf'<{tag}\b[^>]*>.*?</{tag}>', '', s, flags=re.S)
    return s

TOKEN = re.compile(r'<(/?)(\w+)([^>]*?)(/?)>|([^<]+)', re.S)

def parse_book(body):
    """{chapter: [blocks]} for one book. Text before the first chapter (Sirach's prologue) goes to chapter 1."""
    chapters, ch, verse, block = {}, '1', 0, None
    def new_block(kind):
        nonlocal block
        block = [kind, []]
        chapters.setdefault(ch, []).append(block)
    def add_text(t):
        t = re.sub(r'\s+', ' ', t)
        if not t.strip() and not (block and block[1]): return
        if block is None: new_block('p')
        parts = block[1]
        if parts and parts[-1][0] == verse: parts[-1][1] += t
        else: parts.append([verse, t.lstrip() if not parts else t])
    skip = 0
    for close, tag, attrs, selfclose, text in TOKEN.findall(body):
        if text:
            if not skip: add_text(text)
            continue
        if tag in ('id', 'h', 'toc', 'ide', 'rem', 'periph', 'w') and not selfclose:
            if tag == 'w': continue
            skip += -1 if close else 1
            continue
        if close: continue
        a = dict(re.findall(r'(\w+)="([^"]*)"', attrs))
        if tag == 'c':
            ch, verse, block = a['id'], 0, None
        elif tag == 'v':
            verse = int(re.match(r'\d+', a['id']).group()) if re.match(r'\d+', a['id']) else verse
        elif tag == 'p':
            sfm = a.get('sfm', 'p')
            if sfm in ('mt', 'mt1', 'mt2', 'ms', 'is', 'ip', 'imt'): new_block('x')     # book titles and introductions: dropped
            elif sfm in ('s', 's1', 's2', 'ms1'): new_block('s')
            else: new_block('p')
        elif tag == 'q':
            new_block('q2' if a.get('level', '1') != '1' else 'q')
        elif tag in ('d',):
            new_block('d')
        elif tag in ('s',):
            new_block('s')
        elif tag == 'b':
            block = None
    # tidy: drop dropped/empty blocks, trim text
    out = {}
    for c, blocks in chapters.items():
        keep = []
        for kind, parts in blocks:
            parts = [[v, re.sub(r'\s+', ' ', t).strip()] for v, t in parts if t.strip()]
            if kind != 'x' and parts: keep.append([kind, parts])
        if keep: out[c] = keep
    return out

def main(src):
    s = strip_notes(open(src, encoding='utf-8').read())
    books = {b: parse_book(body) for b, body in re.findall(r'<book id="([^"]+)">(.*?)</book>', s, flags=re.S)}
    bible = {}
    for app_id, code in CODES.items():
        bible[app_id] = books[code]
    # Daniel 3: the Prayer of Azariah and Song of the Three Holy Children come after verse 23.
    dan3 = bible['Daniel']['3']
    at = next(i for i, (k, parts) in enumerate(dan3) if any(v > 23 for v, _ in parts))
    song = [['s', [[0, 'The Prayer of Azariah and the Song of the Three Holy Children']]]] + books['S3Y']['1']
    # split the block that holds verse 23 and 24 if they share one
    k, parts = dan3[at]
    before = [p for p in parts if p[0] <= 23]
    after = [p for p in parts if p[0] > 23]
    dan3[at:at + 1] = ([[k, before]] if before else []) + [[b[0], [[f'S{v}' if v else 0, t] for v, t in b[1]]] for b in song] + ([[k, after]] if after else [])
    # Baruch 6 is the Letter of Jeremiah; Psalm 151 follows Psalm 150.
    bible['Baruch']['6'] = [['s', [[0, 'The Letter of Jeremiah']]]] + books['LJE']['6']
    bible['Psalms']['151'] = books['PS2']['151']
    out = Path(__file__).parent / 'data' / 'web.json.gz'
    with gzip.open(out, 'wt', encoding='utf-8') as f:
        json.dump(bible, f, ensure_ascii=False, separators=(',', ':'))
    words = sum(len(t.split()) for b in bible.values() for c in b.values() for _, parts in c for _, t in parts)
    print(f'{len(bible)} books, {sum(len(b) for b in bible.values())} chapters, {words:,} words → {out}')

if __name__ == '__main__':
    main(sys.argv[1])
