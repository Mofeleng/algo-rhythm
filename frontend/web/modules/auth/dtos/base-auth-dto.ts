import z from "zod";

export const baseAuthDto = z.object({
    email: z.string(),
    password: z.string()
});

export type BaseAuthDtoType = z.infer<typeof baseAuthDto>;