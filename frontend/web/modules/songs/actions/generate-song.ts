import { GenerateRequest, GenerateResponse } from "../dtos/generate-song";



export async function generateSong(generateRequest: GenerateRequest) {
    console.log(generateRequest);
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/jobs/generate-song`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ ...generateRequest })
    });

   const data = await response.json();
    console.log(data);
   return data as GenerateResponse;
}