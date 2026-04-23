"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { signInDto, SignInDtoType } from "../../dtos/sign-in-dto";
import { Card, CardHeader, CardDescription, CardContent, CardTitle, CardFooter } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "../../providers/auth-provider";
import { useEffect } from "react";

export const SignInView = () => {
    const router = useRouter();
    const { status } = useSession();

    const form = useForm({
        resolver: zodResolver(signInDto),
        defaultValues: {
            email: "",
            password: ""
        }
    });

    const onSubmit = async (values: SignInDtoType) => {
        await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/auth/login`, {
            method: "POST",
            credentials: "include", //Retrieve and store login credentials
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(values)
        });

        router.push("/")
    }

    useEffect(() => {
        if (status === "authenticated") {
            router.push("/dashboard")
        }
    }, [status, router])

    return (
         <Card className='max-w-xl mx-auto w-full'>
            <CardHeader>
                <CardTitle>Welcome back</CardTitle>
                <CardDescription>Login to your account to pick up where you left off</CardDescription>
            </CardHeader>
            <CardContent>
                <form id="login-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <FieldGroup>
                        <Controller
                            name='email'
                            control={form.control}
                            render={( { field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor='email'>Email address</FieldLabel>
                                    <Input
                                        { ...field }
                                        id='email'
                                        aria-invalid={fieldState.invalid}
                                        placeholder='john@example.com'
                                    />
                                    { fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />

                        <Controller
                            name='password'
                            control={form.control}
                            render={( { field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor='password'>Password</FieldLabel>
                                    <Input
                                        { ...field }
                                        id='password'
                                        type='password'
                                        aria-invalid={fieldState.invalid}
                                        placeholder='********'
                                    />
                                    { fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />
                    </FieldGroup>
                    <Field orientation="horizontal" className="w-full flex flex-row justify-end">
                        <Button type="submit">
                            Sign in
                        </Button>
                    </Field>
                </form>
            </CardContent>
            <CardFooter className='block space-y-3'>
                <p className="text-muted-foreground text-sm">Don&apos;t have an account? <Link href="/auth/sign-up" className='text-primary underline'>sign up</Link> instead</p>
            </CardFooter>
        </Card>
    )
}