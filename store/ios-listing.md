# App Store Listing — Whisco TV (build 8)

**Written 2026-09-28. Every line below describes the binary that is actually being submitted, and nothing it does not contain.**

Build 8 carries **eight official news live streams and no on-demand titles**. Apple rejected 1.0 (7) a second
time under 5.2.2 on 2026-09-28, asking for documentary evidence *"from the rights holder"* for the films or
their removal. We hold no signed carriage letters for films, so the films are gone from this binary. This file
follows the binary.

**The word "Movies" does not appear anywhere below, by design.**

---

## App name (30 chars)

```
Whisco TV
```
*(Exact name. No "Movies", no "Live TV & Movies" — the previous name described build 5.)*

## Subtitle (30 chars)

```
Free live news
```
*(14 chars.)*

## Promotional text (170 chars, editable without review)

```
Eight official news channels, live, free. Each one is the broadcaster's own stream in YouTube's own player.
No account, no download, no copying.
```
*(148 chars.)*

## Description

```
Whisco TV streams official news live streams, free.

LIVE NEWS
Eight international news channels, live, straight from each broadcaster's own
verified YouTube channel and played inside YouTube's own player. YouTube's
interface and the broadcaster's own controls stay visible. Nothing is copied,
stored, re-hosted or re-encoded by us.

WHO EACH CHANNEL IS
Every channel is a national or public broadcaster publishing its own 24/7 news
stream on its own channel. Each row carries a Source line that opens that
broadcaster's own channel, so you can check it yourself in one tap.

WHAT THIS VERSION DOES NOT HAVE
No films, no series, no on-demand library and no downloads. If you are looking
for something to watch on demand, this version does not carry it.

NO ACCOUNT REQUIRED
Open the app and watch. There is no sign-up, no subscription and no payment of
any kind anywhere in the app.

RIGHTS HOLDERS
If you believe something here is yours and should not be, tap "Report a rights
issue" on any channel, or email legal@whisco.tv. We will remove it within 24
hours, without argument.
```
*(Body copy states what the app contains and repeats what it does not, because a
reviewer should not have to guess.)*

## Keywords (100 chars)

```
live news,world news,news,news channel,international news,breaking news,live tv news
```
*(89 chars.)* `movies`, `films`, `dizi`, `bollywood`, `turkish series`, `public domain`
are all deliberately absent — **there is no on-demand title in this binary for them to
describe.**

## Category

`News` (primary). Secondary, if ASC asks: `Entertainment`.

**Age rating:** 12+ — news content only.

## URLs

| field | value |
|---|---|
| Support URL | `https://www.whisco.tv/contact` |
| Marketing URL | `https://www.whisco.tv/about` |

## Screenshots

**This binary only.** Required set, all captured from build 8 on an iPhone:

1. Live list showing the eight channel names.
2. A channel playing, with **YouTube's chrome visible** in the frame.
3. The Source line / rights row for a channel.

**Never in a screenshot:** a film poster, a series poster, an on-demand rail, an Android
frame, a tablet frame, or any count of channels or titles.

## App Review Information — notes

**Paste exactly:**

```
WHISCO TV 1.0 (BUILD 8) — GUIDELINE 5.2.2
Submission: c80e30c4-5e07-4911-bb77-2ed58fd09caf

New binary. Version 1.0, build 8.
Eight official news live streams. Zero on-demand titles.
API header X-Whisco-Store: ios returns 8 live / 0 vod.
Player is YouTube's embed of the broadcaster's own channel.
No save, no M3U, no films.

Attached: one-page live schedule.
Takedown: legal@whisco.tv
Reviewer path, no login: Live → France 24 English → YouTube chrome
visible. If a film or series poster appears, that is not this binary.
```

## What changed from the build-7 listing, and why

| build 7 said | build 8 says | reason |
|---|---|---|
| `Whisco TV: Live News & Docs` | `Whisco TV` | the docs are not in this binary |
| `Live news, public-domain films` | `Free live news` | there are no films to advertise |
| description carried a PUBLIC-DOMAIN FILMS section | removed | Guideline 2.3.1(a): do not advertise content the app does not carry |
| keywords included `public domain`, `archive films` | removed | same |
| promotional text named films | names only the live eight | same |
