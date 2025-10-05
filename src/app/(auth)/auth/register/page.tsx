import type { Metadata } from "next";

import { SignUpForm } from "@/features/auth/sign-up";

export const metadata: Metadata = {
  title: "Регистрация",
};

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function RegisterPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const nextPath = typeof resolvedParams?.next === "string" ? resolvedParams.next : null;
  return <SignUpForm redirectTo={nextPath} />;
}
