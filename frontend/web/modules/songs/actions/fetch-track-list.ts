import { Song } from "../dtos/song-dto";

interface SongFetchError {
    message: string;
}

export async function fetchTrackList() {
   const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/songs/get-many`, {
    credentials: "include"
   });

   const result = await response.json();

   if (!response.ok) {
    return {
        ok: false,
        message: (result as SongFetchError).message,
        body: []
    }
   }
    return {
        ok: true,
        message: "Successfully fetched songs",
        body: result as Song[]
    }
}