import { Router, type IRouter, type Request, type Response } from "express";
import fs from "node:fs";
import path from "node:path";

const router: IRouter = Router();

const widgetPath = path.join(__dirname, "..", "public", "widget.js");

const serveWidget = (_req: Request, res: Response): void => {
  res.setHeader("Content-Type", "text/javascript; charset=utf-8");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=600");

  if (!fs.existsSync(widgetPath)) {
    res.status(503).send("// Widget not yet built");
    return;
  }

  res.sendFile(widgetPath);
};

const corsOk = (_req: Request, res: Response): void => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.status(204).end();
};

/* Direct access: GET /widget.js (port 8080) */
router.get("/widget.js", serveWidget);
router.options("/widget.js", corsOk);

/* Proxy access: GET /api/widget.js (Replit dev proxy / production path prefix) */
router.get("/api/widget.js", serveWidget);
router.options("/api/widget.js", corsOk);

export default router;
