import { create } from "zustand";
import { PlayerSong } from "../dtos/player-store-dto";

interface PlayerState {
    song: PlayerSong | null;
    setSong: (song: PlayerSong | null) => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
    song: null,
    setSong: (song) => set({ song })
}));
