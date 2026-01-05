import { SidebarProvider } from "@/components/ui/sidebar";
import React from "react";
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full overflow-x-hidden">
        {/* Sidebar would be here */}
        <main className="flex-1">{children}</main>
      </div>
    </SidebarProvider>
  );
}
