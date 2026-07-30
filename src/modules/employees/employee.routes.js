import { Router } from "express";

import * as employeeController from "./employee.controller.js";
import {
    createEmployeeSchema,
    employeeIdSchema,
    employeeListQuerySchema,
    resetEmployeePasswordSchema,
    updateEmployeeSchema,
} from "./employee.validator.js";

import { authenticate } from "../../common/middleware/auth.middleware.js";
import { validate } from "../../common/middleware/validate.middleware.js";
import { authorize } from "../../common/middleware/role.middleware.js";

import { USER_ROLES } from "../../common/utils/constants.js";

const router = Router();

router.use(authenticate);
router.use(authorize(USER_ROLES.ADMIN));

router.get("/", validate(employeeListQuerySchema), employeeController.getEmployees);
router.get("/:id", validate(employeeIdSchema), employeeController.getEmployee);
router.post("/", validate(createEmployeeSchema), employeeController.createEmployee);
router.patch("/:id", validate(updateEmployeeSchema), employeeController.updateEmployee);
router.delete("/:id", validate(employeeIdSchema), employeeController.deleteEmployee);
router.patch("/:id/reset-password", validate(resetEmployeePasswordSchema), employeeController.resetEmployeePassword);

export default router;