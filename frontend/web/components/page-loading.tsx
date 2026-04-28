import { Loader } from "lucide-react";

export function PageLoading() {
    return (
        <div className="w-full h-full flex flex-col justify-center">
            <div className="flex flex-col gap-1 items-center">
                <Loader className="animate-spin" />
                <span className="text-sm text-muted-foreground">Loading</span>
            </div>
        </div>
    )
}