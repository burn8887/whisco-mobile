# Google Play listing — Whisco TV (Android build, same catalogue as iOS build 7)

> **Status — 21 September 2026.** Production access is **granted**; version code **7** is on the
> production track and the full-rollout change set is **in review** in Play Console. Corrected on this
> date, **doc-only**: the short description, the "account" line, and the **Data safety** row — all three
> contradicted the Play Data safety declaration, which reads **Email + User ID**. The
> "Apply for production" instruction near the end of this file is **superseded**. No new AAB.

**Paste these into Play Console → Main store listing. Nothing here may claim a number or a category the app does
not actually have.** The catalogue is 8 live channels and 8 films. That is the whole story, and it is enough.

**Do not paste the old text.** It said "500+ live TV channels", "14,000+ movies", Turkish series/dizi and
free-to-air — none of which this build carries, and all of which Grok's doctrine bans. If any of those strings are
still sitting in Play Console, delete them: Play re-reads the listing at production review.

---

## App name (30 characters max)

```
Whisco TV
```

*Verify the field accepts it. If Play flags a name conflict, use* `Whisco TV — Live News` *and tell me.*

## Short description (80 characters max)

```
Official live news and public-domain films. Watch with no signup.
```

That is **65 characters** — inside the limit.

## Full description (4,000 characters max)

```
Whisco TV shows eight live news channels and eight public-domain films. That is the entire catalogue, and every item in it is documented.

LIVE NEWS — 8 CHANNELS
Eight 24/7 news channels, each played from the broadcaster's own official YouTube channel, inside YouTube's own player, with the broadcaster's branding and controls intact:
• France 24 English
• DW English
• TRT World
• Al Jazeera English
• CNA
• NHK WORLD-JAPAN
• Africanews
• ABC News (Australia)

ON DEMAND — 8 PUBLIC-DOMAIN FILMS
Eight short films from the Internet Archive's Prelinger collection, streamed from archive.org's own servers. Each item's page carries its "Public Domain" declaration, and the app links to that page:
• American Look (Part I)
• A Word to the Wives
• Bookbinders
• Out of This World
• Design for Dreaming
• San Francisco Earthquake Aftermath, Part 3
• Skateboard Sense
• More Dangerous Than Dynamite

HOW IT WORKS
• We host no video files. Live channels play through YouTube's embeddable player; films stream from archive.org.
• No download, save or convert function — the app cannot export anything.
• Supported by advertising.
• Watch without signing up — an account is optional. Optional sign-in adds a watchlist and resume.

Rights holders: legal@whisco.tv — anything flagged is removed within 24 hours.
```

**1,277 characters.** It names exactly what is there and claims nothing else.

## What must NOT appear anywhere in the listing

| Banned string | Why |
|---|---|
| `500+`, `615`, `625`, `14,000`, `14,567`, `16,000` | counts the app cannot honour — this is the exact complaint Apple raised |
| `dizi`, `Turkish series`, `Bollywood`, `movies`, `cinema` | the app carries none of it |
| `free-to-air`, `FTA`, `HLS` | no such source is used in this build |
| `iptv-org` or any directory name | Grok's standing rule: never cite it, in any surface |

## Graphics — one replacement required

**`store/feature-graphic.png` is BANNED.** It reads *"500+ Live TV Channels"* and *"14,000+ Free Movies & Shows"*,
and it shows the brand dog — which is not allowed on store catalogue shots. It is retired in this repo (moved to
`store/retired/`) so nobody submits it by accident.

**Replacement:** `store/feature-graphic-1024x500.png` (1024×500, Play's required size). Dark brand ground, the
wordmark, and the honest line. No counts, no dog, no third-party marks.

## Screenshots — do not reuse the old ones

The existing Play screenshots were taken on the 625-channel client. They must be replaced with shots from the
**new Android build**, and Grok's rule applies here exactly as it did on iOS:

- Live TV list — the eight channels
- A channel playing
- On Demand list — the eight films
- A film playing, with the Source row visible

**No channel count and no title count on screen.** Google requires at least 2 phone screenshots (4 recommended);
Play does not need tablet shots, and this build is phone-first, so the iPhone-only logic on Apple's side does not
apply here.

## Other store listing fields

| Field | Value |
|---|---|
| App category | News & Magazines *(or Entertainment — pick one; News fits the eight channels better)* |
| Tags | News, Streaming |
| Contact email | legal@whisco.tv |
| Privacy policy | `https://whisco.tv/privacy` |
| Website | `https://whisco.tv/about` |
| Support | `https://whisco.tv/contact` |
| Content rating questionnaire | answer honestly; advertising = yes; no user-generated content |
| **Data safety** | **Email + User ID** — accounts are optional; if you create one we collect your email address and a user ID, as declared. No analytics SDK. |

## Before you tap anything

- The AAB must be built from `whisco-mobile` `main` at **`db15dfa` or later** — that commit is what sends
  `X-Whisco-Store: android` and therefore gets the 8 + 8 catalogue.
- ~~Do not press **Apply for production**~~ — **superseded 21 September 2026: production access was
  granted** and version code 7 is on the production track in review. Nothing to apply for; see
  `docs/business/PLAY_PRODUCTION_ACCESS_FORM_20260917.md` for the form that was answered.
