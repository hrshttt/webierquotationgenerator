import twilio from 'twilio';

export default function handler(req, res) {
  const VoiceResponse = twilio.twiml.VoiceResponse;
  
  const to = req.body?.To || req.query?.To;
  const from = req.body?.From || req.query?.From || '';
  const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

  console.log('Received Twilio Webhook:', { to, from, twilioPhoneNumber });

  const twiml = new VoiceResponse();

  if (!to) {
    twiml.say('No phone number provided.');
  } else if (to === twilioPhoneNumber && !from.startsWith('client:')) {
    console.log('Routing as INCOMING call to webier_admin client');
    const dial = twiml.dial({ timeout: 10 });
    dial.client('webier_admin');
    
    // Fallback to personal phone
    const personalNum = process.env.PERSONAL_PHONE_NUMBER;
    if (personalNum && personalNum.trim().startsWith('+')) {
      twiml.say('Please wait while we connect you.');
      const fallbackDial = twiml.dial({ callerId: twilioPhoneNumber });
      fallbackDial.number(personalNum.trim());
    } else {
      twiml.say('The administrator is currently unavailable. Please try again later.');
    }
  } else if (!twilioPhoneNumber) {
    twiml.say('Server configuration error. Missing caller ID.');
  } else {
    console.log('Routing as OUTBOUND call to', to);
    const dial = twiml.dial({ callerId: twilioPhoneNumber });
    dial.number(to);
  }

  res.setHeader('Content-Type', 'text/xml');
  res.status(200).send(twiml.toString());
}
