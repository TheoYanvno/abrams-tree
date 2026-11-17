# 📜 AbramsTree

A React Bible study guide: daily reading plans, prayers and prayer times, and a world map of where the events of the Bible happened.

**Status:** finished. Reading plans, translations side by side, prayers and the map all work.

## What it does

- **📖 Read:** pick a reading plan (the whole Bible in a year, the New Testament in 90 days, the Gospels in 40 days, Psalms in a month or Proverbs a chapter a day) and a start date. Each day shows its chapters with links to read them in [SuperBook](https://theoyanvno.github.io/SuperBook/), a daily streak that waits for you in the morning, a progress bar, notes and prayers for each day, and a catch-up list for missed days.
- **Compare translations:** read the day's chapters in two public-domain translations side by side (World English Bible, King James, American Standard, Douay-Rheims, Young's Literal, Bible in Basic English), lined up verse by verse. Tap a verse to highlight it.
- **🙏 Pray:** the Orthodox hours of prayer through the day (morning, the Third, Sixth and Ninth Hours, evening and before sleep), each with a verse and the traditional prayers. Keep a prayer list, mark prayers answered and look back at them.
- **Prayer times:** choose the hours you want and download a calendar file. Your phone or computer then reminds you every day, even when AbramsTree is closed. While the page is open it can also show a notification.
- **🗺️ Map:** 51 events at 42 places, from Abram leaving Ur to John on Patmos. Drag to pan, scroll or use + and − to zoom, filter by era or book, and press **Play in order** to fly through them one by one. Click a place to see what happened there, with links to each chapter. It also works from the keyboard (arrow keys and + / −).
- Everything is saved in your browser, and it works on phones.

## Run it

```bash
npm install
npm start       # builds and serves it at http://localhost:8000
npm test        # plans, progress, prayers, translations, the map and the SuperBook sync
npm run build   # builds the site into docs/ for GitHub Pages
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
| `src/data/basemap.json` | Land, lakes and rivers from [Natural Earth](https://www.naturalearthdata.com/) (public domain), made by `tools/build_basemap.py` |

The logic is plain functions tested with `node --test`; the React components only draw it and save it.

## Built with

React, JavaScript, SVG, the Notifications API, iCalendar files, bible-api.com, Natural Earth, esbuild, GitHub Pages

## Credits

Built with help from AI coding tools; every feature is reviewed and tested before it ships. Prayers are the traditional prayers of the Church, and verses are from the World English Bible, both in the public domain.

## License

MIT. See [LICENSE](LICENSE).
