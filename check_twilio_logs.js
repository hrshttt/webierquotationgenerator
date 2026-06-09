import twilio from 'twilio';
import dotenv from 'dotenv';
dotenv.config();

const client = twilio(process.env.TWILIO_API_KEY, process.env.TWILIO_API_SECRET, { accountSid: process.env.TWILIO_ACCOUNT_SID });

async function check() {
  try {
    const calls = await client.calls.list({ limit: 10 });
    for (const call of calls) {
      console.log(`To: ${call.to}, Status: ${call.status}, Duration: ${call.duration}, Date: ${call.dateCreated}`);
      // Check if there are any notifications/errors for this call
      const notifications = await client.calls(call.sid).notifications.list({ limit: 1 });
      if (notifications.length > 0) {
        console.log(`  Error: ${notifications[0].errorCode} - ${notifications[0].messageText}`);
      }
    }
  } catch (err) {
    console.error("Failed to fetch logs", err);
  }
}
check();
