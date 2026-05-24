"use client";

import { useState } from "react";
import { User, Bell, AlertTriangle, Save } from "lucide-react";

const dietaryOptions = ["Vegetariano", "Vegano", "Sin TACC (celíaco)", "Sin lactosa", "Sin mariscos", "Bajo en sodio", "Diabético"];

export default function MiCuentaPage() {
  const [restrictions, setRestrictions] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ nombre: "Ana García", email: "ana@empresa.com", telefono: "+54 9 11 1234-5678" });

  const toggleRestriction = (r: string) =>
    setRestrictions((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]));

  const handleSave = async () => {
    await new Promise((r) => setTimeout(r, 500));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-cream-100 pt-16">
      <div className="container-xl py-10 max-w-2xl">
        <h1 className="text-3xl font-bold text-graphite-800 mb-8">Mi cuenta</h1>

        {/* Avatar */}
        <div className="bg-white rounded-2xl shadow-card border border-cream-200 p-6 mb-6 flex items-center gap-5">
          <div className="w-16 h-16 bg-terracotta-100 rounded-full flex items-center justify-center text-terracotta-600 text-2xl font-bold">
            A
          </div>
          <div>
            <p className="font-bold text-graphite-800 text-xl">{form.nombre}</p>
            <p className="text-warm-400 text-sm">TechCorp Argentina · Empleado</p>
          </div>
        </div>

        {/* Datos personales */}
        <div className="bg-white rounded-2xl shadow-card border border-cream-200 p-7 mb-6">
          <div className="flex items-center gap-2 mb-6">
            <User size={18} className="text-terracotta-500" />
            <h2 className="font-bold text-graphite-800">Datos personales</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-graphite-700 mb-1.5">Nombre completo</label>
              <input className="input-base" value={form.nombre} onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-graphite-700 mb-1.5">Email</label>
              <input className="input-base" type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-graphite-700 mb-1.5">Teléfono / WhatsApp</label>
              <input className="input-base" value={form.telefono} onChange={(e) => setForm((p) => ({ ...p, telefono: e.target.value }))} />
            </div>
          </div>
        </div>

        {/* Restricciones alimentarias */}
        <div className="bg-white rounded-2xl shadow-card border border-cream-200 p-7 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={18} className="text-terracotta-500" />
            <h2 className="font-bold text-graphite-800">Restricciones alimentarias</h2>
          </div>
          <p className="text-warm-400 text-sm mb-5">
            El sistema filtrará automáticamente los platos que no son aptos para vos.
          </p>
          <div className="flex flex-wrap gap-2">
            {dietaryOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => toggleRestriction(opt)}
                className={`px-3.5 py-2 rounded-full text-sm font-medium transition-all ${
                  restrictions.includes(opt)
                    ? "bg-terracotta-500 text-white"
                    : "bg-cream-100 text-graphite-600 hover:bg-cream-200 border border-cream-300"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Notificaciones */}
        <div className="bg-white rounded-2xl shadow-card border border-cream-200 p-7 mb-6">
          <div className="flex items-center gap-2 mb-5">
            <Bell size={18} className="text-terracotta-500" />
            <h2 className="font-bold text-graphite-800">Notificaciones</h2>
          </div>
          <div className="space-y-4">
            {[
              { label: "Recordatorio de pedido (9:30 hs)", defaultOn: true },
              { label: "Confirmación de pedido por email", defaultOn: true },
              { label: "Menú de la semana los lunes", defaultOn: false },
            ].map((notif) => (
              <div key={notif.label} className="flex items-center justify-between py-2 border-b border-cream-100 last:border-0">
                <span className="text-sm text-graphite-700">{notif.label}</span>
                <button
                  className={`w-11 h-6 rounded-full transition-colors ${notif.defaultOn ? "bg-terracotta-500" : "bg-cream-300"} relative`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${notif.defaultOn ? "right-1" : "left-1"}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-terracotta-500 text-white font-bold rounded-xl hover:bg-terracotta-600 transition-all"
        >
          <Save size={16} />
          {saved ? "¡Guardado!" : "Guardar cambios"}
        </button>
      </div>
    </div>
  );
}
