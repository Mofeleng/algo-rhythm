"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {

  const router = useRouter();

  const [ message, setMessage ] = useState<string>();
  const [ authenticated, setAuthenticated] = useState(false);
  const [ user, setUser ] = useState<any>();

  const onLogout = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include"
    });

    if (res.ok) {
      router.push("/auth/sign-in");
    }
  }

  const generateSong = async () => {
    if (!user) {
      return;
    }
    const userId = user.id ?? "";

    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/jobs/generate-song`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      method: "POST",
    });

    if (res.ok) {
      console.log(await res.json());
    }
  };
  useEffect(() => {
    (
      async () => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/auth/user`, {
          credentials: "include"
        });

        const result = await res.json();
        if (res.ok) {
          setMessage(`Hello ${result?.user?.name}`);
          setUser(result?.user);
          setAuthenticated(true);
        }
        else {
          setMessage("You are not authenticated")
        }
      }
    )();
  })
  return (
    <main>
        { message }

        { authenticated ? (
          <>
          <button onClick={onLogout}>Logout</button>

          <button onClick={generateSong}>New song</button>
          </>
        ): (
          <div className="flex flex-row gap-4">
            <Link href="/auth/sign-in">Sign in</Link>
            <Link href="/auth/sign-up">Sign up</Link>
          </div>
        )}
    </main>
  );
}
