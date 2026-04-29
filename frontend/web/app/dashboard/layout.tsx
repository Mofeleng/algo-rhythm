import { Breadcrumb, BreadcrumbList, BreadcrumbItem } from "@/components/ui/breadcrumb";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/modules/dashboard/ui/components/app-sidebar";
import { BreadcrumbPageClient } from "@/modules/dashboard/ui/components/breadcrumb-page-client";
import { Separator } from "@/components/ui/separator";
import { SoundBar } from "@/modules/songs/ui/components/sound-bar";

export default function Layout({ children }: { children: React.ReactNode}) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="flex min-h-screen max-w-full flex-col">
              <header className="bg-background sticky-top z-10 border-b px-4 py-2">
                <div className="flex shrink-0 grow items-center gap-2">
                  <SidebarTrigger className="ml-1"/>
                  <Separator orientation="vertical" className="mr-2" />
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem>
                        <BreadcrumbPageClient />
                      </BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>
              </header>
              <main className="flex-1">
                { children }
              </main>
              <SoundBar />
            </SidebarInset>
          </SidebarProvider>
    )
}