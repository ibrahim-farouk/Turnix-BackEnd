import { Router } from "express";

import { getBranches } from "./branches.controller.js";

const router = Router();

router.get("/", getBranches);

export default router;