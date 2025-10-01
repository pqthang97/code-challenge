import type { NextFunction, Request, Response } from "express";

const getIP = (req: Request): string => {
  return (req.headers["cf-connecting-ip"] as string) || req.ip || "";
};

const consoleRequestInfo = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  next();
  const time = new Date();
  console.log(`${req.method} | ${time} | ${getIP(req)} | ${req.originalUrl}`);
  Object.keys(req.body || {}).forEach((el) => {
    console.log(`${el}: ${JSON.stringify(req.body[el])}`);
  });
};

export default {
  consoleRequestInfo
};
