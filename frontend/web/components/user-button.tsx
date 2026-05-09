import { ChevronDown, LogOutIcon, UserIcon, UserRoundCheckIcon } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { useSession } from "@/modules/auth/providers/auth-provider";

export function UserButton() {
    const router = useRouter();
    const { logout, user } = useSession();

    if (!user) { return; }
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="w-full sm:bg-muted p-2 rounded-sm border flex flex-row items-center justify-between">
                <div className="flex flex-row items-center gap-2 flex-1 min-w-0">
                  <div className="w-7 h-7 shrink-0 bg-muted-foreground rounded-full flex justify-center items-center">
                    <UserIcon className="size-4 text-background"/>
                  </div>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <h3 className="text-sm truncate">{ user.name }</h3>
                    <p className="text-muted-foreground text-xs truncate">{user.email}</p>
                  </div>
                </div>

                <ChevronDown className="size-4 shrink-0"/>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuGroup>
                <DropdownMenuLabel>Account</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => logout()} className="hover:cursor-pointer">
                  <LogOutIcon /> Log out
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
    )
}