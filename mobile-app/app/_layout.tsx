import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#7c3aed" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
        }}
      >
        <Stack.Screen name="index" options={{ title: "AI Website Generator" }} />
        <Stack.Screen name="preview" options={{ title: "Preview", headerShown: true }} />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}
