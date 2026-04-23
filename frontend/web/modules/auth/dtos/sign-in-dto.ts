import z from "zod";
import { baseAuthDto } from "./base-auth-dto";

export const signInDto = baseAuthDto;

export type SignInDtoType = z.infer<typeof signInDto>;
