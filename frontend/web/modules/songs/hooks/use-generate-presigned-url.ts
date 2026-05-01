import { postApiRequest } from "@/lib/api-request";
import { useMutation } from "@tanstack/react-query";

interface GeneratePresignedUrlResponse {
    url?: string;
}

export function useGeneratePresignedUrl() {
    return useMutation({
        mutationFn: (r2Key: string) => postApiRequest<GeneratePresignedUrlResponse>(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/songs/generate-presigned-url`, JSON.stringify({ r2Key }))
    })
}