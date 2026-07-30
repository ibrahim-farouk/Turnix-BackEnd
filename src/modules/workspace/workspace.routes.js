import { Router } from "express";

import { getWorkspace, callCustomer, cancelService, completeService, skipCustomer } from "./workspace.controller.js";
import { workspaceQuerySchema, workspaceTicketIdSchema } from "./workspace.validator.js";
import { authenticate } from "../../common/middleware/auth.middleware.js";
import { validate } from "../../common/middleware/validate.middleware.js";

const router = Router();

router.use(authenticate);

router.get("/", validate(workspaceQuerySchema), getWorkspace);
router.patch("/tickets/:ticketId/call", validate(workspaceTicketIdSchema), callCustomer);
router.patch("/tickets/:ticketId/complete", validate(workspaceTicketIdSchema), completeService);
router.patch("/tickets/:ticketId/skip", validate(workspaceTicketIdSchema), skipCustomer);
router.patch("/tickets/:ticketId/cancel", validate(workspaceTicketIdSchema), cancelService);


export default router;


