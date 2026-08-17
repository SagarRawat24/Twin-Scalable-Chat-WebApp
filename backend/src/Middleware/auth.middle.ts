import { Request, Response, NextFunction } from "express";
import { auth } from "../lib/auth.js";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // ✅ get session from better-auth using cookies
    const session = await auth.api.getSession({
      headers: req.headers as any,
    });

    // ❌ no session → unauthorized
    if (!session) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // ✅ attach user to request
    req.user = {
      id: session.user.id,
    };

    next();
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};