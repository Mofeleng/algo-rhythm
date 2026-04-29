"use client";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { generateSong } from "../actions/generate-song";
import { GenerateRequest } from "../dtos/generate-song";
import { toast } from "sonner";

export const useGenerateSong = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (request:GenerateRequest) => generateSong(request),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: [ "get-songs" ]})
        },
        onError: (err) => {
            toast.error(`Something went wrong while generating the song.` + err.message)
            console.log(err);
        }
    });
}