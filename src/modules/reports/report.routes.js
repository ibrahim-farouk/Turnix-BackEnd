import { Router } from "express";

import * as reportsController from "./report.controller.js";
import { getReportsSchema } from "./report.validator.js";

import { authenticate } from "../../common/middleware/auth.middleware.js";
import { authorize } from "../../common/middleware/role.middleware.js";
import { validate } from "../../common/middleware/validate.middleware.js";

import { USER_ROLES } from "../../common/utils/constants.js";

const router = Router();

router.use(authenticate);

router.use(authorize(USER_ROLES.ADMIN));

router.get(
    "/",
    validate(getReportsSchema),
    reportsController.getReportsController
);

router.get(
    "/export",
    validate(getReportsSchema),
    reportsController.exportReportsController
);

export default router;