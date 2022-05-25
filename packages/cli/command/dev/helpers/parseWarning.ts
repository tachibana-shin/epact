


console.log()
import chalk from "chalk";

export default function parseWarning(
  message: string,
  hiddenNode: boolean
): string | null | false {
  // is node

  const matchNodeWarn = message.match(/^\(node:\d+\) (\[[^\s]+\] )?/);

  if (matchNodeWarn?.index === 0) {
    if (hiddenNode) {
      return false;
    } else {
      // is node waring
      return chalk.yellow(message.slice(matchNodeWarn[0].length)); // remove (node:12083) [DEP0148]
    }
  }

  return message.includes("Warning: ") ? chalk.yellow(message) : null;
}
