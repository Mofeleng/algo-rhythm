"use client";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { GenerateRequest, GenerateResponse } from "../dtos/generate-song";
import { postApiRequest } from "@/lib/api-request";

export function useGenerateSong() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (request:GenerateRequest) => postApiRequest<GenerateResponse>(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/jobs/generate-song`, JSON.stringify(request)),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: [ "get-songs" ]})
        },
    });
}