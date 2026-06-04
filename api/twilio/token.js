import twilio from 'twilio';

export default function handler(req, res) {
  const AccessToken = twilio.jwt.AccessToken;
  const VoiceGrant = AccessToken.VoiceGrant;

  const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioApiKey = process.env.TWILIO_API_KEY;
  const twilioApiSecret = process.env.TWILIO_API_SECRET;
  const twilioTwimlAppSid = process.env.TWILIO_TWIML_APP_SID;

  if (!twilioAccountSid || !twilioApiKey || !twilioApiSecret || !twilioTwimlAppSid) {
    return res.status(500).json({ error: 'Missing Twilio credentials' });
  }

  const identity = 'webier_admin';

  const voiceGrant = new VoiceGrant({
    outgoingApplicationSid: twilioTwimlAppSid,
    incomingAllow: true,
  });

  const token = new AccessToken(twilioAccountSid, twilioApiKey, twilioApiSecret, {
    identity,
  });
  token.addGrant(voiceGrant);

  res.status(200).json({
    token: token.toJwt(),
    identity,
  });
}
