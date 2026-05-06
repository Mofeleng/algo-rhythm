"use client";

import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Fragment } from "react";
import { SoundBar } from "@/modules/songs/ui/components/sound-bar";

function AppBreadcrumb() {
    const pathname = usePathname();

    // e.g. "/dashboard/songs" → ["dashboard", "songs"]
    const segments = pathname.split("/").filter(Boolean);

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {segments.map((segment, index) => {
                    const isLast = index === segments.length - 1;
                    const label = segment.charAt(0).toUpperCase() + segment.slice(1);

                    return (
                        <Fragment key={segment}>
                            <BreadcrumbItem>
                                {isLast ? (
                                    <BreadcrumbPage>{label}</BreadcrumbPage>
                                ) : (
                                    <span className="text-muted-foreground">{label}</span>
                                )}
                            </BreadcrumbItem>
                            {!isLast && <BreadcrumbSeparator />}
                        </Fragment>
                    );
                })}
            </BreadcrumbList>
        </Breadcrumb>
    );
}

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="flex flex-col h-svh overflow-hidden!">
                <header className="h-14 flex items-center shrink-0 gap-2 px-4">
                    <SidebarTrigger />
                    <AppBreadcrumb />
                </header>
                <main className="flex-1 min-h-0 overflow-y-auto">
                    {children}
                </main>
                <SoundBar />
            </SidebarInset>
        </SidebarProvider>
    );
}