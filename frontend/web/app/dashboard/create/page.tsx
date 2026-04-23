import { SongPanel } from "@/modules/songs/ui/components/song-panel";

export default async function CreatePage() {

    return (
        <div className="flex h-full flex-col lg:flex-row">
            <SongPanel />
        </div>
    )
}