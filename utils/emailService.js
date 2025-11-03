// backend/utils/emailService.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email provider
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// ============================================
// EMAIL TEMPLATES
// ============================================

// Welcome Email
export const sendWelcomeEmail = async (user) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: '🎉 Welcome to FindAbode!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Welcome to FindAbode! 🏠</h1>
        <p>Hi ${user.name},</p>
        <p>Thank you for joining FindAbode! We're excited to have you on board.</p>
        
        ${user.userType === 'seeker' ? `
          <p>As a seeker, you can now:</p>
          <ul>
            <li>✅ Browse thousands of properties</li>
            <li>✅ Save favorites to your wishlist</li>
            <li>✅ Contact property owners directly</li>
          </ul>
        ` : user.providerType === 'owner' ? `
          <p>As a property owner, you can now:</p>
          <ul>
            <li>✅ Post unlimited properties</li>
            <li>✅ Manage your listings</li>
            <li>✅ Connect with potential buyers/renters</li>
          </ul>
          <p>Start posting your first property now!</p>
        ` : `
          <p>Your ${user.providerType} account is pending admin approval.</p>
          <p>We'll notify you via email once your account is approved.</p>
          <p>This usually takes 24-48 hours.</p>
        `}
        
        <a href="${process.env.FRONTEND_URL}" 
           style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">
          Visit FindAbode
        </a>
        
        <p>Best regards,<br/>The FindAbode Team</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent to:', user.email);
  } catch (error) {
    console.error('❌ Failed to send welcome email:', error);
  }
};

// Approval Email
export const sendApprovalEmail = async (user) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: '✅ Your Account Has Been Approved!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #10b981;">Account Approved! ✅</h1>
        <p>Hi ${user.name},</p>
        <p>Great news! Your ${user.providerType} account has been approved.</p>
        <p>You can now start posting properties and connecting with potential clients.</p>
        
        <a href="${process.env.FRONTEND_URL}/post-property" 
           style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">
          Post Your First Property
        </a>
        
        <p>Thank you for choosing FindAbode!</p>
        <p>Best regards,<br/>The FindAbode Team</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Approval email sent to:', user.email);
  } catch (error) {
    console.error('❌ Failed to send approval email:', error);
  }
};

// Rejection Email
export const sendRejectionEmail = async (user, reason) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: '❌ Account Application Update',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #ef4444;">Account Application Update</h1>
        <p>Hi ${user.name},</p>
        <p>We regret to inform you that your ${user.providerType} account application was not approved.</p>
        
        <div style="background: #fee2e2; border-left: 4px solid #ef4444; padding: 16px; margin: 20px 0;">
          <strong>Reason:</strong>
          <p>${reason}</p>
        </div>
        
        <p>If you have questions, please contact our support team.</p>
        <p>Email: support@findabode.com</p>
        
        <p>Best regards,<br/>The FindAbode Team</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Rejection email sent to:', user.email);
  } catch (error) {
    console.error('❌ Failed to send rejection email:', error);
  }
};

// Property Visit Notification
export const sendPropertyVisitNotification = async (property, owner) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: owner.email,
    subject: '👁️ Someone Viewed Your Property',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Property View Notification 👁️</h1>
        <p>Hi ${owner.name},</p>
        <p>Good news! Someone just viewed your property:</p>
        
        <div style="background: #f3f4f6; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <h3>${property.title}</h3>
          <p>${property.city}, ${property.state}</p>
          <p><strong>Total Views:</strong> ${property.views}</p>
        </div>
        
        <a href="${process.env.FRONTEND_URL}/property/${property.id}" 
           style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">
          View Property
        </a>
        
        <p>Keep your property details updated to attract more viewers!</p>
        <p>Best regards,<br/>The FindAbode Team</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Visit notification sent to:', owner.email);
  } catch (error) {
    console.error('❌ Failed to send visit notification:', error);
  }
};

// Wishlist Notification
export const sendWishlistNotification = async (property, owner, seeker) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: owner.email,
    subject: '❤️ Your Property Was Added to Wishlist!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #ef4444;">Someone Loved Your Property! ❤️</h1>
        <p>Hi ${owner.name},</p>
        <p>Great news! ${seeker.name} added your property to their wishlist:</p>
        
        <div style="background: #fee2e2; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <h3>${property.title}</h3>
          <p>${property.city}, ${property.state}</p>
        </div>
        
        <p>This means they're seriously interested! Make sure to respond promptly if they contact you.</p>
        
        <a href="${process.env.FRONTEND_URL}/my-properties" 
           style="display: inline-block; background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">
          View Your Properties
        </a>
        
        <p>Best regards,<br/>The FindAbode Team</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Wishlist notification sent to:', owner.email);
  } catch (error) {
    console.error('❌ Failed to send wishlist notification:', error);
  }
};