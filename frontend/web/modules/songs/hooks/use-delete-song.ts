import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteApiRequest } from "@/lib/api-request";

export function useDeleteSong() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (songId: string) => deleteApiRequest(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/songs/delete`, JSON.stringify({ songId })),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["get-songs"]});
        }
    })
}