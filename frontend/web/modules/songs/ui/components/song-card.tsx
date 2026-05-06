"use client"

import { HeartIcon, LoaderIcon, MusicIcon, PlayIcon } from "lucide-react";
import { BaseSong } from "../../dtos/song-dto"
import { useState } from "react";
import { cn } from "@/lib/utils";
import { usePlayerStore } from "../../stores/use-player-store";
import { PlayerSong } from "../../dtos/player-store-dto";
import { useGeneratePlayUrl } from "../../hooks/use-play-url";

interface SongCardProps {
    song: BaseSong;
}

export function SongCard({ song }:SongCardProps) {
    const { setSong } = usePlayerStore();
    const { mutate:generatePlayUrl, isPending:generatingPlayUrl } = useGeneratePlayUrl();

    const [ liked, setLiked ] = useState<boolean>(false);
    //get existing like? from db and update liked
    const handleSelectSong = async () => {
        if (!song.user || !song.s3Key) return;

        generatePlayUrl(song.id, {
            onSuccess: (data) => {
                const request:PlayerSong = {
                    id: song.id,
                    createdByUserName: song.user!.name,
                    title: song.title,
                    thumbnailUrl: song.thumbnailUrl ?? "",
                    playUrl: data.songUrl
                }

                setSong(request);
            }
        });
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
                            { generatingPlayUrl ? <LoaderIcon className="animate-spin text-white w-6 h-6" /> : <PlayIcon className="w-6 h-6 fill-white text-white" />}
                        </div>
                    </div>
                </div>
                <h3 className="mt-2 truncate text-sm font-medium">{ song.title }</h3>
                <p className="text-xs text-muted-foreground">{ song.user?.name }</p>
                <div className="mt-1 items-center justify-between text-xs">
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