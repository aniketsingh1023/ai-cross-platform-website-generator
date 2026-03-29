import React from "react";
import AddNewButton from "@/features/dashboard/components/add-new-button";
import AddRepoButton from "@/features/dashboard/components/add-github-button";
import EmptyState from "@/components/ui/empty-state";
import ProjectTable from "@/features/dashboard/components/project-table";
import { getAllPlaygroundForUser } from "@/features/dashboard/actions";

const Page = async () => {
  const Playgrounds = await getAllPlaygroundForUser();

  return (
    <div className="flex flex-col min-h-screen w-full px-6 lg:px-10 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your playgrounds and start building
        </p>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <AddNewButton />
        <AddRepoButton />
      </div>

      {/* Projects Section */}
      <div className="mt-10 w-full flex-1">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Your Projects</h2>
          <span className="text-sm text-muted-foreground">
            {Playgrounds?.length || 0} project{(Playgrounds?.length || 0) !== 1 ? "s" : ""}
          </span>
        </div>

        {Playgrounds && Playgrounds.length === 0 ? (
          <EmptyState
            title="No Projects Found"
            description="Create a New Project To Get Started"
            imageSrc="./empty-state.svg"
          />
        ) : (
          <ProjectTable
            projects={Playgrounds || []}
            onDeleteProject={async (id: string) => {
              "use server";
              const { db } = await import("@/lib/db");
              await db.playground.delete({ where: { id } });
            }}
            onUpdateProject={async (
              id: string,
              data: { title: string; description: string }
            ) => {
              "use server";
              const { db } = await import("@/lib/db");
              await db.playground.update({ where: { id }, data });
            }}
            onDuplicateProject={async (id: string) => {
              "use server";
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Page;
