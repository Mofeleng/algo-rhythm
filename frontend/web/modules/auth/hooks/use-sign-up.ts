import { useMutation } from "@tanstack/react-query";
import { SignUpDtoType } from "../dtos/sign-up-dto";
import { postApiRequest } from "@/lib/api-request";

export function useSignUp() {
    return useMutation({
        mutationFn: (values:Partial<SignUpDtoType>) => postApiRequest(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/auth/register`, JSON.stringify(values))
    })
}