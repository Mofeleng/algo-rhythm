import { Download, Loader, MoreHorizontal, Music, Play, RefreshCcw, Search, XCircle } from "lucide-react";
import { Song } from "../../dtos/song-dto";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { generatePlayUrl } from "../../actions/generate-play-url";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { setPublishedStatus } from "../../actions/set-published-status";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function SongList({ songs }: { songs: Song[] } ) {
    const [ searchQuery, setSearchQuery ] = useState<string>("");
    const [ isRefreshing, setIsRefreshing ] = useState<boolean>(false);
    const [ isLoadingSongId, setIsLoadingSongId ] = useState<string|null>(null);
    const [ isPublishingSongId, setIsPublishingSongId ] = useState<string|null>(null);

    const handleSelectSong = async (song: Song) => {
        setIsLoadingSongId(song.id);

        const playUrl = await generatePlayUrl(song.id);
        if (!playUrl.ok) {
            toast.error(playUrl.message);
            return;
        }

        setIsLoadingSongId(null);
        toast(playUrl.songUrl);
    }

    const filteredSongs = songs.filter((song) => 
        song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.prompt?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    const handleSetPublishSong = async (songId: string) => {
        setIsPublishingSongId(songId);
        const updatePublished = await setPublishedStatus(songId);
        if (!updatePublished.ok) {
            setIsPublishingSongId(null);
            toast(updatePublished.message);
            return;
        }

        toast(updatePublished.message);
        //Update in real time
    }

    return (
        <div className="flex flex-1 flex-col overflow-y-auto">
            <div className="flex-1 p-6">
                <div className="mb-4 flex items-center justify-between gap-4">
                    <div className="relative max-w-md flex-1">
                        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-1/2" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search" className="pl-10"
                        />
                    </div>
                    <Button
                        size="sm"
                        variant="outline"
                        disabled={isRefreshing}
                        onClick={() => {}}
                    >
                        { isRefreshing ? <Loader className="mr-2 animate-spin" /> : <RefreshCcw className="mr-2" />}
                        Refresh
                    </Button>
                </div>

                <div className="space-y-1">
                    { filteredSongs.map((song) => {
                        switch (song.status) {
                            case "failed":
                                return (
                                    <div key={song.id} className="flex cursor-not-allowed items-center gap-4 rounded-lg p-3">
                                        <div className="bg-destructive/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-md">
                                            <XCircle className="text-destructive h-6 w-6" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="text-destructive truncate text-sm font-medium">Failed</h3>
                                            <p className="text-muted-foreground text-xs">
                                                Please try creating the song again
                                            </p>
                                        </div>
                                    </div>
                                )

                            case "no credits":
                                return (
                                    <div key={song.id} className="flex cursor-not-allowed items-center gap-4 rounded-lg p-3">
                                        <div className="bg-destructive/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-md">
                                            <XCircle className="text-destructive h-6 w-6" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="text-destructive truncate text-sm font-medium">Not enough credits</h3>
                                            <p className="text-muted-foreground text-xs">
                                               You have reached your song generation limit
                                            </p>
                                        </div>
                                    </div>
                                )
                            case "qeued":
                            case "processing":
                                return (
                                    <div key={song.id} className="flex cursor-not-allowed items-center gap-4 rounded-lg p-3">
                                        <div className="bg-destructive/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-md">
                                            <Loader className="text-muted-foreground animate-spin h-6 w-6" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="text-muted-foreground truncate text-sm font-medium">Failed</h3>
                                            <p className="text-muted-foreground text-xs">
                                                Please try creating the song again
                                            </p>
                                        </div>
                                    </div>
                                )

                            default:
                                return (
                                    <div
                                        key={song.id}
                                        onClick={() => handleSelectSong(song)}
                                        className="hover:bg-muted/50 flex cursor-pointer items-center p-3 gap-4"    
                                    >
                                        <div className="group relative h-12 w-12 shrink-0 overflow-hidden rounded-md">
                                            {
                                                song.thumbnailUrl ?
                                                    <img
                                                        src={song.thumbnailUrl}
                                                        alt="Song thumbnail"
                                                        className="h-full w-full object-cover"
                                                    /> :
                                                    <div className="bg-muted flex h-full w-full items-center justify-center">
                                                        <Music className="text-muted-foreground h-6 w-6"/>
                                                    </div>
                                            }
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
                                                { isLoadingSongId === song.id ? <Loader className="animate-spin text-white" /> : <Play className="text-primary fill-primary" />}
                                            </div>
                                        </div>
                                        <div className="min-w-0 flex-1 ">
                                            <div className="flex items-center gap-2">
                                                <h3 className="truncate text-sm font-medium">{song.title}</h3>
                                                { song.instrumental && 
                                                    <Badge
                                                        variant="outline"
                                                    >
                                                        Instrumental
                                                    </Badge>
                                                }
                                                <p className="text-muted-foreground truncate text-xs">
                                                    {song.prompt}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        "cursor-pointer",
                                                        song.published && "border-red-200"
                                                    )}>   
                                                        {song.published ? "Unpublish" : "Publish"}
                                                    </Button>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"

                                                            >
                                                                <MoreHorizontal />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent
                                                            align="end"
                                                            className="w-40"
                                                        >
                                                            <DropdownMenuItem
                                                             className="mr-1"
                                                             onClick={async (e) => {
                                                                e.stopPropagation();
                                                                const playUrl = await generatePlayUrl(song.id);

                                                                if (playUrl.ok) {
                                                                    toast("at: " + playUrl.songUrl)
                                                                    window.open(playUrl.songUrl, "_blank");
                                                                }

                                                                toast(playUrl.message);
                                                                toast(playUrl.songUrl)
                                                                return;
                                                             }} 
                                                            >
                                                                <Download />
                                                                Download
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                            </div>
                                        </div>
                                    </div>
                                )
                        }
                    })}
                </div>
            </div>
        </div>
    )
}