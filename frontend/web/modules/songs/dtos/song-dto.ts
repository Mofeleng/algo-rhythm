import { User } from "@/modules/auth/dtos/user-dto";
import { SongCategory } from "./song-categories-dto";
import { SongLike } from "./song-like-dto";

export interface Song {
  id: string;
  userId: string;
  user?: User | null;
  title: string;
  s3Key: string | null;
  thumbnailS3Key: string | null;
  status: string;
  instrumental: boolean;
  prompt: string | null;
  lyrics: string | null;
  songDescription: string | null;
  lyricsDescription: string | null;
  guidanceScale: number | null;
  inferStep: number | null;
  audioDuration: number | null;
  seed: number | null;
  published: boolean;
  listenCount: number;
  likes: SongLike[];
  songUrl?: string;
  thumbnailUrl?: string;
  songCategories: SongCategory[];
  createdAt: string; // Represented as ISO strings from the API
  updatedAt: string;
}

