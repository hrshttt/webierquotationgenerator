import twilio from 'twilio';

export default function handler(req, res) {
  const VoiceResponse = twilio.twiml.VoiceResponse;
  
  const to = req.body?.To || req.query?.To;
  const direction = req.body?.Direction || req.query?.Direction;
  const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

  console.log('Received Twilio Webhook:', { to, direction, twilioPhoneNumber });

  const twiml = new VoiceResponse();

  if (!to) {
    twiml.say('No phone number provided.');
  } else if (to === twilioPhoneNumber || direction === 'inbound') {
    console.log('Routing as INCOMING call to webier_admin client');
    const dial = twiml.dial({ timeout: 20 });
    dial.client('webier_admin');
    
    // Safest fallback that won't trigger Twilio Trial restrictions
    twiml.say('The administrator is currently unavailable. Please try again later.');
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
