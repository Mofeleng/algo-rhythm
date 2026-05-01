import { User } from "@/modules/auth/dtos/user-dto";
import { SongCategory } from "./song-categories-dto";
import { SongLike } from "./song-like-dto";

export interface BaseSong {
  id: string;
  userId: string;
  user?: User | null;
  title: string;
  s3Key: string | null;
  thumbnailS3Key: string | null;
  status: string;
  instrumental: boolean;
  prompt: string | null;
  audioDuration: number | null;
  published: boolean;
  listenCount: number;
  likes: number;
  songUrl?: string;
  thumbnailUrl?: string;
  categories: string[];
  createdAt: string; // Represented as ISO strings from the API
  updatedAt: string;
}


export interface Song extends Omit<BaseSong, "likes"> {
  lyrics: string | null;
  likes: SongLike[];
  songDescription: string | null;
  lyricsDescription: string | null;
  guidanceScale: number | null;
  inferStep: number | null;
  seed: number | null;
}



