type Primitive = string | number | boolean

type ParamRecord = Record<string, Primitive>

type RouteDefNoParams = {
  pattern: string
  build: () => string
}

type RouteDefWithParams<P extends ParamRecord> = {
  pattern: string
  build: (params: P) => string
}

export const ROUTES = {
  home: {
    pattern: "/",
    build: () => "/",
  } satisfies RouteDefNoParams,

  project: {
    pattern: "/project",
    build: () => "/project",
  } satisfies RouteDefNoParams,

  codeAnalysis: {
    pattern: "/code-analysis",
    build: () => "/code-analysis",
  } satisfies RouteDefNoParams,

  docs: {
    pattern: "/docs",
    build: () => "/docs",
  } satisfies RouteDefNoParams,

  settings: {
    pattern: "/settings",
    build: () => "/settings",
  } satisfies RouteDefNoParams,

  authLogin: {
    pattern: "/auth/login",
    build: () => "/auth/login",
  } satisfies RouteDefNoParams,

  authRegister: {
    pattern: "/auth/register",
    build: () => "/auth/register",
  } satisfies RouteDefNoParams,

  // Пример с параметрами:
  // user: {
  //   pattern: "/users/:id",
  //   build: (p: { id: string }) => `/users/${p.id}`,
  // } satisfies RouteDefWithParams<{ id: string }>,
} as const

export type RouteKey = keyof typeof ROUTES
export type RouteParams<K extends RouteKey> =
  (typeof ROUTES)[K] extends RouteDefNoParams
    ? undefined
    : (typeof ROUTES)[K] extends RouteDefWithParams<infer P>
      ? P
      : never

function encodeQueryValue(value: Primitive): string {
  return encodeURIComponent(String(value))
}

export function withQuery(base: string, query?: Record<string, Primitive | undefined>): string {
  if (!query) return base
  const entries = Object.entries(query).filter(([, v]) => v !== undefined) as [
    string,
    Primitive
  ][]
  if (entries.length === 0) return base
  const qs = entries.map(([k, v]) => `${encodeURIComponent(k)}=${encodeQueryValue(v)}`).join("&")
  return `${base}?${qs}`
}

type OptionsNoParams = { params?: undefined; query?: Record<string, Primitive | undefined> }
type OptionsWithParams<P extends ParamRecord> = { params: P; query?: Record<string, Primitive | undefined> }

export function href<K extends RouteKey>(key: K, options?: OptionsNoParams): string
export function href<K extends RouteKey>(key: K, options: OptionsWithParams<RouteParams<K> extends ParamRecord ? RouteParams<K> : never>): string
export function href<K extends RouteKey>(
  key: K,
  options?: OptionsNoParams | OptionsWithParams<ParamRecord>
): string {
  const def = ROUTES[key] as RouteDefNoParams | RouteDefWithParams<ParamRecord>
  const path = ("params" in (options ?? {}))
    ? (def as RouteDefWithParams<ParamRecord>).build((options as OptionsWithParams<ParamRecord>).params)
    : (def as RouteDefNoParams).build()
  return withQuery(path, (options as OptionsNoParams | OptionsWithParams<ParamRecord>)?.query)
}

export const PATH = {
  home: ROUTES.home.build(),
  project: ROUTES.project.build(),
  codeAnalysis: ROUTES.codeAnalysis.build(),
  docs: ROUTES.docs.build(),
  settings: ROUTES.settings.build(),
  authLogin: ROUTES.authLogin.build(),
  authRegister: ROUTES.authRegister.build(),
} as const
