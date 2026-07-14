import { NextResponse } from "next/server";
import { createDeliveryOrder, setOrderPreference } from "@/lib/db-delivery";
import { createPaymentPreference, mpEnabled } from "@/lib/mercadopago";
import { sendDeliveryOrderAlert } from "@/lib/email";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Body inválido." }, { status: 400 });

  const { customerName, customerPhone, address, notes, paymentMethod, cart } = body as {
    customerName?: string; customerPhone?: string; address?: string; notes?: string;
    paymentMethod?: "mercadopago" | "efectivo";
    cart?: { id: string; qty: number }[];
  };

  if (!customerName?.trim() || !address?.trim()) {
    return NextResponse.json({ error: "Faltan nombre o dirección." }, { status: 400 });
  }
  if (!cart || cart.length === 0) {
    return NextResponse.json({ error: "El carrito está vacío." }, { status: 400 });
  }
  if (paymentMethod !== "mercadopago" && paymentMethod !== "efectivo") {
    return NextResponse.json({ error: "Método de pago inválido." }, { status: 400 });
  }
  if (paymentMethod === "mercadopago" && !mpEnabled()) {
    return NextResponse.json({ error: "El pago online no está disponible en este momento. Probá con efectivo contra entrega." }, { status: 503 });
  }

  let order;
  try {
    order = await createDeliveryOrder({
      customerName: customerName.trim(),
      customerPhone: customerPhone?.trim() || null,
      address: address.trim(),
      notes: notes?.trim() || null,
      paymentMethod,
      cart,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "No se pudo crear el pedido.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  if (paymentMethod === "efectivo") {
    sendDeliveryOrderAlert({
      orderId: order.id,
      customerName: order.customer_name,
      customerPhone: order.customer_phone,
      address: order.address,
      notes: order.notes,
      items: order.items,
      total: order.total,
      paymentMethod: "efectivo",
    }).catch((e) => console.error("[email delivery]", e));

    return NextResponse.json({ orderId: order.id, status: order.status });
  }

  // mercadopago: crear preferencia con el total calculado server-side
  try {
    const { initPoint, preferenceId } = await createPaymentPreference(
      order.id,
      order.items.map((i) => ({ id: i.id, name: i.name, price: i.price, qty: i.qty }))
    );
    await setOrderPreference(order.id, preferenceId);
    return NextResponse.json({ orderId: order.id, checkoutUrl: initPoint });
  } catch (e) {
    console.error("[mercadopago preference]", e);
    return NextResponse.json({ error: "No se pudo iniciar el pago. Intentá de nuevo o elegí efectivo." }, { status: 502 });
  }
}
