import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const emailFrom = process.env.EMAIL_FROM || 'noreply@couponmanager.com';
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

export async function sendInvitationEmail(email: string, token: string, groupId: string): Promise<void> {
  const invitationUrl = `${frontendUrl}/invitations/accept?token=${token}`;
  
  // If Resend is not configured, log the email
  if (!resend) {
    console.log(`[Email] Invitation email to ${email}:`);
    console.log(`Invitation URL: ${invitationUrl}`);
    console.log(`Group ID: ${groupId}`);
    return;
  }

  try {
    await resend.emails.send({
      from: emailFrom,
      to: email,
      subject: 'Group Invitation - Coupon Manager',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>You've been invited to a group!</h2>
          <p>You have been invited to join a group in the Coupon Manager application.</p>
          <p>Click the button below to accept the invitation:</p>
          <div style="margin: 30px 0;">
            <a href="${invitationUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Accept Invitation
            </a>
          </div>
          <p style="color: #666; font-size: 12px;">
            Or copy and paste this URL into your browser:<br/>
            <a href="${invitationUrl}">${invitationUrl}</a>
          </p>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            This invitation will expire in 7 days.
          </p>
        </div>
      `,
      text: `You've been invited to join a group in the Coupon Manager application.\n\nAccept the invitation by clicking this link: ${invitationUrl}\n\nThis invitation will expire in 7 days.`,
    });
  } catch (error) {
    console.error('Failed to send invitation email:', error);
    throw error;
  }
}

export async function sendExpiryNotificationEmail(
  email: string,
  expiringCoupons: any[]
): Promise<void> {
  // If Resend is not configured, log the email
  if (!resend) {
    console.log(`[Email] Expiry notification to ${email}:`);
    console.log(`Expiring coupons:`, expiringCoupons.length);
    expiringCoupons.forEach(coupon => {
      console.log(`- ${coupon.title} expires on ${coupon.expiryDate.toLocaleDateString()}`);
    });
    return;
  }

  const couponList = expiringCoupons
    .map(
      (coupon: any) => {
        const groupName = coupon.groupId?.name || 'N/A';
        const expiryDate = coupon.expiryDate instanceof Date ? coupon.expiryDate : new Date(coupon.expiryDate);
        return `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${coupon.title || 'N/A'}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${groupName}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${expiryDate.toLocaleDateString()}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${(coupon.remainingAmount || 0).toFixed(2)} ${coupon.currency || 'ILS'}</td>
      </tr>
    `;
      }
    )
    .join('');

  try {
    await resend.emails.send({
      from: emailFrom,
      to: email,
      subject: `Expiring Coupons - ${expiringCoupons.length} coupon(s) expiring soon`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Coupons Expiring Soon</h2>
          <p>You have ${expiringCoupons.length} coupon(s) that are expiring soon:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background-color: #f8f9fa;">
                <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ccc;">Title</th>
                <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ccc;">Group</th>
                <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ccc;">Expiry Date</th>
                <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ccc;">Remaining</th>
              </tr>
            </thead>
            <tbody>
              ${couponList}
            </tbody>
          </table>
          <p>
            <a href="${frontendUrl}/groups" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              View Coupons
            </a>
          </p>
        </div>
      `,
      text: `You have ${expiringCoupons.length} coupon(s) expiring soon:\n\n${expiringCoupons
        .map((c: any) => {
          const groupName = c.groupId?.name || 'N/A';
          const expiryDate = c.expiryDate instanceof Date ? c.expiryDate : new Date(c.expiryDate);
          return `- ${c.title || 'N/A'} (${groupName}) expires on ${expiryDate.toLocaleDateString()}, remaining: ${(c.remainingAmount || 0).toFixed(2)} ${c.currency || 'ILS'}`;
        })
        .join('\n')}\n\nView your coupons: ${frontendUrl}/groups`,
    });
  } catch (error) {
    console.error('Failed to send expiry notification email:', error);
    throw error;
  }
}

export async function sendUnmappedAlertEmail(
  adminEmails: string[],
  multiCouponName: string,
  couponId: string
): Promise<void> {
  // If Resend is not configured, log the email
  if (!resend) {
    console.log(`[Email] Unmapped alert to admins:`, adminEmails);
    console.log(`Multi-coupon name: ${multiCouponName}, Coupon ID: ${couponId}`);
    return;
  }

  const couponUrl = `${frontendUrl}/admin/unmapped-events`;

  try {
    await resend.emails.send({
      from: emailFrom,
      to: adminEmails,
      subject: `Unmapped Multi-Coupon Alert: ${multiCouponName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Unmapped Multi-Coupon Alert</h2>
          <p>A new coupon was created with an unmapped multi-coupon definition.</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <p><strong>Multi-Coupon Name:</strong> ${multiCouponName}</p>
            <p><strong>Coupon ID:</strong> ${couponId}</p>
          </div>
          <p>
            <a href="${couponUrl}" style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              View Unmapped Events
            </a>
          </p>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            Please create a Multi-Coupon Definition for "${multiCouponName}" and resolve the unmapped coupons.
          </p>
        </div>
      `,
      text: `Unmapped Multi-Coupon Alert\n\nA new coupon was created with an unmapped multi-coupon definition.\n\nMulti-Coupon Name: ${multiCouponName}\nCoupon ID: ${couponId}\n\nView unmapped events: ${couponUrl}`,
    });
  } catch (error) {
    console.error('Failed to send unmapped alert email:', error);
    throw error;
  }
}
