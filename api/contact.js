// api/contact.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { fname, lname, email, phone, company, subject, message, website } = req.body || {};

  // Honeypot: real users leave this hidden field empty; bots often fill it
  if (website) {
    return res.status(200).json({ ok: true });
  }

  if (!fname || !lname || !email || !subject || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  const textBody = `
New enquiry from the MTI website

Name: ${fname} ${lname}
Email: ${email}
Phone: ${phone || 'Not provided'}
Company: ${company || 'Not provided'}
Enquiry type: ${subject}

Message:
${message}
`.trim();

  try {
    const response = await fetch('https://api.smtp2go.com/v3/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Smtp2go-Api-Key': process.env.SMTP2GO_API_KEY,
      },
      body: JSON.stringify({
        sender: process.env.CONTACT_FROM_EMAIL,
        to: [process.env.CONTACT_TO_EMAIL],
        subject: `[MTI Website] ${subject}: ${fname} ${lname}`,
        text_body: textBody,
        custom_headers: [{ header: 'Reply-To', value: email }],
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error('SMTP2GO error:', response.status, detail);
      return res.status(502).json({ error: 'Email could not be sent' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Contact form error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
