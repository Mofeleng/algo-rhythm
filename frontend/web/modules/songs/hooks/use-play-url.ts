import { useMutation } from "@tanstack/react-query"
import { generatePlayUrl } from "../actions/generate-play-url"

export function useGeneratePlayUrl() {
    return useMutation({
        mutationFn: async (songId: string) => generatePlayUrl(songId),
    })
}