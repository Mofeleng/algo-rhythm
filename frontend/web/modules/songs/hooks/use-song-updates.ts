import { useEffect, useState } from "react"
import * as signalR from "@microsoft/signalr";

interface SongUpdate {
    songId: string;
    status: string;
    songUrl: string | null;
    thumbnailUrl: string | null;
}

export function useSongUpdates(userId: string | undefined | null) {
    const [ connection, setConnection ] = useState<signalR.HubConnection | null>(null);
    const [ latestUpdate , setLatestUpdate] = useState<SongUpdate|null>(null);

    useEffect(() => {
        if (!userId) return;

        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl(`${process.env.NEXT_PUBLIC_BACKEND_API}/song-hub`)
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Information)
            .build();

        setConnection(newConnection);
    }, [userId]);

    useEffect(() => {
        if (connection) {
            connection.start()
                .then(() => {
                    console.log("Connected to signal R");
                    connection.invoke("JoinUserGroup", userId?.toString());

                    connection.on("RecieveSongUpdate", (update) => {
                        setLatestUpdate(update);
                    });
                })
                .catch(e => console.error("Connection failed", e));

            return () => {
                connection.stop();
            }
        }
    }, [ connection, userId ]);

    return latestUpdate;
}