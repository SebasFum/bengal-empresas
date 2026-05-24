import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle, Clock, Users, Star, Truck } from "lucide-react";

const benefits = [
  { icon: Star, title: "Calidad gourmet", desc: "Ingredientes premium, preparación artesanal, presentación que impresiona." },
  { icon: Clock, title: "Corte a las 10hs", desc: "El equipo elige hasta las 10:00. A las 12:30 está en tu empresa." },
  { icon: Users, title: "Personalizable", desc: "Restricciones alimentarias, preferencias y presupuesto por empleado." },
  { icon: Truck, title: "Packaging premium", desc: "Identificadas por empleado, temperatura controlada, sin mezclas." },
];

const menuTypes = [
  {
    name: "Menú Estándar",
    price: "desde $5.900",
    description: "Plato principal + ensalada + postre o fruta.",
    includes: ["Proteína + guarnición", "Ensalada de estación", "Fruta o postre"],
    color: "bg-cream-200",
  },
  {
    name: "Menú Premium",
    price: "desde $7.800",
    description: "Plato principal gourmet + entrada + postre artesanal.",
    includes: ["Entrada o sopa", "Plato principal con guarnición premium", "Postre artesanal"],
    color: "bg-terracotta-500",
    featured: true,
  },
  {
    name: "Menú Saludable",
    price: "desde $6.200",
    description: "Opciones bajas en calorías, vegetarianas y veganas.",
    includes: ["Bowl o wrap integral", "Sin frituras ni salsas pesadas", "Fruta fresca"],
    color: "bg-graphite-700",
  },
];

export default function ViandasPage() {
  return (
    <>
      {/* HERO */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1547592180-85f173990554?w=1600&q=85"
            alt="Viandas corporativas gourmet"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-graphite-900/85 to-graphite-900/40" />
        </div>

        <div className="relative z-10 container-xl pt-24 pb-16">
          <div className="max-w-xl">
            <span className="text-terracotta-300 text-sm font-semibold uppercase tracking-wider">Servicio diario</span>
            <h1 className="text-5xl md:text-6xl font-bold text-white mt-3 mb-6">
              Viandas Corporativas
            </h1>
            <p className="text-cream-300 text-xl leading-relaxed mb-8">
              Gastronomía premium para tu equipo, cada día. Sin las complicaciones de gestionar la comida en la oficina.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/degustaciones" className="inline-flex items-center gap-2 px-6 py-3.5 bg-terracotta-500 text-white font-semibold rounded-xl hover:bg-terracotta-600 transition-all">
                Solicitar degustación <ArrowRight size={16} />
              </Link>
              <Link href="/menus" className="inline-flex items-center gap-2 px-6 py-3.5 bg-white/10 text-white font-semibold rounded-xl border border-white/30 hover:bg-white/20 transition-all">
                Ver menús
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFICIOS */}
      <section className="section-py bg-cream-100">
        <div className="container-xl">
          <div className="text-center mb-12">
            <div className="divider-gold mx-auto mb-4" />
            <h2 className="text-4xl font-bold text-graphite-800 mb-3">Por qué eligen Bengal</h2>
            <p className="text-warm-500 text-lg max-w-md mx-auto">No es solo comida. Es experiencia, operación y detalle.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b) => (
              <div key={b.title} className="bg-white rounded-2xl p-7 shadow-card border border-cream-200 text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-terracotta-50 rounded-2xl mb-4">
                  <b.icon size={24} className="text-terracotta-500" />
                </div>
                <h3 className="font-bold text-graphite-800 mb-2">{b.title}</h3>
                <p className="text-warm-500 text-sm leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TIPOS DE MENÚ */}
      <section className="section-py bg-graphite-800">
        <div className="container-xl">
          <div className="text-center mb-12">
            <div className="divider-gold mx-auto mb-4" />
            <h2 className="text-4xl font-bold text-cream-100 mb-3">Modalidades disponibles</h2>
            <p className="text-warm-400 text-lg max-w-md mx-auto">Elegís la que mejor se adapta a tu equipo y presupuesto.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {menuTypes.map((type) => (
              <div
                key={type.name}
                className={`rounded-2xl p-8 ${type.featured ? "bg-terracotta-500 ring-2 ring-terracotta-300/50 scale-[1.02]" : "bg-graphite-700 border border-graphite-600"}`}
              >
                {type.featured && (
                  <span className="inline-block px-3 py-1 bg-white/20 text-white text-xs font-semibold rounded-full mb-4">
                    Más elegido
                  </span>
                )}
                <h3 className={`text-2xl font-bold mb-1 ${type.featured ? "text-white" : "text-cream-100"}`}>{type.name}</h3>
                <p className={`text-xl font-semibold mb-3 ${type.featured ? "text-terracotta-100" : "text-terracotta-400"}`}>{type.price}</p>
                <p className={`text-sm mb-6 ${type.featured ? "text-terracotta-100" : "text-warm-400"}`}>{type.description}</p>
                <ul className="space-y-2.5 mb-8">
                  {type.includes.map((item) => (
                    <li key={item} className={`flex items-start gap-2 text-sm ${type.featured ? "text-white" : "text-warm-300"}`}>
                      <CheckCircle size={15} className={`mt-0.5 flex-shrink-0 ${type.featured ? "text-white" : "text-terracotta-400"}`} />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/degustaciones"
                  className={`block text-center py-3 rounded-xl font-semibold text-sm transition-all ${
                    type.featured
                      ? "bg-white text-terracotta-600 hover:bg-cream-100"
                      : "border-2 border-terracotta-400 text-terracotta-400 hover:bg-terracotta-500 hover:text-white"
                  }`}
                >
                  Solicitar propuesta
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DETALLE OPERATIVO */}
      <section className="section-py bg-cream-100">
        <div className="container-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="divider-gold mb-6" />
              <h2 className="text-4xl font-bold text-graphite-800 mb-5">
                Operación impecable, sin fricciones
              </h2>
              <p className="text-warm-500 text-lg leading-relaxed mb-8">
                Gestionamos todo el proceso para que vos solo tengas que recibir. Sin llamadas de confirmación, sin errores de pedido, sin temperatura inadecuada.
              </p>
              <div className="space-y-4">
                {[
                  "Cada vianda identificada con nombre del empleado",
                  "Caja térmica por empresa, temperatura controlada",
                  "Lista de producción consolidada para tu empresa",
                  "Factura mensual con resumen por empleado",
                  "Soporte operativo de lunes a viernes",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle size={18} className="text-terracotta-500 mt-0.5 flex-shrink-0" />
                    <span className="text-graphite-700 text-sm">{item}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/contacto"
                className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-terracotta-500 text-white font-semibold rounded-xl hover:bg-terracotta-600 transition-all"
              >
                Consultar condiciones <ArrowRight size={16} />
              </Link>
            </div>
            <div className="relative h-80 lg:h-auto lg:aspect-square rounded-2xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1583394293214-0b7c41b48c61?w=800&q=85"
                alt="Packaging premium Bengal"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-py bg-terracotta-500">
        <div className="container-xl text-center">
          <h2 className="text-4xl font-bold text-white mb-4">¿Querés conocer la propuesta en persona?</h2>
          <p className="text-terracotta-100 text-xl mb-8 max-w-lg mx-auto">
            Pedí una degustación gratuita para tu equipo. Sin compromiso, sin costo.
          </p>
          <Link href="/degustaciones" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-terracotta-600 font-bold rounded-xl hover:bg-cream-100 transition-colors text-lg">
            Solicitar degustación gratis <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}
