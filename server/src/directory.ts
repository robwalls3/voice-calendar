import { makeRoute } from './handler.js'
import { entriesRoute } from './routes/entries/index'
import { parseRoute } from './routes/parse/index'

export const routes = {
  '/entries': makeRoute(entriesRoute),
  '/parse': makeRoute(parseRoute)
}