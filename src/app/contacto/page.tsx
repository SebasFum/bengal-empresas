"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle } from "lucide-react";

export default function ContactoPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tipo, setTipo] = useState<"comercial" | "operativo">("comercial");
  const [form, setForm] = useState({ nombre: "", empresa: "", email: "", asunto: "", mensaje: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <>
      <section className="bg-graphite-800 pt-28 pb-14">
        <div className="container-xl text-center">
          <div className="divider-gold mx-auto mb-4" />
          <h1 className="text-5xl font-bold text-cream-100 mb-4">Contacto</h1>
          <p className="text-warm-400 text-xl max-w-lg mx-auto">
            Consultas comerciales o soporte operativo. Respondemos rápido.
          </p>
        </div>
      </section>

      <section className="section-py bg-cream-100">
        <div className="container-xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Info */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-graphite-800 mb-6">¿En qué podemos ayudarte?</h2>
                <div className="space-y-4">
                  {[
                    { icon: Mail, label: "Email", value: "hola@bengalrestaurante.com.ar", href: "mailto:hola@bengalrestaurante.com.ar" },
                    { icon: Phone, label: "WhatsApp", value: "+54 9 11 2899-9904", href: "https://wa.me/5491128999904" },
                    { icon: MapPin, label: "Zona de cobertura", value: "Pilar, Del Viso, Parque Industrial y Manzanares — 20 km a la redonda de Pilar centro", href: null },
                    { icon: Clock, label: "Horario", value: "Lun–Vie de 8:00 a 18:00 hs", href: null },
                  ].map(({ icon: Icon, label, value, href }) => (
                    <div key={label} className="flex items-start gap-4 bg-white rounded-xl p-4 border border-cream-200 shadow-card">
                      <div className="w-10 h-10 bg-terracotta-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon size={18} className="text-terracotta-500" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-warm-400 uppercase tracking-wider">{label}</p>
                        {href ? (
                          <a href={href} className="text-graphite-800 font-medium hover:text-terracotta-600 transition-colors text-sm">
                            {value}
                          </a>
                        ) : (
                          <p className="text-graphite-800 font-medium text-sm">{value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-terracotta-50 border border-terracotta-200 rounded-2xl p-6">
                <h3 className="font-bold text-graphite-800 mb-2">¿Querés una degustación?</h3>
                <p className="text-warm-500 text-sm leading-relaxed mb-4">
                  Si todavía no trabajás con Bengal, la mejor forma de empezar es con una degustación gratuita.
                </p>
                <a href="/degustaciones" className="inline-block text-sm font-semibold text-terracotta-600 hover:text-terracotta-700 transition-colors">
                  Solicitar degustación →
                </a>
              </div>
            </div>

            {/* Formulario */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-card border border-cream-200 p-8">
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-terracotta-50 rounded-full flex items-center justify-center mx-auto mb-5">
                    <CheckCircle size={32} className="text-terracotta-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-graphite-800 mb-3">¡Mensaje recibido!</h3>
                  <p className="text-warm-500">Te respondemos en máximo 24hs hábiles.</p>
                </div>
              ) : (
                <>
                  {/* Selector tipo */}
                  <div className="flex gap-2 mb-8 p-1 bg-cream-100 rounded-xl">
                    {(["comercial", "operativo"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTipo(t)}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                          tipo === t
                            ? "bg-terracotta-500 text-white shadow-sm"
                            : "text-graphite-600 hover:bg-cream-200"
                        }`}
                      >
                        {t === "comercial" ? "Consulta comercial" : "Soporte de pedido"}
                      </button>
                    ))}
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-graphite-700 mb-1.5">Nombre *</label>
                        <input name="nombre" value={form.nombre} onChange={handleChange} required
                          className="input-base" placeholder="Tu nombre" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-graphite-700 mb-1.5">
                          {tipo === "comercial" ? "Empresa" : "Empresa / número de pedido"}
                        </label>
                        <input name="empresa" value={form.empresa} onChange={handleChange}
                          className="input-base" placeholder={tipo === "comercial" ? "Nombre de la empresa" : "Ej: ORD-2401"} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-graphite-700 mb-1.5">Email *</label>
                      <input name="email" type="email" value={form.email} onChange={handleChange} required
                        className="input-base" placeholder="tu@email.com" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-graphite-700 mb-1.5">Asunto *</label>
                      <input name="asunto" value={form.asunto} onChange={handleChange} required
                        className="input-base" placeholder={tipo === "comercial" ? "Ej: Propuesta para 30 personas" : "Ej: Problema con pedido del martes"} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-graphite-700 mb-1.5">Mensaje *</label>
                      <textarea name="mensaje" value={form.mensaje} onChange={handleChange} required rows={5}
                        className="input-base resize-none"
                        placeholder="Contanos en qué podemos ayudarte..." />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 py-3.5 bg-terracotta-500 text-white font-semibold rounded-xl hover:bg-terracotta-600 disabled:opacity-60 transition-all"
                    >
                      {loading ? "Enviando..." : <><Send size={16} /> Enviar mensaje</>}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
