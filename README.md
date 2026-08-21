# 🎳 Wanstrow Spares

### Skittles at The King William IV
**There's Only One Team In Wanstrow!**

[![Live Site](https://img.shields.io/badge/site-wanstrowspares.xyz-1F5A3A)](https://wanstrowspares.xyz)

---

## 📖 About

This repository powers the official team dashboard for **Wanstrow Spares**, a pub skittles team playing out of The King William IV. The site is a lightweight, mobile-friendly dashboard the whole team can check on WhatsApp — live standings, player stats, fixtures, and results — with a simple admin panel for match-day updates.

**Live site:** [wanstrowspares.xyz](https://wanstrowspares.xyz)

<!--
📸 Add a screenshot of the dashboard here once you have one, e.g.:
![Team Overview screenshot](docs/screenshot-overview.png)
See the "Adding Images" section below for how to do this.
-->

---

## ✨ Features

- **Team Overview** — season stats at a glance: wins, losses, draws, points, and average score
- **Player Stats** — sortable table (Games, Total Pins, Average, High Score); click any column header to sort, click again to reverse, a third click resets to alphabetical
- **Head-to-Head** — win/draw/loss record against each of the 18 league opponents
- **Results** — full match history for the season
- **Fixtures** — colour-coded Home/Away and Early/Late badges for every upcoming match
- **Season Archive** — switch between the current season and past seasons; visible to everyone, not just admins
- **Admin Panel** (password-protected) — add fixtures via CSV upload, enter match results, add/remove players
- **Mobile-optimised** — compact admin icon and larger logo on small screens, built for viewing on the pub WhatsApp group
- **XYZ Handicap System** — built-in support for the league's absent-player scoring rules
- **Half-point scoring** — supports drawn legs (e.g. 5.5–2.5) as used in this league

---

## 🏗️ Tech Stack

Plain, dependency-free front end — no build step, no frameworks:

- **HTML / CSS / JavaScript** (vanilla)
- **GitHub Pages** for hosting
- **Custom domain** (wanstrowspares.xyz) via Namecheap, HTTPS enforced
- **JSON files** for season data — no database or backend

---

## 📁 File Structure

```
/
├── index.html              # Page structure & layout
├── script.js                # All app logic (data loading, rendering, admin actions)
├── styles.css                # Brand styling (forest green theme)
├── wanstrow-logo.png       # Team crest, also used as favicon
└── data/
    ├── 2025-26.json         # Archived season (read-only reference)
    └── 2026-27.json         # Current season
```

Each season gets its own JSON file. Old seasons are never deleted — they stay in `/data` permanently as an archive, viewable by anyone via the Season selector.

---

## 🚀 Deployment

The site is hosted on GitHub Pages, pointed at by a custom domain:

1. GitHub Pages serves directly from this repo's default branch
2. Namecheap DNS is configured with 4 A Records pointing to GitHub's servers, plus a CNAME record for `www`
3. Domain is set as `wanstrowspares.xyz` (no `www`, no trailing slash)
4. **HTTPS is enforced** in GitHub Pages settings

Changes pushed to `index.html`, `script.js`, or `styles.css` typically take **2–3 minutes** to propagate live. A hard refresh (`Ctrl+Shift+R` / `Cmd+Shift+R`, or fully closing and reopening the tab on iOS Safari) may be needed to see changes immediately, as browsers cache aggressively.

---

## 🔑 Admin Access

Click **Admin Login** (top right / lock icon on mobile) to unlock:
- Fixture CSV upload
- Match result entry
- Add/remove players

The admin password is set as a constant near the top of `script.js`. Since this repository is public, **the password is intentionally not documented here** — check `script.js` directly, and consider rotating it periodically since anyone can view the source of a public repo.

---

## 🗂️ Data & Season Workflow

This is a **static site with no backend**, so data is stored in the browser's `localStorage` on whichever device made the change. To make a change visible to the whole team (on all their devices), it needs to be manually pushed to GitHub:

1. Log in as Admin and make your changes (enter a match, add a player, etc.)
2. Open the browser console (`Cmd+Option+J` on Mac Chrome)
3. Run:
   ```js
   console.log(JSON.stringify(dashboardData.seasons['2026-27']))
   ```
4. Copy the JSON output
5. Go to `data/2026-27.json` in this GitHub repo, replace the contents, and commit
6. Wait 2–3 minutes for GitHub Pages to propagate — the change is now live for everyone

This is the same process used for adding fixtures, players, or match results — the admin panel just prepares the data locally first.

### Starting a new season

1. Back up the current live `index.html`, `script.js`, `styles.css`, and data file
2. Rename the outgoing season's data file (e.g. `matches.json` → `2025-26.json`) and keep it as the permanent archive
3. Create a new empty `2026-27.json`:
   ```json
   { "matches": [] }
   ```
4. Update `script.js` if the fetch path needs to change (usually not necessary, since new dashboard builds already point at the right file)
5. Deploy and test before announcing to the team

---

## 📊 Fixture CSV Format

The admin panel accepts pasted CSV data in this format:

```
Date,Opponent,Venue,Time
```

**Example:**
```
01/09/2026,Balls Deep,Home,Early
08/09/2026,The Tossers,Away,Late
15/09/2026,Deep In Cider,Home,Early
```

- **Date** — accepts `DD/MM/YYYY` or `YYYY-MM-DD`
- **Venue** — `Home` or `Away`
- **Time** — `Early` or `Late` (shown as colour-coded badges), or an actual `HH:MM` time

No header row is required — paste the fixture rows straight in.

---

## 🎨 Brand Colours

| Colour | Hex | Usage |
|---|---|---|
| Primary Green | `#12432D` | Header, active tabs, buttons |
| Dark Green | `#0C2E1E` | Gradient shading, hover states |
| Cream | `#F5F3E8` | Page background |
| Points (yellow) | `#f59e0b` | Points stat card |
| Average (blue) | `#3b82f6` | Average score stat card |
| Success (green) | `#10b981` | Wins |
| Danger (red) | `#ef4444` | Losses, handicap indicator |

Colours match the official Wanstrow Spares club crest exactly.

---

## 🖼️ Adding Images to This README

GitHub renders images in Markdown automatically. To add a screenshot:

1. Create a `docs/` folder in this repo (or reuse an existing images folder)
2. Upload your image (e.g. `docs/screenshot-overview.png`)
3. Reference it in this file using:
   ```markdown
   ![Description of image](docs/screenshot-overview.png)
   ```

Good candidates for screenshots: the Team Overview tab, the Player Stats table (showing the sort arrows), and the Fixtures tab with the coloured badges.

---

## ⚠️ Known Limitations

- **No database** — all data lives in static JSON files, manually updated via GitHub commits
- **No real-time sync** — changes made on one device aren't visible elsewhere until pushed to GitHub
- **No user accounts** — a single shared admin password controls all editing access

These are deliberate trade-offs to keep the site free to host and simple to maintain for a pub skittles team — not a bug list to fix, just good to know when making changes.

---

*Built for Wanstrow Spares. Skittles at The King William IV. There's Only One Team In Wanstrow!* 🎳
