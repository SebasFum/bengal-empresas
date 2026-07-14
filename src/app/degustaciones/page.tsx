"use client";

import { useState } from "react";
import Image from "next/image";
import { CheckCircle, ArrowRight, Send } from "lucide-react";

export default function DegustacionesPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nombre: "", empresa: "", cargo: "", email: "", telefono: "", personas: "", mensaje: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <>
      {/* HERO */}
      <section className="relative min-h-[55vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600&q=85"
            alt="Degustación corporativa"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-graphite-900/90 to-graphite-900/50" />
        </div>
        <div className="relative z-10 container-xl pt-24 pb-14">
          <div className="max-w-lg">
            <span className="text-terracotta-300 text-sm font-semibold uppercase tracking-wider">Sin costo, sin compromiso</span>
            <h1 className="text-5xl md:text-6xl font-bold text-white mt-3 mb-5">
              Degustación gratuita
            </h1>
            <p className="text-cream-300 text-xl leading-relaxed">
              La mejor forma de conocer Bengal es probarla. Te llevamos una selección de menús para que tu equipo decida.
            </p>
          </div>
        </div>
      </section>

      {/* QUÉ INCLUYE */}
      <section className="py-12 bg-cream-100">
        <div className="container-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Selección de platos", desc: "Traemos 3 o 4 platos representativos del menú estándar y premium para que prueben variedad.", icon: "🍽" },
              { title: "Sin costos ocultos", desc: "La degustación es 100% gratuita para empresas de más de 10 personas.", icon: "✅" },
              { title: "Propuesta incluida", desc: "Después de la degustación te enviamos una propuesta personalizada con precios y condiciones.", icon: "📋" },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-2xl p-7 shadow-card border border-cream-200 text-center">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="font-bold text-graphite-800 mb-2">{item.title}</h3>
                <p className="text-warm-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FORMULARIO */}
      <section className="section-py bg-cream-200">
        <div className="container-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">
            {/* Left */}
            <div>
              <div className="divider-gold mb-6" />
              <h2 className="text-4xl font-bold text-graphite-800 mb-5">Solicitá tu degustación</h2>
              <p className="text-warm-500 text-lg leading-relaxed mb-8">
                Completá el formulario y te contactamos en menos de 24 horas hábiles para coordinar.
              </p>
              <div className="space-y-4">
                {[
                  { icon: CheckCircle, text: "Respuesta garantizada en 24hs hábiles" },
                  { icon: CheckCircle, text: "Coordinamos fecha y horario que te convenga" },
                  { icon: CheckCircle, text: "Llegamos a tu empresa con todo listo" },
                  { icon: CheckCircle, text: "Sin ningún tipo de compromiso" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3">
                    <Icon size={18} className="text-terracotta-500 flex-shrink-0" />
                    <span className="text-graphite-700 text-sm">{text}</span>
                  </div>
                ))}
              </div>
              <div className="mt-10 p-6 bg-white rounded-2xl shadow-card border border-cream-200">
                <p className="text-warm-500 text-sm mb-2">¿Preferís por WhatsApp?</p>
                <a
                  href="https://wa.me/5491128999904?text=Hola%2C%20quiero%20solicitar%20una%20degustaci%C3%B3n%20para%20mi%20empresa"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors text-sm"
                >
                  Escribirnos por WhatsApp <ArrowRight size={14} />
                </a>
              </div>
            </div>

            {/* Form */}
            <div className="bg-white rounded-2xl shadow-card border border-cream-200 p-8">
              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-terracotta-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} className="text-terracotta-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-graphite-800 mb-3">¡Solicitud recibida!</h3>
                  <p className="text-warm-500 leading-relaxed">
                    Te contactamos en menos de 24hs para coordinar la degustación. Revisá tu casilla de mail.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-graphite-700 mb-1.5">Nombre completo *</label>
                      <input name="nombre" value={form.nombre} onChange={handleChange} required
                        className="input-base" placeholder="Tu nombre" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-graphite-700 mb-1.5">Empresa *</label>
                      <input name="empresa" value={form.empresa} onChange={handleChange} required
                        className="input-base" placeholder="Nombre de la empresa" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-graphite-700 mb-1.5">Cargo *</label>
                      <input name="cargo" value={form.cargo} onChange={handleChange} required
                        className="input-base" placeholder="RRHH, Compras, etc." />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-graphite-700 mb-1.5">Cantidad de personas *</label>
                      <select name="personas" value={form.personas} onChange={handleChange} required
                        className="input-base">
                        <option value="">Seleccioná...</option>
                        <option value="5-10">5 a 10</option>
                        <option value="10-25">10 a 25</option>
                        <option value="25-50">25 a 50</option>
                        <option value="50-100">50 a 100</option>
                        <option value="+100">Más de 100</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-graphite-700 mb-1.5">Email corporativo *</label>
                    <input name="email" type="email" value={form.email} onChange={handleChange} required
                      className="input-base" placeholder="nombre@empresa.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-graphite-700 mb-1.5">Teléfono / WhatsApp</label>
                    <input name="telefono" value={form.telefono} onChange={handleChange}
                      className="input-base" placeholder="+54 9 11 ..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-graphite-700 mb-1.5">¿Algo que quieras contarnos?</label>
                    <textarea name="mensaje" value={form.mensaje} onChange={handleChange} rows={3}
                      className="input-base resize-none" placeholder="Restricciones, preferencias, fecha ideal..." />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-terracotta-500 text-white font-semibold rounded-xl hover:bg-terracotta-600 disabled:opacity-60 transition-all text-sm"
                  >
                    {loading ? "Enviando..." : <>Solicitar degustación <Send size={15} /></>}
                  </button>
                  <p className="text-xs text-warm-400 text-center">
                    Al enviar el formulario aceptás ser contactado por Bengal Empresas.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
