import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle, Users, TrendingUp, Shield, Clock } from "lucide-react";

const profiles = [
  {
    role: "RRHH & Bienestar",
    icon: Users,
    pain: "Coordinás comida para todo el equipo y hay siempre algún problema.",
    solution: "Cada empleado elige su propia vianda. Vos solo administrás desde el panel.",
    benefits: ["Satisfacción del equipo aumenta", "Sin quejas sobre la comida", "Sin tarea de coordinación"],
  },
  {
    role: "Compras & Administración",
    icon: TrendingUp,
    pain: "Necesitás proveedor confiable, factura clara y presupuesto controlable.",
    solution: "Factura mensual detallada por empleado. Presupuesto por persona definido de antemano.",
    benefits: ["Control de costos real", "Facturación simple", "Sin sorpresas en el precio"],
  },
  {
    role: "Facility & Office Manager",
    icon: Shield,
    pain: "Querés que la comida llegue puntual y sin complicaciones logísticas.",
    solution: "Llegamos en horario, con todo identificado y en temperatura correcta.",
    benefits: ["Puntualidad garantizada", "Cero gestión del día a día", "Soporte ante cualquier imprevisto"],
  },
];

const companySizes = [
  {
    label: "Equipo pequeño",
    range: "5 a 20 personas",
    description: "Ideal para startups, estudios y equipos compactos. Máxima flexibilidad.",
    features: ["Pedido diario o semanal", "Sin compromisos de mínimo", "Facturación mensual", "Soporte por WhatsApp"],
  },
  {
    label: "Empresa mediana",
    range: "20 a 100 personas",
    description: "Solución estructurada con panel empresa y administración simplificada.",
    features: ["Panel empresa completo", "Gestión de usuarios", "Resumen semanal", "Account manager dedicado"],
    featured: true,
  },
  {
    label: "Corporación",
    range: "+100 personas",
    description: "Implementación a medida, integración con sistemas internos y SLA garantizado.",
    features: ["Acuerdo a medida", "Integración sistemas", "SLA contractual", "Facturación centralizada"],
  },
];

