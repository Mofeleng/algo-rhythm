import { useMutation } from "@tanstack/react-query"
import { postApiRequest } from "@/lib/api-request"

export function useGeneratePlayUrl() {
    return useMutation({
        mutationFn: async (songId: string) => postApiRequest<{ songUrl: string }>(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/songs/generate-play-url`, JSON.stringify({ songId })),
    })
}