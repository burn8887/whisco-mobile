import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, StyleSheet, ActivityIndicator, Text } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { WebView } from "react-native-webview";
import { colors, font, spacing } from "../theme";

// Universal Whisco player.
//  - HLS (.m3u8) / MP4 → expo-video (native ExoPlayer on Android): instant
//    start, adaptive quality, fullscreen, PiP, resume support.
//  - YouTube embeds → official iframe player in a WebView (ToS-compliant;
//    the broadcaster keeps its ads/analytics).
export default function Player({
  src,
  title,
  startAt,
  onProgress,
}: {
  src: string;
  title?: string;
  startAt?: number; // seconds — native player only
  onProgress?: (positionSecs: number) => void; // fires ~every 5s, native only
}) {
  const isYouTube = src.includes("youtube.com/embed");
  return isYouTube ? (
    <YouTubePlayer src={src} title={title} />
  ) : (
    <NativePlayer src={src} startAt={startAt} onProgress={onProgress} />
  );
}

function NativePlayer({
  src,
  startAt,
  onProgress,
}: {
  src: string;
  startAt?: number;
  onProgress?: (positionSecs: number) => void;
}) {
  const [error, setError] = useState(false);
  const seeked = useRef(false);

  const player = useVideoPlayer(src, (p) => {
    p.play();
  });

  // Resume: seek once after load.
  useEffect(() => {
    if (!startAt || seeked.current) return;
    const t = setInterval(() => {
      try {
        if (player.duration > 0 && !seeked.current) {
          if (startAt < player.duration - 30) player.currentTime = startAt;
          seeked.current = true;
          clearInterval(t);
        }
      } catch {
        /* player not ready yet */
      }
    }, 500);
    return () => clearInterval(t);
  }, [player, startAt]);

  // Progress reporting for resume-watching.
  useEffect(() => {
    if (!onProgress) return;
    const t = setInterval(() => {
      try {
        const pos = player.currentTime;
        if (pos > 0 && Number.isFinite(pos)) onProgress(Math.floor(pos));
      } catch {
        /* ignore */
      }
    }, 5000);
    return () => clearInterval(t);
  }, [player, onProgress]);

  // Error surface: listen to status changes.
  useEffect(() => {
    const sub = player.addListener("statusChange", ({ status }) => {
      if (status === "error") setError(true);
    });
    return () => sub.remove();
  }, [player]);

  if (error) {
    return (
      <View style={[styles.frame, styles.center]}>
        <Text style={styles.errTitle}>This channel is temporarily unavailable</Text>
        <Text style={styles.errBody}>
          We check every stream automatically and it should be back shortly — try another channel in the meantime.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.frame}>
      <VideoView
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        player={player}
        fullscreenOptions={{ enable: true }}
        allowsPictureInPicture
        nativeControls
      />
    </View>
  );
}

function YouTubePlayer({ src, title }: { src: string; title?: string }) {
  const [loading, setLoading] = useState(true);
  // Fix for YouTube error 153 ("configuration error"): embeds require a valid
  // origin/referer. Loading the embed URL directly in a WebView sends none.
  // Instead we render a tiny host page with baseUrl https://www.whisco.tv so
  // the iframe sees the same origin as the website — where embeds work.
  const embedUrl = useMemo(
    () => `${src}${src.includes("?") ? "&" : "?"}autoplay=1&playsinline=1&rel=0`,
    [src]
  );
  const html = useMemo(
    () => `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>html,body{margin:0;padding:0;background:#000;height:100%;overflow:hidden}iframe{position:absolute;inset:0;width:100%;height:100%;border:0}</style></head><body><iframe src="${embedUrl}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="origin"></iframe></body></html>`,
    [embedUrl]
  );

  return (
    <View style={styles.frame}>
      <WebView
        source={{ html, baseUrl: "https://www.whisco.tv" }}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        originWhitelist={["*"]}
        allowsFullscreenVideo
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled
        domStorageEnabled
        thirdPartyCookiesEnabled
        onLoadEnd={() => setLoading(false)}
        onShouldStartLoadWithRequest={(req) =>
          req.url.includes("youtube.com") || req.url.includes("whisco.tv") || req.url === "about:blank"
        }
        accessibilityLabel={title || "Video player"}
      />
      {loading && (
        <View style={[{ position: "absolute" as const, top: 0, left: 0, right: 0, bottom: 0 }, styles.center]}>
          <ActivityIndicator color={colors.orange} size="large" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#000",
    borderRadius: 12,
    overflow: "hidden",
  },
  center: { alignItems: "center", justifyContent: "center", padding: spacing.lg },
  errTitle: { color: colors.text, fontSize: font.body, fontWeight: "700", textAlign: "center" },
  errBody: { color: colors.textDim, fontSize: font.small, textAlign: "center", marginTop: spacing.sm, maxWidth: 320 },
});
