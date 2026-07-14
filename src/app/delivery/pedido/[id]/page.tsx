import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock, XCircle, Banknote } from "lucide-react";
import { cormorant, jost } from "@/lib/brand-fonts";
import { getDeliveryOrder } from "@/lib/db-delivery";

export const dynamic = "force-dynamic";

const STATUS_UI: Record<string, { icon: React.ReactNode; title: string; text: string; color: string }> = {
  pagado: {
    icon: <CheckCircle2 size={40} className="text-green-400" />,
    title: "¡Pago confirmado!",
    text: "Tu pedido ya está en la cocina de Bengal. Te va a llegar en breve.",
    color: "border-green-500/30",
  },
  confirmado_efectivo: {
    icon: <Banknote size={40} className="text-[#C9A45C]" />,
    title: "Pedido confirmado",
    text: "Pagás en efectivo cuando lo recibas. Tu pedido ya está en la cocina de Bengal.",
    color: "border-[#C9A45C]/30",
  },
  pendiente_pago: {
    icon: <Clock size={40} className="text-amber-400" />,
    title: "Esperando el pago",
    text: "Todavía no confirmamos tu pago. Si ya pagaste, esta pantalla se va a actualizar en unos segundos.",
    color: "border-amber-500/30",
  },
  rechazado: {
    icon: <XCircle size={40} className="text-red-400" />,
    title: "El pago no se pudo procesar",
    text: "Mercado Pago rechazó el pago. Podés intentar de nuevo o elegir efectivo contra entrega.",
    color: "border-red-500/30",
  },
  cancelado: {
    icon: <XCircle size={40} className="text-red-400" />,
    title: "Pedido cancelado",
    text: "Este pedido fue cancelado.",
    color: "border-red-500/30",
  },
  entregado: {
    icon: <CheckCircle2 size={40} className="text-green-400" />,
    title: "¡Pedido entregado!",
    text: "Gracias por elegir Bengal.",
    color: "border-green-500/30",
  },
};

export default async function OrderStatusPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getDeliveryOrder(id);
  if (!order) notFound();

  const ui = STATUS_UI[order.status] ?? STATUS_UI.pendiente_pago;

  return (
    <div
      className={`${cormorant.variable} ${jost.variable} bg-[#0B0A09] text-[#EDE6DA] min-h-screen flex flex-col`}
      style={{ fontFamily: "var(--font-jost), sans-serif" }}
    >
      {order.status === "pendiente_pago" && (
        <meta httpEquiv="refresh" content="5" />
      )}

      <header className="border-b border-white/5">
        <div className="max-w-2xl mx-auto px-5 h-16 flex items-center">
          <Link href="/" className="text-lg tracking-[0.35em] font-light hover:text-[#C9A45C] transition-colors" style={{ fontFamily: "var(--font-cormorant), serif" }}>
            BENGAL
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-5 py-16">
        <div className={`w-full max-w-md border ${ui.color} bg-[#121009] p-8 md:p-10 text-center`}>
          <div className="flex justify-center mb-6">{ui.icon}</div>
          <h1 className="text-2xl md:text-3xl font-light mb-3" style={{ fontFamily: "var(--font-cormorant), serif" }}>
            {ui.title}
          </h1>
          <p className="text-[#B7AD9C] font-light leading-relaxed mb-8">{ui.text}</p>

          <div className="text-left border-t border-white/10 pt-6 space-y-2">
            {order.items.map((i) => (
              <div key={i.id} className="flex justify-between text-sm">
                <span className="text-[#EDE6DA]">{i.qty}× {i.name}</span>
                <span className="text-[#B7AD9C]">${(i.price * i.qty).toLocaleString("es-AR")}</span>
              </div>
            ))}
            <div className="flex justify-between pt-3 mt-3 border-t border-white/10 font-medium">
              <span>Total</span>
              <span className="text-[#C9A45C]">${order.total.toLocaleString("es-AR")}</span>
            </div>
          </div>

          <p className="text-[#B7AD9C]/60 text-xs mt-6 font-light">
            N° de pedido: <span className="font-mono">{order.id.slice(-8).toUpperCase()}</span>
          </p>

          <Link
            href="/delivery"
            className="inline-block mt-8 px-6 py-3 border border-[#C9A45C]/50 text-[#C9A45C] text-[11px] uppercase tracking-[0.25em] hover:bg-[#C9A45C] hover:text-[#0B0A09] transition-all"
          >
            Volver a la carta
          </Link>
        </div>
      </main>
    </div>
  );
}
