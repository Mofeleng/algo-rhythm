interface PlayUrlResponse {
    message?:string;
    songUrl?: string;
}
export async function generatePlayUrl(songId: string) {
    console.log("song id: ", songId)
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/songs/generate-play-url`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ songId })
    });


    const result = await response.json() as PlayUrlResponse;
        console.log(result)

    return result;
}