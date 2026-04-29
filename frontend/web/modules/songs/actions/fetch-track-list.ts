import { Song } from "../dtos/song-dto";

export async function fetchTrackList() {
   const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/songs/get-many`, {
    credentials: "include"
   });

   const result = await response.json();

   return result as Song[];
}