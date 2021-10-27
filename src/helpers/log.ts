import chalk from "chalk";

export function warn(msg: string) {
  console.warn(chalk.yellow(`[express-warn]: ${msg}`));
}

export function error(msg: string) {
  console.log(chalk.red(`[express-warn]: ${msg}`));
}

export function log(msg: string) {
  console.log(`[express-warn]: ${msg}`);
}
