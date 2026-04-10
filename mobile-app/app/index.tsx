import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";

// Point this at your local dev server or deployed API
// For Expo Go, use your machine's local IP when running locally
const API_BASE = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

type Framework = "html" | "nextjs" | "vue";

const FRAMEWORKS: { value: Framework; label: string; icon: string }[] = [
  { value: "html", label: "HTML + Tailwind", icon: "🌐" },
  { value: "nextjs", label: "Next.js", icon: "▲" },
  { value: "vue", label: "Vue 3", icon: "💚" },
];

const EXAMPLE_PROMPTS = [
  "A portfolio website for a photographer",
  "A SaaS landing page with pricing",
  "A restaurant menu website",
  "A personal blog homepage",
];

export default function HomeScreen() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [framework, setFramework] = useState<Framework>("html");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      Alert.alert("Empty prompt", "Please describe the website you want to generate.");
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch(`${API_BASE}/api/generate-website`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim(), framework }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Server returned ${res.status}`);
      }

      const data = await res.json();
      const previewHtml: string = data.previewHtml || data.code || "";
      const code: string = data.code || "";

      // Navigate to preview screen
      router.push({
        pathname: "/preview",
        params: {
          html: encodeURIComponent(previewHtml),
          code: encodeURIComponent(code),
          framework,
        },
      });
    } catch (err: any) {
      Alert.alert("Generation failed", err.message || "Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.inner}>
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>✨</Text>
          <Text style={styles.heroTitle}>AI Website Generator</Text>
          <Text style={styles.heroSub}>
            Describe your website → Choose framework → Preview instantly
          </Text>
        </View>

        {/* Framework picker */}
        <Text style={styles.label}>Framework</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={framework}
            onValueChange={(val) => setFramework(val as Framework)}
            style={styles.picker}
          >
            {FRAMEWORKS.map((fw) => (
              <Picker.Item
                key={fw.value}
                label={`${fw.icon}  ${fw.label}`}
                value={fw.value}
              />
            ))}
          </Picker>
        </View>

        {/* Prompt input */}
        <Text style={styles.label}>Describe your website</Text>
        <TextInput
          style={styles.textInput}
          value={prompt}
          onChangeText={setPrompt}
          placeholder="e.g., A modern portfolio for a graphic designer with dark theme and project gallery"
          placeholderTextColor="#9ca3af"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        {/* Example prompts */}
        <Text style={styles.exampleLabel}>Quick examples:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.examplesRow}>
          {EXAMPLE_PROMPTS.map((ex) => (
            <TouchableOpacity
              key={ex}
              style={styles.exampleChip}
              onPress={() => setPrompt(ex)}
            >
              <Text style={styles.exampleChipText}>{ex}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Generate button */}
        <TouchableOpacity
          style={[styles.generateBtn, (!prompt.trim() || isGenerating) && styles.generateBtnDisabled]}
          onPress={handleGenerate}
          disabled={!prompt.trim() || isGenerating}
          activeOpacity={0.8}
        >
          {isGenerating ? (
            <View style={styles.btnRow}>
              <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.generateBtnText}>Generating…</Text>
            </View>
          ) : (
            <Text style={styles.generateBtnText}>✨ Generate Website</Text>
          )}
        </TouchableOpacity>

        {/* Framework badges */}
        <View style={styles.badgesRow}>
          {FRAMEWORKS.map((fw) => (
            <TouchableOpacity
              key={fw.value}
              style={[styles.badge, framework === fw.value && styles.badgeActive]}
              onPress={() => setFramework(fw.value)}
            >
              <Text style={styles.badgeText}>{fw.icon} {fw.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  inner: {
    padding: 20,
    paddingBottom: 40,
  },
  hero: {
    alignItems: "center",
    marginBottom: 28,
    marginTop: 8,
  },
  heroEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
  },
  heroSub: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
    marginTop: 16,
  },
  pickerWrapper: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    overflow: "hidden",
  },
  picker: {
    height: Platform.OS === "ios" ? 160 : 52,
    color: "#111827",
  },
  textInput: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 14,
    fontSize: 14,
    color: "#111827",
    minHeight: 110,
  },
  exampleLabel: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 10,
    marginBottom: 6,
  },
  examplesRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  exampleChip: {
    backgroundColor: "#ede9fe",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  exampleChipText: {
    fontSize: 12,
    color: "#6d28d9",
    fontWeight: "500",
  },
  generateBtn: {
    backgroundColor: "#7c3aed",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#7c3aed",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  generateBtnDisabled: {
    opacity: 0.5,
  },
  generateBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  btnRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  badgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 20,
    justifyContent: "center",
  },
  badge: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#fff",
  },
  badgeActive: {
    borderColor: "#7c3aed",
    backgroundColor: "#ede9fe",
  },
  badgeText: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "500",
  },
});
