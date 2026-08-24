import React, { useMemo, useState } from "react";
import { View, StyleSheet, ActivityIndicator, Text } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { WebView } from "react-native-webview";
import { colors, font, spacing } from "../theme";

// Universal Whisco player.
//  - HLS (.m3u8) / MP4 → expo-video (native ExoPlayer on Android): instant
//    start, adaptive quality, fullscreen, PiP.
//  - YouTube embeds → official iframe player in a WebView (ToS-compliant;
//    the broadcaster keeps its ads/analytics).
export default function Player({ src, title }: { src: string; title?: string }) {
  const isYouTube = src.includes("youtube.com/embed");
  return isYouTube ? <YouTubePlayer src={src} title={title} /> : <NativePlayer src={src} />;
}

function NativePlayer({ src }: { src: string }) {
  const [error, setError] = useState(false);
  const player = useVideoPlayer(src, (p) => {
    p.play();
  });

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
  const uri = useMemo(() => `${src}${src.includes("?") ? "&" : "?"}autoplay=1&playsinline=1`, [src]);

  return (
    <View style={styles.frame}>
      <WebView
        source={{ uri }}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        allowsFullscreenVideo
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled
        domStorageEnabled
        onLoadEnd={() => setLoading(false)}
        // Keep navigation inside the player; block YouTube link-outs.
        onShouldStartLoadWithRequest={(req) =>
          req.url.startsWith("https://www.youtube.com/embed") || req.url === uri || req.url === "about:blank"
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
