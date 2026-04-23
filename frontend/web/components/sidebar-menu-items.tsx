"use client";

import { Home, Music, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { SidebarMenuButton, SidebarMenuItem } from "./ui/sidebar";

export default function SidebarMenuItems() {
    const path = usePathname();

    
    let sidebarItems = [
        {
            title: "Home",
            url: "/",
            icon: Home,
            active: false
        },
        {
            title: "Create",
            url: "/create",
            icon: Music,
            active: false
        },
        {
            title: "Search",
            url: "/search",
            icon: Search,
            active: false
        }
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