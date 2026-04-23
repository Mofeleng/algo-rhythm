import z from "zod";
import { baseAuthDto } from "./base-auth-dto";

export const signUpDto = baseAuthDto.extend({
    name: z.string(),
    confirmPassword: z.string()
}).superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
        ctx.addIssue("Passwords do not match");
    }
});

export type SignUpDtoType = z.infer<typeof signUpDto>;