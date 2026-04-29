import { create } from "zustand";

interface PlayerSong {
    id: string;
    title: string;
    playUrl: string | null;
    thumbnailUrl: string | null;
    createdByUserName: string | null;
}

interface PlayerState {
    song: PlayerSong | null;
    setSong: (song: PlayerSong) => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
    song: null,
    setSong: (song) => set({ song })
}));
