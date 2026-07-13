import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function emailDisabled() {
  return !process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.startsWith("re_...");
}

const FROM = "Bengal <pedidos@mail.bengalrestaurante.com.ar>";

function shell(inner: string) {
  return `
    <!DOCTYPE html>
    <html>
    <body style="font-family:system-ui,sans-serif;background:#FAF7F2;margin:0;padding:32px 16px;">
      <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #EDE8E0;">
        ${inner}
        <div style="border-top:1px solid #EDE8E0;padding:20px 32px;text-align:center;">
          <p style="color:#9CA3AF;font-size:12px;margin:0;">Bengal Empresarial · Gastronomía corporativa premium</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

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
  if (emailDisabled()) {
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

// ─── Aviso interno: nuevo pedido (cocina + supervisión) ───────

type NewOrderAlertInput = {
  menuName: string;
  clientName: string;
  date: string;
  extras: string[];
  notes: string;
  total: number;
  segment: string | null;
  orderId: string;
};

export async function sendNewOrderAlert(input: NewOrderAlertInput) {
  if (emailDisabled()) {
    console.log("[email] RESEND_API_KEY no configurada — saltando aviso interno");
    return;
  }
  const recipients = (process.env.ORDER_ALERT_EMAILS ?? "")
    .split(",").map((e) => e.trim()).filter(Boolean);
  if (recipients.length === 0) {
    console.log("[email] ORDER_ALERT_EMAILS no configurada — saltando aviso interno");
    return;
  }

  const dateLabel = new Date(input.date + "T12:00:00").toLocaleDateString("es-AR", {
    weekday: "long", day: "numeric", month: "long",
  });
  const segmentLabel = input.segment === "empresa" ? "🏢 Empresa"
    : input.segment === "hogar" ? "🏠 Hogar"
    : input.segment === "eventos" ? "🎉 Eventos" : "";

  await resend.emails.send({
    from: FROM,
    to: recipients,
    subject: `🔔 Nuevo pedido — ${input.menuName} (${input.clientName})`,
    html: shell(`
      <div style="background:#2C2825;padding:28px 32px;text-align:center;">
        <h1 style="color:#F5EFE6;margin:0;font-size:20px;font-weight:700;">🔔 Nuevo pedido entrante</h1>
        <p style="color:#B8AFA3;margin:6px 0 0;font-size:13px;text-transform:capitalize;">${dateLabel}</p>
      </div>
      <div style="padding:28px 32px;">
        <div style="background:#FAF7F2;border-radius:12px;padding:20px;border:1px solid #EDE8E0;">
          <p style="margin:0 0 4px;font-weight:700;color:#2C2825;font-size:17px;">${input.menuName}</p>
          <p style="margin:0 0 8px;color:#6b7280;font-size:14px;">Cliente: <strong style="color:#2C2825;">${input.clientName}</strong> ${segmentLabel ? `· ${segmentLabel}` : ""}</p>
          ${input.extras.length > 0 ? `<p style="margin:0;color:#C4704F;font-size:13px;">Extras: ${input.extras.join(", ")}</p>` : ""}
          ${input.notes ? `<p style="margin:4px 0 0;color:#B45309;font-size:13px;">⚠️ Nota: ${input.notes}</p>` : ""}
          <p style="margin:12px 0 0;font-weight:700;color:#C4704F;font-size:18px;">$${input.total.toLocaleString("es-AR")}</p>
        </div>
        <a href="https://bengal-empresas.vercel.app/cocina"
           style="display:block;text-align:center;background:#C4704F;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:13px;border-radius:12px;margin-top:20px;">
          Abrir pantalla de cocina
        </a>
        <p style="color:#9CA3AF;font-size:12px;margin:16px 0 0;text-align:center;">
          N° de pedido: <span style="font-family:monospace;color:#6b7280;">${input.orderId.slice(-8).toUpperCase()}</span>
        </p>
      </div>
    `),
  });
}

// ─── Aviso al cliente: pedido en camino ────────────────────────

type OrderOnTheWayInput = {
  to: string;
  menuName: string;
  orderId: string;
};

export async function sendOrderOnTheWay(input: OrderOnTheWayInput) {
  if (emailDisabled() || !input.to) return;

  await resend.emails.send({
    from: FROM,
    to: input.to,
    subject: `🛵 Tu pedido está en camino — ${input.menuName}`,
    html: shell(`
      <div style="background:#C4704F;padding:32px;text-align:center;">
        <p style="font-size:40px;margin:0 0 8px;">🛵</p>
        <h1 style="color:white;margin:0;font-size:22px;font-weight:700;">¡Tu pedido está en camino!</h1>
      </div>
      <div style="padding:32px;">
        <p style="color:#2C2825;font-size:16px;margin:0 0 16px;">
          <strong>${input.menuName}</strong> ya salió de nuestra cocina y está viajando hacia vos.
        </p>
        <p style="color:#6b7280;font-size:13px;margin:0;">
          N° de pedido: <strong style="color:#2C2825;font-family:monospace;">${input.orderId.slice(-8).toUpperCase()}</strong>
        </p>
      </div>
    `),
  });
}
