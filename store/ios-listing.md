# App Store Listing — Whisco TV (build 6)
**Rewritten 2026-09-16. Every line below describes the binary that is actually being submitted.**
If a claim here is not true of build 6, it does not belong in this file.

---

## App name (30 chars)
```
Whisco TV: Live News & Docs
```

## Subtitle (30 chars)
```
Live news, public-domain films
```
*(30 chars exactly — verified by count, not by eye.)*

## Promotional text (170 chars, editable without review)
```
Official broadcaster live news and public-domain documentaries, streaming free. Every title shows its source, and rights holders can reach us in one tap.
```
*(145 chars.)*

## Description
```
Whisco TV streams official live news and public-domain documentaries, free.

LIVE NEWS
Watch international news channels live, straight from each broadcaster's own
official YouTube channel, played in YouTube's own player. Nothing is copied,
re-hosted or re-encoded by us.

PUBLIC-DOMAIN FILMS
Documentary and educational shorts from the Internet Archive's public-domain
collections, including the Prelinger Archives. Each title shows the licence
declared on its own archive page, and a link to that page.

WHERE EVERYTHING COMES FROM
Every item in this app carries a Source line: the broadcaster's own channel, or
the item's own page on the Internet Archive. Tap it and check for yourself.

RIGHTS HOLDERS
If you believe something here is yours and should not be, tap "Report a rights
issue" on any title, or email legal@whisco.tv. We will remove it, without argument.
```
*(Body copy deliberately states what the app contains, and nothing it does not.)*

## Keywords (100 chars)
```
live news,world news,documentary,public domain,free news,news channel,archive films
```
*(87 chars. NOTE: `movies`, `dizi`, `bollywood`, `turkish series` are deliberately
absent — they described build 5, not this build.)*

## Category
`News` (primary). Secondary, if ASC asks: `Entertainment`.

**Age rating:** 12+ — news content only.

## URLs
| Field | Value |
|---|---|
| **Privacy policy** | `https://whisco.tv/privacy` |
| **Support** | `https://whisco.tv/contact` |
| **Marketing** | `https://whisco.tv/about` |

**Marketing URL is `/about`, never `/`.** The lock requires it off the catalogue home:
the store page must not imply that the app is the website's full catalogue, because it
is not. `/about` describes the product without listing content the app does not carry.

## Privacy nutrition label
**Data NOT collected.** v1 stores the watchlist and resume position on the device only.
No analytics SDK, no ad SDK, no account required.

---

## App Review notes (paste into the review notes box)

```
Whisco TV is free and ad-supported (currently ad-free in-app).

WHAT THIS BUILD CONTAINS
- Live: 2 official broadcaster news channels, each embedded from the broadcaster's
  own YouTube channel and played in YouTube's own player. We host no video files.
- On demand: 4 public-domain short films from the Internet Archive (Prelinger
  Archives collection), streamed from archive.org.

EVERY ITEM SHOWS ITS SOURCE
Each channel and title displays a Source line with a link to the official URL for
that item — the broadcaster's own channel, or the item's own Internet Archive page,
where the public-domain declaration is printed. Tap it in the app.

WHY THE CATALOGUE IS SMALL
This build deliberately ships a small, fully documented catalogue. Our public website
carries a much larger one. The app is not the website, and we have not made it look
like one. A larger app catalogue is a separate decision we are not making yet.

NO ACCOUNT NEEDED
No login, no sign-up. An optional sign-in is available for the watchlist.

RIGHTS
We host no media. Live content plays through YouTube's embeddable player from the
uploader's own channel; on-demand content is public domain, declared on its own
archive page. Rights holders can reach us from inside the app or at legal@whisco.tv,
and we remove content on request.

Screenshots below are of this build.
```

---

## Screenshots needed
6.7" iPhone + 13" iPad. **Take them from THIS build** — anything showing a large
catalogue is a screenshot of build 5 and must not be submitted.

1. **Live TV** — the official broadcaster news channels
2. **Playing a live channel** — YouTube's player visible, broadcaster's channel name on screen
3. **On Demand** — the public-domain shorts
4. **A title's Source line** — the Source row and "Report a rights issue", showing
   where the item came from and how a rights holder reaches us

### Feature graphic — DO NOT SUBMIT AS-IS
`store/feature-graphic.png` is **1024x500**, which is a **Google Play** asset; the App
Store uses screenshots only, so it is not part of the iOS submission either way.

**It was inspected on 2026-09-16 and it advertises a catalogue this binary does not
have.** It reads:

> Whisco TV · **"500+ Live TV Channels"** · **"14,000+ Free Movies & Shows"** · "100% FREE • No subscription, ever"

Build 6 carries **2 live rows and 4 public-domain shorts.** That graphic is a picture
of build 5, and for a 5.2.2 / 2.3.1 review it is a liability, not decoration.
**It must be replaced before it is used on any store page.**

Two things for the founder to decide, flagged rather than assumed:
1. The replacement copy. Something of the shape *"Live news from official broadcasters
   + public-domain films"* would match this build — but it must be his words.
2. **The dog is on it.** The brand rule says the dog never appears on title posters,
   store catalog shots, ads, or legal. Whether a store *banner* counts is a brand call,
   not mine. Playlisting is not being touched tonight, so nothing is blocked.

---

## Removed from the previous version of this file
Recording what changed, so nobody re-adds it by accident:

| Removed | Why |
|---|---|
| `Marketing URL: https://whisco.tv` | The lock requires off-catalogue. Now `/about`. |
| `500+ free live TV channels and 14,000+ movies & shows` | Not this binary. The app carries 2 live rows and 4 shorts. |
| `Turkish series (dizi) including Forbidden Love, Esaret, Emanet` | Not in this build at all. |
| `Bollywood and South Asian cinema`, `Pakistani dramas` | Not in this build. |
| Keywords `movies, turkish series, bollywood, pakistani drama, arabic series` | They advertised content the binary does not contain. |
| `free-to-air public HLS broadcasts` in review notes | This build carries no HLS. |
| `Filter by language in one tap` | No longer meaningful at this catalogue size. |
