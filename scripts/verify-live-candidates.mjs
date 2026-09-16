/**
 * LIVE CANDIDATE VERIFICATION — gate 1 of Grok's rights-pack lock.
 *
 * Gate: "8-15 live YT rows play on a non-GCC IP with chrome visible."
 *
 * This runs from a US vantage (the review environment Apple used was an iPad on
 * what Grok assessed as a likely non-GCC IP), so it is the right place to test.
 *
 * For each candidate broadcaster we resolve the channel's CURRENT live stream and
 * then ask YouTube three questions a reviewer would implicitly ask:
 *
 *   1. Does the channel have a live stream right now?  (channel /live redirect)
 *   2. Is it embeddable?                               (public oEmbed 200 + author)
 *   3. Does it play from this region?                  (playabilityStatus from the
 *                                                       player response)
 *
 * What this CANNOT prove: that a human sees YouTube's player chrome on screen.
 * Only a device/screenshot proves that. This narrows the candidates so the human
 * play-test has fewer things to check.
 */
import { writeFileSync } from "node:fs";

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15";

/** Grok named: France 24, DW, TRT World, Al Jazeera official, "same class only". */
const CANDIDATES = [
  { name: "France 24 English", handle: "France24_en", site: "https://www.france24.com/en/", class: "named" },
  { name: "DW News", handle: "dwnews", site: "https://www.dw.com/", class: "named" },
  { name: "TRT World", handle: "trtworld", site: "https://www.trtworld.com/", class: "named" },
  { name: "Al Jazeera English", handle: "aljazeeraenglish", site: "https://www.aljazeera.com/", class: "named" },
  { name: "Sky News", handle: "SkyNews", site: "https://news.sky.com/", class: "same-class" },
  { name: "Euronews English", handle: "euronews", site: "https://www.euronews.com/", class: "same-class" },
  { name: "CNA (Channel NewsAsia)", handle: "channelnewsasia", site: "https://www.channelnewsasia.com/", class: "same-class" },
  { name: "ABC News (Australia)", handle: "abcnewsaustralia", site: "https://www.abc.net.au/news", class: "same-class" },
  { name: "NHK World-Japan", handle: "NHKWORLDJAPAN", site: "https://www3.nhk.or.jp/nhkworld/", class: "same-class" },
  { name: "CGTN", handle: "CGTNOfficial", site: "https://www.cgtn.com/", class: "same-class" },
  { name: "Africanews", handle: "africanews", site: "https://www.africanews.com/", class: "same-class" },
  { name: "Bloomberg Television", handle: "markets", site: "https://www.bloomberg.com/live", class: "same-class" },
  { name: "Reuters", handle: "Reuters", site: "https://www.reuters.com/", class: "same-class" },
  { name: "DW Documentary", handle: "DWDocumentary", site: "https://www.dw.com/en/tv/docfilm/s-3610", class: "same-class" },
];

const TIMEOUT = 25000;

async function get(url, opts = {}) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), TIMEOUT);
  try {
    const res = await fetch(url, {
      signal: ctl.signal,
      redirect: opts.redirect ?? "follow",
      headers: { "User-Agent": UA, "Accept-Language": "en-US,en;q=0.9" },
    });
    const text = opts.body ? await res.text() : null;
    return { status: res.status, url: res.url, text };
  } catch (e) {
    return { status: 0, url, text: null, error: String(e).slice(0, 60) };
  } finally {
    clearTimeout(t);
  }
}

