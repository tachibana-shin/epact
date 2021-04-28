import { Router } from "express";

export default interface loadRoutes {
   (path?: string): Router;
}