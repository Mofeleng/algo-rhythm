"use client";

import { DownloadIcon, MoreHorizontal, MusicIcon, PauseIcon, PlayIcon, Volume2Icon, VolumeIcon } from "lucide-react";
import { usePlayerStore } from "../../stores/use-player-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function SoundBar() {
    const audioRef = useRef<HTMLAudioElement>(null);

    const { song } = usePlayerStore();

    const [ isPlaying, setIsPlaying ] = useState<boolean>(false);
    const [ volume, setVolume ] = useState<number[]>([100]);
    const [ songProgress, setSongProgress ] = useState<number>(0);
    const [ songDuration, setSongDuration ] = useState<number>(0);


    const handleSeekSongProgress = (value: number[]) => {
        if (audioRef.current && value[0] !== undefined) {
            audioRef.current.currentTime = value[0];
            setSongProgress(value[0]);
        }
    }

    const toggleIsPlaying = () => {
        if (!song?.playUrl || !audioRef.current) return;
        
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play();
            setIsPlaying(true);
        }
    }

    const formatTime = (time:number) => {
        const min = Math.floor(time/60);
        const sec = Math.floor(time % 60);

        return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
    }

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume[0] / 100;
        }
    }, [volume])

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateSongProgress = () => setSongProgress(audio.currentTime);
        const updateSongDuration = () => setSongDuration(audio.duration);
        
        const handleOnSongEnded = () => {
            setIsPlaying(false);
            setSongProgress(0);
        }
        audio.addEventListener("timeupdate", updateSongProgress);
        audio.addEventListener("loadedmetadata", updateSongDuration);
        audio.addEventListener("ended", handleOnSongEnded);

        return () => {
            audio.removeEventListener("timeupdate", updateSongProgress);
            audio.removeEventListener("loadedmetadata", updateSongDuration);
            audio.removeEventListener("ended", handleOnSongEnded);
        }
    }, [song]);

    useEffect(() => {
        if (audioRef.current && song?.playUrl) {
            setSongProgress(0);
            setSongDuration(0);

            audioRef.current.src = song.playUrl;

            const autoPlay = audioRef.current.play();

            if (autoPlay !== undefined) {
                autoPlay.then(() => {
                    setIsPlaying(true);
                }).catch((err) => {
                    console.error(err);
                    setIsPlaying(false);
                });
            }
        }
    }, [song]);

    if (!song) return null;
    
    return (
        <div className="px-4 pb-2">
            <Card className="bg-background/60 relative w-full shrink-0 border-t py-0 backdrop-blur-2xl">
                <div className="space-y-2 p-3">
                    <div className="flex items-center justify-between">
                        <div className="flex min-w-0 flex-1 items-center gap-2">
                            <div className="flex w-10 h-10 shrink-0 justify-center items-center rounded-md bg-linear-to-br from-indigo-500 to-violet-500">
                                { song?.thumbnailUrl ? 
                                    <img
                                        className="w-full h-full rounded-md object-cover"
                                        src={song.thumbnailUrl}
                                    /> :
                                    <MusicIcon className="text-white w-4 h-4" />
                                }
                            </div>
                            <div className="max-w-24 min-w-0 flex-1 md:max-w-full">
                                <p className="truncate text-sm font-medium">
                                    { song?.title || "Untitled" }
                                </p>
                                <p className="text-muted-foreground truncate text-xs">
                                    { song?.createdByUserName }
                                </p>
                            </div>
                        </div>
                        <div className="absolute left-1/2 -translate-x-1/2">
                            <Button 
                                variant="ghost"
                                size="icon"
                                onClick={toggleIsPlaying}
                            >
                                { isPlaying ? 
                                    <PauseIcon className="w-4 h-4"/> :
                                    <PlayIcon className="w-4 h-4"/>                               
                                }
                            </Button>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="flex items-center gap-2">
                                <Volume2Icon className="h-4 w-4" />
                                <Slider
                                    value={volume}
                                    onValueChange={setVolume}
                                    max={100}
                                    min={0}
                                    step={1}
                                    className="w-16"
                                />
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                    >
                                        <MoreHorizontal className="w-4 h-4"/>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-40">
                                    <DropdownMenuItem onClick={() => {
                                        if (!song?.playUrl) return;
                                        window.open(song.playUrl, "_blank");
                                    }}>
                                        <DownloadIcon className="mr-2 h-4 w-4" />
                                        Download
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-muted-foreground w-8 text-right text-[10px]">
                            { formatTime(songProgress) }
                        </span>
                        <Slider
                            className="flex-1"
                            value={[songProgress]}
                            step={1}
                            max={songDuration || 100}
                            onValueChange={(e) => handleSeekSongProgress(e)}
                        />
                        <span className="text-muted-foreground w-8 text-right text-[10px]">
                            { formatTime(songDuration) }
                        </span>
                    </div>
                </div>
                {song?.playUrl && (
                    <audio
                        ref={audioRef}
                        src={song?.playUrl ?? ""}
                        preload="metadata"
                    />
                )}
            </Card>
        </div>
    )
}