import twilio from 'twilio';

export default function handler(req, res) {
  const VoiceResponse = twilio.twiml.VoiceResponse;
  
  const to = req.body?.To || req.query?.To;
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

  res.setHeader('Content-Type', 'text/xml');
  res.status(200).send(twiml.toString());
}
