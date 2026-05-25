import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

type OrderConfirmationInput = {
  to: string;
  menuName: string;
  date: string;
  extras: string[];
  notes: string;
  total: number;
  orderId: string;
};

export async function sendOrderConfirmation(input: OrderConfirmationInput) {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.startsWith("re_...")) {
    console.log("[email] RESEND_API_KEY no configurada — saltando email");
    return;
  }

  const dateLabel = new Date(input.date + "T12:00:00").toLocaleDateString("es-AR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const extrasHtml = input.extras.length > 0
    ? `<p style="margin:0;color:#6b7280;font-size:14px;">Extras: ${input.extras.join(", ")}</p>`
    : "";

  const notesHtml = input.notes
    ? `<p style="margin:4px 0 0;color:#6b7280;font-size:14px;">Nota: ${input.notes}</p>`
    : "";

  await resend.emails.send({
    from: "Bengal <pedidos@bengalempresarial.com.ar>",
    to: input.to,
    subject: `✅ Pedido confirmado — ${input.menuName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family:system-ui,sans-serif;background:#FAF7F2;margin:0;padding:32px 16px;">
        <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #EDE8E0;">

          <div style="background:#C4704F;padding:32px;text-align:center;">
            <div style="width:48px;height:48px;background:rgba(255,255,255,0.2);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px;">
              <span style="color:white;font-weight:700;font-size:20px;">B</span>
            </div>
            <h1 style="color:white;margin:0;font-size:22px;font-weight:700;">¡Pedido confirmado!</h1>
          </div>

          <div style="padding:32px;">
            <p style="color:#2C2825;font-size:16px;margin:0 0 24px;">
              Tu pedido fue registrado exitosamente.
            </p>

            <div style="background:#FAF7F2;border-radius:12px;padding:20px;margin-bottom:24px;border:1px solid #EDE8E0;">
              <p style="margin:0 0 4px;font-weight:700;color:#2C2825;font-size:16px;">${input.menuName}</p>
              <p style="margin:0 0 8px;color:#6b7280;font-size:14px;text-transform:capitalize;">${dateLabel}</p>
              ${extrasHtml}
              ${notesHtml}
              <p style="margin:12px 0 0;font-weight:700;color:#C4704F;font-size:18px;">$${input.total.toLocaleString("es-AR")}</p>
            </div>

            <p style="color:#6b7280;font-size:13px;margin:0 0 4px;">
              N° de pedido: <strong style="color:#2C2825;font-family:monospace;">${input.orderId.slice(-8).toUpperCase()}</strong>
            </p>
            <p style="color:#6b7280;font-size:13px;margin:0;">
              Si tenés algún inconveniente, respondé este email o escribinos por WhatsApp.
            </p>
          </div>

          <div style="border-top:1px solid #EDE8E0;padding:20px 32px;text-align:center;">
            <p style="color:#9CA3AF;font-size:12px;margin:0;">Bengal Empresarial · Gastronomía corporativa premium</p>
          </div>
        </div>
      </body>
      </html>
    `,
  });
}
