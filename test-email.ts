import { Resend } from 'resend';
import 'dotenv/config';

const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmail() {
  console.log('Using API Key starting with:', process.env.RESEND_API_KEY?.substring(0, 8));
  try {
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'aaron_caampued@yahoo.com', // Let's try sending to a default address or ask the user
      subject: 'Test',
      html: '<p>Test</p>'
    });
    console.log('Data:', data);
    console.log('Error:', error);
  } catch (err) {
    console.error('Exception:', err);
  }
}

testEmail();
