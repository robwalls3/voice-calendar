import type { Request, Response, Router } from 'express'
import { Router as ExpressRouter } from 'express'

type RouteHandler = {
  method: 'get' | 'post' | 'put' | 'delete' | 'patch'
  path?: string
  handler: (req: Request, res: Response) => any
}

export type Route = RouteHandler | RouteHandler[]

export function makeRoute(route: Route): Router {
  const router = ExpressRouter()
  const handlers = Array.isArray(route) ? route : [route]

  for (const { method, path, handler } of handlers) {
    router[method](path ?? '/', handler)
  }

  return router
}