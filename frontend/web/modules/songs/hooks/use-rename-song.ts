import { useMutation, useQueryClient } from "@tanstack/react-query"
import { postApiRequest } from "@/lib/api-request";
import { Song } from "../dtos/song-dto";

export function useRenameSong() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({songId, newName}:{ songId: string, newName: string }) => postApiRequest<Song>(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/songs/rename`, JSON.stringify({ songId, newName })),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["get-songs"] });
        }
    })
}