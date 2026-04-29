import { Song } from "../dtos/song-dto";

export async function deleteSong(songId: string) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/songs/delete`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ songId })
    });

    const data = await res.json() as Song;

    return data;
}