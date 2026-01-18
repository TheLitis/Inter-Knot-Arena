import { randomInt } from "node:crypto";
import nodemailer from "nodemailer";
import { createId, now } from "../utils.js";

export interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
  secure: boolean;
}

export interface EmailVerification {
  token: string;
  code: string;
  userId: string;
  email: string;
  redirectTo: string;
  createdAt: number;
  expiresAt: number;
}

export interface EmailVerificationStore {
  create(data: Omit<EmailVerification, "token" | "code" | "createdAt" | "expiresAt">): EmailVerification;
  consume(token: string, code: string): EmailVerification | null;
  delete(token: string): void;
}

export function createEmailVerificationStore(ttlMs: number): EmailVerificationStore {
  const records = new Map<string, EmailVerification>();

  return {
    create(data) {
      const createdAt = now();
      const token = createId("verify");
      const code = randomInt(0, 1000000).toString().padStart(6, "0");
      const record: EmailVerification = {
        ...data,
        token,
        code,
        createdAt,
        expiresAt: createdAt + ttlMs
      };
      records.set(token, record);
      return record;
    },
    consume(token, code) {
      const record = records.get(token);
      if (!record) {
        return null;
      }
      records.delete(token);
      if (record.expiresAt <= now()) {
        return null;
      }
      if (record.code !== code) {
        return null;
      }
      return record;
    },
    delete(token) {
      records.delete(token);
    }
  };
}

export async function sendVerificationEmail(
  config: SmtpConfig,
  to: string,
  code: string
): Promise<void> {
  if (!config.host || !config.from) {
    throw new Error("SMTP is not configured");
  }
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.user ? { user: config.user, pass: config.pass } : undefined
  });

  await transporter.sendMail({
    from: config.from,
    to,
    subject: "Inter-Knot Arena verification code",
    text: `Your Inter-Knot Arena verification code is ${code}. This code expires soon.`,
    html: `<p>Your Inter-Knot Arena verification code is <strong>${code}</strong>.</p><p>This code expires soon.</p>`
  });
}
