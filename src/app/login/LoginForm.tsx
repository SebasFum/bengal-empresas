"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, ArrowRight, Building2, Home, PartyPopper } from "lucide-react";
import { signIn } from "next-auth/react";
import { registerUser } from "@/app/actions/auth";
import type { Segment } from "@/lib/supabase/types";

const SEGMENTS: { id: Segment; label: string; desc: string; icon: React.ReactNode }[] = [
  { id: "empresa", label: "Empresa", desc: "Almuerzos corporativos", icon: <Building2 size={18} /> },
  { id: "hogar",   label: "Hogar",   desc: "Delivery a domicilio",   icon: <Home size={18} /> },
  { id: "eventos", label: "Eventos", desc: "Catering y eventos",     icon: <PartyPopper size={18} /> },
];

export default function LoginForm() {
  const [mode, setMode]       = useState<"login" | "register">("login");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; isInfo?: boolean } | null>(null);
  const [segment, setSegment] = useState<Segment>("empresa");
  const [form, setForm]       = useState({ email: "", password: "", nombre: "" });
  const router       = useRouter();
  const searchParams = useSearchParams();
  const redirectTo   = searchParams.get("redirect") ?? "/pedidos";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(null);
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (mode === "login") {
      const res = await signIn("credentials", {
        email:    form.email,
        password: form.password,
        redirect: false,
      });
      if (res?.error) {
        setMessage({ text: "Email o contraseña incorrectos." });
        setLoading(false);
        return;
      }
      router.push(redirectTo);
      router.refresh();
    } else {
      const result = await registerUser({
        email:     form.email,
        password:  form.password,
        full_name: form.nombre,
        role:      segment,
      });
      if (!result.success) {
        setMessage({ text: result.error });
        setLoading(false);
        return;
      }
      // Auto-login after register
      const res = await signIn("credentials", {
        email:    form.email,
        password: form.password,
        redirect: false,
      });
      if (res?.error) {
        setMessage({ text: "Cuenta creada. Ingresá con tus datos.", isInfo: true });
        setLoading(false);
        return;
      }
      router.push(redirectTo);
      router.refresh();
    }
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
            <span className="text-2xl font-semibold text-graphite-800" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>Bengal</span>
          </Link>
          <h1 className="text-2xl font-bold text-graphite-800 mb-1">
            {mode === "login" ? "Bienvenido de vuelta" : "Crear cuenta"}
          </h1>
          <p className="text-warm-400 text-sm">
            {mode === "login" ? "Ingresá para ver el menú y hacer tu pedido." : "Elegí tu tipo de cuenta para empezar."}
          </p>
        </div>

        {/* Toggle */}
        <div className="flex gap-1 p-1 bg-cream-200 rounded-xl mb-6">
          {(["login", "register"] as const).map((m) => (
            <button key={m} onClick={() => { setMode(m); setMessage(null); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${mode === m ? "bg-white text-graphite-800 shadow-sm" : "text-warm-400 hover:text-graphite-700"}`}>
              {m === "login" ? "Ingresar" : "Registrarse"}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-card border border-cream-200 p-7">
          <form onSubmit={handleSubmit} className="space-y-4">

            {mode === "register" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-graphite-700 mb-2">¿Cómo usarás Bengal? *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {SEGMENTS.map((s) => (
                      <button key={s.id} type="button" onClick={() => setSegment(s.id)}
                        className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border-2 text-xs font-semibold transition-all ${
                          segment === s.id
                            ? "border-terracotta-500 bg-terracotta-50 text-terracotta-700"
                            : "border-cream-200 text-graphite-600 hover:border-cream-300"
                        }`}>
                        <span className={segment === s.id ? "text-terracotta-500" : "text-warm-400"}>{s.icon}</span>
                        <span>{s.label}</span>
                        <span className="font-normal text-warm-400 text-center leading-tight">{s.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-graphite-700 mb-1.5">Nombre completo *</label>
                  <input name="nombre" value={form.nombre} onChange={handleChange} required className="input-base" placeholder="Tu nombre" />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-graphite-700 mb-1.5">Email *</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} required className="input-base" placeholder="nombre@empresa.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-graphite-700 mb-1.5">Contraseña *</label>
              <div className="relative">
                <input name="password" type={showPass ? "text" : "password"} value={form.password}
                  onChange={handleChange} required minLength={6} className="input-base pr-10" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-400 hover:text-graphite-600">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {message && (
              <div className={`rounded-xl px-4 py-3 text-sm ${message.isInfo ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                {message.text}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-terracotta-500 text-white font-semibold rounded-xl hover:bg-terracotta-600 disabled:opacity-60 transition-all mt-2">
              {loading
                ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Cargando...</>
                : <>{mode === "login" ? "Ingresar" : "Crear cuenta"} <ArrowRight size={16} /></>}
            </button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-cream-200" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-white px-3 text-warm-400">o</span></div>
          </div>

          <a href="https://wa.me/5491128999904?text=Hola%2C%20quiero%20acceder%20al%20portal"
            className="w-full flex items-center justify-center gap-2 py-3 border-2 border-green-500 text-green-600 font-semibold rounded-xl hover:bg-green-50 transition-all text-sm">
            Consultar por WhatsApp
          </a>
        </div>

        <p className="text-center text-xs text-warm-400 mt-6">
          ¿Tu empresa no está registrada?{" "}
          <Link href="/degustaciones" className="text-terracotta-600 font-semibold hover:underline">Solicitar acceso</Link>
        </p>
      </div>
    </div>
  );
}
