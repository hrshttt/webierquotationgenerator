import twilio from 'twilio';

const VoiceResponse = twilio.twiml.VoiceResponse;
const twiml = new VoiceResponse();
const dial = twiml.dial({ timeout: 10 });
dial.client('webier_admin');
twiml.dial('+19999999999');
console.log(twiml.toString());
