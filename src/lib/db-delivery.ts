import { neon } from "@neondatabase/serverless";

// Conexión a la base SEPARADA de Bengal Delivery (bengal_delivery).
// Independiente de la base de Empresas: precios y carta pueden divergir.
let _client: ReturnType<typeof neon> | null = null;

function getClient() {
  if (!_client) _client = neon(process.env.DATABASE_URL_DELIVERY!);
  return _client;
}

export const sqlDelivery = (strings: TemplateStringsArray, ...values: unknown[]) =>
  getClient()(strings, ...values) as Promise<Record<string, unknown>[]>;

export type DeliveryMenu = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  calories: number | null;
  tags: string[];
  image_url: string | null;
  popular: boolean;
};

export async function getDeliveryMenus(): Promise<DeliveryMenu[]> {
  const rows = await sqlDelivery`
    SELECT id, name, description, category, price, calories, tags, image_url, popular
    FROM menus WHERE active = true
    ORDER BY popular DESC, name
  `;
  return rows.map((r) => ({
    id: r.id as string,
    name: r.name as string,
    description: r.description as string | null,
    category: r.category as string,
    price: Number(r.price),
    calories: r.calories as number | null,
    tags: (r.tags as string[]) ?? [],
    image_url: r.image_url as string | null,
    popular: Boolean(r.popular),
  }));
}

// ─── Pedidos ────────────────────────────────────────────────────────────────

export type OrderItem = { id: string; name: string; price: number; qty: number };
export type PaymentMethod = "mercadopago" | "efectivo";
export type OrderStatus =
  | "pendiente_pago" | "pagado" | "rechazado"
  | "confirmado_efectivo" | "cancelado" | "entregado";

export type DeliveryOrder = {
  id: string;
  customer_name: string;
  customer_phone: string | null;
  address: string;
  notes: string | null;
  items: OrderItem[];
  total: number;
  payment_method: PaymentMethod;
  status: OrderStatus;
  created_at: string;
};

function rowToOrder(r: Record<string, unknown>): DeliveryOrder {
  return {
    id: r.id as string,
    customer_name: r.customer_name as string,
    customer_phone: r.customer_phone as string | null,
    address: r.address as string,
    notes: r.notes as string | null,
    items: r.items as OrderItem[],
    total: Number(r.total),
    payment_method: r.payment_method as PaymentMethod,
    status: r.status as OrderStatus,
    created_at: r.created_at as string,
  };
}

// Recibe solo {id, qty} del cliente y busca el precio real en la DB —
// nunca confiar en un precio que venga del navegador.
export async function createDeliveryOrder(input: {
  customerName: string;
  customerPhone: string | null;
  address: string;
  notes: string | null;
  paymentMethod: PaymentMethod;
  cart: { id: string; qty: number }[];
}): Promise<DeliveryOrder> {
  if (input.cart.length === 0) throw new Error("El carrito está vacío.");

  const ids = input.cart.map((c) => c.id);
  const menuRows = await sqlDelivery`
    SELECT id, name, price FROM menus WHERE id = ANY(${ids}) AND active = true
  `;
  const priceById = new Map(menuRows.map((r) => [r.id as string, { name: r.name as string, price: Number(r.price) }]));

  const items: OrderItem[] = input.cart.map((c) => {
    const menu = priceById.get(c.id);
    if (!menu) throw new Error("Uno de los platos ya no está disponible.");
    return { id: c.id, name: menu.name, price: menu.price, qty: c.qty };
  });
  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const initialStatus: OrderStatus = input.paymentMethod === "efectivo" ? "confirmado_efectivo" : "pendiente_pago";

  const rows = await sqlDelivery`
    INSERT INTO orders (customer_name, customer_phone, address, notes, items, total, payment_method, status)
    VALUES (${input.customerName}, ${input.customerPhone}, ${input.address}, ${input.notes},
            ${JSON.stringify(items)}, ${total}, ${input.paymentMethod}, ${initialStatus})
    RETURNING *
  `;
  return rowToOrder(rows[0]);
}

export async function getDeliveryOrder(id: string): Promise<DeliveryOrder | null> {
  const rows = await sqlDelivery`SELECT * FROM orders WHERE id = ${id} LIMIT 1`;
  return rows[0] ? rowToOrder(rows[0]) : null;
}

export async function setOrderPreference(orderId: string, preferenceId: string) {
  await sqlDelivery`UPDATE orders SET mp_preference_id = ${preferenceId}, updated_at = now() WHERE id = ${orderId}`;
}

export async function getOrderByPreferenceId(preferenceId: string): Promise<DeliveryOrder | null> {
  const rows = await sqlDelivery`SELECT * FROM orders WHERE mp_preference_id = ${preferenceId} LIMIT 1`;
  return rows[0] ? rowToOrder(rows[0]) : null;
}

export async function markOrderPaid(orderId: string, paymentId: string) {
  await sqlDelivery`
    UPDATE orders SET status = 'pagado', mp_payment_id = ${paymentId}, updated_at = now()
    WHERE id = ${orderId} AND status != 'pagado'
  `;
}

export async function markOrderRejected(orderId: string, paymentId: string) {
  await sqlDelivery`
    UPDATE orders SET status = 'rechazado', mp_payment_id = ${paymentId}, updated_at = now()
    WHERE id = ${orderId} AND status = 'pendiente_pago'
  `;
}
