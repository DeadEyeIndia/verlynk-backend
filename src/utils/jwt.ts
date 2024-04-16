import { CookieOptions, Response } from "express";
import { sign } from "jsonwebtoken";

import { IUser } from "../models/user";

export const sendToken = (
  user: IUser,
  statusCode: number,
  res: Response<{ success: boolean }>
) => {
  const token = sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET || "sdw5bsbf2sdawd",
    {
      expiresIn: process.env.JWT_EXPIRE || "1d",
    }
  );

  const options = {
    expires: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
    httpOnly: true,
    path: "/",
    priority: "high",
    sameSite: "lax",
  } as CookieOptions;

  res
    .status(statusCode)
    .cookie("verlynk_token", token, options)
    .json({ success: true });
};
