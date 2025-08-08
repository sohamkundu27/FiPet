import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { onCall } from "firebase-functions/v2/https";
import { google } from "googleapis";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../.env") });
console.log("CLIENT_ID is", process.env.CLIENT_ID);

// Get environment variables
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET =  process.env.CLIENT_SECRET;
const REDIRECT_URL =  process.env.REDIRECT_URL;
const REFRESH_TOKEN =  process.env.REFRESH_TOKEN;
const GMAIL_USER =  process.env.GMAIL_USER;

// Create the OAuth2 client
function getOAuth2Client() {
  const OAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URL,
  );

  OAuth2Client.setCredentials({
    refresh_token: REFRESH_TOKEN,
  });

  return OAuth2Client;
}

// Generate a 4-digit verification code
function generateVerificationCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// Send verification code email
async function sendVerificationEmail(email: string, code: string) {
  const OAuth2Client = getOAuth2Client();
  const accessToken = await OAuth2Client.getAccessToken();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: GMAIL_USER,
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      refreshToken: REFRESH_TOKEN,
      accessToken: accessToken.token,
    },
  } as any);

  const mailOptions = {
    from: GMAIL_USER,
    to: email,
    subject: "Password Reset Verification Code",
    text: `Your verification code is: ${code}\n\nThis code will expire in 10 minutes. If you didn't request this code, please ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #FF6B35;">Password Reset Verification</h2>
        <p>You requested a password reset for your FiPet account.</p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <h1 style="color: #FF6B35; font-size: 32px; letter-spacing: 4px; margin: 0;">${code}</h1>
        </div>
        <p>Enter this 4-digit code in the app to reset your password. This code will expire in 10 minutes.</p>
        <p>If you didn't request this password reset, please ignore this email.</p>
        <hr style="margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">This is an automated message from FiPet.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

// Store verification code in Firestore
async function storeVerificationCode(email: string, code: string) {
  const db = getFirestore();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await db.collection("passwordResetCodes").doc(email).set({
    code,
    email,
    expiresAt,
    createdAt: new Date(),
  });
}

// Verify the code from Firestore
async function verifyCode(email: string, code: string, deleteAfterVerification: boolean = true): Promise<boolean> {
  const db = getFirestore();
  const doc = await db.collection("passwordResetCodes").doc(email).get();

  if (!doc.exists) {
    return false;
  }

  const data = doc.data();
  if (!data) {
    return false;
  }

  // Check if code matches and hasn't expired
  if (data.code === code && data.expiresAt.toDate() > new Date()) {
    // Only delete the code if requested
    if (deleteAfterVerification) {
      await db.collection("passwordResetCodes").doc(email).delete();
    }
    return true;
  }

  return false;
}

// Callable function to send verification code
export const sendPasswordResetCode = onCall(async (request) => {
  try {
    const { email } = request.data;

    if (!email) {
      throw new Error("Email is required");
    }

    // Check if user exists
    const auth = getAuth();
    try {
      await auth.getUserByEmail(email);
    } catch (error) {
      throw new Error("No account found with this email address");
    }

    // Generate and send verification code
    const code = generateVerificationCode();
    await sendVerificationEmail(email, code);
    await storeVerificationCode(email, code);

    return { success: true, message: "Verification code sent successfully" };
  } catch (error: any) {
    console.error("Error sending verification code:", error);
    throw new Error(error.message || "Failed to send verification code");
  }
});

// Callable function to verify code
export const verifyPasswordResetCode = onCall(async (request) => {
  try {
    const { email, code } = request.data;

    if (!email || !code) {
      throw new Error("Email and code are required");
    }

    const isValid = await verifyCode(email, code, false); // Don't delete yet

    if (!isValid) {
      throw new Error("Invalid or expired verification code");
    }

    return { success: true, message: "Code verified successfully" };
  } catch (error: any) {
    console.error("Error verifying code:", error);
    throw new Error(error.message || "Failed to verify code");
  }
});

// Callable function to update password
export const updatePasswordWithCode = onCall(async (request) => {
  try {
    const { email, code, newPassword } = request.data;

    if (!email || !code || !newPassword) {
      throw new Error("Email, code, and new password are required");
    }

    // Verify the code first
    const isValid = await verifyCode(email, code, false); // Don't delete yet
    if (!isValid) {
      throw new Error("Invalid or expired verification code");
    }

    // Update password using Firebase Admin
    const auth = getAuth();
    const user = await auth.getUserByEmail(email);
    await auth.updateUser(user.uid, { password: newPassword });

    // Delete the code after successful password update
    const db = getFirestore();
    await db.collection("passwordResetCodes").doc(email).delete();

    return { success: true, message: "Password updated successfully" };
  } catch (error: any) {
    console.error("Error updating password:", error);
    throw new Error(error.message || "Failed to update password");
  }
});
