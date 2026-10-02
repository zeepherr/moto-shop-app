import crypto from "node:crypto";
import { resolveMx } from "node:dns/promises";
import nodemailer from "nodemailer";
import { config } from "@/config";
import { OTP_RESEND_COOLDOWN_MS, OTP_TTL_MS } from "../constants";

export const generateOtp = (): string => {
  return crypto.randomInt(100000, 1000000).toString();
};

export const hashOtp = (otp: string): string => {
  return crypto
    .createHmac("sha256", config.auth.otpSecret)
    .update(otp)
    .digest("hex");
};

export const getOtpCooldownSeconds = (lastSentAt: Date): number => {
  const elapsed = Date.now() - new Date(lastSentAt).getTime();
  const remaining = OTP_RESEND_COOLDOWN_MS - elapsed;
  if (remaining <= 0) return 0;
  return Math.ceil(remaining / 1000);
};

export const checkValidMailDomain = async (email: string): Promise<boolean> => {
  const domain = email.split("@")[1];
  if (!domain) return false;

  try {
    const records = await resolveMx(domain);
    return records.length > 0 && records.some((r) => Boolean(r.exchange) && r.exchange !== ".");
  } catch {
    return false;
  }
};

const createMailTransporter = () => {
  return nodemailer.createTransport({
    host: config.mail.host,
    port: config.mail.port,
    secure: config.mail.port === 465,
    auth: {
      user: config.mail.user,
      pass: config.mail.pass,
    },
  });
};

export const sendRegistrationOtpEmail = async (email: string, otp: string): Promise<void> => {
  const transporter = createMailTransporter();
  const minutes = Math.floor(OTP_TTL_MS / (60 * 1000));

  await transporter.sendMail({
    from: `"HrungMoto" <${config.mail.user}>`,
    to: email,
    subject: "Verify your email address",
    text: `Your verification code is ${otp}.\n\nThis code will expire in ${minutes} minutes.`,
    html: `
      <h2>Email Verification</h2>
      <p>Your verification code is:</p>
      <h1 style="letter-spacing: 4px; font-size: 32px;">${otp}</h1>
      <p>This code will expire in <strong>${minutes} minutes</strong>.</p>
      <p>If you did not request this registration, please ignore this email.</p>
    `,
  });
};
