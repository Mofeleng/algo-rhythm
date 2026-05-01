"use client";


import { useSession } from "@/modules/auth/providers/auth-provider";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { MusicIcon } from "lucide-react";
import { SongCard } from "../components/song-card";
import { PageLoading } from "@/components/page-loading";
import { getApiRequest } from "@/lib/api-request";
import { BaseSong } from "../../dtos/song-dto";

export default function HomePageView() {
    const router = useRouter();
    const { user, status } = useSession();

    const { data:songData, isPending, error } = useQuery({
        queryKey: ["get-published"],
        queryFn: () => getApiRequest<{ songs: BaseSong[] }>(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/songs/get-all`),
        refetchOnWindowFocus: false
    });

      useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/sign-in");
        }
    }, [status, router]);

    const songs = songData?.songs;

    if (isPending) {
        return <PageLoading />
    }

     if (!songs || error) {
        return (
            <div className="flex h-full flex-col items-center justify-center p-4 text-center">
                <MusicIcon className="w-20 h-20 text-muted-foreground" />
                <h1 className="mt-4 text-2xl font-bold tracking-tight">Something went wrong</h1>
                <p className="text-muted-foreground mt-2">
                    Could not fetch songs
                </p>
            </div>
        )
    }

    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 2);

    const trendingSongs = songs.filter((song) => new Date(song.createdAt) >= threeDaysAgo).slice(0, 10);

    const trendingSongIds = new Set(trendingSongs.map((song) => song.id));
    console.log(songs)
    const categorizedSongs = songs.filter((song) => !trendingSongIds.has(song.id) && song.categories.length > 0).reduce((acc, song) => {
        const primaryCategory = song.categories[0];
        if (primaryCategory) {
            if (!acc[primaryCategory]) {
                acc[primaryCategory] = []
            }
            if (acc[primaryCategory]!.length < 10) {
                acc[primaryCategory]!.push(song)
            }
        }

        return acc;
    }, {} as Record<string, Array<(typeof songs)[number]>>);

    
   
    if (trendingSongs?.length === 0 && Object.keys(categorizedSongs).length === 0) {
        return (
            <div className="flex h-full flex-col items-center justify-center p-4 text-center">
                <MusicIcon className="w-20 h-20 text-muted-foreground" />
                <h1 className="mt-4 text-2xl font-bold tracking-tight">No songs</h1>
                <p className="text-muted-foreground mt-2">
                    There are no published songs right now, try again later
                </p>
            </div>
        )
    }
    
    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold tracking-tight">
                Discover music
            </h1>
            { trendingSongs.length > 0 && (
                <div className="mt-6">
                    <h2 className="text-xl font-semibold">Trending</h2>
                    <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-6  md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                        { trendingSongs.map((song) => (
                            <SongCard key={song.id} song={song} />
                        ))}
                    </div>
                </div>
            )}
            { Object.entries(categorizedSongs).slice(0,5).map(([category, songs]) => (
                trendingSongs.length > 0 && (
                <div className="mt-6">
                    <h2 className="text-xl font-semibold">{ category }</h2>
                    <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-6  md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                        { songs.map((song) => (
                            <SongCard key={song.id} song={song} />
                        ))}
                    </div>
                </div>
                )
            ))}
        </div>
    )
}