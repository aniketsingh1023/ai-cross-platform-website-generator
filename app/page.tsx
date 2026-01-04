import Image from "next/image";
import { Button } from "@/components/ui/button";
import UserButton from "@/features/auth/components/user-button";

export default function Home() {
  return (
   <div>
    <h1 className = "text-3xl font-bold text-rose-500">this is a button</h1>
    <UserButton />
   </div>
  );
}
