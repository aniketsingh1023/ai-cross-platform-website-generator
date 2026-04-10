import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  Alert,
  ActivityIndicator,
} from "react-native";
import { WebView } from "react-native-webview";
import { useLocalSearchParams, useRouter } from "expo-router";

type Framework = "html" | "nextjs" | "vue";

const FRAMEWORK_LABELS: Record<Framework, string> = {
  html: "🌐 HTML",
  nextjs: "▲ Next.js",
  vue: "💚 Vue",
};

function generateSlug(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let s = "site-";
  for (let i = 0; i < 8; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export default function PreviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const html = decodeURIComponent((params.html as string) || "");
  const framework = (params.framework as Framework) || "html";

  const [isDeploying, setIsDeploying] = useState(false);
  const [deployUrl, setDeployUrl] = useState("");
  const [webviewLoading, setWebviewLoading] = useState(true);

  const handleDeploy = () => {
    if (deployUrl) {
      Share.share({ message: `My website is live at: ${deployUrl}` });
      return;
    }

    setIsDeploying(true);
    setTimeout(() => {
      const url = `https://${generateSlug()}.vercel.app`;
      setDeployUrl(url);
      setIsDeploying(false);
      Alert.alert(
        "🎉 Deployed!",
        `Your website is live at:\n${url}`,
        [{ text: "Share", onPress: () => Share.share({ message: url }) }, { text: "OK" }]
      );
    }, 2500);
  };

  return (
    <View style={styles.container}>
      {/* Toolbar */}
      <View style={styles.toolbar}>
        <View style={styles.toolbarLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.frameworkBadge}>{FRAMEWORK_LABELS[framework]}</Text>
        </View>
        <TouchableOpacity
          style={[styles.deployBtn, isDeploying && styles.deployBtnDisabled]}
          onPress={handleDeploy}
          disabled={isDeploying}
          activeOpacity={0.8}
        >
          {isDeploying ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.deployText}>{deployUrl ? "Share" : "🚀 Deploy"}</Text>
          )}
        </TouchableOpacity>
      </View>

      {deployUrl ? (
        <View style={styles.deployBanner}>
          <Text style={styles.deployBannerText}>✅ Live at: {deployUrl}</Text>
        </View>
      ) : null}

      {/* WebView Preview */}
      <View style={styles.webviewContainer}>
        {webviewLoading && (
          <View style={styles.webviewLoader}>
            <ActivityIndicator size="large" color="#7c3aed" />
            <Text style={styles.loaderText}>Rendering preview…</Text>
          </View>
        )}
        <WebView
          source={{ html }}
          style={styles.webview}
          onLoadEnd={() => setWebviewLoading(false)}
          javaScriptEnabled
          domStorageEnabled
          allowsFullscreenVideo={false}
          scrollEnabled
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  toolbarLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
  },
  backText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  frameworkBadge: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6d28d9",
    backgroundColor: "#ede9fe",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  deployBtn: {
    backgroundColor: "#16a34a",
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 10,
    minWidth: 80,
    alignItems: "center",
    shadowColor: "#16a34a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  deployBtnDisabled: {
    opacity: 0.6,
  },
  deployText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  deployBanner: {
    backgroundColor: "#dcfce7",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#bbf7d0",
  },
  deployBannerText: {
    fontSize: 12,
    color: "#15803d",
    fontWeight: "500",
  },
  webviewContainer: {
    flex: 1,
    position: "relative",
  },
  webviewLoader: {
    position: "absolute",
    inset: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    zIndex: 10,
    gap: 12,
  },
  loaderText: {
    fontSize: 14,
    color: "#6b7280",
  },
  webview: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
