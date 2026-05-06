"use client";

import { Compass, Home, Music, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { SidebarMenuButton, SidebarMenuItem } from "../../../../components/ui/sidebar";

export default function SidebarMenuItems() {
    const path = usePathname();

    
    let sidebarItems = [
        {
            title: "Explore",
            url: "/dashboard/explore",
            icon: Compass,
            active: false
        },
        {
            title: "Create",
            url: "/dashboard/create",
            icon: Music,
            active: false
        },
    ];

    sidebarItems = sidebarItems.map((item) => ({
        ...item,
        active: path === item.url
    }));

    return (
        <>
            { sidebarItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={item.active}>
                        <a href={item.url}>
                            <item.icon />
                            <span>{ item.title }</span>
                        </a>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            ))}
        </>
    )

}