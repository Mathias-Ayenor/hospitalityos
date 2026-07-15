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

    console.log("Authorization Header:", authorization);

    if (!authorization) {
      return res.status(401).json({
        success: false,
        message: "Missing Authorization header",
      });
    }

    const token = authorization.replace("Bearer ", "");

    console.log("Token Preview:", token.substring(0, 20) + "...");

    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);

    console.log("Supabase User:", user);
    console.log("Supabase Error:", error);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: error?.message || "Invalid authentication token",
      });
    }

    req.authUser = user;

    next();
  } catch (err: any) {
    console.error("Authentication Exception:", err);

    return res.status(500).json({
      success: false,
      message: err?.message || "Authentication failed",
    });
  }
}