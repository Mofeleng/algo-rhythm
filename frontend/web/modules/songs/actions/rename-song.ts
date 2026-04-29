import { Song } from "../dtos/song-dto";

export async function renameSong({ songId, newName }:{ songId: string, newName: string }) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/songs/rename`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ songId, newName })
    });

    const data = await res.json() as Song;

    return data;
}