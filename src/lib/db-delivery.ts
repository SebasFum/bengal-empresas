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
