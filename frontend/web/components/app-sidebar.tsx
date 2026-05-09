"use client";

import { Music } from "lucide-react";
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
  SidebarFooter,
} from "@/components/ui/sidebar";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { UserButton } from "./user-button";
import { useSession } from "@/modules/auth/providers/auth-provider";

const items = [
  {
    title: "Manage Songs",
    url: "/manage",
    icon: Music,
  },
];

export function AppSidebar() {

  const pathname = usePathname();
  const { user } = useSession();
  return (
    <Sidebar variant="inset">
      <SidebarHeader className="h-16 justify-center px-4 border-b">
        <Link href="/explore">
          <Image
            src="/logo.svg" alt="Logo"
            width={100}
            height={40}
            className="w-24"
            loading="eager"
          />
        </Link>
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
      <SidebarFooter className="space-y-1">
        <p className="text-center text-sm"><span className="font-bold">{ user?.credits }</span>&nbsp;credits</p>
        <UserButton />
      </SidebarFooter>
    </Sidebar>
  );
}