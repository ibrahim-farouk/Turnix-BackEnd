import { Router } from "express";

import * as settingsController from "./setting.controller.js";

import { authenticate } from "../../common/middleware/auth.middleware.js";
import { validate } from "../../common/middleware/validate.middleware.js";
import { authorize } from "../../common/middleware/role.middleware.js";

import { USER_ROLES } from "../../common/utils/constants.js";
import { updateSettingsSchema } from "./setting.validator.js";

const router = Router();

router.use(authenticate);
router.use(authorize(USER_ROLES.ADMIN));

router.get(
    "/",
    settingsController.getSettingsController
);

router.patch(
    "/",
    validate(updateSettingsSchema),
    settingsController.updateSettingsController
);

export default router;