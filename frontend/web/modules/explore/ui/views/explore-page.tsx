"use client";

import { PageLoading } from "@/components/page-loading";
import { getApiRequest } from "@/lib/api-request";
import { BaseSong } from "@/modules/songs/dtos/song-dto";
import { SongCard } from "@/modules/songs/ui/components/song-card";
import { useQuery } from "@tanstack/react-query";
import { MusicIcon } from "lucide-react";

export function ExplorePageView() {
    const { data: songData, isPending, error } = useQuery({
        queryKey: ["get-published"],
        queryFn: () =>
            getApiRequest<{ songs: BaseSong[] }>(
                `${process.env.NEXT_PUBLIC_BACKEND_API}/api/songs/get-all`
            ),
        refetchOnWindowFocus: false,
    });

    const songs = songData?.songs;

    if (isPending) {
        return <PageLoading />;
    }

    if (!songs || error) {
        return (
            <div className="flex flex-col items-center justify-center p-4 text-center">
                <MusicIcon className="w-20 h-20 text-muted-foreground" />
                <h1 className="mt-4 text-2xl font-bold tracking-tight">Something went wrong</h1>
                <p className="text-muted-foreground mt-2">Could not fetch songs</p>
            </div>
        );
    }

    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 2);

    const trendingSongs = songs
        .filter((song) => new Date(song.createdAt) > threeDaysAgo)
        .slice(0, 10);

    const trendingSongIds = new Set(trendingSongs.map((song) => song.id));
    const categorizedSongs = songs
        .filter((song) => !trendingSongIds.has(song.id) && song.categories.length > 0)
        .reduce(
            (acc, song) => {
                const primaryCategory = song.categories[0];
                if (primaryCategory) {
                    if (!acc[primaryCategory]) acc[primaryCategory] = [];
                    if (acc[primaryCategory]!.length < 10) acc[primaryCategory]!.push(song);
                }
                return acc;
            },
            {} as Record<string, Array<(typeof songs)[number]>>
        );

    const otherSongs = songs.filter((song) => new Date(song.createdAt) < threeDaysAgo);

    if (trendingSongs?.length === 0 && Object.keys(categorizedSongs).length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-4 text-center">
                <MusicIcon className="w-20 h-20 text-muted-foreground" />
                <h1 className="mt-4 text-2xl font-bold tracking-tight">No songs</h1>
                <p className="text-muted-foreground mt-2">
                    There are no published songs right now, try again later
                </p>
            </div>
        );
    }

    return (
        <div className="py-4 px-4 sm:px-6 md:px-10">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Discover music</h1>

            {trendingSongs.length > 0 && (
                <div className="mt-6">
                    <h2 className="text-lg sm:text-xl font-semibold">Trending</h2>
                    <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-5 md:grid-cols-3 xl:grid-cols-4">
                        {trendingSongs.map((song) => (
                            <SongCard key={song.id} song={song} />
                        ))}
                    </div>
                </div>
            )}

            {otherSongs.length > 0 && (
                <div className="mt-6">
                    <h2 className="text-lg sm:text-xl font-semibold">Explore songs</h2>
                    <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-5 md:grid-cols-3 xl:grid-cols-4">
                        {otherSongs.map((song) => (
                            <SongCard key={song.id} song={song} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}