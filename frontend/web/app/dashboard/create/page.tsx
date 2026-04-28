import { SongPanel } from "@/modules/songs/ui/components/song-panel";
import SongListView from "@/modules/songs/ui/view/song-list-view";

export default async function CreatePage() {

    return (
        <div className="flex h-full flex-col lg:flex-row">
            <SongPanel />
            <SongListView/>
        </div>
    )
}