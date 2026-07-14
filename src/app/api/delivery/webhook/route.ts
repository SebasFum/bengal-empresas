import { NextResponse } from "next/server";
import crypto from "crypto";
import { fetchPayment } from "@/lib/mercadopago";
import { markOrderPaid, markOrderRejected } from "@/lib/db-delivery";
import { sendDeliveryOrderAlert } from "@/lib/email";

// Valida la firma x-signature que manda Mercado Pago, si hay secreto configurado.
// Sin el secreto (todavía no vinculado en el panel de MP) igual es seguro:
// el estado real del pago se re-consulta siempre contra la API con nuestro
// propio access token, nunca se confía en el cuerpo del webhook.
function verifySignature(request: Request, dataId: string): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) return true; // no configurado aún — se valida igual vía fetchPayment()

  const signatureHeader = request.headers.get("x-signature");
  const requestId = request.headers.get("x-request-id");
  if (!signatureHeader || !requestId) return false;

  const parts = Object.fromEntries(
    signatureHeader.split(",").map((p) => {
      const [k, v] = p.split("=");
      return [k?.trim(), v?.trim()];
    })
  );
  const ts = parts.ts;
  const v1 = parts.v1;
  if (!ts || !v1) return false;

  const manifest = `id:${dataId.toLowerCase()};request-id:${requestId};ts:${ts};`;
  const expected = crypto.createHmac("sha256", secret).update(manifest).digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(v1));
  } catch {
    return false;
  }
}

async function handleNotification(dataId: string | null, type: string | null) {
  if (!dataId || type !== "payment") return NextResponse.json({ ok: true });

  const payment = await fetchPayment(dataId);
  const orderId = payment.external_reference;
  if (!orderId) return NextResponse.json({ ok: true });

  if (payment.status === "approved") {
    await markOrderPaid(orderId, dataId);
    sendDeliveryOrderAlert({
      orderId,
      customerName: (payment.payer?.first_name ?? "Cliente") + (payment.payer?.last_name ? ` ${payment.payer.last_name}` : ""),
      customerPhone: payment.payer?.phone?.number ?? null,
      address: "Ver detalle en el pedido",
      notes: null,
      items: (payment.additional_info?.items ?? []).map((i) => ({
        name: i.title ?? "Ítem",
        price: Number(i.unit_price ?? 0),
        qty: Number(i.quantity ?? 1),
      })),
      total: Number(payment.transaction_amount ?? 0),
      paymentMethod: "mercadopago",
    }).catch((e) => console.error("[email delivery webhook]", e));
  } else if (payment.status === "rejected" || payment.status === "cancelled") {
    await markOrderRejected(orderId, dataId);
  }

  return NextResponse.json({ ok: true });
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  let dataId = searchParams.get("data.id") ?? searchParams.get("id");
  let type = searchParams.get("type") ?? searchParams.get("topic");

  const body = await request.json().catch(() => null) as { type?: string; data?: { id?: string } } | null;
  if (body) {
    dataId = dataId ?? body.data?.id ?? null;
    type = type ?? body.type ?? null;
  }

  if (dataId && !verifySignature(request, dataId)) {
    return NextResponse.json({ error: "Firma inválida." }, { status: 401 });
  }

  try {
    return await handleNotification(dataId, type);
  } catch (e) {
    console.error("[mercadopago webhook]", e);
    // 500 para que Mercado Pago reintente la notificación
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dataId = searchParams.get("data.id") ?? searchParams.get("id");
  const type = searchParams.get("type") ?? searchParams.get("topic");

  if (dataId && !verifySignature(request, dataId)) {
    return NextResponse.json({ error: "Firma inválida." }, { status: 401 });
  }

  try {
    return await handleNotification(dataId, type);
  } catch (e) {
    console.error("[mercadopago webhook]", e);
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}
