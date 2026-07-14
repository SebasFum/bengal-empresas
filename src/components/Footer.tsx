import Link from "next/link";
import { Mail, Phone, MapPin, Camera } from "lucide-react";

const footerLinks = {
  servicios: [
    { label: "Viandas Corporativas", href: "/viandas-corporativas" },
    { label: "Eventos para Empresas", href: "/eventos" },
    { label: "Ver Menús", href: "/menus" },
    { label: "Degustaciones", href: "/degustaciones" },
  ],
  empresa: [
    { label: "Cómo funciona", href: "/como-funciona" },
    { label: "Para empresas", href: "/empresas" },
    { label: "Preguntas frecuentes", href: "/faq" },
    { label: "Contacto", href: "/contacto" },
  ],
  portal: [
    { label: "Ingresar al portal", href: "/login" },
    { label: "Hacer un pedido", href: "/pedidos" },
    { label: "Mi historial", href: "/historial" },
    { label: "Panel empresa", href: "/panel-empresa" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-graphite-800 text-cream-200">
      {/* CTA banner */}
      <div className="bg-terracotta-500">
        <div className="container-xl py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-xl font-semibold text-white" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
              ¿Querés conocer la propuesta?
            </p>
            <p className="text-terracotta-100 text-sm mt-1">
              Pedí una degustación gratuita para tu equipo.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/degustaciones"
              className="px-5 py-2.5 bg-white text-terracotta-600 font-semibold rounded-lg text-sm hover:bg-cream-100 transition-colors"
            >
              Solicitar degustación
            </Link>
            <Link
              href="/contacto"
              className="px-5 py-2.5 border-2 border-white text-white font-semibold rounded-lg text-sm hover:bg-white/10 transition-colors"
            >
              Hablar con un asesor
            </Link>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="container-xl py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-terracotta-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>B</span>
              </div>
              <span className="text-xl font-semibold text-cream-100" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                Bengal <span className="text-terracotta-400">Empresas</span>
              </span>
            </div>
            <p className="text-warm-400 text-sm leading-relaxed max-w-xs">
              Gastronomía premium para equipos que exigen calidad. Viandas y eventos corporativos con experiencia impecable.
            </p>
            <div className="flex gap-3 mt-6">
              <a href="https://www.instagram.com/bengaloficial/" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 bg-graphite-700 rounded-lg flex items-center justify-center text-warm-400 hover:bg-terracotta-500 hover:text-white transition-all">
                <Camera size={16} />
              </a>
            </div>

            <div className="mt-6 space-y-2">
              <a href="mailto:hola@bengalrestaurante.com.ar" className="flex items-center gap-2 text-sm text-warm-400 hover:text-terracotta-400 transition-colors">
                <Mail size={14} />
                hola@bengalrestaurante.com.ar
              </a>
              <a href="https://wa.me/5491128999904" className="flex items-center gap-2 text-sm text-warm-400 hover:text-terracotta-400 transition-colors">
                <Phone size={14} />
                +54 9 11 2899-9904
              </a>
              <span className="flex items-center gap-2 text-sm text-warm-400">
                <MapPin size={14} />
                CABA y GBA Norte
              </span>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-cream-100 font-semibold text-sm uppercase tracking-wider mb-4">
                {section === "servicios" ? "Servicios" : section === "empresa" ? "Empresa" : "Portal"}
              </h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-warm-400 hover:text-terracotta-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-graphite-700">
        <div className="container-xl py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-warm-500">
            © {new Date().getFullYear()} Bengal Empresas. Todos los derechos reservados.
          </p>
          <div className="flex gap-4 text-xs text-warm-500">
            <a href="#" className="hover:text-terracotta-400 transition-colors">Privacidad</a>
            <a href="#" className="hover:text-terracotta-400 transition-colors">Términos</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
