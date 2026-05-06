"use client";

import { cn } from "@/lib/utils"
import { ArrowUpRightIcon, CompassIcon, MusicIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "./ui/button"
import Image from "next/image"

const sideBarItems = [
    {
        name: "Explore",
        icon: CompassIcon,
        url: "/explore"
    },
    {
        name: "Creator Studio",
        icon: ArrowUpRightIcon,
        url: "/manage"
    }
]

export function AppSidebar() {
    const pathname = usePathname();

    return (
        <div className="w-full h-dvh flex items-center justify-center relative">
            <div className="w-60 h-[calc(100vh-100px)] fixed top-10 bg-card border rounded-lg px-3 py-4 flex flex-col gap-4">
                <Image
                    src="/logo.svg"
                    alt="AlgoRhythm logo"
                    className="w-[80%] h-10"
                    width={580}
                    height={580}
                />
                <div className="mt-1 flex flex-col gap-y-1">
                    {
                        sideBarItems.map((item) => (
                            <Link
                                key={item.name} 
                                href={item.url} 
                                className={cn(
                                    "flex flex-row rounded-sm py-1 px-1 items-center gap-1 hover:bg-muted transition-all delay-100",
                                    pathname.includes(item.url) && "bg-muted/80"
                            )}>
                                <item.icon className="size-4" />
                                { item.name }
                            </Link>
                        ))
                    }
                </div>
                <div className="self-end w-full">
                    <Button
                        className="w-full rounded-full"
                    >
                        Sign up
                    </Button>
                </div>
            </div>
        </div>
    )
}