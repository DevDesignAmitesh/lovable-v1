import type { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";
import { JWT_SECRET } from "./config";

export function auth(req: Request, res: Response, next: NextFunction) {
  const bearerToken = req.headers.authorization;

  if (!bearerToken) {
    res.status(401).json({ message: "unauthorized" })
    return;
  }
  
  const token = bearerToken.split("Bearer ")[1];

  if (!token) {
    res.status(401).json({ message: "unauthorized" })
    return;
  }

  let decoded;

  try {
    decoded = verify(token, JWT_SECRET) as { userId: string }
  } catch {
    console.log("JWT verify error")
    res.status(401).json({ message: "unauthorized" })
    return;
  }

  req.userId = decoded.userId;
  next();
}