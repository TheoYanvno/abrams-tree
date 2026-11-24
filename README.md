# 📜 AbrahamsTree

A React Bible study guide in deep green and gold: daily reading plans, the whole Bible to read, prayers and prayer times, a world map of where the events of the Bible happened, a timeline of when the people of the Bible lived, and the Church calendar.

**Live app:** [theoyanvno.github.io/abrams-tree](https://theoyanvno.github.io/abrams-tree/)

**Status:** finished. Reading plans, translations side by side, prayers, the map and the timeline all work.

## What it does

- **🏠 Home:** the AbrahamsTree crest over Doré's *Abraham and the Three Angels*, God's promise to Abraham (Genesis 12:3), and a picture tile for each part of the app. A bar along the bottom goes to Home, Bible, Study, Calendar and Profile, and the menu button lists every section.
- **📖 Bible:** read any chapter of the Orthodox Bible in any of the six public-domain translations, with previous and next buttons. Tap a verse to highlight it; the app remembers where you stopped.
- **📅 Study:** pick a reading plan (the whole Bible in a year, the New Testament in 90 days, the Gospels in 40 days, Psalms in a month or Proverbs a chapter a day) and a start date. Each day shows its chapters with links to read them in [SuperBook](https://theoyanvno.github.io/SuperBook/), a daily streak that waits for you in the morning, a progress bar, notes and prayers for each day, and a catch-up list for missed days.
- **Compare translations:** read the day's chapters in two public-domain translations side by side (World English Bible, King James, American Standard, Douay-Rheims, Young's Literal, Bible in Basic English), lined up verse by verse. Tap a verse to highlight it.
- **🙏 Pray:** the Orthodox hours of prayer through the day (morning, the Third, Sixth and Ninth Hours, evening and before sleep), each with a verse and the traditional prayers. Keep a prayer list, mark prayers answered and look back at them.
- **Prayer times:** choose the hours you want and download a calendar file. Your phone or computer then reminds you every day, even when AbrahamsTree is closed. While the page is open it can also show a notification.
- **🗺️ Map:** 51 events at 42 places, from Abram leaving Ur to John on Patmos. Drag to pan, scroll or use + and − to zoom, filter by era or book, and press **Play in order** to fly through them one by one while a trail of footprints walks from each place to the next. The map is drawn like an old atlas: ink coastlines on parchment, wavy sea lines and a compass rose. Click a place to see what happened there, with links to each chapter. It also works from the keyboard (arrow keys and + / −).
- **⏳ Timeline:** when each person lived, drawn as bars across the years.
  - **Adam to St. Paul:** the whole story on one line, from Adam to the apostles Peter, Paul and John. The Genesis years are joined to the later dates at Abraham, so every date on it is approximate.
  - **Adam to Joseph:** years counted from creation, added up from the ages Genesis 5 and 11 give for each father and son. It shows the Flood in year 1,656, Methuselah dying that same year, and Shem still alive when Isaac was born.
  - **Abraham to the apostles:** years BC and AD, worked back from 1 Kings 6:1 (the temple begun 480 years after the Exodus) and Exodus 12:40. Approximate dates are marked c.
  - **God's time:** "one day is with the Lord as a thousand years" (2 Peter 3:8), so a band along the top marks every thousand years as one of God's days. Each person's life is also shown in God's time: Methuselah's 969 years are 23 hours 15 minutes of one day.
  - **Alive together:** tap a name to see who was alive at the same time, and read their chapter.
  - **A day with the Lord:** the week of creation as God's days (six days of making are 6,000 of our years, and with the seventh day of rest, 7,000 years), and the verses where God speaks of time, read with the thousand-year day.
- **🗓️ Calendar:** the next Great Feast and how many days away it is, every feast of the coming year by month (Pascha and the feasts that move with it are worked out for each year), and the fasting seasons.
- **👤 Profile:** your plan, streak and progress, how many verses you have highlighted, days with notes and open prayer requests, and a button to clear it all from the device.
- **📕 Study Bible:** the *AbrahamsTree Study Bible* prints the whole Bible (the World English Bible, with every book of the Orthodox Old Testament) in four 6 × 9 volumes of 13 weeks each, ready for Amazon KDP.
  - **Each week opens with two pages:** the week number, the lesson of the week, a saint's words and a short life of the saint, a "Did you know?" with an engraving by Gustave Doré, and the lesson plan with a checkbox for each day; then an introduction to any book that starts that week, a prayer to learn by heart over four weeks, and a map of that week's places, with open circles for every place the reading has already been.
  - **The end of every book:** a short summary and a timeline of the Bible's history with that book in black and the books read so far in grey.
  - **Room to write:** three lines for notes at the foot of every page of Scripture, and a page at the end of every week with three talking points to think about and discuss, and room for notes.
  - **The books outside the Protestant Bible:** in the weeks that read them, the "Did you know?" explains when and why they were set aside, and why the Orthodox Church keeps them.
  - **Doré's engravings in the text:** 207 of Gustave Doré's Bible engravings sit beside the verses they show, and the app shows each week's pictures too.
  - **Then the Bible text itself,** day by day, in two columns.
  - **Each volume ends with:** the hours of prayer, a prayer list, that part's timeline and maps, and journal pages.
  - **QR codes:** every week, hour, chart and map has one that opens the same spot in the app, and the app tells you which volume and page you're on.
- Everything is saved in your browser, and it works on phones.

## Run it

```bash
npm install
npm start       # builds and serves it at http://localhost:8000
npm test        # plans, progress, prayers, translations, the map, the timeline, the calendar and the SuperBook sync
npm run build   # builds the site into docs/ for GitHub Pages
npm run book    # builds the four Study Bible volumes into book/ and their page numbers into src/data/bookPages.json
npm run cover   # builds each volume's KDP paperback cover (back, spine and front) into book/
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
| `src/lib/book.js`, `src/data/study.js` | The weeks of the plan, the links the QR codes open, the volume and page for each, and the study notes (introductions, quotes, prayers to learn, facts) |
| `tools/parse_web.py`, `tools/build_book.mjs`, `tools/build_cover.mjs` | The World English Bible put into the Orthodox order, and the four volumes and their covers built from it |
| `tools/make_dore.py`, `src/lib/dore.js` | The Doré engravings: which verse each one belongs to, print copies for the book and small copies for the app |
| `src/data/basemap.json` | Land, lakes and rivers from [Natural Earth](https://www.naturalearthdata.com/) (public domain), made by `tools/build_basemap.py` |

The logic is plain functions tested with `node --test`; the React components only draw it and save it.

## Built with

React, JavaScript, SVG, the Notifications API, iCalendar files, bible-api.com, Natural Earth, esbuild, GitHub Pages

## Credits

Built with help from AI coding tools; every feature is reviewed and tested before it ships. Prayers are the traditional prayers of the Church, and verses are from the World English Bible, both in the public domain. Illustrations are engravings by Gustave Doré from *La Grande Bible de Tours* (1866, public domain); scans compiled by Felix Just, S.J., derived from AionianBible.org by Nainoia Inc.

## License

MIT. See [LICENSE](LICENSE).
