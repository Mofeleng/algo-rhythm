import { useMutation } from "@tanstack/react-query"

export const useLogout = () => {
    return useMutation({
        mutationFn: async () => {
             await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/auth/logout`, {
                method: "POST",
                credentials: "include"
            });
        }
    })
}