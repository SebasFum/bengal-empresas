"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ArrowRight } from "lucide-react";
import { faqItems } from "@/lib/data";

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <>
      <section className="bg-graphite-800 pt-28 pb-14">
        <div className="container-xl text-center">
          <div className="divider-gold mx-auto mb-4" />
          <h1 className="text-5xl font-bold text-cream-100 mb-4">Preguntas frecuentes</h1>
          <p className="text-warm-400 text-xl max-w-lg mx-auto">
            Las preguntas que siempre nos hacen antes de empezar. Si no encontrás lo que buscás, escribinos.
          </p>
        </div>
      </section>

      <section className="section-py bg-cream-100">
        <div className="container-xl max-w-3xl">
          <div className="space-y-3">
            {faqItems.map((item, i) => (
              <div key={i} className="bg-white rounded-2xl border border-cream-200 shadow-card overflow-hidden">
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between px-7 py-5 text-left gap-4 hover:bg-cream-50 transition-colors"
                >
                  <span className="font-semibold text-graphite-800">{item.question}</span>
                  <ChevronDown
                    size={18}
                    className={`text-terracotta-500 flex-shrink-0 transition-transform duration-200 ${open === i ? "rotate-180" : ""}`}
                  />
                </button>
                {open === i && (
                  <div className="px-7 pb-6 border-t border-cream-200">
                    <p className="text-warm-500 leading-relaxed pt-4 text-sm">{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-14 bg-terracotta-50 border border-terracotta-200 rounded-2xl p-8 text-center">
            <h3 className="text-xl font-bold text-graphite-800 mb-3">¿No encontraste lo que buscabas?</h3>
            <p className="text-warm-500 text-sm mb-6">Escribinos directamente. Respondemos en menos de 24hs hábiles.</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/contacto" className="inline-flex items-center gap-2 px-5 py-2.5 bg-terracotta-500 text-white font-semibold rounded-lg hover:bg-terracotta-600 transition-all text-sm">
                Enviar consulta <ArrowRight size={14} />
              </Link>
              <a href="https://wa.me/5491100000000" className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-all text-sm">
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
