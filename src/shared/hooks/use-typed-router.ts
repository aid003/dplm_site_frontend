'use client'

import { useRouter } from "next/navigation"
import { href, type RouteKey, type RouteParams } from "@/shared/lib/routes"

type Primitive = string | number | boolean

type NavOptions<K extends RouteKey> = RouteParams<K> extends undefined
  ? { params?: undefined; query?: Record<string, Primitive | undefined> }
  : { params: RouteParams<K>; query?: Record<string, Primitive | undefined> }

export function useTypedRouter() {
  const router = useRouter()

  function push<K extends RouteKey>(key: K, options?: NavOptions<K>) {
    router.push(href(key, options as never))
  }

  function replace<K extends RouteKey>(key: K, options?: NavOptions<K>) {
    router.replace(href(key, options as never))
  }

  function prefetch<K extends RouteKey>(key: K, options?: NavOptions<K>) {
    router.prefetch(href(key, options as never))
  }

  return { push, replace, prefetch }
}


