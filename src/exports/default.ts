import { Router } from "express";

import { useBoot } from "./boot";
import { useRouter } from "./router";

export type Configs = {
  readonly router: {
    // eslint-disable-next-line functional/no-return-void
    readonly extendRoutes: (router: Router) => void;
  };
  readonly boot: readonly string[];
};

export default function use(): Router {
  const router = Router();

  router.use(useBoot());
  router.use(useRouter());

  return router;
}
