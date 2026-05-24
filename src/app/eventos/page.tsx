import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle } from "lucide-react";

const eventTypes = [
  {
    title: "Desayunos Corporativos",
    description: "Ideal para kick-offs, bienvenidas, reuniones matutinas o días de logro. Pastelería artesanal, cafés especiales y opciones saladas premium.",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=85",
    includes: ["Pastelería artesanal", "Sándwiches premium", "Cafés y jugos", "Montaje incluido"],
    capacity: "Desde 10 personas",
  },
  {
    title: "Coffee Breaks",
    description: "Para capacitaciones, workshops y reuniones largas. Selección de snacks, frutas y bebidas calientes servidas en el momento.",
    image: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=600&q=85",
    includes: ["Mini sándwiches", "Frutas frescas", "Scones y medialunas", "Bebidas calientes y frías"],
    capacity: "Desde 8 personas",
  },
  {
    title: "Almuerzos Ejecutivos",
    description: "Reuniones de directorio, cierre con clientes o presentaciones especiales. Servicio impecable con montaje de mesa y atención personalizada.",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=85",
    includes: ["Entrada + principal + postre", "Opciones de maridaje", "Montaje premium de mesa", "Servicio personalizado"],
    capacity: "Desde 6 personas",
  },
  {
    title: "Cenas y Celebraciones",
    description: "Fin de año, lanzamientos, premiaciones. Menús especiales, decoración personalizada y servicio a la altura de la ocasión.",
    image: "https://images.unsplash.com/photo-1555244162-803834f70033?w=600&q=85",
    includes: ["Menú de 3 o 4 pasos", "Bebidas y brindis", "Decoración temática opcional", "Mozos incluidos"],
    capacity: "Desde 20 personas",
  },
  {
    title: "Catering para Capacitaciones",
    description: "Box lunch o servicio en sala para formaciones internas, trainings y workshops de medio día o día completo.",
    image: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=600&q=85",
    includes: ["Box lunch premium", "Snacks de media mañana", "Coffee break", "Hidratación incluida"],
    capacity: "Desde 10 personas",
  },
  {
    title: "Eventos Especiales",
    description: "Lanzamientos de producto, aniversarios, visitas de clientes internacionales. Cada evento es diseñado a medida.",
    image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&q=85",
    includes: ["Menú y formato a medida", "Presentación personalizada", "Coordinación de evento", "Servicio completo"],
    capacity: "Sin mínimo",
  },
];

export default function EventosPage() {
  return (
    <>
      {/* HERO */}
      <section className="relative min-h-[65vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1600&q=85"
            alt="Eventos corporativos premium"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-graphite-900/85 to-graphite-900/40" />
        </div>
        <div className="relative z-10 container-xl pt-24 pb-16">
          <div className="max-w-xl">
            <span className="text-terracotta-300 text-sm font-semibold uppercase tracking-wider">Para cada ocasión</span>
            <h1 className="text-5xl md:text-6xl font-bold text-white mt-3 mb-5">
              Eventos para Empresas
            </h1>
            <p className="text-cream-300 text-xl leading-relaxed mb-8">
              Desde el desayuno del lunes hasta la cena de fin de año. Cada ocasión merece una experiencia impecable.
            </p>
            <Link href="/contacto" className="inline-flex items-center gap-2 px-6 py-3.5 bg-terracotta-500 text-white font-semibold rounded-xl hover:bg-terracotta-600 transition-all">
              Consultar disponibilidad <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* TIPOS DE EVENTO */}
      <section className="section-py bg-cream-100">
        <div className="container-xl">
          <div className="text-center mb-14">
            <div className="divider-gold mx-auto mb-4" />
            <h2 className="text-4xl font-bold text-graphite-800 mb-3">Servicios disponibles</h2>
            <p className="text-warm-500 text-lg max-w-lg mx-auto">
              Cada formato está pensado para una necesidad específica. Todos con la calidad Bengal.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {eventTypes.map((event) => (
              <div key={event.title} className="bg-white rounded-2xl overflow-hidden shadow-card border border-cream-200 card-lift">
                <div className="relative h-44 img-zoom">
                  <Image src={event.image} alt={event.title} fill className="object-cover" />
                  <div className="absolute bottom-3 left-3">
                    <span className="px-3 py-1.5 bg-graphite-800/80 text-cream-200 text-xs font-medium rounded-full backdrop-blur-sm">
                      {event.capacity}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-graphite-800 mb-2">{event.title}</h3>
                  <p className="text-warm-500 text-sm leading-relaxed mb-4">{event.description}</p>
                  <ul className="space-y-1.5 mb-5">
                    {event.includes.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-graphite-600">
                        <CheckCircle size={13} className="text-terracotta-500 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link href="/contacto" className="block text-center py-2.5 border-2 border-terracotta-500 text-terracotta-600 text-sm font-semibold rounded-xl hover:bg-terracotta-500 hover:text-white transition-all">
                    Solicitar cotización
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESO */}
      <section className="section-py bg-graphite-800">
        <div className="container-xl">
          <div className="text-center mb-12">
            <div className="divider-gold mx-auto mb-4" />
            <h2 className="text-4xl font-bold text-cream-100 mb-3">¿Cómo contratás un evento?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Consultás", desc: "Nos contás el tipo de evento, fecha, cantidad de personas y presupuesto." },
              { step: "02", title: "Recibís propuesta", desc: "En 24hs te enviamos una propuesta personalizada con menú y precio final." },
              { step: "03", title: "Confirmás", desc: "Con un anticipo del 50% reservamos tu fecha y comenzamos la producción." },
              { step: "04", title: "Lo disfrutás", desc: "Llegamos antes, montamos, servimos y retiramos. Vos solo disfrutás." },
            ].map((s) => (
              <div key={s.step} className="bg-graphite-700 rounded-2xl p-6 border border-graphite-600">
                <div className="text-3xl font-bold text-terracotta-500 mb-3" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>{s.step}</div>
                <h3 className="font-bold text-cream-100 mb-2">{s.title}</h3>
                <p className="text-warm-400 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-py bg-terracotta-500">
        <div className="container-xl text-center">
          <h2 className="text-4xl font-bold text-white mb-4">¿Tenés un evento en mente?</h2>
          <p className="text-terracotta-100 text-xl mb-8 max-w-md mx-auto">
            Contanos la idea y en 24hs te enviamos una propuesta a medida.
          </p>
          <Link href="/contacto" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-terracotta-600 font-bold rounded-xl hover:bg-cream-100 transition-colors text-lg">
            Solicitar cotización <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}
