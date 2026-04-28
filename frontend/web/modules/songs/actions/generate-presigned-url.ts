interface GeneratePresignedUrlResponse {
    url?: string;
}

export async function generatePresignedUrl(r2Key: string) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/songs/generate-presigned-url`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ r2Key })
    });

    const result = await response.json() as GeneratePresignedUrlResponse;

    if (!response.ok || !result.url) {
        return {
            ok: false,
            message: "Could not generate presigned url",
            body: undefined
        }
    }

    return {
        ok: true,
        message: "Generated presigned url",
        body: result.url
    }
}