"use client";

import { useState } from "react";
import { Send, Mail } from "lucide-react";

const WHATSAPP_PHONE = "5491128999904";

const EVENT_TYPES = [
  "Desayuno corporativo",
  "Coffee break / té",
  "Almuerzo ejecutivo",
  "Evento corporativo",
  "After office / cocktail",
  "Celebración privada",
];

export default function CateringQuoteForm() {
  const [form, setForm] = useState({
    nombre: "", empresa: "", tipo: EVENT_TYPES[0], fecha: "",
    comensales: "", zona: "", mensaje: "",
  });

  const canSend = form.nombre.trim() && form.comensales.trim();

  const sendWhatsApp = () => {
    const lines = [
      "*Cotización Bengal Catering* 🐅",
      "─────────────",
      `Nombre: ${form.nombre}`,
      form.empresa && `Empresa: ${form.empresa}`,
      `Tipo de evento: ${form.tipo}`,
      form.fecha && `Fecha estimada: ${form.fecha}`,
      `Comensales: ${form.comensales}`,
      form.zona && `Zona: ${form.zona}`,
      form.mensaje && `Detalle: ${form.mensaje}`,
    ].filter(Boolean).join("\n");
    window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(lines)}`, "_blank");
  };

  const mailtoHref = () => {
    const body = [
      `Nombre: ${form.nombre}`,
      form.empresa && `Empresa: ${form.empresa}`,
      `Tipo de evento: ${form.tipo}`,
      form.fecha && `Fecha estimada: ${form.fecha}`,
      `Comensales: ${form.comensales}`,
      form.zona && `Zona: ${form.zona}`,
      form.mensaje && `Detalle: ${form.mensaje}`,
    ].filter(Boolean).join("\n");
    return `mailto:hola@bengalrestaurante.com.ar?subject=${encodeURIComponent("Cotización Bengal Catering")}&body=${encodeURIComponent(body)}`;
  };

  const inputCls = "w-full bg-white/5 border border-white/10 px-4 py-3 text-sm text-[#EDE6DA] placeholder:text-[#B7AD9C]/50 focus:border-[#C9A45C]/60 focus:outline-none";

  return (
    <div className="max-w-2xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          placeholder="Tu nombre *" className={inputCls} />
        <input value={form.empresa} onChange={(e) => setForm({ ...form, empresa: e.target.value })}
          placeholder="Empresa (si aplica)" className={inputCls} />
        <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}
          className={`${inputCls} appearance-none`}>
          {EVENT_TYPES.map((t) => <option key={t} value={t} className="bg-[#121009]">{t}</option>)}
        </select>
        <input value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })}
          placeholder="Fecha estimada" className={inputCls} />
        <input value={form.comensales} onChange={(e) => setForm({ ...form, comensales: e.target.value })}
          placeholder="Cantidad de comensales * (desde 20)" type="number" min={20} className={inputCls} />
        <input value={form.zona} onChange={(e) => setForm({ ...form, zona: e.target.value })}
          placeholder="Zona / dirección del evento" className={inputCls} />
      </div>
      <textarea value={form.mensaje} onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
        placeholder="Contanos del evento: ocasión, horario, estilo, restricciones alimentarias…"
        rows={4} className={`${inputCls} mt-3 resize-none`} />

      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <button onClick={sendWhatsApp} disabled={!canSend}
          className="flex-1 flex items-center justify-center gap-2 py-4 bg-[#C9A45C] text-[#0B0A09] text-[12px] uppercase tracking-[0.2em] font-semibold hover:bg-[#D8B76F] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          <Send size={14} /> Cotizar por WhatsApp
        </button>
        <a href={canSend ? mailtoHref() : undefined} aria-disabled={!canSend}
          className={`flex-1 flex items-center justify-center gap-2 py-4 border border-[#C9A45C]/50 text-[#C9A45C] text-[12px] uppercase tracking-[0.2em] transition-all ${canSend ? "hover:bg-[#C9A45C] hover:text-[#0B0A09]" : "opacity-50 cursor-not-allowed"}`}>
          <Mail size={14} /> Cotizar por email
        </a>
      </div>
      {!canSend && (
        <p className="text-center text-[#B7AD9C]/60 text-[11px] mt-4 font-light">
          Completá tu nombre y la cantidad de comensales para enviar.
        </p>
      )}
    </div>
  );
}
