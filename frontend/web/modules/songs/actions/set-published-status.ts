
export async function setPublishedStatus(songId: string) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/songs/set-published-status`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ songId })
    });

    const result = await response.json() as { message: string; };

    return {
        ok: response.ok,
        message: result.message
    }
}