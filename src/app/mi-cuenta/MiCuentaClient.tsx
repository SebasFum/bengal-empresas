"use client";

import { useState, useTransition } from "react";
import { User, AlertTriangle, Save, LogOut, CheckCircle } from "lucide-react";
import { updateProfile, logout } from "@/app/actions/auth";

const DIETARY_OPTIONS = [
  "Vegetariano", "Vegano", "Sin TACC (celíaco)", "Sin lactosa",
  "Sin mariscos", "Bajo en sodio", "Diabético",
];

const ROLE_LABELS: Record<string, string> = {
  employee: "Empleado",
  company_admin: "Admin empresa",
  admin: "Administrador Bengal",
};

type Props = {
  initialName: string;
  initialPhone: string;
  initialRestrictions: string[];
  email: string;
  role: string;
  companyName: string | null;
  deliveryTime: string | null;
};

export default function MiCuentaClient({
  initialName, initialPhone, initialRestrictions,
  email, role, companyName, deliveryTime,
}: Props) {
  const [nombre, setNombre] = useState(initialName);
  const [telefono, setTelefono] = useState(initialPhone);
  const [restrictions, setRestrictions] = useState<string[]>(initialRestrictions);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const toggleRestriction = (r: string) =>
    setRestrictions((prev) =>
      prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]
    );

  const handleSave = () => {
    setError(null);
    startTransition(async () => {
      const result = await updateProfile({
        full_name: nombre,
        phone: telefono,
        dietary_restrictions: restrictions,
      });
      if (result.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(result.error ?? "No se pudo guardar.");
      }
    });
  };

  const initial = (nombre || email)[0]?.toUpperCase() ?? "U";

  return (
    <div className="min-h-screen bg-cream-100 pt-16">
      <div className="container-xl py-10 max-w-2xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-graphite-800">Mi cuenta</h1>
          <form action={logout}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm text-warm-500 hover:text-red-600 border border-cream-300 rounded-xl hover:border-red-200 transition-all"
            >
              <LogOut size={15} /> Cerrar sesión
            </button>
          </form>
        </div>

        {/* Avatar + info */}
        <div className="bg-white rounded-2xl shadow-card border border-cream-200 p-6 mb-6 flex items-center gap-5">
          <div className="w-16 h-16 bg-terracotta-100 rounded-full flex items-center justify-center text-terracotta-600 text-2xl font-bold flex-shrink-0">
            {initial}
          </div>
          <div>
            <p className="font-bold text-graphite-800 text-xl">{nombre || email}</p>
            <p className="text-warm-400 text-sm">
              {companyName ? `${companyName} · ` : ""}{ROLE_LABELS[role] ?? role}
            </p>
            {deliveryTime && (
              <p className="text-xs text-terracotta-600 mt-1">🕐 Entrega: {deliveryTime} hs</p>
            )}
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
              <input
                className="input-base"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Tu nombre"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-graphite-700 mb-1.5">Email</label>
              <input
                className="input-base opacity-60 cursor-not-allowed"
                type="email"
                value={email}
                readOnly
                title="El email no se puede modificar desde aquí"
              />
              <p className="text-xs text-warm-400 mt-1">El email no se puede cambiar desde aquí.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-graphite-700 mb-1.5">Teléfono / WhatsApp</label>
              <input
                className="input-base"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="+54 9 11 2899-9904"
              />
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
            Se mostrarán en tus pedidos para que cocina lo tenga en cuenta.
          </p>
          <div className="flex flex-wrap gap-2">
            {DIETARY_OPTIONS.map((opt) => (
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

        {/* Feedback */}
        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-terracotta-500 text-white font-bold rounded-xl hover:bg-terracotta-600 disabled:opacity-60 transition-all"
        >
          {saved
            ? <><CheckCircle size={16} /> ¡Guardado!</>
            : isPending
            ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Guardando...</>
            : <><Save size={16} /> Guardar cambios</>
          }
        </button>
      </div>
    </div>
  );
}
