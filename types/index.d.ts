import { Router } from "express";

export default interface loadRoutes {
  (path?: string): Router;
}

export function registerRoute(
  path: string | Router,
  route:
    | Router
    | { (request: Request, response: Response, next?: NextFunction): void }
    | Object
): Router;

export const METHODS: string[];
