import { transporter, sender } from "./mailtrap.config.js";
import {
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
  VERIFICATION_EMAIL_ADMIN_TEMPLATE,
  EMAIL_CHANGE_CONFIRMATION_TEMPLATE,
} from "./emailTemplates.js";

export const sendVerificationEmail = async (email, verificationToken) => {
  const recipient = [{ email }];
  try {
    const response = await transporter.sendMail({
      from: sender.email, // Sender's email
      to: recipient.map((r) => r.email), // List of recipients
      subject: "Verify your email",
      html: VERIFICATION_EMAIL_TEMPLATE.replace(
        "{verificationCode}",
        verificationToken
      ),
    });

    console.log("Email sent successfully", response);
  } catch (error) {
    console.error(`Error sending verification`, error);
    throw new Error(`Error sending verification email: ${error}`);
  }
};

export const sendVerificationAdminEmail = async (
  email,
  verificationToken,
  password
) => {
  const recipient = [{ email }];
  try {
    const response = await transporter.sendMail({
      from: sender.email, // Sender's email
      to: recipient.map((r) => r.email), // List of recipients
      subject: "Verify your email and set up your account",
      html: VERIFICATION_EMAIL_ADMIN_TEMPLATE.replace(
        "{verificationCode}",
        verificationToken
      ).replace("{initialPassword}", password),
    });

    console.log("Email sent successfully", response);
  } catch (error) {
    console.error(`Error sending verification`, error);
    throw new Error(`Error sending verification email: ${error}`);
  }
};

export const sendWelcomeEmail = async (email, name) => {
  const recipient = [{ email }];
  try {
    const response = await transporter.sendMail({
      from: sender.email,
      to: recipient.map((r) => r.email),
      subject: "Welcome to Our Service",
      html: `<p>Hello ${name},</p><p>Welcome to our service!</p>`,
    });

    console.log("Welcome email sent successfully", response);
  } catch (error) {
    console.error(`Error sending welcome email`, error);
    throw new Error(`Error sending welcome email: ${error}`);
  }
};

export const sendPasswordResetEmail = async (email, resetURL) => {
  const recipient = [{ email }];
  try {
    const response = await transporter.sendMail({
      from: sender.email,
      to: recipient.map((r) => r.email),
      subject: "Reset your password",
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
    });
    console.log("Password reset email sent", response);
  } catch (error) {
    console.error(`Error sending password reset email`, error);
    throw new Error(`Error sending password reset email: ${error}`);
  }
};

export const sendResetSuccessEmail = async (email) => {
  const recipient = [{ email }];
  try {
    const response = await transporter.sendMail({
      from: sender.email,
      to: recipient.map((r) => r.email),
      subject: "Password Reset Successful",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
    });

    console.log("Password reset success email sent", response);
  } catch (error) {
    console.error(`Error sending password reset success email`, error);
    throw new Error(`Error sending password reset success email: ${error}`);
  }
};

export const sendEmailChangeConfirmation = async (oldEmail, newEmail) => {
  try {
    // Send confirmation to old email
    await transporter.sendMail({
      from: sender.email,
      to: oldEmail,
      subject: "Your Email Address Has Been Changed",
      html: EMAIL_CHANGE_CONFIRMATION_TEMPLATE.replace(
        "{oldEmail}",
        oldEmail
      ).replace("{newEmail}", newEmail),
    });

    // Send confirmation to new email
    await transporter.sendMail({
      from: sender.email,
      to: newEmail,
      subject: "Your Email Address Has Been Changed",
      html: EMAIL_CHANGE_CONFIRMATION_TEMPLATE.replace(
        "{oldEmail}",
        oldEmail
      ).replace("{newEmail}", newEmail),
    });

    console.log("Email change confirmation sent successfully");
  } catch (error) {
    console.error(`Error sending email change confirmation:`, error);
    throw new Error(`Error sending email change confirmation: ${error}`);
  }
};
