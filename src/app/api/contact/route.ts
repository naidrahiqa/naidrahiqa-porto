import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { name, email, message } = body;

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Name, email, and message are required" }, { status: 400 });
  }

  if (typeof name !== "string" || typeof email !== "string" || typeof message !== "string") {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  if (name.length > 100 || email.length > 200 || message.length > 2000) {
    return NextResponse.json({ error: "Input too long" }, { status: 400 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
  }

  try {
    await resend.emails.send({
      from: "Naidrahiqa Contact <onboarding@resend.dev>",
      to: "faqihardiansyah89@gmail.com",
      replyTo: email,
      subject: `[Portfolio] ${name} - ${message.slice(0, 50)}...`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3d3450;">New message from your portfolio</h2>
          <div style="background: #f0edf5; border-radius: 12px; padding: 20px; margin-top: 16px;">
            <p style="margin: 0 0 8px;"><strong style="color: #3d3450;">From:</strong> ${name}</p>
            <p style="margin: 0 0 8px;"><strong style="color: #3d3450;">Email:</strong> ${email}</p>
            <hr style="border: none; border-top: 1px solid rgba(88,75,102,0.12); margin: 12px 0;" />
            <p style="margin: 0; color: #3d3450; white-space: pre-wrap;">${message}</p>
          </div>
          <p style="color: #7a6e8c; font-size: 12px; margin-top: 16px;">
            Sent from naidrahiqa.vercel.app/contact
          </p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
