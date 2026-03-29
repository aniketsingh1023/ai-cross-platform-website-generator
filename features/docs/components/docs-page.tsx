"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BookOpen,
  Code2,
  Terminal,
  Eye,
  FileText,
  Keyboard,
  LayoutTemplate,
  Download,
  HelpCircle,
  Sparkles,
  Github,
  MonitorPlay,
  FolderTree,
  Layers,
  Navigation,
  Info,
  Cpu,
  Bot,
  Wand2,
  BrainCircuit,
  ListChecks,
  GitBranch,
  Import,
  KeyRound,
  Rocket,
  Globe,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Search,
  Save,
  PanelLeft,
  TabletSmartphone,
  CircleDot,
} from "lucide-react";

const sections = [
  { id: "getting-started", label: "Getting Started", icon: Rocket },
  { id: "editor-features", label: "Editor Features", icon: Code2 },
  { id: "ai-features", label: "AI Features", icon: Sparkles },
  { id: "github-integration", label: "GitHub Integration", icon: Github },
  { id: "keyboard-shortcuts", label: "Keyboard Shortcuts", icon: Keyboard },
  { id: "templates", label: "Templates", icon: LayoutTemplate },
  { id: "setting-up-ollama", label: "Setting Up Ollama", icon: Download },
  { id: "faq", label: "FAQ", icon: HelpCircle },
];

function CodeBlock({ children }: { children: string }) {
  return (
    <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
      {children}
    </code>
  );
}

function CommandBlock({ children }: { children: string }) {
  return (
    <div className="bg-muted rounded-lg p-4 font-mono text-sm my-3 border">
      <span className="text-muted-foreground select-none">$ </span>
      {children}
    </div>
  );
}

