"use client";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Music, Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSession } from "@/modules/auth/providers/auth-provider";
import { useRouter } from "next/navigation";
import { PageLoading } from "@/components/page-loading";
import { useGenerateSong } from "../../hooks/use-generate-song";

const inspirationTags = [
    "Driving rock anthem",
    "Lo-fi hip hop",
    "Acoustic ballad",
    "80s synth-pop",
    "Epic moview score"
];

const styleTags = [
    "Industrial rave",
    "Soulful vocals",
    "Ambient pads",
    "Funky guitar",
    "Electronic beats",
    "G funk",
    "Afro beats"
]

export function SongPanel() {
    const router = useRouter();
    const { status, user } = useSession();
    const { mutateAsync:generateSong, isPending:generating } = useGenerateSong();

    const [ mode, setMode ] = useState<"simple"|"custom">("simple");
    
    const [ songDescription, setSongDescription ] = useState<string>("");
    const [ instrumental, setInstrumental ] = useState<boolean>(false);
    const [ lyricsMode, setLyricsMode ] = useState<"auto"|"default">("default");
    const [ songLyrics, setSongLyrics ] = useState<string>("");
    const [ songStyles, setSongStyles ] = useState<string>("");

    const resetForm = () => {
        setSongDescription("");
        setInstrumental(false);
        setSongLyrics("");
        setSongStyles("");
    }
    const handleCreate = async () => {
        if (mode === "simple" && !songDescription.trim()) {
            toast.error("Please describe your song before creating");
            return;
        }
        if (mode === "custom" && !songStyles.trim()) {
            toast.error("Please describe what kind of song you would like");
            return;
        }

        if (!user) {
            toast.error("Please sign in before generating a song");
            return;
        };
        const title = `audio-`.concat((Math.random() * 10000).toString());
        const request = {
            Title: title,
            UserId: user.id,
            Prompt: songStyles,
            Lyrics: lyricsMode === "default" ? songLyrics : undefined,
            SongDescription: songDescription,
            LyricsDescription: lyricsMode === "auto" ? songLyrics : undefined,
        }

        console.log(request);
        await generateSong(request);

        resetForm();

    } 
    const handlePopulateInspiration = (tag: string) => {
        const currentTags = songDescription.split(", ").map((s) =>
            s.trim()
        ).filter((s) => s);

        if (!currentTags.includes(tag)) {
            if (songDescription.trim() === "") {
                setSongDescription(tag);
            } else {
                setSongDescription(songDescription + ", " + tag);
            }
        }
    }
    const handlePopulateStyleTags = (tag: string) => {
        const currentTag = songStyles.split(", ").map((s) =>
            s.trim()
        ).filter((s) => s);

        if (!currentTag.includes(tag)) {
            if (songStyles.trim() === "") {
                setSongStyles(tag);
            } else {
                setSongStyles(songStyles + ", " + tag);
            }
        }
    }
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/sign-in");
        }
    }, [status, router]);


    return (
    <div className="bg-muted/30 flex w-full flex-col border-r lg:w-80">
        {     status === "loading" ? <PageLoading /> : (
            <>
            <div className="flex-1 overflow-y-auto p-4">
                <Tabs value={mode} onValueChange={(value) => setMode(value as "simple" | "custom")}>
                    <TabsList className="w-full">
                        <TabsTrigger value="simple">Simple</TabsTrigger>
                        <TabsTrigger value="custom">Custom</TabsTrigger>
                    </TabsList>
                    <TabsContent value="simple" className="mt-6 space-y-6">
                        <div className="flex flex-col gap-3">
                            <label className="text-sm font-medium">Describe the song</label>
                            <Textarea
                                value={songDescription}
                                onChange={(e) => { setSongDescription(e.target.value) }}
                                className="resize-none min-h-30" 
                                placeholder="A 432Hz classic instrumental beat for studying"
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Button variant="outline" size="sm" onClick={() => setMode("custom")}><Plus className="mr-1" />Lyrics</Button>
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium">Instrimental</label>
                                <Switch checked={instrumental} onCheckedChange={(c) => setInstrumental(c)}/>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3">
                            <label className="text-sm font-medium">Inspiration</label>
                            <div className="w-full overflow-x-auto whitespace-nowrap">
                                <div className="flex gap-2 pb-2">
                                    { inspirationTags.map((i) => (
                                        <Button
                                            key={i}
                                            variant="outline"
                                            size="sm"
                                            className="h-7 shrink-0 bg-transparent text-xs"
                                            onClick={() => handlePopulateInspiration(i)}
                                        >
                                            <Plus className="mr-1"/> { i}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="custom" className="mt-6 space-y-6">
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium">Lyrics</label>
                                <div className="flex items-center gap-1">
                                    <Button
                                        className="h-7 text-sm"
                                        onClick={() => {
                                            setLyricsMode("auto");
                                            setSongLyrics("")
                                        }}
                                        variant={lyricsMode === "auto" ? "secondary" : "ghost"}
                                    >
                                        Auto
                                    </Button>

                                    <Button
                                        className="h-7 text-sm"
                                        onClick={() => {
                                            setLyricsMode("default");
                                            setSongLyrics("")
                                        }}
                                        variant={lyricsMode === "default" ? "secondary" : "ghost"}
                                    >
                                        Default
                                    </Button>
                                </div>
                            </div>
                            <Textarea 
                                value={songLyrics}
                                onChange={(e) => setSongLyrics(e.target.value)}
                                className="min-h-25 resize-none"
                                placeholder={lyricsMode === "default" ? "Write your lyrics here": "Describe the lyrics you would like generated"}
                            />
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium">Instrumental</label>
                                <Switch checked={instrumental} onCheckedChange={(c) => setInstrumental(c)}/>
                            </div>
                        </div>
                        
                        <div className="flex flex-col gap-3">
                            <label className="text-sm font-medium">Styles</label>
                            <Textarea 
                                value={songStyles}
                                onChange={(e) => setSongStyles(e.target.value)}
                                className="min-h-15 resize-none"
                                placeholder="Enter song styles"
                            />
                            <div className="w-full overflow-x-auto whitespace-nowrap">
                                <div className="flex gap-2 pb-2">
                                    { styleTags.map((i) => (
                                        <Badge
                                            key={i}
                                            variant="secondary"
                                            className="h-7 shrink-0 bg-secondary/80 flex cursor-pointer text-xs"
                                            onClick={() => handlePopulateStyleTags(i)}
                                        >
                                            <Plus className="mr-1"/> { i}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
            <div className="border-t p-4">
                <Button
                    disabled={generating}
                    onClick={handleCreate}
                    className="w-full cursor-pointer bg-linear-to-r from-green-300 to-blue-300 hover:bg-linear-to-r hover:from-green-500 hover:to-blue-500 transition-all delay-100"
                >
                    { generating ? (
                        <>
                            <Loader2 className="animate-spin"/> Generating
                        </>
                    ): (
                        <>
                            <Music /> Generate
                        </>
                    )}
                </Button>
            </div>
        </>
        )}
    </div>
    )
}