"use client";

import { Compass, Music, Settings } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  {
    title: "Explore",
    url: "/explore",
    icon: Compass,
  },
  {
    title: "Manage Songs",
    url: "/manage",
    icon: Music,
  },
];

export function AppSidebar() {

  const pathname = usePathname();

  return (
    <Sidebar variant="inset">
      <SidebarHeader className="h-16 justify-center px-4 border-b">
        <Image src="/logo.svg" alt="Logo" width={100} height={40} className="w-24" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem
                  key={item.title}
                  className={
                    cn(
                      "hover:bg-muted",
                      pathname.includes(item.url) && "bg-muted"
                    )
                  }
                >
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}