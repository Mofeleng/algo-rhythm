"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpDto, SignUpDtoType } from '../../dtos/sign-up-dto';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSession } from '../../providers/auth-provider';

const SignUpView = () => {
    const router = useRouter();
    const { status } = useSession();
    const form = useForm({
        resolver: zodResolver(signUpDto),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: ""
        }
    });

    const onSubmit = async ({ name, email, password }:SignUpDtoType) => {
        await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name, email, password })
        });

        router.push("/auth/sign-in");
    }

    useEffect(() => {
        if (status === "authenticated") {
            router.push("/dashboard")
        }
    }, [status, router])

  return (
    <Card className='max-w-xl mx-auto w-full'>
        <CardHeader>
            <CardTitle>Welcome to Algo Rhythm</CardTitle>
            <CardDescription>Create your account to start making AI generated hits</CardDescription>
        </CardHeader>
        <CardContent>
            <form id='register-form' className='space-y-5' onSubmit={form.handleSubmit(onSubmit)}>
                <FieldGroup>
                    <Controller
                        name='name'
                        control={form.control}
                        render={( { field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor='user-name'>Full name</FieldLabel>
                                <Input
                                    { ...field }
                                    id='user-name'
                                    aria-invalid={fieldState.invalid}
                                    placeholder='John Doe'
                                />
                                { fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    />

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

                    <Controller
                        name='confirmPassword'
                        control={form.control}
                        render={( { field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor='confirm-password'>Confirm Password</FieldLabel>
                                <Input
                                    { ...field }
                                    id='confirm-password'
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

                <Field orientation="horizontal" className='w-full flex flex-row justify-end'>
                    <Button type='submit'>
                        Sign up
                    </Button>
                </Field>
            </form>
        </CardContent>
        <CardFooter className='block space-y-5'>
            <p className="text-muted-foreground text-sm">Already have an account? <Link href="/auth/sign-in" className='text-primary underline'>sign in</Link> instead</p>
        </CardFooter>
    </Card>
  )
}

export default SignUpView