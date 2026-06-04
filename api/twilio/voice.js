import twilio from 'twilio';

export default function handler(req, res) {
  const VoiceResponse = twilio.twiml.VoiceResponse;
  
  const to = req.body?.To || req.query?.To;
  const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

  const twiml = new VoiceResponse();

  if (!to) {
    twiml.say('No phone number provided.');
  } else if (to === twilioPhoneNumber || req.body?.Direction === 'inbound') {
    // Incoming call to our Twilio Number
    const dial = twiml.dial({ timeout: 10 });
    dial.client('webier_admin');
    
    // If the browser client doesn't answer (timeout or offline), fallback to personal phone
    if (process.env.PERSONAL_PHONE_NUMBER) {
      twiml.dial(process.env.PERSONAL_PHONE_NUMBER);
    } else {
      twiml.say('The administrator is currently unavailable. Please leave a message after the beep.');
      twiml.record();
    }
  } else if (!twilioPhoneNumber) {
    twiml.say('Server configuration error. Missing caller ID.');
  } else {
    // Outbound call from the browser
    const dial = twiml.dial({ callerId: twilioPhoneNumber });
    dial.number(to);
  }

  res.setHeader('Content-Type', 'text/xml');
  res.status(200).send(twiml.toString());
}
