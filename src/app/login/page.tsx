"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", nombre: "", empresa: "" });
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    router.push("/pedidos");
  };

  return (
    <div className="min-h-screen bg-cream-100 flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 justify-center mb-6">
            <div className="w-10 h-10 bg-terracotta-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>B</span>
            </div>
            <span className="text-2xl font-semibold text-graphite-800" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
              Bengal
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-graphite-800 mb-1">
            {mode === "login" ? "Bienvenido de vuelta" : "Crear cuenta"}
          </h1>
          <p className="text-warm-400 text-sm">
            {mode === "login"
              ? "Ingresá para ver el menú y hacer tu pedido."
              : "Registrate para empezar a pedir."}
          </p>
        </div>

        {/* Toggle */}
        <div className="flex gap-1 p-1 bg-cream-200 rounded-xl mb-6">
          {(["login", "register"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                mode === m ? "bg-white text-graphite-800 shadow-sm" : "text-warm-400 hover:text-graphite-700"
              }`}
            >
              {m === "login" ? "Ingresar" : "Registrarse"}
            </button>
          ))}
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-card border border-cream-200 p-7">
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-graphite-700 mb-1.5">Nombre completo *</label>
                  <input name="nombre" value={form.nombre} onChange={handleChange} required
                    className="input-base" placeholder="Tu nombre" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-graphite-700 mb-1.5">Empresa *</label>
                  <input name="empresa" value={form.empresa} onChange={handleChange} required
                    className="input-base" placeholder="Nombre de tu empresa" />
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-graphite-700 mb-1.5">Email *</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} required
                className="input-base" placeholder="nombre@empresa.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-graphite-700 mb-1.5">Contraseña *</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="input-base pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-400 hover:text-graphite-600"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {mode === "login" && (
              <div className="text-right">
                <a href="#" className="text-xs text-terracotta-600 hover:text-terracotta-700 font-medium">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-terracotta-500 text-white font-semibold rounded-xl hover:bg-terracotta-600 disabled:opacity-60 transition-all mt-2"
            >
              {loading
                ? "Cargando..."
                : <>{mode === "login" ? "Ingresar" : "Crear cuenta"} <ArrowRight size={16} /></>
              }
            </button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-cream-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-warm-400">o</span>
            </div>
          </div>

          <a
            href="https://wa.me/5491100000000?text=Hola%2C%20quiero%20acceder%20al%20portal%20de%20pedidos"
            className="w-full flex items-center justify-center gap-2 py-3 border-2 border-green-500 text-green-600 font-semibold rounded-xl hover:bg-green-50 transition-all text-sm"
          >
            Ingresar por WhatsApp
          </a>
        </div>

        <p className="text-center text-xs text-warm-400 mt-6">
          ¿Tu empresa no está registrada?{" "}
          <Link href="/degustaciones" className="text-terracotta-600 font-semibold hover:underline">
            Solicitar acceso
          </Link>
        </p>
      </div>
    </div>
  );
}
