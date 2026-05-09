import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import { useGenerateSong } from "../../hooks/use-generate-song";
import { Loader2Icon, MusicIcon, PlusIcon, Settings2Icon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

interface NewSongModalProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    userId: string;
}


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

const newSongSchema = z.object({
    Prompt: z.string().optional(),
    Lyrics: z.string().optional(),
    SongDescription: z.string().optional(),
    AudioDuration: z.number(),
    LyricsDescription: z.string().optional(),
    Instrumental: z.boolean().optional(),
    GuidanceScale: z.number(),
    Seed: z.number(),
    InferStep: z.number(),
    SongStyles: z.string().optional(),
    UserId: z.string(),
    Title: z.string(),
});

export function NewSongModal({ open, setOpen, userId }:NewSongModalProps) {
    const { mutate:generateSong, isPending:loading } = useGenerateSong();

    const form = useForm<z.infer<typeof newSongSchema>>({
        resolver: zodResolver(newSongSchema),
        defaultValues: {
            Title: "",
            UserId: userId,
            SongDescription: "",
            SongStyles: "",
            Lyrics: "",
            Instrumental: false,
            AudioDuration: 30,
            GuidanceScale: 15,
            InferStep: 20,
            Seed: -1,
            },
        });

    const mode = form.watch("SongStyles") ? "custom" : "simple"; 
    const [lyricsMode] = form.watch("LyricsDescription") ? ["auto"] : ["default"];

    const onSubmit = async (values: z.infer<typeof newSongSchema>) => {
        if (mode === "simple" && !values.SongDescription?.trim()) {
            form.formState.errors.SongDescription!.message = "Please describe your song before generating";
            return;
        } if (mode === "custom" && !values.SongStyles?.trim()) {
            form.formState.errors.SongStyles!.message = "Please describe what kind of song you would like before generating";
            return;
        }


        await generateSong({
            ...values,
            Title: values.Title ?? `audio-${Math.random() * 10000000}`, 
            Prompt: mode === "simple" ? values.SongDescription: values.SongStyles,
            Seed: values.Seed === -1 ? Math.floor(Math.random() * 1000000) : values.Seed
        }, {
          onError: (err) => {
            toast.error("oopps. " + err.message)
          }
        });

        form.reset();
        setOpen(false);
    }

    const handleAppendTag = (field: "SongDescription" | "SongStyles", tag: string) => {
        const currentValue = form.getValues(field) || "";
        const tags = currentValue.split(",").map((t) => t.trim()).filter(Boolean);
        if (!tags.includes(tag)) {
        form.setValue(field, currentValue ? `${currentValue}, ${tag}` : tag);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden flex flex-col h-[90vh] max-h-[90vh]">
        <DialogHeader className="p-6 pb-0 shrink-0">
          <DialogTitle>Generate a new song</DialogTitle>
          <DialogDescription>
            Choose between a simple prompt or custom controls.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6 pt-2 overflow-hidden min-h-0">
          <form id="song-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-sm">Song Title</Label>
              <Input
                { ...form.register("Title") }
              />
            </div>
            <Tabs defaultValue="simple" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="simple">Simple</TabsTrigger>
                <TabsTrigger value="custom">Custom</TabsTrigger>
              </TabsList>

              <TabsContent value="simple" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Describe the song</Label>
                  <Textarea
                    {...form.register("SongDescription")}
                    placeholder="A 432Hz classic instrumental beat for studying"
                    className="resize-none min-h-[100px]"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="inst-simple">Instrumental</Label>
                    <Switch
                      id="inst-simple"
                      checked={form.watch("Instrumental")}
                      onCheckedChange={(v) => form.setValue("Instrumental", v)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Inspiration</Label>
                  <div className="flex flex-wrap gap-2">
                    {inspirationTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="cursor-pointer hover:bg-secondary"
                        onClick={() => handleAppendTag("SongDescription", tag)}
                      >
                        <PlusIcon className="w-3 h-3 mr-1" /> {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="custom" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Lyrics</Label>
                    <div className="flex bg-muted rounded-md p-1 gap-1">
                      <Button
                        type="button"
                        variant={form.watch("LyricsDescription") ? "secondary" : "ghost"}
                        size="sm"
                        className="h-7 px-2"
                        onClick={() => {
                            form.setValue("Lyrics", "");
                            form.setValue("LyricsDescription", "Generated lyrics");
                        }}
                      >
                        Auto
                      </Button>
                      <Button
                        type="button"
                        variant={!form.watch("LyricsDescription") ? "secondary" : "ghost"}
                        size="sm"
                        className="h-7 px-2"
                        onClick={() => form.setValue("LyricsDescription", undefined)}
                      >
                        Manual
                      </Button>
                    </div>
                  </div>
                  <Textarea
                    {...form.register(form.watch("LyricsDescription") ? "LyricsDescription" : "Lyrics")}
                    placeholder={form.watch("LyricsDescription") ? "Describe the theme..." : "Enter your lyrics..."}
                    className="min-h-[100px] resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Styles</Label>
                  <Textarea
                    {...form.register("SongStyles")}
                    placeholder="Enter styles separated by commas"
                    className="min-h-[60px] resize-none"
                  />
                  <div className="flex flex-wrap gap-2">
                    {styleTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => handleAppendTag("SongStyles", tag)}
                      >
                        <PlusIcon className="w-3 h-3 mr-1" /> {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Global Settings */}
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <Settings2Icon size={16} /> Generation Settings
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label className="text-xs">Creativity: {form.watch("GuidanceScale")}</Label>
                </div>
                <Slider
                  value={[form.watch("GuidanceScale")]}
                  min={1} max={50} step={0.5}
                  onValueChange={([v]) => form.setValue("GuidanceScale", v)}
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label className="text-xs">Step: { form.watch("InferStep") }</Label>
                </div>
                <Slider
                  value={[form.watch("InferStep")]}
                  min={1} max={130} step={1}
                  onValueChange={([v]) => form.setValue("InferStep", v)}

                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label className="text-xs">Duration: {form.watch("AudioDuration")}s</Label>
                </div>
                <Slider
                  value={[form.watch("AudioDuration")]}
                  min={5} max={120} step={5}
                  onValueChange={([v]) => form.setValue("AudioDuration", v)}
                />
              </div>
            </div>
          </form>
        </ScrollArea>

        <DialogFooter className="p-6 bg-muted/30 border-t">
          <Button variant="outline" onClick={() => setOpen(false)} type="button">
            Cancel
          </Button>
          <Button
            type="submit"
            form="song-form"
            disabled={loading}
            className="bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600"
          >
            {loading ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                Generating
              </>
            ) : (
              <>
                <MusicIcon className="mr-2 h-4 w-4" />
                Generate
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    )
}