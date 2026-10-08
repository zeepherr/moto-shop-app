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

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character] ?? character);

interface AccountEmailContent {
  preheader: string;
  title: string;
  introduction: string;
  details: string[];
  code?: string;
  action?: { label: string; url: string };
  secondaryAction?: { label: string; url: string };
  note?: string;
}

const renderVerificationCode = (code: string) => `
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 18px;background-color:#f4f6f9;border:1px solid #e1e5ec;border-radius:10px;">
    <tr>
      <td align="center" style="padding:18px 16px;">
        <p style="margin:0 0 8px;color:#697386;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">Verification code</p>
        <p dir="ltr" style="margin:0;color:#1d1d1f;font-family:Arial,Helvetica,sans-serif;font-size:32px;font-weight:700;letter-spacing:8px;line-height:1.25;">${escapeHtml(code)}</p>
      </td>
    </tr>
  </table>`;

const renderPrimaryAction = ({ label, url }: { label: string; url: string }) => {
  const escapedUrl = escapeHtml(url);

  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:22px 0 16px;">
      <tr>
        <td align="center" bgcolor="#0066cc" style="border-radius:8px;">
          <a href="${escapedUrl}" style="display:inline-block;padding:13px 22px;border:1px solid #0066cc;border-radius:8px;color:#ffffff;font-size:14px;font-weight:700;line-height:1.2;text-decoration:none;">${escapeHtml(label)}</a>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 6px;color:#697386;font-size:12px;line-height:1.5;">If the button does not work, copy and paste this link into your browser:</p>
    <p style="margin:0 0 16px;font-size:12px;line-height:1.5;word-break:break-all;"><a href="${escapedUrl}" style="color:#0066cc;text-decoration:underline;">${escapeHtml(url)}</a></p>`;
};

const renderSecondaryAction = ({ label, url }: { label: string; url: string }) => `
  <p style="margin:0 0 16px;color:#414957;font-size:14px;line-height:1.65;">${escapeHtml(label)} <a href="${escapeHtml(url)}" style="color:#0066cc;text-decoration:underline;">${escapeHtml(url)}</a></p>`;

const renderDetails = (details: string[]) =>
  details
    .map((detail) => `
      <p style="margin:0 0 12px;color:#414957;font-size:14px;line-height:1.65;">${escapeHtml(detail)}</p>`)
    .join("");

const renderNote = (note: string) => `
  <p style="margin:18px 0 0;border-top:1px solid #e7eaf0;padding-top:16px;color:#697386;font-size:13px;line-height:1.6;">${escapeHtml(note)}</p>`;

const renderAccountEmail = ({
  preheader,
  title,
  introduction,
  details,
  code,
  action,
  secondaryAction,
  note,
}: AccountEmailContent) => {
  const html = `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>${escapeHtml(title)}</title>
      </head>
      <body style="margin:0;background-color:#f4f6f9;color:#1d1d1f;font-family:Arial,Helvetica,sans-serif;">
        <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;mso-hide:all;">${escapeHtml(preheader)}</div>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f4f6f9;">
          <tr>
            <td align="center" style="padding:32px 16px;">
              <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;">
                <tr>
                  <td style="padding:0 0 16px 2px;">
                    <span style="color:#1d1d1f;font-size:20px;font-weight:700;letter-spacing:-0.3px;">HrungMoto</span>
                    <span style="padding-left:8px;color:#697386;font-size:12px;">SHOP MANAGEMENT</span>
                  </td>
                </tr>
                <tr>
                  <td style="border:1px solid #e1e5ec;border-radius:12px;background-color:#ffffff;padding:32px 30px;">
                    <p style="margin:0 0 10px;color:#0066cc;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">Account services</p>
                    <h1 style="margin:0 0 14px;color:#1d1d1f;font-size:24px;line-height:1.3;font-weight:700;">${escapeHtml(title)}</h1>
                    <p style="margin:0 0 18px;color:#414957;font-size:15px;line-height:1.65;">${escapeHtml(introduction)}</p>
                    ${code ? renderVerificationCode(code) : ""}
                    ${renderDetails(details)}
                    ${action ? renderPrimaryAction(action) : ""}
                    ${secondaryAction ? renderSecondaryAction(secondaryAction) : ""}
                    ${note ? renderNote(note) : ""}
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding:18px 12px 0;color:#697386;font-size:12px;line-height:1.6;">This is an automated account message from HrungMoto.</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>`;

  const text = [
    "HrungMoto",
    title,
    introduction,
    ...(code ? ["Verification code: " + code] : []),
    ...details,
    ...(action ? [action.label + ": " + action.url] : []),
    ...(secondaryAction ? [secondaryAction.label + " " + secondaryAction.url] : []),
    ...(note ? [note] : []),
    "This is an automated account message from HrungMoto.",
  ].join("\n\n");

  return { html, text };
};

