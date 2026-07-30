import { Router } from "express";

import authRoutes from "../modules/auth/auth.routes.js";
import branchRoutes from "../modules/branches/branches.routes.js";
import serviceRoutes from "../modules/services/service.routes.js";
import ticketRoutes from "../modules/tickets/ticket.routes.js";
import workspaceRoutes from "../modules/workspace/workspace.routes.js";
import employeeRoutes from "../modules/employees/employee.routes.js";
import profileRoutes from "../modules/profile/profile.routes.js";
import settingsRoutes from "../modules/settings/setting.routes.js";
import reportsRoutes from "../modules/reports/report.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/branches", branchRoutes);
router.use("/branches", serviceRoutes);
router.use("/tickets", ticketRoutes);
router.use("/workspace", workspaceRoutes);
router.use("/employees", employeeRoutes);
router.use("/profile", profileRoutes);
router.use("/settings", settingsRoutes);
router.use("/reports", reportsRoutes);

export default router;