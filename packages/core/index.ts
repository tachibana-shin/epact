import { boot } from "./createBoot";
import createBoot from "./createBoot";
import { page, router } from "./createPage";
import createPage, { installMiddleware } from "./createPage";
import defineConfig, { DefineConfig } from "./defineConfig";
import parsePrefixRouter from "./utils/parsePrefixRouter";

export {
  createBoot,
  createPage,
  defineConfig,
  boot,
  page,
  router,
  DefineConfig,
  installMiddleware,
  parsePrefixRouter,
};
