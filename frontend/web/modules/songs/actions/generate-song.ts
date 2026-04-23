
interface GenerateRequest {
    Prompt?: string;
    Lyrics?: string;
    SongDescription?: string;
    LyricsDescription?: string;
    Instrumental?: boolean;
    GuidanceScale?: number;
    UserId: string;
    Title: string;
}

interface GenerateResponse {
    message: string;
}

export async function generateSong(generateRequest: GenerateRequest) {

    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/jobs/generate-song`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ ...generateRequest })
    });

    const result:GenerateResponse = await response.json();

    if (response.ok) {
        return {
            ok: true,
            message: result.message
        }
    }

    return {
        ok: false,
        message: result.message
    }
}