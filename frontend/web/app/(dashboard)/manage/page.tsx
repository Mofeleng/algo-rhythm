"use client";

import { PageLoading } from "@/components/page-loading";
import { getApiRequest } from "@/lib/api-request";
import { useSession } from "@/modules/auth/providers/auth-provider";
import { Song } from "@/modules/songs/dtos/song-dto";
import { useSongUpdates } from "@/modules/songs/hooks/use-song-updates";
import { ManageSongsView } from "@/modules/songs/ui/view/manage-songs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
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
        queryFn: () => getApiRequest<Song[]>(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/songs/get-many`),
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
    if (!songs) {
        return <>
            No music
        </>
    }
    return (
        <ManageSongsView songs={songs} />
    )
}