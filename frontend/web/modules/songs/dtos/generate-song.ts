export interface GenerateRequest {
    Prompt?: string;
    Lyrics?: string;
    SongDescription?: string;
    AudioDuration: number;
    LyricsDescription?: string;
    Instrumental?: boolean;
    GuidanceScale?: number;
    Seed: number;
    InferStep?: number;
    UserId: string;
    Title: string;
}

export interface GenerateResponse {
    message: string;
}