export function DocsPage() {
  const [activeSection, setActiveSection] = useState("getting-started");

  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = sections.map((s) => ({
        id: s.id,
        el: document.getElementById(s.id),
      }));
      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const el = sectionElements[i].el;
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120) {
            setActiveSection(sectionElements[i].id);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="flex w-full">
      {/* Left Sidebar - Table of Contents */}
      <aside className="hidden lg:block w-64 shrink-0 border-r sticky top-0 h-screen">
        <ScrollArea className="h-full py-6 px-4">
          <div className="flex items-center gap-2 mb-6 px-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-lg">Documentation</h2>
          </div>
          <nav className="space-y-1">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => scrollTo(section.id)}
                  className={`flex items-center gap-2 w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    activeSection === section.id
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {section.label}
                </button>
              );
            })}
          </nav>
        </ScrollArea>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <ScrollArea className="h-screen">
          <div className="max-w-4xl mx-auto px-6 py-10 space-y-16">
            {/* Hero */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold tracking-tight">
                    VibeCode Documentation
                  </h1>
                  <p className="text-muted-foreground text-lg mt-1">
                    Everything you need to build, run, and ship code from your
                    browser.
                  </p>
                </div>
              </div>
            </div>

            {/* Getting Started */}
            <section id="getting-started" className="scroll-mt-8 space-y-6">
              <div className="flex items-center gap-3">
                <Rocket className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Getting Started</h2>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-blue-500" />
                    What is VibeCode?
                  </CardTitle>
                  <CardDescription>
                    A browser-based code editor with AI superpowers
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm leading-relaxed text-muted-foreground">
                  <p>
                    VibeCode is a full-featured, browser-based code editor
                    powered by WebContainers. It provides a complete development
                    environment with an integrated terminal, live preview, file
                    explorer, and AI assistance -- all without installing
                    anything on your machine.
                  </p>
                  <p className="mt-3">
                    Whether you are prototyping a new idea, learning to code, or
                    building production apps, VibeCode gives you the tools to go
                    from zero to deployed in minutes.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ListChecks className="h-5 w-5 text-green-500" />
                    Quick Start Guide
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        step: 1,
                        title: "Sign In",
                        desc: "Create an account or sign in with your existing credentials.",
                      },
                      {
                        step: 2,
                        title: "Create a Playground",
                        desc: 'Click "New Playground" from the dashboard to start a new project.',
                      },
                      {
                        step: 3,
                        title: "Choose a Template",
                        desc: "Pick from React, Next.js, Express, Vue, Angular, or Hono.",
                      },
                      {
                        step: 4,
                        title: "Start Coding",
                        desc: "Write code, use the integrated terminal, and see live preview instantly.",
                      },
                    ].map((item) => (
                      <div
                        key={item.step}
                        className="flex items-start gap-4"
                      >
                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0">
                          {item.step}
                        </div>
                        <div>
                          <p className="font-medium">{item.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MonitorPlay className="h-5 w-5 text-orange-500" />
                    System Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      A modern browser (Chrome, Edge, or Brave recommended)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Internet connection for authentication and GitHub features
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>
                        <strong>Ollama</strong> installed locally for AI
                        features (optional)
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </section>

            {/* Editor Features */}
            <section id="editor-features" className="scroll-mt-8 space-y-6">
              <div className="flex items-center gap-3">
                <Code2 className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Editor Features</h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  {
                    icon: Code2,
                    title: "Monaco Editor",
                    desc: "Full syntax highlighting, IntelliSense, auto-completion, multi-cursor editing, and minimap. The same editor engine that powers VS Code.",
                    color: "text-blue-500",
                  },
                  {
                    icon: FolderTree,
                    title: "File Explorer",
                    desc: "Create, rename, and delete files and folders. Drag-and-drop support with a familiar tree view.",
                    color: "text-yellow-500",
                  },
                  {
                    icon: Terminal,
                    title: "Integrated Terminal",
                    desc: "Full terminal powered by WebContainers. Run commands, install packages, and start dev servers. Supports multiple tabs.",
                    color: "text-green-500",
                  },
                  {
                    icon: Eye,
                    title: "Live Preview",
                    desc: "See your running application in real time. The preview updates automatically as your dev server detects changes.",
                    color: "text-purple-500",
                  },
                  {
                    icon: Layers,
                    title: "File Tabs",
                    desc: "Open multiple files simultaneously. Unsaved changes are indicated with a dot so you never lose track of edits.",
                    color: "text-red-500",
                  },
                  {
                    icon: Navigation,
                    title: "Breadcrumbs",
                    desc: "Navigate your file path with clickable breadcrumbs at the top of the editor.",
                    color: "text-indigo-500",
                  },
                  {
                    icon: Info,
                    title: "Status Bar",
                    desc: "Displays cursor position, language mode, encoding, indentation, and active theme at a glance.",
                    color: "text-teal-500",
                  },
                ].map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <Card key={feature.title}>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Icon className={`h-5 w-5 ${feature.color}`} />
                          {feature.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {feature.desc}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>

            {/* AI Features */}
            <section id="ai-features" className="scroll-mt-8 space-y-6">
              <div className="flex items-center gap-3">
                <Sparkles className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">AI Features</h2>
              </div>
              <p className="text-muted-foreground">
                VibeCode integrates local AI models via Ollama to provide
                intelligent coding assistance without sending your code to
                external servers.
              </p>

              <Tabs defaultValue="chat" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="chat">AI Chat</TabsTrigger>
                  <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
                  <TabsTrigger value="generator">Generator</TabsTrigger>
                  <TabsTrigger value="models">Models</TabsTrigger>
                </TabsList>

                <TabsContent value="chat">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bot className="h-5 w-5 text-violet-500" />
                        AI Chat
                      </CardTitle>
                      <CardDescription>
                        Four specialized modes for different workflows
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {[
                        {
                          mode: "Chat",
                          desc: "General-purpose conversation about your code, concepts, or architecture.",
                          badge: "default",
                        },
                        {
                          mode: "Code Review",
                          desc: "Get feedback on code quality, best practices, and potential issues.",
                          badge: "secondary",
                        },
                        {
                          mode: "Bug Fix",
                          desc: "Paste an error or describe a bug and get targeted debugging help.",
                          badge: "destructive",
                        },
                        {
                          mode: "Optimization",
                          desc: "Improve performance, reduce bundle size, and refactor for clarity.",
                          badge: "outline",
                        },
                      ].map((item) => (
                        <div
                          key={item.mode}
                          className="flex items-start gap-3 p-3 rounded-lg border"
                        >
                          <Badge variant={item.badge as any}>
                            {item.mode}
                          </Badge>
                          <p className="text-sm text-muted-foreground">
                            {item.desc}
                          </p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="suggestions">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Cpu className="h-5 w-5 text-cyan-500" />
                        Code Suggestions
                      </CardTitle>
                      <CardDescription>
                        Inline completions powered by Ollama and CodeLlama
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground space-y-3">
                      <p>
                        As you type, VibeCode provides intelligent code
                        completions directly in the editor. Suggestions appear as
                        ghost text that you can accept or dismiss.
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Tab</Badge>
                        <span>Accept the current suggestion</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Esc</Badge>
                        <span>Dismiss the current suggestion</span>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="generator">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Wand2 className="h-5 w-5 text-pink-500" />
                        Website Generator
                      </CardTitle>
                      <CardDescription>
                        Describe a website and let AI build it for you
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground space-y-3">
                      <p>
                        Use natural language to describe the website you want.
                        The AI will generate the complete code including HTML,
                        CSS, and JavaScript, then load it directly into your
                        playground.
                      </p>
                      <div className="bg-muted rounded-lg p-4 border">
                        <p className="font-mono text-xs">
                          &quot;Build me a landing page for a SaaS product with
                          a hero section, pricing cards, and a dark theme&quot;
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="models">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BrainCircuit className="h-5 w-5 text-amber-500" />
                        Model Selection
                      </CardTitle>
                      <CardDescription>
                        Choose from a range of local AI models
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {[
                          {
                            name: "CodeLlama",
                            desc: "Optimized for code",
                            recommended: true,
                          },
                          {
                            name: "Llama 3.2",
                            desc: "General purpose",
                            recommended: false,
                          },
                          {
                            name: "DeepSeek",
                            desc: "Strong reasoning",
                            recommended: false,
                          },
                          {
                            name: "Mistral",
                            desc: "Fast and efficient",
                            recommended: false,
                          },
                          {
                            name: "Qwen",
                            desc: "Multilingual",
                            recommended: false,
                          },
                        ].map((model) => (
                          <div
                            key={model.name}
                            className="p-3 rounded-lg border text-center space-y-1"
                          >
                            <p className="font-medium text-sm">{model.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {model.desc}
                            </p>
                            {model.recommended && (
                              <Badge variant="default" className="text-xs">
                                Recommended
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </section>

            {/* GitHub Integration */}
            <section
              id="github-integration"
              className="scroll-mt-8 space-y-6"
            >
              <div className="flex items-center gap-3">
                <Github className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">GitHub Integration</h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <GitBranch className="h-5 w-5 text-green-500" />
                      Push to GitHub
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    Create new repositories and push your playground code
                    directly to GitHub without leaving the editor.
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Import className="h-5 w-5 text-blue-500" />
                      Import from GitHub
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    Clone any public or private repository into a new playground
                    and start editing immediately.
                  </CardContent>
                </Card>
                <Card className="sm:col-span-2 lg:col-span-1">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <KeyRound className="h-5 w-5 text-amber-500" />
                      Personal Access Token
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground space-y-2">
                    <p>To use GitHub features, generate a PAT:</p>
                    <ol className="list-decimal list-inside space-y-1 text-xs">
                      <li>
                        Go to GitHub {">"} Settings {">"} Developer Settings
                      </li>
                      <li>Click &quot;Personal access tokens&quot;</li>
                      <li>
                        Generate a new token with <CodeBlock>repo</CodeBlock>{" "}
                        scope
                      </li>
                      <li>Paste the token in VibeCode settings</li>
                    </ol>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Keyboard Shortcuts */}
            <section
              id="keyboard-shortcuts"
              className="scroll-mt-8 space-y-6"
            >
              <div className="flex items-center gap-3">
                <Keyboard className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Keyboard Shortcuts</h2>
              </div>

              <Card>
                <CardContent className="pt-6">
                  <div className="grid gap-3">
                    {[
                      {
                        shortcut: "Ctrl + K",
                        action: "Command Palette",
                        icon: Search,
                      },
                      {
                        shortcut: "Ctrl + S",
                        action: "Save File",
                        icon: Save,
                      },
                      {
                        shortcut: "Ctrl + Shift + F",
                        action: "Search in Files",
                        icon: Search,
                      },
                      {
                        shortcut: "Ctrl + B",
                        action: "Toggle Sidebar",
                        icon: PanelLeft,
                      },
                      {
                        shortcut: "Tab",
                        action: "Accept AI Suggestion",
                        icon: CheckCircle2,
                      },
                      {
                        shortcut: "Esc",
                        action: "Dismiss AI Suggestion",
                        icon: CircleDot,
                      },
                    ].map((item, i) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{item.action}</span>
                          </div>
                          <kbd className="pointer-events-none inline-flex h-7 select-none items-center gap-1 rounded border bg-muted px-2 font-mono text-xs font-medium text-muted-foreground">
                            {item.shortcut}
                          </kbd>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Templates */}
            <section id="templates" className="scroll-mt-8 space-y-6">
              <div className="flex items-center gap-3">
                <LayoutTemplate className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Templates</h2>
              </div>
              <p className="text-muted-foreground">
                Kickstart your project with one of our pre-configured templates.
                Each comes with the framework, bundler, and dependencies
                pre-installed.
              </p>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  {
                    name: "React",
                    desc: "Vite + React with fast HMR",
                    badge: "Popular",
                    color: "text-cyan-500",
                  },
                  {
                    name: "Next.js",
                    desc: "Full-stack React framework with SSR",
                    badge: "Full-stack",
                    color: "text-foreground",
                  },
                  {
                    name: "Express",
                    desc: "Minimal Node.js backend server",
                    badge: "Backend",
                    color: "text-green-500",
                  },
                  {
                    name: "Vue",
                    desc: "Vite + Vue for reactive UIs",
                    badge: "Frontend",
                    color: "text-emerald-500",
                  },
                  {
                    name: "Angular",
                    desc: "Full-featured TypeScript framework",
                    badge: "Enterprise",
                    color: "text-red-500",
                  },
                  {
                    name: "Hono",
                    desc: "Ultrafast edge-first web framework",
                    badge: "Edge",
                    color: "text-orange-500",
                  },
                ].map((tpl) => (
                  <Card key={tpl.name} className="group hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className={`text-base ${tpl.color}`}>
                          {tpl.name}
                        </CardTitle>
                        <Badge variant="secondary" className="text-xs">
                          {tpl.badge}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {tpl.desc}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Setting Up Ollama */}
            <section id="setting-up-ollama" className="scroll-mt-8 space-y-6">
              <div className="flex items-center gap-3">
                <Download className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Setting Up Ollama</h2>
              </div>
              <p className="text-muted-foreground">
                Ollama runs AI models locally on your machine. Follow these
                steps to enable AI features in VibeCode.
              </p>

              <Card>
                <CardContent className="pt-6 space-y-6">
                  {[
                    {
                      step: 1,
                      title: "Download Ollama",
                      content: (
                        <p className="text-sm text-muted-foreground">
                          Visit{" "}
                          <a
                            href="https://ollama.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary underline underline-offset-4 hover:text-primary/80"
                          >
                            ollama.com
                          </a>{" "}
                          and download the installer for your operating system.
                        </p>
                      ),
                    },
                    {
                      step: 2,
                      title: "Install and Launch",
                      content: (
                        <p className="text-sm text-muted-foreground">
                          Run the installer and launch Ollama. It runs as a
                          background service on your machine.
                        </p>
                      ),
                    },
                    {
                      step: 3,
                      title: "Pull a Model",
                      content: (
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">
                            Open a terminal and pull the CodeLlama model:
                          </p>
                          <CommandBlock>ollama pull codellama:latest</CommandBlock>
                        </div>
                      ),
                    },
                    {
                      step: 4,
                      title: "Verify Installation",
                      content: (
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">
                            Confirm the model is available:
                          </p>
                          <CommandBlock>ollama list</CommandBlock>
                        </div>
                      ),
                    },
                    {
                      step: 5,
                      title: "Ready to Go",
                      content: (
                        <p className="text-sm text-muted-foreground">
                          VibeCode automatically detects Ollama running on{" "}
                          <CodeBlock>localhost:11434</CodeBlock>. Open VibeCode
                          and AI features will be available immediately.
                        </p>
                      ),
                    },
                  ].map((item) => (
                    <div key={item.step} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0">
                          {item.step}
                        </div>
                        {item.step < 5 && (
                          <div className="w-px h-full bg-border mt-2" />
                        )}
                      </div>
                      <div className="pb-6">
                        <p className="font-medium mb-1">{item.title}</p>
                        {item.content}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </section>

            {/* FAQ */}
            <section id="faq" className="scroll-mt-8 space-y-6">
              <div className="flex items-center gap-3">
                <HelpCircle className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">
                  Frequently Asked Questions
                </h2>
              </div>

              <Card>
                <CardContent className="pt-6">
                  <Accordion type="single" collapsible className="w-full">
                    {[
                      {
                        q: "Why is AI not working?",
                        a: "Make sure Ollama is installed, running, and that you have pulled at least one model (e.g., codellama:latest). VibeCode connects to Ollama on localhost:11434. If you are using a firewall, ensure that port is accessible.",
                      },
                      {
                        q: "Can I use other AI models?",
                        a: "Yes! You can pull any model supported by Ollama (e.g., ollama pull mistral, ollama pull deepseek-coder) and then select it from the model dropdown in the AI chat panel.",
                      },
                      {
                        q: "How do I push to GitHub?",
                        a: "Generate a Personal Access Token (PAT) on GitHub with the 'repo' scope. Go to GitHub > Settings > Developer Settings > Personal Access Tokens. Paste your token in VibeCode's GitHub settings, then use the Push to GitHub button in the editor toolbar.",
                      },
                      {
                        q: "Is my code stored securely?",
                        a: "Your code and project data are stored in MongoDB. Authentication is handled securely. We recommend not storing sensitive secrets directly in your code files.",
                      },
                      {
                        q: "Can I collaborate with others?",
                        a: "Real-time collaboration is coming soon! For now, you can share projects by pushing to GitHub and having collaborators import the repository.",
                      },
                      {
                        q: "What browsers are supported?",
                        a: "VibeCode works best in Chrome, Edge, and Brave. WebContainers require SharedArrayBuffer support, which is available in these Chromium-based browsers. Firefox and Safari have limited support.",
                      },
                    ].map((item, i) => (
                      <AccordionItem key={i} value={`faq-${i}`}>
                        <AccordionTrigger className="text-sm text-left">
                          {item.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-sm text-muted-foreground">
                          {item.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </section>

            {/* Footer */}
            <div className="border-t pt-8 pb-16 text-center text-sm text-muted-foreground">
              <p>
                Built with Next.js, Shadcn UI, and WebContainers. Powered by
                local AI via Ollama.
              </p>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
