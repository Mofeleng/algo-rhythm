import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useRenameSong } from "../../hooks/use-rename-song";
import { Loader } from "lucide-react";
import { toast } from "sonner";

interface RenameSongModalProps {
    songId: string;
    prevName: string;
    open: boolean;
    setOpen: (open: boolean) => void;
}

export function RenameSongModal({ songId, open, prevName, setOpen }:RenameSongModalProps) {

    const { mutate:handleRenameSong, isPending } = useRenameSong();
    const [ newName, setNewName ] = useState<string>(prevName);

    const onRenameSong = () => {
        if (!newName) return;

        handleRenameSong({ songId, newName }, {
            onSuccess: () => {
                setOpen(false);
            },
            onError: (err) => {
                toast.error("Something went wrong " + err.message)
            }
        })
    }

    return (
        <Dialog
            open={open}
            onOpenChange={setOpen}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Rename song</DialogTitle>
                    <DialogDescription></DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                        <label>Title</label>
                        <Input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                        />  
                    </div>
                    <div className="w-full flex flex-row justify-end gap-4">
                        <Button 
                            variant="outline"
                            disabled={isPending}
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={onRenameSong}
                            disabled={isPending}
                        >
                            {
                                isPending ? <>
                                    <Loader className="animate-spin" />
                                    Saving
                                </> : <>Save</>
                            }
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}