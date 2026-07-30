
import { Router } from "express";

import { login } from "./auth.controller.js";
import { loginSchema } from "./auth.validator.js";
import { validate } from "../../common/middleware/validate.middleware.js";

const router = Router();

router.post("/login", validate(loginSchema), login);

export default router;