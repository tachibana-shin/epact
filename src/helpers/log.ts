/* eslint-disable @typescript-eslint/no-explicit-any */
import chalk from "chalk";

export function warn(msg: any) {
  if (typeof msg === "string") {
    console.warn(chalk.yellow(`[express-warn]: ${msg}`));
  } else {
    console.warn(msg);
  }
}

export function error(msg: any) {
  if (typeof msg === "string") {
    console.warn(chalk.yellow(`[express-error]: ${msg}`));
  } else {
    console.warn(msg);
  }
}

export function log(msg: any) {
  if (typeof msg === "string") {
    console.warn(chalk.yellow(`[express-log]: ${msg}`));
  } else {
    console.warn(msg);
  }
}
