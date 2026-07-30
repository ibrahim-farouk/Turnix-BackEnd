import { Router } from "express";

import * as profileController from "./profile.controller.js";

import { authenticate } from "../../common/middleware/auth.middleware.js";
import { validate } from "../../common/middleware/validate.middleware.js";
import { uploadProfileImage } from "../../common/middleware/upload.middleware.js";

import {
    updateProfileSchema,
    changePasswordSchema
} from "./profile.validator.js";

const router = Router();

router.use(authenticate);

router.get("/", profileController.getProfileController);
router.patch("/", validate(updateProfileSchema), profileController.updateProfileController);
router.patch("/change-password", validate(changePasswordSchema), profileController.changePasswordController);
router.patch("/picture", uploadProfileImage.single("profileImage"), profileController.updateProfilePictureController);

export default router;