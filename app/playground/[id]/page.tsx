import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import PlaygroundLayout from "@/features/playground/components/playground-layout";

interface PlaygroundPageProps {
  params: Promise<{ id: string }>;
}

export default async function PlaygroundPage({ params }: PlaygroundPageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  const playground = await db.playground.findUnique({
    where: { id },
    include: {
      templateFile: true,
    },
  });

  if (!playground) {
    redirect("/dashboard");
  }

  // Check ownership
  if (playground.userId !== (session.user as any).id) {
    redirect("/dashboard");
  }

  const initialFiles = playground.templateFile?.content as Record<string, any> | null;

  return (
    <PlaygroundLayout
      playgroundId={playground.id}
      initialTitle={playground.title}
      initialTemplate={playground.template}
      initialFiles={initialFiles}
    />
  );
}
