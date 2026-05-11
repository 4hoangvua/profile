# Progress Tracker

Track what's been built and whether it works.

## Completed Work

| #  | Feature / Task              | Date       | Proof                  |
| -- | --------------------------- | ---------- | ---------------------- |
| 1  | Spec document (prProfile.md)| 2026-05-09 | File created, reviewed |
| 2  | System rules (test-rule.md) | 2026-05-09 | Rules extracted from spec |
| 3  | Database + Config (config.php)| 2026-05-09 | All 8 tables, defaults |
| 4  | Auth API (auth.php)         | 2026-05-09 | login/logout/check/change_password |
| 5  | API Router (index.php)      | 2026-05-09 | Routes all 25+ actions |
| 6  | Profile API                 | 2026-05-09 | get/save profile |
| 7  | Skills API                  | 2026-05-09 | CRUD with validation |
| 8  | Projects API                | 2026-05-09 | CRUD with validation |
| 9  | Education API               | 2026-05-09 | CRUD with validation |
| 10 | Experience API              | 2026-05-09 | CRUD with validation |
| 11 | Contact API                 | 2026-05-09 | send/get/mark_read/delete |
| 12 | Settings API                | 2026-05-09 | get/save settings |
| 13 | Upload API                  | 2026-05-09 | 2MB limit, type validation |
| 14 | Frontend CSS (style.css)    | 2026-05-09 | 3 themes, responsive, animations |
| 15 | Admin CSS (admin.css)       | 2026-05-09 | Sidebar layout, modals, toast |
| 16 | Frontend JS (main.js)       | 2026-05-09 | Data fetch, render, scroll animations |
| 17 | Admin JS (admin.js)         | 2026-05-09 | Full CRUD, auth, upload |
| 18 | Main page (index.html)      | 2026-05-09 | 8 sections, semantic HTML |
| 19 | Admin page (admin/index.html)| 2026-05-09 | Login + sidebar + all panels |
| 20 | Move admin.html to admin/   | 2026-05-11 | Paths updated, documentation current |
| 21 | Fix project image paths in admin | 2026-05-11 | Prepend ../ to relative paths in admin.js |
| 22 | Inline form for CRUD actions | 2026-05-11 | Replace editModal with panel-form, full width view |
| 23 | Mobile Sidebar Overlay      | 2026-05-11 | Overlay backdrop + click-outside to close |
| 24 | Smooth Panel Transitions    | 2026-05-11 | CSS Fade & Slide animations for admin panels |
| 25 | Cache-busting (v=2)         | 2026-05-11 | Query string versioning for CSS/JS |
| 26 | Spec Update (prProfile.md)  | 2026-05-11 | Updated architecture and feature list |
| 27 | F13: CV Export/Download     | 2026-05-11 | Integrated CV upload/download logic |
| 28 | F14: SEO & Meta Tags        | 2026-05-11 | Added OG tags, keywords, descriptions |
| 29 | F14: Performance            | 2026-05-11 | Lazy loading, Cache-busting v=3 |
| 30 | Modern Icon System (SVG)    | 2026-05-11 | Replaced emojis with SVGs in UI |
| 31 | Cache-busting v=3           | 2026-05-11 | Forced browser refresh for all assets |
| 32 | Full-page Preloader         | 2026-05-11 | Prevented default data flashing on load |
| 33 | URL Hash Routing (Admin)    | 2026-05-11 | State persistence & deep linking for Admin panels |
| 34 | Personal Info Update        | 2026-05-11 | Updated name (Trần Đình Hoàng) & HTTPS links |


**Proof** = how we know it works. Examples: "tested manually", "unit test passes", "screenshot", "runs on localhost".

## Known Issues

| #  | Issue             | Severity   | Status         |
| -- | ----------------- | ---------- | -------------- |
|    | (none yet)        |            |                |

**Severity:** `low` | `medium` | `high` | `blocker`
**Status:** `open` | `fixing` | `fixed` | `wont-fix`
