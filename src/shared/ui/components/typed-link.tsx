'use client'

import type { JSX } from "react"
import Link, { type LinkProps } from "next/link"
import { cn } from "@/shared/lib/utils"
import { href, type RouteKey, type RouteParams } from "@/shared/lib/routes"

type Primitive = string | number | boolean

type BaseProps = Omit<JSX.IntrinsicElements["a"], "href"> & {
  className?: string
}

type TypedLinkProps<K extends RouteKey> = BaseProps & {
  route: K
  params?: RouteParams<K> extends undefined ? undefined : RouteParams<K>
  query?: Record<string, Primitive | undefined>
  prefetch?: LinkProps["prefetch"]
}

export function TypedLink<K extends RouteKey>({
  route,
  params,
  query,
  className,
  prefetch,
  children,
  ...rest
}: TypedLinkProps<K>): JSX.Element {
  const to = href(route, (params ? { params, query } : { query }) as never)
  return (
    <Link href={to} prefetch={prefetch} className={cn(className)} {...rest}>
      {children}
    </Link>
  )
}

type NavLinkProps<K extends RouteKey> = TypedLinkProps<K> & {
  isActive?: boolean
}

export function NavLink<K extends RouteKey>({ isActive, className, ...props }: NavLinkProps<K>): JSX.Element {
  return (
    <TypedLink
      {...props}
      className={cn(
        "rounded-md px-2 py-1 text-sm",
        isActive ? "bg-accent text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground",
        className
      )}
    />
  )
}


