"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { postApiRequest } from "@/lib/api-request";

export function usePublishSong() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (songId: string) => postApiRequest<{ message: string }>(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/songs/set-published-status`, JSON.stringify({ songId })),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ["get-songs"]})
        }
    })
}