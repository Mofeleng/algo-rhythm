import { useMutation, useQueryClient } from "@tanstack/react-query"
import { renameSong } from "../actions/rename-song"

export function useRenameSong() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({songId, newName}:{ songId: string, newName: string }) => renameSong({songId, newName }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["get-songs"] });
        }
    })
}