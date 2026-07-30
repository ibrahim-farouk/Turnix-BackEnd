import { Router } from "express";

import { joinQueue, trackTicket } from "./ticket.controller.js";
import { createTicketSchema, ticketIdSchema } from "./ticket.validator.js";
import { validate } from "../../common/middleware/validate.middleware.js";

const router = Router();

router.post("/", validate(createTicketSchema), joinQueue);
router.get("/:ticketId/track", validate(ticketIdSchema), trackTicket);

export default router;
