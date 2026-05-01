import { Download, DownloadIcon, Loader, MoreHorizontal, Music, PencilIcon, Play, RefreshCcw, Search, Trash, XCircle } from "lucide-react";
import { Song } from "../../dtos/song-dto";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { usePublishSong } from "../../hooks/use-publish-song";
import { useQueryClient } from "@tanstack/react-query";
import { DeleteSongAlert } from "./delete-song-alert";
import { RenameSongModal } from "./rename-song-modal";
import { usePlayerStore } from "../../stores/use-player-store";
import { useSession } from "@/modules/auth/providers/auth-provider";
import { useGeneratePlayUrl } from "../../hooks/use-play-url";

export function SongList({ songs }: { songs: Song[] } ) {
    const [ searchQuery, setSearchQuery ] = useState<string>("");
    const [ isRefreshing, setIsRefreshing ] = useState<boolean>(false);
    const [ isLoadingSongId, setIsLoadingSongId ] = useState<string|null>(null);

    const [ isDeleteOpen, setIsDeleteOpen ] = useState<boolean>(false);
    const [ isRenameOpen, setIsRenameOpen ] = useState<boolean>(false);

    const [ selectedId, setSelectedId ] = useState<string|undefined>();
    const [prevName, setPrevName ] = useState<string|undefined>();

    const { setSong } = usePlayerStore();
    const { user } = useSession();

    const { mutate:handleSetPublishSong } = usePublishSong();
    const { mutate:handleGeneratePlayUrl, isPending:generatingPlayUrl } = useGeneratePlayUrl();
    const queryClient = useQueryClient();

    const handleSelectSong = async (song: Song) => {
        setIsLoadingSongId(song.id);

        handleGeneratePlayUrl(song.id, {
            onSuccess: (data) => {
                setSong({
                    id: song.id,
                    title: song.title,
                    playUrl: data.songUrl,
                    createdByUserName: user?.name ?? "",
                    thumbnailUrl: song.thumbnailUrl ?? ""
                });
            }, onError: (err) => {
                toast.error(err.message);
            }
        })
        
    }

    const filteredSongs = songs.filter((song) => 
        song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.prompt?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await queryClient.invalidateQueries({ queryKey: ["get-songs" ]});    
        setIsRefreshing(false);
    }

    const handleToggleRename = (songId: string, prevName: string) => {
        setSelectedId(songId);
        setPrevName(prevName);

        setIsRenameOpen(true);
    }

    const handleToggleDelete = (songId: string) => {
        setSelectedId(songId);
        setIsDeleteOpen(true);
    }

    return (
        <>
        {selectedId && (
            <>
            <DeleteSongAlert
                open={isDeleteOpen}
                setOpen={setIsDeleteOpen}
                songId={selectedId}
            />

            <RenameSongModal
                open={isRenameOpen}
                setOpen={setIsRenameOpen}
                songId={selectedId}
                prevName={prevName ?? ""}
            />
            </>
        )}
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
                        onClick={handleRefresh}
                    >
                        <RefreshCcw className={cn("mr-2", isRefreshing && "animate-spin")} />
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
                                        <div className="bg-muted/30 flex h-12 w-12 shrink-0 items-center justify-center rounded-md">
                                            <Loader className="text-muted-foreground animate-spin h-6 w-6" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="text-muted-foreground truncate text-sm font-medium">Processing</h3>
                                            <p className="text-muted-foreground text-xs">
                                                Generating song, it will show up here once completed
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
                                                    onClick={() => (handleSetPublishSong(song.id))}
                                                    variant="outline"
                                                    className={cn(
                                                        "cursor-pointer z-10",
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
                                                                if (!song.r2Key) return;
                                                                handleGeneratePlayUrl(song.id, {
                                                                    onSuccess: (data) => {
                                                                        window.open(data.songUrl, "_blank")
                                                                    }
                                                                });
                                                             }} 
                                                            >
                                                                <DownloadIcon />
                                                                Download
                                                            </DropdownMenuItem>

                                                             <DropdownMenuItem
                                                                className="mr-1"
                                                                onClick={async (e) => {
                                                                    e.stopPropagation();
                                                                    handleToggleRename(song.id, song.title)
                                                                }} 
                                                            >
                                                                <PencilIcon />
                                                                Rename
                                                            </DropdownMenuItem>

                                                            <DropdownMenuItem
                                                                className="mr-1"
                                                                onClick={async (e) => {
                                                                    e.stopPropagation();
                                                                    handleToggleDelete(song.id)
                                                                }} 
                                                            >
                                                                <Trash />
                                                                Delete
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
    </>
    )
}