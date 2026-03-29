"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { updateProfile, deleteAccount } from "@/features/settings/actions";
import {
  User,
  Shield,
  Palette,
  Github,
  Loader2,
  Check,
  AlertTriangle,
} from "lucide-react";
import { AvatarUpload } from "./avatar-upload";

interface SettingsUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  createdAt: string;
  providers: string[];
}

interface Preferences {
  editorTheme: string;
  defaultTemplate: string;
  aiSuggestions: boolean;
  defaultAiModel: string;
}

const DEFAULT_PREFERENCES: Preferences = {
  editorTheme: "vs-dark",
  defaultTemplate: "REACT",
  aiSuggestions: true,
  defaultAiModel: "gpt-4",
};

const EDITOR_THEMES = [
  { value: "vs-dark", label: "VS Dark" },
  { value: "monokai", label: "Monokai" },
  { value: "dracula", label: "Dracula" },
  { value: "github-dark", label: "GitHub Dark" },
  { value: "one-dark-pro", label: "One Dark Pro" },
  { value: "nord", label: "Nord" },
  { value: "solarized-dark", label: "Solarized Dark" },
];

const TEMPLATES = [
  { value: "REACT", label: "React" },
  { value: "NEXTJS", label: "Next.js" },
  { value: "EXPRESS", label: "Express" },
  { value: "VUE", label: "Vue" },
  { value: "ANGULAR", label: "Angular" },
  { value: "HONO", label: "Hono" },
];

const AI_MODELS = [
  { value: "gpt-4", label: "GPT-4" },
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
  { value: "claude-3-opus", label: "Claude 3 Opus" },
  { value: "claude-3-sonnet", label: "Claude 3 Sonnet" },
];

const ROLE_LABELS: Record<string, string> = {
  USER: "User",
  ADMIN: "Admin",
  PREMIUM_USE: "Premium User",
};

export function SettingsPage({ user }: { user: SettingsUser }) {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Profile state
  const [name, setName] = useState(user.name || "");
  const [imageUrl, setImageUrl] = useState(user.image || "");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Delete state
  const [deleting, setDeleting] = useState(false);

  // Preferences state
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("vibe-editor-preferences");
    if (stored) {
      try {
        setPreferences({ ...DEFAULT_PREFERENCES, ...JSON.parse(stored) });
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  const savePreferences = (updated: Preferences) => {
    setPreferences(updated);
    localStorage.setItem("vibe-editor-preferences", JSON.stringify(updated));
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaveSuccess(false);
    setSaveError("");

    const result = await updateProfile({
      name,
      image: imageUrl || undefined,
    });

    setSaving(false);

    if (result?.error) {
      setSaveError(result.error);
    } else {
      setSaveSuccess(true);
      router.refresh();
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    const result = await deleteAccount();
    if (result?.error) {
      setSaveError(result.error);
      setDeleting(false);
    }
    // redirect happens server-side
  };

  const initials = (user.name || user.email)
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and preferences.
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="account" className="gap-2">
            <Shield className="h-4 w-4" />
            Account
          </TabsTrigger>
          <TabsTrigger value="preferences" className="gap-2">
            <Palette className="h-4 w-4" />
            Preferences
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal details and profile picture.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <AvatarUpload
                currentImage={imageUrl || null}
                onUpload={(url) => {
                  setImageUrl(url);
                  setSaveSuccess(true);
                  setTimeout(() => setSaveSuccess(false), 3000);
                }}
              />

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={user.email}
                  disabled
                  className="opacity-60"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed. It is linked to your authentication
                  provider.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button onClick={handleSaveProfile} disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {saveSuccess && <Check className="h-4 w-4 mr-2" />}
                  {saving
                    ? "Saving..."
                    : saveSuccess
                      ? "Saved!"
                      : "Save Changes"}
                </Button>
                {saveError && (
                  <p className="text-sm text-destructive">{saveError}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Details</CardTitle>
                <CardDescription>
                  View your account information and linked providers.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide">
                      Role
                    </Label>
                    <p className="font-medium">
                      {ROLE_LABELS[user.role] || user.role}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide">
                      Member Since
                    </Label>
                    <p className="font-medium">
                      {new Date(user.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label className="text-muted-foreground text-xs uppercase tracking-wide">
                    Linked Accounts
                  </Label>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-3">
                        <Github className="h-5 w-5" />
                        <span className="font-medium">GitHub</span>
                      </div>
                      <span
                        className={`text-sm font-medium ${
                          user.providers.includes("github")
                            ? "text-green-600 dark:text-green-400"
                            : "text-muted-foreground"
                        }`}
                      >
                        {user.providers.includes("github")
                          ? "Connected"
                          : "Not connected"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-3">
                        <svg
                          className="h-5 w-5"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        <span className="font-medium">Google</span>
                      </div>
                      <span
                        className={`text-sm font-medium ${
                          user.providers.includes("google")
                            ? "text-green-600 dark:text-green-400"
                            : "text-muted-foreground"
                        }`}
                      >
                        {user.providers.includes("google")
                          ? "Connected"
                          : "Not connected"}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>
                  Permanently delete your account and all associated data.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete your account, all your playgrounds, starred items,
                        chat messages, and linked accounts.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        disabled={deleting}
                      >
                        {deleting && (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        )}
                        {deleting ? "Deleting..." : "Yes, delete my account"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                  Customize how the application looks.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {mounted && (
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Theme</Label>
                      <p className="text-sm text-muted-foreground">
                        Choose your preferred color scheme.
                      </p>
                    </div>
                    <Select value={theme} onValueChange={setTheme}>
                      <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Select theme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Editor Theme</Label>
                    <p className="text-sm text-muted-foreground">
                      Default theme for the code editor.
                    </p>
                  </div>
                  <Select
                    value={preferences.editorTheme}
                    onValueChange={(value) =>
                      savePreferences({ ...preferences, editorTheme: value })
                    }
                  >
                    <SelectTrigger className="w-[160px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EDITOR_THEMES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Defaults</CardTitle>
                <CardDescription>
                  Set your default template and AI configuration.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Default Template</Label>
                    <p className="text-sm text-muted-foreground">
                      Template used when creating new playgrounds.
                    </p>
                  </div>
                  <Select
                    value={preferences.defaultTemplate}
                    onValueChange={(value) =>
                      savePreferences({
                        ...preferences,
                        defaultTemplate: value,
                      })
                    }
                  >
                    <SelectTrigger className="w-[160px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TEMPLATES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>AI Suggestions</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable or disable AI-powered code suggestions.
                    </p>
                  </div>
                  <Switch
                    checked={preferences.aiSuggestions}
                    onCheckedChange={(checked) =>
                      savePreferences({
                        ...preferences,
                        aiSuggestions: checked,
                      })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Default AI Model</Label>
                    <p className="text-sm text-muted-foreground">
                      Model used for AI-powered features.
                    </p>
                  </div>
                  <Select
                    value={preferences.defaultAiModel}
                    onValueChange={(value) =>
                      savePreferences({
                        ...preferences,
                        defaultAiModel: value,
                      })
                    }
                  >
                    <SelectTrigger className="w-[160px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AI_MODELS.map((m) => (
                        <SelectItem key={m.value} value={m.value}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
