import { Request, Response, NextFunction } from "express";
import { getSupabaseAdmin } from "../supabaseAdmin";

declare global {
  namespace Express {
    interface Request {
      authUser?: any;
    }
  }
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const authorization = req.headers.authorization;

    if (!authorization) {
      return res.status(401).json({
        success: false,
        message: "Missing Authorization header",
      });
    }

    const token = authorization.replace("Bearer ", "");

    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
    }

    req.authUser = user;

    next();
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Authentication failed",
    });
  }
}