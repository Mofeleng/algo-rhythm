"use client";

import { cn } from "@/lib/utils";
import { ArrowUpRightIcon, CompassIcon, Loader2Icon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "./ui/button";
import Image from "next/image";
import { useSession } from "@/modules/auth/providers/auth-provider";
import { UserButton } from "./user-button";

const sideBarItems = [
    {
        name: "Explore",
        icon: CompassIcon,
        url: "/explore",
    },
    {
        name: "Creator Studio",
        icon: ArrowUpRightIcon,
        url: "/manage",
    },
];

export function AppSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { status, user } = useSession();

    return (
        <>
            {/* ── Desktop sidebar ── */}
            <div className="hidden md:flex w-full h-dvh items-center justify-center relative">
                <div className="w-60 h-[calc(100vh-100px)] fixed top-10 bg-card border rounded-lg px-3 py-4 flex flex-col gap-4">
                    <Link href="/explore">
                        <Image
                            src="/logo.svg"
                            alt="AlgoRhythm logo"
                            className="w-[80%] h-10"
                            width={580}
                            height={580}
                            loading="eager"
                        />
                    </Link>
                    <div className="mt-1 flex flex-col gap-y-1">
                        {sideBarItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.url}
                                className={cn(
                                    "flex flex-row rounded-sm py-1 px-1 items-center gap-1 hover:bg-muted transition-all delay-100",
                                    pathname.includes(item.url) && "bg-muted/80"
                                )}
                            >
                                <item.icon className="size-4" />
                                {item.name}
                            </Link>
                        ))}
                    </div>
                    <div className="mt-auto w-full">
                        {status === "unauthenticated" ? (
                            <Button
                                className="w-full rounded-full"
                                onClick={() => router.push("/auth/sign-in")}
                            >
                                Sign in
                            </Button>
                        ) : status === "loading" ? (
                            <div className="self-center">
                                <Loader2Icon className="animate-spin text-primary" />
                            </div>
                        ) : (
                            <div className="space-y-1">
                                <p className="text-center text-sm">
                                    <span className="font-bold">{user?.credits}&nbsp;</span>
                                    credits
                                </p>
                                <UserButton />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Mobile bottom nav ── */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t h-16">
                {/* Every slot (nav links + auth) is flex-1 so they share equal width */}
                <div className="flex items-center h-full px-2">
                    {sideBarItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.url}
                            className={cn(
                                "flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-muted-foreground transition-colors",
                                pathname.includes(item.url) && "text-primary"
                            )}
                        >
                            <item.icon className="size-5" />
                            <span className="text-[10px] font-medium">{item.name}</span>
                        </Link>
                    ))}


                </div>
            </nav>
        </>
    );
}