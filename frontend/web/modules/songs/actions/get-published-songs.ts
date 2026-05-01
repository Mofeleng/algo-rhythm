import { Song, BaseSong } from "../dtos/song-dto";

export async function getPublishedSongs() {

    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/songs/get-all`, {
        credentials: "include"
    });
    console.log(res);
    const response = await res.json();
    console.log(response)
    return response.songs as BaseSong[];
}