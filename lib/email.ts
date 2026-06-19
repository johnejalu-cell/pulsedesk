import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

export interface ClippingItem {
  term: string;
  headline: string;
  summary: string;
  source?: string;
}

export async function sendClippingsEmail(
  toEmail: string,
  clippings: ClippingItem[]
): Promise<void> {
  const grouped = clippings.reduce((acc, item) => {
    if (!acc[item.term]) acc[item.term] = [];
    acc[item.term].push(item);
    return acc;
  }, {} as Record<string, ClippingItem[]>);

  const sectionsHtml = Object.entries(grouped).map(([term, items]) => `
    <div style="margin-bottom:32px;">
      <h2 style="font-size:16px;font-weight:700;color:#1e293b;border-bottom:2px solid #3b82f6;padding-bottom:8px;margin-bottom:16px;">
        ${term}
      </h2>
      ${items.map(item => `
        <div style="margin-bottom:16px;padding:16px;background:#f8fafc;border-radius:8px;border-left:3px solid #3b82f6;">
          <p style="font-size:14px;font-weight:600;color:#1e293b;margin:0 0 6px 0;">${item.headline}</p>
          <p style="font-size:13px;color:#475569;margin:0 0 6px 0;line-height:1.5;">${item.summary}</p>
          ${item.source ? `<p style="font-size:11px;color:#94a3b8;margin:0;">Source: ${item.source}</p>` : ''}
        </div>
      `).join('')}
    </div>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;padding:32px 16px;background:#ffffff;">
      <div style="margin-bottom:32px;">
        <img src="https://pulsedepartment.com/logo.png" alt="Pulse Department" style="height:32px;" onerror="this.style.display='none'">
        <h1 style="font-size:22px;font-weight:800;color:#1e293b;margin:16px 0 4px 0;">Your Press Clippings</h1>
        <p style="font-size:13px;color:#64748b;margin:0;">Latest news on your watchlist — ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      ${sectionsHtml}

      <div style="margin-top:40px;padding-top:24px;border-top:1px solid #e2e8f0;text-align:center;">
        <p style="font-size:12px;color:#94a3b8;margin:0 0 8px 0;">Manage your watchlist in <a href="https://pulsedepartment.com/dashboard/settings" style="color:#3b82f6;">Settings</a></p>
        <p style="font-size:12px;color:#94a3b8;margin:0;">© ${new Date().getFullYear()} Pulse Department</p>
      </div>
    </body>
    </html>
  `;

  await resend.emails.send({
    from: 'Pulse Department <clippings@pulsedepartment.com>',
    to: toEmail,
    subject: `Your Press Clippings — ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`,
    html,
  });
}
