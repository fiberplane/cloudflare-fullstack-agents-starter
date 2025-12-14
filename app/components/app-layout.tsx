import { Outlet } from "@tanstack/react-router";
import { AppHeader } from "@/app/components/app-header";
import { AppSidebar } from "@/app/components/app-sidebar";
import { LayoutContent, LayoutMain } from "@/app/components/ui/layout";
import { SidebarInset, SidebarProvider } from "@/app/components/ui/sidebar";

export function AppLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex flex-1 flex-col">
          <AppHeader />
          <LayoutMain>
            <LayoutContent>
              <Outlet />
            </LayoutContent>
          </LayoutMain>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
