import { Router } from "express";

import { useBoot } from "./boot";
import { useRouter } from "./router";

export default function useAll(): Router {
  const router = Router();

  router.use(useBoot());
  router.use(useRouter());

  return router;
}
