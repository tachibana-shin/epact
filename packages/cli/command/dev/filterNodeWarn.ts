import { Transform } from "stream";
import { inspect } from "util";
import parseError from "./helpers/parseError";
import parseWarning from "./helpers/parseWarning";

const warningTraceTip =
  "(Use `node --trace-warnings ...` to show where the warning was created)";
const nodeWarningPattern = /^\(node:\d+\) (.+)\n/m;

export default function createFilterNodeWarn(
  hiddenESBuild: boolean,
  hiddenNodeWarn: boolean
) {
  const warningsToIgnore = [
    "ExperimentalWarning: --experimental-loader is an experimental feature. This feature could change at any time",
    "ExperimentalWarning: Custom ESM Loaders is an experimental feature. This feature could change at any time",
    "ExperimentalWarning: Importing JSON modules is an experimental feature. This feature could change at any time",
  ];
  let filterStderr = true;
  let counter = 0;

  return new Transform({
    transform(chunk, encode, cb) {
      const err = parseError(chunk.toString(), hiddenESBuild);

      if (err) {
        process.stderr.write(
          inspect(err, { showHidden: false, depth: null, colors: true })
        );

        cb(null, null);

        return;
      }

      if (filterStderr) {
        counter += 1;

        // Only filter first 10
        if (counter > 10) {
          filterStderr = false;
        }

        const stderrLog = chunk.toString();
        const nodeWarning = stderrLog.match(nodeWarningPattern);
        if (nodeWarning) {
          const [, warningMessage] = nodeWarning;
          const ignoreWarning = warningsToIgnore.indexOf(warningMessage);
          if (ignoreWarning > -1) {
            warningsToIgnore.splice(ignoreWarning, 1);
            if (warningsToIgnore.length === 0) {
              filterStderr = false;
            }

            chunk = stderrLog
              .replace(nodeWarningPattern, "")
              .replace(warningTraceTip, "")
              .trim();
          }
        }
      }

      const warn = parseWarning(chunk.toString(), hiddenNodeWarn);

      if (warn === false) {
        cb(null, null);
        return;
      }
      if (warn) {
        process.stderr.write(warn);

        cb(null, null);

        return;
      }

      cb(null, chunk);
    },
  });
}
