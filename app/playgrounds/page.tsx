import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getAllPlaygroundForUser } from "@/features/dashboard/actions";
import PlaygroundsPage from "@/features/playgrounds/components/playgrounds-page";

export default async function Page() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  const playgrounds = await getAllPlaygroundForUser();

  return <PlaygroundsPage playgrounds={playgrounds || []} />;
}
