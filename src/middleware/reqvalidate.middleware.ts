import { Schema } from "joi";
import { createValidator } from "express-joi-validation";

const validator = createValidator();

/*
const validateRequest =
  (schema: Schema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body);
    if (error) {
      res.sendStatus(StatusCodes.BAD_REQUEST);
      return;
    }

    next();
  };
*/

export const validateBody = (schema: Schema) => validator.body(schema);
export const validateParams = (schema: Schema) => validator.params(schema);
