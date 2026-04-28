"use client";

import { useSession } from "@/modules/auth/providers/auth-provider"
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchTrackList } from "../../actions/fetch-track-list";
import { Song } from "../../dtos/song-dto";
import { toast } from "sonner";
import { useSongUpdates } from "../../hooks/use-song-updates";
import { SongList } from "../components/song-list";

export default function SongListView () {
    const router = useRouter();
    const { status, user } = useSession();
    const songUpdates = useSongUpdates(user?.id);

    const [ songs, setSongs ] = useState<Song[]>([]);
    
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/sign-in");
        }
    }, [status, router]);

    useEffect(() => {
        const useFetchTracks = async () => {
            await fetchTrackList().then((data) => {
                if (!data.ok) {
                    toast.error(data.message ?? "");
                    return;
                }
                console.log(data.body)
                setSongs(data.body);
            });
        }

     useFetchTracks();

    }, []);

    useEffect(() => {
        if (songUpdates) {
            toast("New song update");

            if (songUpdates.status === "completed") {
                setSongs((prev) => (
                    prev.map((song) => 
                        song.id === songUpdates.songId
                        ? { ...song, status: songUpdates.status }
                        : song
                    )
                ));
            }
        }
    }, [songUpdates])
    return (
        <>
            { songs.length > 0 ? (
                <SongList songs={songs} />
            ) : (
                <div className="">
                    No songs, create a song to play it here
                </div>
            )}
        </>
    )
}