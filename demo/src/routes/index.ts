import { router } from "../../../src";

export default router<{
  // eslint-disable-next-line functional/prefer-readonly-type
  get: {
    // eslint-disable-next-line functional/prefer-readonly-type
    params: {
      // eslint-disable-next-line functional/prefer-readonly-type
      id: number;
    };
      // eslint-disable-next-line functional/prefer-readonly-type
    resBody: {
      // eslint-disable-next-line functional/prefer-readonly-type
      message: string;
    };
  };
}>({
  get(req, res) {
    req.params.id;
  },
});
