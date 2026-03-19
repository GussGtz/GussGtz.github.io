export default async function handler(req, res) {
  // Solo aceptar POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, company, budget, message } = req.body;

  // Validación básica
  if (!name || !email || !budget || !message) {
    return res.status(400).json({ error: 'Campos requeridos faltantes' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Email inválido' });
  }

  const payload = {
    sender:  { name: 'Portfolio · Gustavo Gutierrez', email: 'gutierrezgustavocanul@gmail.com' },
    to:      [{ email: 'gutierrezgustavocanul@gmail.com', name: 'Gustavo Gutierrez' }],
    replyTo: { email, name },
    subject: `[Portafolio] Nuevo contacto: ${name}`,
    htmlContent: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#f4f6f8;padding:32px;border-radius:12px;">
        <h2 style="color:#008a50;margin:0 0 4px;">📬 Nuevo mensaje desde tu portafolio</h2>
        <p style="color:#666;margin:0 0 20px;font-size:14px;">Alguien llenó el formulario de contacto.</p>
        <hr style="border:none;border-top:1px solid #ddd;margin-bottom:20px;">
        <table style="width:100%;border-collapse:collapse;font-size:15px;">
          <tr><td style="padding:8px 0;color:#888;width:130px;">Nombre</td><td style="padding:8px 0;font-weight:600;">${name}</td></tr>
          <tr><td style="padding:8px 0;color:#888;">Email</td><td style="padding:8px 0;"><a href="mailto:${email}" style="color:#008a50;">${email}</a></td></tr>
          <tr><td style="padding:8px 0;color:#888;">Empresa</td><td style="padding:8px 0;">${company || '<em style="color:#bbb">No especificada</em>'}</td></tr>
          <tr><td style="padding:8px 0;color:#888;">Presupuesto</td><td style="padding:8px 0;font-weight:600;color:#008a50;">${budget}</td></tr>
        </table>
        <hr style="border:none;border-top:1px solid #ddd;margin:20px 0;">
        <p style="color:#888;font-size:13px;margin-bottom:8px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Descripción del proyecto</p>
        <div style="background:#fff;padding:18px;border-radius:8px;border-left:4px solid #008a50;font-size:15px;line-height:1.6;white-space:pre-line;">${message}</div>
        <hr style="border:none;border-top:1px solid #ddd;margin:20px 0;">
        <p style="color:#bbb;font-size:12px;margin:0;">Enviado desde <a href="https://guss-gtz-github-io.vercel.app" style="color:#008a50;">guss-gtz-github-io.vercel.app</a></p>
      </div>`
  };

  try {
    const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key':      process.env.BREVO_API_KEY,
        'Content-Type': 'application/json',
        'Accept':       'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (brevoRes.status === 201 || brevoRes.ok) {
      return res.status(200).json({ ok: true });
    }

    const errBody = await brevoRes.json().catch(() => ({}));
    console.error('Brevo error:', brevoRes.status, errBody);
    return res.status(500).json({ error: 'Error al enviar', detail: errBody });

  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
