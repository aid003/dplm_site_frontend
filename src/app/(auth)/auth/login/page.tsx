import type { Metadata } from "next";

import { SignInForm } from "@/features/auth/sign-in";

export const metadata: Metadata = {
  title: "Вход",
};

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const nextPath = typeof resolvedParams?.next === "string" ? resolvedParams.next : null;
  return <SignInForm redirectTo={nextPath} />;
}
