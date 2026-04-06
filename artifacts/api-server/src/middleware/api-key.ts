import { type Request, type Response, type NextFunction } from "express";

const WIDGET_API_KEY = process.env.WIDGET_API_KEY ?? "dev-widget-key";

export function requireApiKey(req: Request, res: Response, next: NextFunction): void {
  const key =
    (req.headers["x-widget-api-key"] as string) ?? req.query.apiKey as string;

  if (!key || key !== WIDGET_API_KEY) {
    res.status(401).json({ error: "Unauthorized", message: "Valid API key required" });
    return;
  }
  next();
}

export function optionalApiKey(req: Request, res: Response, next: NextFunction): void {
  next();
}