export default function EmpresasPage() {
  return (
    <>
      {/* HERO */}
      <section className="relative min-h-[60vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=85"
            alt="Empresa premium"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-graphite-900/90 to-graphite-900/50" />
        </div>
        <div className="relative z-10 container-xl pt-24 pb-16">
          <div className="max-w-xl">
            <span className="text-terracotta-300 text-sm font-semibold uppercase tracking-wider">Para líderes que cuidan a su equipo</span>
            <h1 className="text-5xl md:text-6xl font-bold text-white mt-3 mb-5">
              Soluciones para empresas
            </h1>
            <p className="text-cream-300 text-xl leading-relaxed mb-8">
              Independientemente de tu área, Bengal tiene una solución que hace tu trabajo más fácil y mejora la experiencia de tu equipo.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/degustaciones" className="inline-flex items-center gap-2 px-6 py-3.5 bg-terracotta-500 text-white font-semibold rounded-xl hover:bg-terracotta-600 transition-all">
                Solicitar propuesta <ArrowRight size={16} />
              </Link>
              <Link href="/como-funciona" className="inline-flex items-center gap-2 px-6 py-3.5 bg-white/10 text-white font-semibold rounded-xl border border-white/30 hover:bg-white/20 transition-all">
                Ver cómo funciona
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* POR PERFIL */}
      <section className="section-py bg-cream-100">
        <div className="container-xl">
          <div className="text-center mb-14">
            <div className="divider-gold mx-auto mb-4" />
            <h2 className="text-4xl font-bold text-graphite-800 mb-3">Pensado para tu rol</h2>
            <p className="text-warm-500 text-lg max-w-lg mx-auto">
              Cada responsable tiene sus propios problemas. Bengal resuelve los de todos.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {profiles.map((p) => (
              <div key={p.role} className="bg-white rounded-2xl p-8 shadow-card border border-cream-200">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-terracotta-50 rounded-2xl mb-5">
                  <p.icon size={24} className="text-terracotta-500" />
                </div>
                <h3 className="text-xl font-bold text-graphite-800 mb-4">{p.role}</h3>
                <div className="bg-cream-100 rounded-xl p-4 mb-5">
                  <p className="text-xs font-semibold text-warm-500 uppercase tracking-wider mb-1">El problema</p>
                  <p className="text-graphite-700 text-sm italic">&ldquo;{p.pain}&rdquo;</p>
                </div>
                <div className="bg-terracotta-50 rounded-xl p-4 mb-5">
                  <p className="text-xs font-semibold text-terracotta-600 uppercase tracking-wider mb-1">La solución Bengal</p>
                  <p className="text-graphite-700 text-sm">{p.solution}</p>
                </div>
                <ul className="space-y-2">
                  {p.benefits.map((b) => (
                    <li key={b} className="flex items-center gap-2 text-sm text-graphite-600">
                      <CheckCircle size={13} className="text-terracotta-500 flex-shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* POR TAMAÑO */}
      <section className="section-py bg-graphite-800">
        <div className="container-xl">
          <div className="text-center mb-12">
            <div className="divider-gold mx-auto mb-4" />
            <h2 className="text-4xl font-bold text-cream-100 mb-3">Según el tamaño de tu empresa</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {companySizes.map((size) => (
              <div
                key={size.label}
                className={`rounded-2xl p-8 border ${
                  size.featured
                    ? "bg-terracotta-500 border-terracotta-400 ring-2 ring-terracotta-300/30"
                    : "bg-graphite-700 border-graphite-600"
                }`}
              >
                {size.featured && (
                  <span className="inline-block px-3 py-1 bg-white/20 text-white text-xs font-semibold rounded-full mb-4">
                    Más popular
                  </span>
                )}
                <h3 className={`text-xl font-bold mb-1 ${size.featured ? "text-white" : "text-cream-100"}`}>
                  {size.label}
                </h3>
                <p className={`font-semibold mb-3 ${size.featured ? "text-terracotta-100" : "text-terracotta-400"}`}>
                  {size.range}
                </p>
                <p className={`text-sm leading-relaxed mb-6 ${size.featured ? "text-terracotta-100" : "text-warm-400"}`}>
                  {size.description}
                </p>
                <ul className="space-y-2.5 mb-8">
                  {size.features.map((f) => (
                    <li key={f} className={`flex items-center gap-2 text-sm ${size.featured ? "text-white" : "text-warm-300"}`}>
                      <CheckCircle size={14} className={size.featured ? "text-white" : "text-terracotta-400"} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/contacto"
                  className={`block text-center py-3 rounded-xl font-semibold text-sm transition-all ${
                    size.featured
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

      {/* PILOTO */}
      <section className="section-py bg-cream-100">
        <div className="container-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="divider-gold mb-6" />
              <h2 className="text-4xl font-bold text-graphite-800 mb-5">Empezá con un piloto</h2>
              <p className="text-warm-500 text-lg leading-relaxed mb-6">
                No pedimos compromiso a largo plazo. Arrancamos con un piloto de 30 días para que tu equipo y vos puedan evaluar la propuesta con calma.
              </p>
              <div className="space-y-4 mb-8">
                {[
                  { icon: Clock, text: "Arranque en 5 días hábiles desde la firma" },
                  { icon: Users, text: "Sin mínimo de permanencia" },
                  { icon: Shield, text: "Sin costo de alta ni configuración" },
                  { icon: TrendingUp, text: "Informe de satisfacción al final del piloto" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-terracotta-50 rounded-xl flex items-center justify-center">
                      <Icon size={16} className="text-terracotta-500" />
                    </div>
                    <span className="text-graphite-700 text-sm">{text}</span>
                  </div>
                ))}
              </div>
              <Link href="/degustaciones" className="inline-flex items-center gap-2 px-6 py-3.5 bg-terracotta-500 text-white font-semibold rounded-xl hover:bg-terracotta-600 transition-all">
                Arrancar el piloto <ArrowRight size={16} />
              </Link>
            </div>
            <div className="relative h-80 lg:h-auto lg:aspect-square rounded-2xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=85"
                alt="Equipo corporativo"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
