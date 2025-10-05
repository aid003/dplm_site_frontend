"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { useSignInMutation } from "@/features/auth/sign-in/model/use-sign-in";
import { Button } from "@/shared/ui/components/button";
import { Input } from "@/shared/ui/components/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/components/form";
import { HttpError } from "@/shared/api/http-client";
import { ROUTES } from "@/shared/lib/routes";
import { safeRedirect } from "@/shared/lib/navigation";
import { TypedLink } from "@/shared/ui/components/typed-link";

const DEFAULT_VALUES = {
  email: "",
  password: "",
};

type SignInFormValues = typeof DEFAULT_VALUES;

type SignInFormProps = {
  redirectTo?: string | null;
};

export function SignInForm({ redirectTo }: SignInFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const targetRedirect = useMemo(
    () => safeRedirect(redirectTo ?? ROUTES.home.build(), ROUTES.home.build()),
    [redirectTo]
  );
  const form = useForm<SignInFormValues>({
    defaultValues: DEFAULT_VALUES,
    mode: "onChange",
  });

  const { mutateAsync, isPending } = useSignInMutation();

  const onSubmit = async (values: SignInFormValues) => {
    setServerError(null);
    try {
      await mutateAsync(values);
      router.replace(targetRedirect);
    } catch (error) {
      if (error instanceof HttpError) {
        setServerError(error.message);
      } else {
        setServerError("Не удалось выполнить вход. Попробуйте позже.");
      }
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Вход</h1>
        <p className="text-sm text-muted-foreground">
          Введите свои данные, чтобы продолжить работу в системе.
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            name="email"
            rules={{
              required: "Укажите эл. почту",
              pattern: {
                value: /.+@.+\..+/,
                message: "Некорректный формат почты",
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Электронная почта</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="name@example.com"
                    autoComplete="email"
                    disabled={isPending}
                    required
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="password"
            rules={{
              required: "Введите пароль",
              minLength: {
                value: 6,
                message: "Минимальная длина — 6 символов",
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Пароль</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    disabled={isPending}
                    minLength={6}
                    required
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {serverError ? (
            <p className="text-sm text-destructive text-center">{serverError}</p>
          ) : null}

          <Button
            type="submit"
            className="w-full"
            disabled={isPending || !form.formState.isValid}
          >
            {isPending ? "Входим..." : "Войти"}
          </Button>
        </form>
      </Form>
      <p className="text-center text-sm text-muted-foreground">
        Нет аккаунта?{" "}
        <TypedLink
          route="authRegister"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Зарегистрируйтесь
        </TypedLink>
      </p>
    </div>
  );
}
