# 📜 AbrahamsTree

A React Bible study guide: daily reading plans, prayers and prayer times, a world map of where the events of the Bible happened, and a timeline of when the people of the Bible lived.

**Status:** finished. Reading plans, translations side by side, prayers, the map and the timeline all work.

## What it does

- **📖 Read:** pick a reading plan (the whole Bible in a year, the New Testament in 90 days, the Gospels in 40 days, Psalms in a month or Proverbs a chapter a day) and a start date. Each day shows its chapters with links to read them in [SuperBook](https://theoyanvno.github.io/SuperBook/), a daily streak that waits for you in the morning, a progress bar, notes and prayers for each day, and a catch-up list for missed days.
- **Compare translations:** read the day's chapters in two public-domain translations side by side (World English Bible, King James, American Standard, Douay-Rheims, Young's Literal, Bible in Basic English), lined up verse by verse. Tap a verse to highlight it.
- **🙏 Pray:** the Orthodox hours of prayer through the day (morning, the Third, Sixth and Ninth Hours, evening and before sleep), each with a verse and the traditional prayers. Keep a prayer list, mark prayers answered and look back at them.
- **Prayer times:** choose the hours you want and download a calendar file. Your phone or computer then reminds you every day, even when AbrahamsTree is closed. While the page is open it can also show a notification.
- **🗺️ Map:** 51 events at 42 places, from Abram leaving Ur to John on Patmos. Drag to pan, scroll or use + and − to zoom, filter by era or book, and press **Play in order** to fly through them one by one. Click a place to see what happened there, with links to each chapter. It also works from the keyboard (arrow keys and + / −).
- **⏳ Timeline:** when each person lived, drawn as bars across the years.
  - **Adam to Joseph:** years counted from creation, added up from the ages Genesis 5 and 11 give for each father and son. It shows the Flood in year 1,656, Methuselah dying that same year, and Shem still alive when Isaac was born.
  - **Abraham to the apostles:** years BC and AD, worked back from 1 Kings 6:1 (the temple begun 480 years after the Exodus) and Exodus 12:40. Approximate dates are marked c.
  - **God's time:** "one day is with the Lord as a thousand years" (2 Peter 3:8), so a band along the top marks every thousand years as one of God's days. Each person's life is also shown in God's time: Methuselah's 969 years are 23 hours 15 minutes of one day.
  - **Alive together:** tap a name to see who was alive at the same time, and read their chapter.
  - **A day with the Lord:** the week of creation as God's days (six days of making are 6,000 of our years, and with the seventh day of rest, 7,000 years), and the verses where God speaks of time, read with the thousand-year day.
- **📕 Study book:** a printed 6 × 9 companion, *AbrahamsTree: A Bible-in-a-Year Study Book* (150 pages). It has 52 weekly reading pages, each facing a page for notes and prayers, plus the hours of prayer, a prayer list, the timeline and the week of creation, a map for each era and journal pages. Every section has a QR code that opens the same spot in the app: that week's chapters side by side in two translations, that hour's prayers, that chart or that era on the map. The app tells you which page of the book you're on.
- Everything is saved in your browser, and it works on phones.

## Run it

```bash
npm install
npm start       # builds and serves it at http://localhost:8000
npm test        # plans, progress, prayers, translations, the map, the timeline and the SuperBook sync
npm run build   # builds the site into docs/ for GitHub Pages
npm run book    # builds the study book into book/ (the PDF needs Playwright)
npm run cover   # builds its KDP paperback cover (back, spine and front) into book/
```

It works the same on Windows, macOS and Linux (in the VS Code terminal on Windows). The translations come from [bible-api.com](https://bible-api.com/), the same free service SuperBook reads, so comparing translations needs an internet connection.

## How it's built

| File | What it does |
|---|---|
| `src/lib/books.js` | The Orthodox canon, kept identical to SuperBook's by a test |
| `src/lib/plans.js`, `src/lib/progress.js` | Reading plans split evenly by day, streaks, completion and catch-up |
| `src/lib/translations.js` | Chapters from bible-api.com, cached, with clear errors, lined up verse by verse; highlights |
| `src/lib/prayers.js` | The hours of prayer, the prayer list, the next reminder, and the `.ics` calendar file |
| `src/lib/map.js`, `src/data/places.js` | Places and events, filtering, and the pan and zoom maths |
| `src/lib/timeline.js`, `src/data/people.js` | Lives added up from Genesis, BC and AD dates, who was alive together, and God's time (a thousand years to a day) |
| `src/lib/book.js`, `tools/build_book.mjs` | The study book's pages in order with each QR code's app link, and the 6 × 9 PDF built from them |
| `src/data/basemap.json` | Land, lakes and rivers from [Natural Earth](https://www.naturalearthdata.com/) (public domain), made by `tools/build_basemap.py` |

The logic is plain functions tested with `node --test`; the React components only draw it and save it.

## Built with

React, JavaScript, SVG, the Notifications API, iCalendar files, bible-api.com, Natural Earth, esbuild, GitHub Pages

## Credits

Built with help from AI coding tools; every feature is reviewed and tested before it ships. Prayers are the traditional prayers of the Church, and verses are from the World English Bible, both in the public domain.

## License

MIT. See [LICENSE](LICENSE).
