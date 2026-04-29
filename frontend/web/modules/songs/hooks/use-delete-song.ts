import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteSong } from "../actions/delete-song";

export function useDeleteSong() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (songId: string) => deleteSong(songId),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["get-songs"]});
        }
    })
}