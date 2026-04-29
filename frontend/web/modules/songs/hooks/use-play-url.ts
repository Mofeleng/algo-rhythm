import { useMutation } from "@tanstack/react-query"
import { generatePlayUrl } from "../actions/generate-play-url"

export const useGeneratePlayUrl = () => {

    return useMutation({
        mutationFn: async (songId: string) => generatePlayUrl(songId),
    })
}