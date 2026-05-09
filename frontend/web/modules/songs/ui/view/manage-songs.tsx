import { useState } from "react";
import { usePlayerStore } from "../../stores/use-player-store";
import { useSession } from "@/modules/auth/providers/auth-provider";
import { usePublishSong } from "../../hooks/use-publish-song";
import { useGeneratePlayUrl } from "../../hooks/use-play-url";
import { useQueryClient } from "@tanstack/react-query";
import { Song } from "../../dtos/song-dto";
import { toast } from "sonner";
import { DeleteSongAlert } from "../components/delete-song-alert";
import { RenameSongModal } from "../components/rename-song-modal";
import { ClockIcon, DownloadIcon, LoaderIcon, MoreHorizontal, MusicIcon, PencilIcon, PlayIcon, PlusIcon, RefreshCcwIcon, SearchIcon, TrashIcon, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SoundBar } from "../components/sound-bar";
import { NewSongModal } from "../components/new-song-modal";

export function ManageSongsView({ songs }: { songs: Song[] }) {
    const [ searchQuery, setSearchQuery ] = useState<string>("");
    const [ isRefreshing, setIsRefreshing ] = useState<boolean>(false);
    const [ isLoadingSongId, setIsLoadingSongId ] = useState<string|null>(null);

    const [ isDeleteOpen, setIsDeleteOpen ] = useState<boolean>(false);
    const [ isRenameOpen, setIsRenameOpen ] = useState<boolean>(false);
    const [ isCreateOpen, setIsCreateOpen ] = useState<boolean>(false);

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
        <div className="px-4">
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
        {
            user && (
                <NewSongModal
                open={isCreateOpen}
                setOpen={setIsCreateOpen}
                userId={user.id}
            />
            )
        }
        <div className="max-w-3xl mx-auto">
            <div className="p-6">
                <div className="mb-4 flex items-center justify-between gap-4">
                    <div className="relative max-w-md flex-1">
                        <SearchIcon className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-1/2" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search" className="pl-10"
                        />
                    </div>
                    <div className="flex flex-row gap-2">
                        <Button
                            size="sm"
                            onClick={() => setIsCreateOpen(true)}
                            className="cursor-pointer"
                        >
                            <PlusIcon className="mr-2"/>
                            Add new song
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            disabled={isRefreshing}
                            onClick={handleRefresh}
                            className="cursor-pointer"
                        >
                            <RefreshCcwIcon className={cn("mr-2", isRefreshing && "animate-spin")} />
                            Refresh
                        </Button>
                    </div>
                </div>

                <div className="space-y-1">
                    { filteredSongs.length === 0 && (
                        <div className="mt-3 w-full border-muted text-center">
                            <p className="text-muted-foreground">No songs yet, Your song generation history will show here</p>
                        </div>
                    )}
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
                            case "queued":
                                return (
                                    <div key={song.id} className="flex cursor-wait items-center gap-4 rounded-lg p-3 border border-dashed border-muted-foreground/20 bg-muted/10">
                                        <div className="bg-muted/50 flex h-12 w-12 shrink-0 items-center justify-center rounded-md border">
                                            {/* Using a clock to indicate "waiting" instead of a spinner */}
                                            <ClockIcon className="text-muted-foreground/60 h-6 w-6 animate-pulse" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-muted-foreground truncate text-sm font-medium">Queued</h3>
                                                <Badge variant="outline" className="text-[10px] h-4 px-1 uppercase tracking-wider opacity-60">
                                                    Waiting
                                                </Badge>
                                            </div>
                                            <p className="text-muted-foreground/70 text-xs truncate">
                                                {song.title || "Untitled Song"} — In line for generation
                                            </p>
                                        </div>
                                    </div>
                                )
                            case "processing":
                                return (
                                    <div key={song.id} className="flex cursor-not-allowed items-center gap-4 rounded-lg p-3">
                                        <div className="bg-muted/30 flex h-12 w-12 shrink-0 items-center justify-center rounded-md">
                                            <LoaderIcon className="text-muted-foreground animate-spin h-6 w-6" />
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
                                                        <MusicIcon className="text-muted-foreground h-6 w-6"/>
                                                    </div>
                                            }
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
                                                { isLoadingSongId === song.id ? <LoaderIcon className="animate-spin text-white" /> : <PlayIcon className="text-primary fill-primary" />}
                                            </div>
                                        </div>
                                        <div className="min-w-0 flex-1 ">
                                            <div className=" flex items-center gap-2 justify-between">
                                                <div className="flex items-center gap-x-3">
                                                    <h3 className="truncate text-sm font-medium">{song.title}</h3>
                                                    { song.instrumental && 
                                                        <Badge
                                                            variant="outline"
                                                        >
                                                            Instrumental
                                                        </Badge>
                                                    }
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
                                                                <TrashIcon />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>
                                            <p className="max-w-3/4 text-muted-foreground truncate text-xs">
                                                    {song.prompt}
                                                </p>
                                        </div>
                                    </div>
                                )
                        }
                    })}
                </div>
            </div>
        </div>
    </div>
    )
}