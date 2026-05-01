"use client"

import { HeartIcon, LoaderIcon, MusicIcon, PlayIcon } from "lucide-react";
import { BaseSong } from "../../dtos/song-dto"
import { useState } from "react";
import { cn } from "@/lib/utils";
import { usePlayerStore } from "../../stores/use-player-store";
import { generatePlayUrl } from "../../actions/generate-play-url";
import { PlayerSong } from "../../dtos/player-store-dto";

interface SongCardProps {
    song: BaseSong;
}

export function SongCard({ song }:SongCardProps) {
    const { setSong } = usePlayerStore();

    const [ isLoading, setIsLoading ] = useState<boolean>(false);
    const [ liked, setLiked ] = useState<boolean>(false);
    //get existing like? from db and update liked
    const handleSelectSong = async () => {
        setIsLoading(true);

    const playUrl = await generatePlayUrl(song.id);
    if (!playUrl.songUrl || !song.user) return;

    const request:PlayerSong = {
        id: song.id,
        createdByUserName: song.user.name,
        title: song.title,
        thumbnailUrl: song.thumbnailUrl ?? "",
        playUrl: playUrl.songUrl
    }

    setSong(request);
        setIsLoading(false);
    }
    return (
        <div>
            <div
                onClick={handleSelectSong}
                className="cursor-pointer group"
            >
                <div className="relative aspect-square w-full overflow-hidden rounded-md bg-gray-200 group-hover:opacity-75">
                    { song.thumbnailUrl ? 
                        <img src={song.thumbnailUrl} className="w-full h-full object-cover object-center"/> :
                        <div className="bg-muted flex h-full w-full items-center justify-center">
                            <MusicIcon className="text-muted-foreground w-12 h-12"/>
                        </div>
                    }
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/50 transition-transform group-hover:scale-105">
                            { isLoading ? <LoaderIcon className="animate-spin text-white w-6 h-6" /> : <PlayIcon className="w-6 h-6 fill-white text-white" />}
                        </div>
                    </div>
                </div>
                <h3 className="mt-2 truncate text-sm font-medium text-gray-900">{ song.title }</h3>
                <p className="text-xs text-gray-500">{ song.user?.name }</p>
                <div className="mt-1 items-center justify-between text-xs text-gray-900">
                    <span>{song.listenCount } listens</span>
                    <button className="flex cursor-pointer items-center gap-1">
                        <HeartIcon className={
                            cn(
                              "w-4 h-4",
                               liked && "fill-red-500 text-red-500"
                        )}/>
                        { song.likes } likes
                    </button>
                </div>
            </div>
        </div>
    )
}