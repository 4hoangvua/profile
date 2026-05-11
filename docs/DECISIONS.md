# Decisions

Record important choices here so future agents (and you) know WHY things are the way they are.

## Template

```
### D-XXX: Title

**Date:** YYYY-MM-DD
**Context:** What problem or question came up?
**Decision:** What did we choose?
**Why:** Why this over other options?
```

## Log

### D-001: Centralizing Auth Helpers in config.php

**Date:** 2026-05-09
**Context:** Admin API endpoints (profile, skills, etc.) were failing with 500 errors because they called `require_auth()` which was only defined in `auth.php`, and `auth.php` was not loaded for those actions.
**Decision:** Moved `require_auth()` and `is_authenticated()` helper functions from `auth.php` to `config.php`.
**Why:** `config.php` is required by the main router (`index.php`) for every single API request. By putting core security helpers there, we guarantee they are available to all resource handlers without needing manual `require` calls in every file, preventing "Undefined Function" fatal errors.

### D-002: Implementing Hash-based Routing in Vanilla JS Admin
**Date:** 2026-05-11
**Context:** The admin panel was a Single Page Application (SPA) that reset to the Dashboard upon every reload, causing loss of work context (especially when editing items).
**Decision:** Implemented a custom routing system using `window.location.hash`.
**Why:** URL Hash is the most reliable way to persist state in a Vanilla JS SPA without requiring server-side URL rewriting (like `.htaccess` for History API). It allows deep linking to specific panels (e.g., `#skills/edit/5`) and supports browser history (Back/Forward) while staying within the project's "No Framework" constraint.
