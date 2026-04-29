"use client";

import { useSession } from "@/modules/auth/providers/auth-provider"
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchTrackList } from "../../actions/fetch-track-list";
import { useSongUpdates } from "../../hooks/use-song-updates";
import { SongList } from "../components/song-list";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PageLoading } from "@/components/page-loading";

export default function SongListView () {
    const router = useRouter();
    const { status, user } = useSession();
    const songUpdates = useSongUpdates(user?.id);
    const queryClient = useQueryClient();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/sign-in");
        }
    }, [status, router]);

    const { data:songs, isPending, error } = useQuery({
        queryKey: ["get-songs"],
        queryFn: fetchTrackList,
    });

    useEffect(() => {
        if (songUpdates) {
            queryClient.invalidateQueries({ queryKey: ["get-songs"]});            
        }
    }, [songUpdates]);

    if (isPending) {
        return (
            <PageLoading />
        )
    }

    if (error) {
        return (
            <div className="w-full h-full flex flex-col justify-center">
                Error
            </div>
        )
    }
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