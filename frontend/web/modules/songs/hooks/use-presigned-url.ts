import { postApiRequest } from "@/lib/api-request";
import { useMutation } from "@tanstack/react-query";

export function usePresignedUrl() {
    return useMutation({
        mutationFn: (r2Key: string) => postApiRequest(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/songs/generate-presigned-url`, JSON.stringify({ r2Key }))
    })
}