export interface GenerateRequest {
    Prompt?: string;
    Lyrics?: string;
    SongDescription?: string;
    LyricsDescription?: string;
    Instrumental?: boolean;
    GuidanceScale?: number;
    UserId: string;
    Title: string;
}

export interface GenerateResponse {
    message: string;
}