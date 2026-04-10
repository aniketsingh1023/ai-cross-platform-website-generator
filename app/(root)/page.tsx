import { Button } from "@/components/ui/button";
import { ArrowUpRight, Wand2, Globe, Smartphone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
export default function Home() {

  return (
    <div className=" z-20 flex flex-col items-center justify-start min-h-screen py-2 mt-10">

      <div className="flex flex-col justify-center items-center my-3">
      <Image src={"./hero.svg"} alt="Hero-Section" height={500}  width={500}/>

      <h1 className=" z-20 text-6xl mt-5 font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-rose-500 via-red-500 to-pink-500 dark:from-rose-400 dark:via-red-400 dark:to-pink-400 tracking-tight leading-[1.3] ">
        Vibe Code With with Intelligence
      </h1>
      </div>


      <p className="mt-2 text-lg text-center text-gray-600 dark:text-gray-400 px-5 py-10 max-w-2xl">
        VibeCode Editor is a powerful and intelligent code editor that enhances
        your coding experience with advanced features and seamless integration.
        It is designed to help you write, debug, and optimize your code
        efficiently.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <Link href={"/dashboard"}>
          <Button variant={"brand"} size={"lg"}>
            Get Started
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
        <Link href={"/generator"}>
          <Button variant={"outline"} size={"lg"} className="gap-2">
            <Wand2 className="w-4 h-4" />
            AI Website Generator
          </Button>
        </Link>
      </div>

      {/* AI Generator Feature Card */}
      <div className="mt-4 mb-12 max-w-2xl w-full mx-4 rounded-2xl border bg-gradient-to-br from-violet-50 to-blue-50 dark:from-violet-950/30 dark:to-blue-950/30 p-6">
        <div className="flex items-center gap-2 mb-3">
          <Wand2 className="h-5 w-5 text-violet-600" />
          <h2 className="font-semibold text-lg">AI Multi-Framework Website Generator</h2>
          <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 font-medium">New</span>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Describe your website in plain English → choose HTML, Next.js, or Vue → get instant code + live preview → deploy with one click.
        </p>
        <div className="flex flex-wrap gap-3 mb-4">
          {["🌐 HTML + Tailwind", "▲ Next.js", "💚 Vue 3", "📱 Mobile App"].map((fw) => (
            <span key={fw} className="text-xs px-2.5 py-1 rounded-full border bg-background font-medium">
              {fw}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Globe className="h-3.5 w-3.5" /> Live preview</span>
          <span className="flex items-center gap-1"><Smartphone className="h-3.5 w-3.5" /> Mobile support</span>
          <span>Simulated deployment</span>
        </div>
        <Link href={"/generator"} className="mt-4 block">
          <Button className="w-full gap-2">
            <Wand2 className="h-4 w-4" />
            Try AI Generator
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}