export const sendRegistrationOtpEmail = async (email: string, otp: string): Promise<void> => {
  const transporter = createMailTransporter();
  const minutes = Math.floor(OTP_TTL_MS / (60 * 1000));
  const message = renderAccountEmail({
    preheader: "Your verification code for setting up a HrungMoto account.",
    title: "Verify your email address",
    introduction: "Use this code to verify the email address for your HrungMoto account setup.",
    code: otp,
    details: ["This code expires in " + minutes + " minutes."],
    note: "If you did not expect this verification request, you can ignore this email.",
  });

  await transporter.sendMail({
    from: `"HrungMoto" <${config.mail.user}>`,
    to: email,
    subject: "Your HrungMoto verification code",
    ...message,
  });
};

export const sendEmailChangeOtpEmail = async (email: string, otp: string, accountType: "administrator" | "staff" | "member" = "administrator"): Promise<void> => {
  const transporter = createMailTransporter();
  const minutes = Math.floor(OTP_TTL_MS / (60 * 1000));
  const message = renderAccountEmail({
    preheader: `Confirm the new email address for your HrungMoto ${accountType} account.`,
    title: "Confirm your new email",
    introduction: `Enter this code in your ${accountType} profile to confirm this email address.`,
    code: otp,
    details: ["Your current email stays active until this code is verified.", "This code expires in " + minutes + " minutes."],
    note: "If you did not request this change, you can ignore this email. Your account email will not change.",
  });

  await transporter.sendMail({
    from: `"HrungMoto" <${config.mail.user}>`,
    to: email,
    subject: "Confirm your HrungMoto email change",
    ...message,
  });
};

export const sendPasswordOtpEmail = async (
  email: string,
  otp: string,
  purpose: "reset" | "change" = "reset",
  accountType: "administrator" | "staff" | "member" = "administrator",
): Promise<void> => {
  const transporter = createMailTransporter();
  const minutes = Math.floor(OTP_TTL_MS / (60 * 1000));
  const isChange = purpose === "change";
  const message = renderAccountEmail({
    preheader: isChange
      ? `A password change was requested for your HrungMoto ${accountType} account.`
      : `A password reset was requested for your HrungMoto ${accountType} account.`,
    title: isChange ? "Confirm your password change" : "Reset your password",
    introduction: isChange
      ? "Use this verification code to confirm your password change."
      : `Use this verification code to set a new password for your ${accountType} account.`,
    code: otp,
    details: ["This code expires in " + minutes + " minutes."],
    note: isChange
      ? "If you did not request this change, ignore this email. Your password will remain unchanged."
      : "If you did not request a password reset, ignore this email. Your password will remain unchanged.",
  });

  await transporter.sendMail({
    from: `"HrungMoto" <${config.mail.user}>`,
    to: email,
    subject: isChange ? "Confirm your HrungMoto password change" : "Reset your HrungMoto password",
    ...message,
  });
};

export const sendAdminPasswordOtpEmail = async (
  email: string,
  otp: string,
  purpose: "reset" | "change" = "reset",
) => sendPasswordOtpEmail(email, otp, purpose, "administrator");

export const sendStaffPasswordOtpEmail = async (email: string, otp: string, accountType: "staff" | "member" = "staff") =>
  sendPasswordOtpEmail(email, otp, "change", accountType);

export const sendRegistrationLinkEmail = async (email: string, registrationUrl: string): Promise<void> => {
  const transporter = createMailTransporter();
  const message = renderAccountEmail({
    preheader: "The shop has approved your email address for HrungMoto registration.",
    title: "Complete your registration",
    introduction: "The shop has approved this email address for registration with HrungMoto.",
    details: [
      "Use the same email address that received this invitation to complete your registration.",
      "The shop’s registration approval expires in 24 hours.",
    ],
    action: { label: "Continue registration", url: registrationUrl },
    note: "If you did not expect this invitation, you can ignore this email.",
  });

  await transporter.sendMail({
    from: `"HrungMoto" <${config.mail.user}>`,
    to: email,
    subject: "Complete your HrungMoto account registration",
    ...message,
  });
};

export const sendPasswordSetupEmail = async (
  email: string,
  setupUrl: string,
  loginUrl: string,
): Promise<void> => {
  const transporter = createMailTransporter();
  const message = renderAccountEmail({
    preheader: "Your email has been verified. Set a password to finish your HrungMoto account setup.",
    title: "Set up your password",
    introduction: "Your email address has been verified. Create a password to finish setting up your HrungMoto account.",
    details: ["This single-use setup link expires in 24 hours."],
    action: { label: "Create your password", url: setupUrl },
    secondaryAction: { label: "After setup, sign in here:", url: loginUrl },
    note: "If you did not expect this message, you can ignore it.",
  });

  await transporter.sendMail({
    from: `"HrungMoto" <${config.mail.user}>`,
    to: email,
    subject: "Set up your HrungMoto password",
    ...message,
  });
};
