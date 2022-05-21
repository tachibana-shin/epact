import { router } from "express-fw-next";

export default router<{
  // eslint-disable-next-line functional/prefer-readonly-type
  get: {
    // eslint-disable-next-line functional/prefer-readonly-type
    params: {
      // eslint-disable-next-line functional/prefer-readonly-type
      id: number;
    };
    // eslint-disable-next-line functional/prefer-readonly-type
    body: {
      // eslint-disable-next-line functional/prefer-readonly-type
      message: string;
    };
  };
}>({
  get(req, res) {
    res.json({
      message: "Hello express",
    });
  },
}
