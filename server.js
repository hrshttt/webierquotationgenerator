import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import twilio from 'twilio';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/api/twilio/token', (req, res) => {
  const AccessToken = twilio.jwt.AccessToken;
  const VoiceGrant = AccessToken.VoiceGrant;

  const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioApiKey = process.env.TWILIO_API_KEY;
  const twilioApiSecret = process.env.TWILIO_API_SECRET;
  const twilioTwimlAppSid = process.env.TWILIO_TWIML_APP_SID;

  if (!twilioAccountSid || !twilioApiKey || !twilioApiSecret || !twilioTwimlAppSid) {
    return res.status(500).json({ error: 'Missing Twilio credentials' });
  }

  const identity = `user_${Math.floor(Math.random() * 10000)}`;

  const voiceGrant = new VoiceGrant({
    outgoingApplicationSid: twilioTwimlAppSid,
    incomingAllow: true,
  });

  const token = new AccessToken(twilioAccountSid, twilioApiKey, twilioApiSecret, {
    identity,
  });
  token.addGrant(voiceGrant);

  res.json({
    token: token.toJwt(),
    identity,
  });
});

app.post('/api/twilio/voice', (req, res) => {
  const VoiceResponse = twilio.twiml.VoiceResponse;
  let to = req.body.targetNumber || req.body.To;
  if (to) {
    if (Array.isArray(to)) to = to[0];
    if (typeof to === 'string') {
      to = to.replace(/ /g, '+');
      if (!to.startsWith('+')) {
        to = '+' + to;
      }
    }
  }
  const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

  const twiml = new VoiceResponse();

  if (!to) {
    twiml.say('No phone number provided.');
  } else if (!twilioPhoneNumber) {
    twiml.say('Server configuration error. Missing caller ID.');
  } else {
    const dial = twiml.dial({ callerId: twilioPhoneNumber });
    dial.number(to);
  }

  res.type('text/xml');
  res.send(twiml.toString());
});

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});
