const twilio = require('twilio');
const twiml = new twilio.twiml.VoiceResponse();
const dial = twiml.dial({ timeout: 10 });
dial.client('webier_admin');
twiml.dial('+1234567890');
console.log(twiml.toString());