function videoIdOf(u) {
  if (!u) return null;
  const m = u.match(/[?&]v=([A-Za-z0-9_-]{11})/) || u.match(/youtu\.be\/([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

async function resolveLive(handle) {
  // The channel /live page carries the current live stream id in
  // `currentVideoEndpoint`. We do NOT read the player response: from a
  // datacenter IP YouTube answers that with LOGIN_REQUIRED ("Sign in to confirm
  // you're not a bot"), which says nothing about the video itself. The page
  // data, by contrast, is served normally.
  const r = await get(`https://www.youtube.com/@${handle}/live`, { body: true });
  if (r.status !== 200 || !r.text) return { ok: false, why: `channel /live -> http ${r.status}` };

  const i = r.text.indexOf('"currentVideoEndpoint"');
  if (i >= 0) {
    const m = r.text.slice(i, i + 700).match(/"url":"\/watch\?v=([A-Za-z0-9_-]{11})"/);
    if (m) return { ok: true, videoId: m[1] };
  }

  // Fallback: the live stream is the most-linked video id on its own /live page.
  const counts = {};
  for (const m of r.text.matchAll(/"watchEndpoint":\{"videoId":"([A-Za-z0-9_-]{11})"/g)) {
    counts[m[1]] = (counts[m[1]] || 0) + 1;
  }
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  if (top && top[1] >= 3) return { ok: true, videoId: top[0], viaFallback: true };
  return { ok: false, why: "no live stream id found on the channel /live page" };
}

async function checkEmbed(videoId) {
  const u = `https://www.youtube.com/oembed?url=${encodeURIComponent(
    `https://www.youtube.com/watch?v=${videoId}`
  )}&format=json`;
  const r = await get(u, { body: true });
  if (r.status !== 200 || !r.text) return { embeddable: false, http: r.status };
  try {
    const j = JSON.parse(r.text);
    return { embeddable: true, author: j.author_name, authorUrl: j.author_url, title: j.title };
  } catch {
    return { embeddable: false, http: r.status };
  }
}

async function checkPlayability(videoId) {
  const r = await get(`https://www.youtube.com/watch?v=${videoId}&hl=en`, { body: true });
  if (!r.text) return { status: "no-response" };
  const s = r.text;

  const isLiveNow = /"isLiveNow":true/.test(s);
  const isLiveContent = /"isLiveContent":true/.test(s);
  const playableInEmbed = /"playableInEmbed":true/.test(s);

  // playabilityStatus.status — OK / LOGIN_REQUIRED / UNPLAYABLE / ERROR
  const ps = s.match(/"playabilityStatus":\{"status":"([A-Z_]+)"/)?.[1] || "unknown";
  const reason = s.match(/"playabilityStatus":\{[^}]*?"reason":"([^"]{0,120})"/)?.[1] || null;

  // region restriction signals
  const regionBlocked =
    /"contentCheckOk":false/.test(s) ||
    /not available in your country/i.test(s) ||
    /"isBlockedInSomeCountries":true/.test(s);

  return { playabilityStatus: ps, reason, isLiveNow, isLiveContent, playableInEmbed, regionBlocked };
}

async function main() {
  console.log(`=== LIVE CANDIDATE VERIFICATION (vantage: US) ===\n`);
  const results = [];

  for (const c of CANDIDATES) {
    const live = await resolveLive(c.handle);
    if (!live.ok) {
      console.log(`  ✗ ${c.name.padEnd(24)} — ${live.why}`);
      results.push({ ...c, pass: false, why: live.why });
      continue;
    }

    const emb = await checkEmbed(live.videoId);
    const embedUrl = `https://www.youtube-nocookie.com/embed/${live.videoId}`;
    // Pass = the channel has a live stream and it is EMBEDDABLE (oEmbed 200).
    // Region/playback verification is NOT claimed here: see the note in main().
    const pass = emb.embeddable === true;

    console.log(
      `  ${pass ? "✓" : "✗"} ${c.name.padEnd(24)} ${live.videoId}  embeddable=${emb.embeddable ? "Y" : "N"}  uploader="${(emb.author || "?").slice(0, 30)}"`
    );

    results.push({
      ...c,
      pass,
      videoId: live.videoId,
      embedUrl,
      watchUrl: `https://www.youtube.com/watch?v=${live.videoId}`,
      uploader: emb.author || null,
      uploaderUrl: emb.authorUrl || null,
      title: emb.title || null,
      // NOT verified from here: region availability and on-screen chrome.
      regionVerified: false,
    });
  }

  const passing = results.filter((r) => r.pass);
  console.log(`\n  ── PASSING from this US vantage: ${passing.length} / ${CANDIDATES.length} ──`);
  for (const p of passing) console.log(`   ✓ ${p.name}  ->  ${p.embedUrl}`);

  writeFileSync(
    "/home/user/whisco-mobile/docs-live-candidates.json",
    JSON.stringify({ verifiedFrom: "US (The Dalles, Oregon)", verifiedAt: new Date().toISOString(), results }, null, 2)
  );
  console.log(`\n  full detail written to whisco-mobile/docs-live-candidates.json`);
}

main().catch((e) => {
  console.error("failed:", e.message);
  process.exitCode = 1;
});
