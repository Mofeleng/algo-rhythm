"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { setPublishedStatus } from "../actions/set-published-status"

export const usePublishSong = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (songId: string) => await setPublishedStatus(songId),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ["get-songs"]})
        }
    })
}