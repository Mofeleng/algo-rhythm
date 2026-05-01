import { postApiRequest } from "@/lib/api-request";
import { useMutation } from "@tanstack/react-query";
import { SignInDtoType } from "../dtos/sign-in-dto";

export function useSignIn() {
    return useMutation({
        mutationFn: (values: SignInDtoType) => postApiRequest(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/auth/login`, JSON.stringify(values)),
    })
}