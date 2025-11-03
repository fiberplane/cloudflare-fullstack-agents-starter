import { Outlet } from "@tanstack/react-router";
import { AppHeader } from "@/app/components/app-header";
import { AppSidebar } from "@/app/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/app/components/ui/sidebar";

export function AppLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex flex-1 flex-col">
          <AppHeader />
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">
              <Outlet />
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
