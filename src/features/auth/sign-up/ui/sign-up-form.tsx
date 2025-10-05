"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { useSignUpMutation } from "@/features/auth/sign-up/model/use-sign-up";
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
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

type SignUpFormValues = typeof DEFAULT_VALUES;

type SignUpFormProps = {
  redirectTo?: string | null;
};

export function SignUpForm({ redirectTo }: SignUpFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const targetRedirect = useMemo(
    () => safeRedirect(redirectTo ?? ROUTES.home.build(), ROUTES.home.build()),
    [redirectTo]
  );
  const form = useForm<SignUpFormValues>({
    defaultValues: DEFAULT_VALUES,
    mode: "onChange",
  });

  const { mutateAsync, isPending } = useSignUpMutation();

  const onSubmit = async (values: SignUpFormValues) => {
    const { confirmPassword, ...payload } = values;
    void confirmPassword;
    setServerError(null);
    try {
      await mutateAsync(payload);
      router.replace(targetRedirect);
    } catch (error) {
      if (error instanceof HttpError) {
        setServerError(error.message);
      } else {
        setServerError("Не получилось зарегистрироваться. Повторите попытку позже.");
      }
    }
  };

  const passwordValue = form.watch("password");

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Регистрация</h1>
        <p className="text-sm text-muted-foreground">
          Создайте аккаунт, чтобы получить полный доступ к приложению.
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Имя</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Имя и фамилия"
                    disabled={isPending}
                    autoComplete="name"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
              required: "Придумайте пароль",
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
                    autoComplete="new-password"
                    disabled={isPending}
                    required
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="confirmPassword"
            rules={{
              required: "Повторите пароль",
              validate: (value) =>
                value === passwordValue || "Пароли не совпадают",
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Подтверждение пароля</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    disabled={isPending}
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
            {isPending ? "Регистрируем..." : "Создать аккаунт"}
          </Button>
        </form>
      </Form>
      <p className="text-center text-sm text-muted-foreground">
        Уже есть аккаунт?{" "}
        <TypedLink
          route="authLogin"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Войти
        </TypedLink>
      </p>
    </div>
  );
}
