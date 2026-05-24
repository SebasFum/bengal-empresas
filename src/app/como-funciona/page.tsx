import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle, Clock } from "lucide-react";
import { steps } from "@/lib/data";

const timeline = [
  { time: "08:00 hs", event: "Bengal actualiza el menú del día en el portal." },
  { time: "10:00 hs", event: "Cierre de pedidos. Los empleados no pueden modificar después de esta hora." },
  { time: "10:30 hs", event: "Bengal consolida el pedido y comienza la producción." },
  { time: "12:00 hs", event: "Producción finalizada y despacho desde cocina central." },
  { time: "12:30 hs", event: "Entrega en tu empresa. Cada vianda identificada por empleado." },
];

export default function ComoFuncionaPage() {
  return (
    <>
      {/* HERO */}
      <section className="bg-graphite-800 pt-28 pb-14">
        <div className="container-xl text-center">
          <div className="divider-gold mx-auto mb-4" />
          <h1 className="text-5xl font-bold text-cream-100 mb-4">¿Cómo funciona?</h1>
          <p className="text-warm-400 text-xl max-w-xl mx-auto">
            Un proceso simple y predecible, diseñado para que no tengas que preocuparte por nada.
          </p>
        </div>
      </section>

      {/* PASOS */}
      <section className="section-py bg-cream-100">
        <div className="container-xl">
          <h2 className="text-4xl font-bold text-graphite-800 text-center mb-14">Los 4 pasos</h2>
          <div className="max-w-3xl mx-auto space-y-8">
            {steps.map((step, i) => (
              <div key={step.number} className="flex gap-6">
                <div className="flex-shrink-0 flex flex-col items-center">
                  <div
                    className="w-14 h-14 bg-terracotta-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg"
                    style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                  >
                    {step.number}
                  </div>
                  {i < steps.length - 1 && <div className="w-0.5 h-full bg-terracotta-200 mt-3" />}
                </div>
                <div className="bg-white rounded-2xl p-7 shadow-card border border-cream-200 flex-1 -mt-1">
                  <h3 className="text-xl font-bold text-graphite-800 mb-3">{step.title}</h3>
                  <p className="text-warm-500 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TIMELINE DEL DÍA */}
      <section className="section-py bg-graphite-800">
        <div className="container-xl">
          <div className="text-center mb-12">
            <div className="divider-gold mx-auto mb-4" />
            <h2 className="text-4xl font-bold text-cream-100 mb-3">Un día con Bengal</h2>
            <p className="text-warm-400 text-lg max-w-md mx-auto">
              Así se ve un día de operación. Predecible, coordinado, impecable.
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            {timeline.map((item, i) => (
              <div key={item.time} className="flex gap-5 mb-6 last:mb-0">
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className="w-12 h-12 bg-terracotta-500/20 border border-terracotta-500/40 rounded-xl flex items-center justify-center">
                    <Clock size={18} className="text-terracotta-400" />
                  </div>
                  {i < timeline.length - 1 && <div className="w-0.5 h-6 bg-graphite-600 mt-2" />}
                </div>
                <div className="bg-graphite-700 rounded-xl px-6 py-4 border border-graphite-600 flex-1">
                  <span className="text-terracotta-400 font-bold text-sm">{item.time}</span>
                  <p className="text-warm-300 text-sm mt-1">{item.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* POR QUÉ FUNCIONA */}
      <section className="section-py bg-cream-100">
        <div className="container-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative h-80 lg:h-auto lg:aspect-[4/3] rounded-2xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800&q=85"
                alt="Portal de pedidos Bengal"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <div className="divider-gold mb-6" />
              <h2 className="text-4xl font-bold text-graphite-800 mb-5">El portal de pedidos</h2>
              <p className="text-warm-500 text-lg leading-relaxed mb-6">
                Diseñado para que cualquier persona pueda usar sin capacitación. Mobile first, sin burocracia.
              </p>
              <div className="space-y-4">
                {[
                  "Ingresás con mail y contraseña (o magic link)",
                  "Ves el menú del día con fotos y descripción",
                  "Elegís en máximo 3 clics",
                  "Confirmás y ya está",
                  "Si mañana querés lo mismo, hay un botón de 'repetir'",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle size={18} className="text-terracotta-500 mt-0.5 flex-shrink-0" />
                    <span className="text-graphite-700 text-sm">{item}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-8">
                <Link href="/login" className="inline-flex items-center gap-2 px-5 py-3 bg-terracotta-500 text-white font-semibold rounded-xl hover:bg-terracotta-600 transition-all text-sm">
                  Acceder al portal <ArrowRight size={15} />
                </Link>
                <Link href="/degustaciones" className="inline-flex items-center gap-2 px-5 py-3 border-2 border-terracotta-500 text-terracotta-600 font-semibold rounded-xl hover:bg-terracotta-500 hover:text-white transition-all text-sm">
                  Solicitar demo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ RÁPIDO */}
      <section className="section-py bg-cream-200">
        <div className="container-xl">
          <h2 className="text-3xl font-bold text-graphite-800 text-center mb-10">Preguntas que siempre surgen</h2>
          <div className="max-w-2xl mx-auto grid grid-cols-1 gap-4">
            {[
              { q: "¿Puedo cambiar el pedido después del corte?", a: "No. El corte de las 10:00 hs es definitivo ya que se inicia la producción. Por eso sugerimos recordatorio automático al equipo." },
              { q: "¿Qué pasa si un empleado tiene restricciones alimentarias?", a: "Cada empleado carga sus restricciones en el perfil y el sistema filtra automáticamente las opciones disponibles para esa persona." },
              { q: "¿Cuántos usuarios puede tener mi empresa?", a: "Los que necesités. No hay límite de usuarios por empresa." },
            ].map((item) => (
              <div key={item.q} className="bg-white rounded-xl p-6 shadow-card border border-cream-200">
                <h3 className="font-bold text-graphite-800 mb-2">{item.q}</h3>
                <p className="text-warm-500 text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/faq" className="text-terracotta-600 font-semibold hover:text-terracotta-700 transition-colors">
              Ver todas las preguntas frecuentes →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
