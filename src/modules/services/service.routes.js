import { Router } from "express";

import { getBranchServices } from "./service.controller.js";
import { serviceSchema } from "./service.validator.js";
import { validate } from "../../common/middleware/validate.middleware.js";

const router = Router();

router.get("/:branchId/services", validate(serviceSchema), getBranchServices);

export default router;