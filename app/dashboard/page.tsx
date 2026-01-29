import React from "react";
import AddNewButton from "@/features/dashboard/components/add-new-button";
import AddRepoButton from "@/features/dashboard/components/add-github-button";
import EmptyState from "@/components/ui/empty-state";


const Page = () => {
  const Playgrounds : any = [];
  return (
    <div className="flex flex-col justify-start items-center min-h-screen mx-auto max-w-7xl px-4 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <AddNewButton />
        <AddRepoButton />
      </div>

      <div className="mt-10 flex flex-col justify-center items-center w-full">
        {
              Playgrounds && Playgrounds.length === 0  ? (<EmptyState title='No Projects Found' description='Create a New Project To Get Started' imageSrc='./empty-state.svg' />) : (
                // todo : Add Playground Table 
                <p>

                </p>
              )
        }
      </div>
    </div>
  );
};

export default Page;
