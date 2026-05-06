"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";
import { useGenerateSong } from "../../hooks/use-generate-song";
import { useSession } from "@/modules/auth/providers/auth-provider";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2Icon, MusicIcon, PlusIcon, Settings2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageLoading } from "@/components/page-loading";

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


export function CreateSongPanel() {
    const router = useRouter();
    const { status, user } = useSession();
    const { mutateAsync:generateSong, isPending:generating } = useGenerateSong();

    const [ mode, setMode ] = useState<"simple"|"custom">("simple");
    
    const [ songDescription, setSongDescription ] = useState<string>("");
    const [ instrumental, setInstrumental ] = useState<boolean>(false);
    const [ lyricsMode, setLyricsMode ] = useState<"auto"|"default">("default");
    const [ songLyrics, setSongLyrics ] = useState<string>("");
    const [ songStyles, setSongStyles ] = useState<string>("");
    const [guidanceScale, setGuidanceScale] = useState(15);
    const [inferSteps, setInferSteps] = useState(60);
    const [duration, setDuration] = useState(30); // Default to 30s
    const [seed, setSeed] = useState(-1); // -1 for random

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
            Prompt: mode === "simple" ? songDescription : songStyles,
            Lyrics: lyricsMode === "default" ? songLyrics : undefined,
            SongDescription: mode === "simple" ? songDescription : undefined,
            LyricsDescription: lyricsMode === "auto" ? songLyrics : undefined,
            GuidanceScale: guidanceScale,
            InferStep: inferSteps,
            AudioDuration: duration,
            Seed: seed === -1 ? Math.floor(Math.random() * 1000000) : seed,
            Instrumental: instrumental
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
        <div className="bg-muted/30 h-full flex flex-col">
                <div className="flex flex-col">
                     {     status === "loading" ? <PageLoading /> : (
            <>
            <div className=" p-4">
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
                            <Button variant="outline" size="sm" onClick={() => setMode("custom")}><PlusIcon className="mr-1" />Lyrics</Button>
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
                                            <PlusIcon className="mr-1"/> { i}
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
                                            <PlusIcon className="mr-1"/> { i}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
                 <div className="space-y-4 border-t pt-4 mt-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-2">
                    <Settings2Icon size={16} /> Generation Settings
                </div>
                
                <div className="space-y-3">
                    <div className="flex justify-between">
                        <Label className="text-xs">Creativity (Guidance: {guidanceScale})</Label>
                    </div>
                    <Slider 
                        value={[guidanceScale]} 
                        min={1} max={30} step={0.5} 
                        onValueChange={([v]) => setGuidanceScale(v)} 
                    />
                    <p className="text-[10px] text-muted-foreground">Higher = follows prompt strictly, Lower = more creative.</p>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between">
                        <Label className="text-xs">Quality (Steps: {inferSteps})</Label>
                    </div>
                    <Slider 
                        value={[inferSteps]} 
                        min={20} max={100} step={1} 
                        onValueChange={([v]) => setInferSteps(v)} 
                    />
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between">
                        <Label className="text-xs">Duration: {duration}s</Label>
                    </div>
                    <Slider 
                        value={[duration]} 
                        min={5} max={120} step={5} 
                        onValueChange={([v]) => setDuration(v)} 
                    />
                </div>
            </div>
            </div>

           

            <div className="border-t p-4 bg-muted/30 shrink-0">
                <Button
                    disabled={generating}
                    onClick={handleCreate}
                    className="w-full cursor-pointer bg-linear-to-r from-green-300 to-blue-300 hover:bg-linear-to-r hover:from-green-500 hover:to-blue-500 transition-all delay-100"
                >
                    { generating ? (
                        <>
                            <Loader2Icon className="animate-spin"/> Generating
                        </>
                    ): (
                        <>
                            <MusicIcon /> Generate
                        </>
                    )}
                </Button>
            </div>
        </>
        )}
                </div>
        </div>
    )
}