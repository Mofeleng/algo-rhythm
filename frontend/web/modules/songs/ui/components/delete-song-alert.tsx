import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { useDeleteSong } from "../../hooks/use-delete-song";
import { Loader } from "lucide-react";

interface DeleteSongAlertProps {
    songId: string;
    open: boolean;
    setOpen: (open: boolean) => void;
}

export function DeleteSongAlert({ songId, open, setOpen }: DeleteSongAlertProps) {

    const { mutate:handleDeleteSong, isPending } = useDeleteSong();
    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to delete this song?</AlertDialogTitle>
                    <AlertDialogDescription>This action cannot be undone</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel
                        disabled={isPending}
                    >
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        variant="destructive"
                        onClick={() => handleDeleteSong(songId, {
                            onSuccess: () => {
                                setOpen(false)
                            }
                        })}
                        disabled={isPending}
                    >
                        {
                            isPending ? <>
                                <Loader className="animate-spin" />
                                Deleting
                            </> : <>Delete</>
                        }
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}