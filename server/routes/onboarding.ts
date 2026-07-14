
import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { completeOnboarding } from "../services/onboarding.service";

const router = Router();

router.post(
  "/",
  authMiddleware,
  async (req, res) => {
    try {
      const result = await completeOnboarding(
        req.body,
        req.authUser.id
      );

      return res.status(201).json({
        success: true,
        hotel: result,
      });

    } catch (error: any) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message:
          error.message ??
          "Failed to complete onboarding.",
      });
    }
  }
);

export default router;