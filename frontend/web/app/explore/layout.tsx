import { AppSidebar } from "@/components/sidebar";
import { SoundBar } from "@/modules/songs/ui/components/sound-bar";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <main className="flex flex-col md:grid md:grid-cols-[1fr_4fr] w-full overflow-hidden">
            <AppSidebar />
            <div className="flex flex-col flex-1 min-h-0 md:h-screen pb-16 md:pb-0">
                <div className="flex-1 min-h-0 pt-4 md:pt-8 overflow-y-auto">
                    {children}
                </div>
                <SoundBar />
            </div>
        </main>
    );
}