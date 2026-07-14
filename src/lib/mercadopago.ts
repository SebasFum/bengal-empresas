import { MercadoPagoConfig, Preference, Payment } from "mercadopago";

export function mpEnabled() {
  return !!process.env.MP_ACCESS_TOKEN;
}

function getClient() {
  return new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });
}

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://bengalrestaurante.com.ar";
}

type PreferenceItem = { id: string; name: string; price: number; qty: number };

// Crea una preferencia de pago (Checkout Pro) para un pedido puntual.
// El monto lo fija el ítem, no algo que el cliente pueda manipular en el navegador.
export async function createPaymentPreference(orderId: string, items: PreferenceItem[]) {
  const client = getClient();
  const preference = new Preference(client);
  const base = siteUrl();

  const result = await preference.create({
    body: {
      items: items.map((i) => ({
        id: i.id,
        title: i.name.slice(0, 250),
        quantity: i.qty,
        unit_price: i.price,
        currency_id: "ARS",
      })),
      external_reference: orderId,
      back_urls: {
        success: `${base}/delivery/pedido/${orderId}`,
        pending: `${base}/delivery/pedido/${orderId}`,
        failure: `${base}/delivery/pedido/${orderId}`,
      },
      auto_return: "approved",
      notification_url: `${base}/api/delivery/webhook`,
      statement_descriptor: "BENGAL DELIVERY",
    },
  });

  return { initPoint: result.init_point as string, preferenceId: result.id as string };
}

// Nunca confiar en el status que manda el webhook/query param del navegador:
// siempre re-consultar el pago contra la API de MP con el access token propio.
export async function fetchPayment(paymentId: string) {
  const client = getClient();
  const payment = new Payment(client);
  return payment.get({ id: paymentId });
}
