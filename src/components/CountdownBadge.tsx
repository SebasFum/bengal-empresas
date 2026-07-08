"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

export default function CountdownBadge() {
  const [display, setDisplay] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const cutoff = new Date();
      cutoff.setHours(10, 0, 0, 0);

      if (now >= cutoff) {
        setClosed(true);
        setDisplay("Pedidos del día cerrados");
        return;
      }

      const diff = cutoff.getTime() - now.getTime();
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1_000);

      setUrgent(h === 0 && m < 30);
      setDisplay(
        h > 0
          ? `${h}h ${String(m).padStart(2, "0")}m para pedir`
          : `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")} para pedir`
      );
    };

    tick();
    const id = setInterval(tick, 1_000);
    return () => clearInterval(id);
  }, []);

  if (!display) return null;

  if (closed) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-graphite-700 text-warm-400 border border-graphite-600">
        <Clock size={11} /> Pedidos cerrados · Reabre mañana 8:00 hs
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
      urgent
        ? "bg-red-500/20 text-red-300 border-red-500/40 animate-pulse"
        : "bg-terracotta-500/20 text-terracotta-300 border-terracotta-500/30"
    }`}>
      <Clock size={11} />
      {display}
    </span>
  );
}
