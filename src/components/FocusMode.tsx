import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, X, Zap, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const BLOCKED_APPS = [
  { name: "Instagram", icon: "📸" },
  { name: "TikTok", icon: "🎵" },
  { name: "Twitter/X", icon: "🐦" },
  { name: "YouTube", icon: "▶️" },
  { name: "Snapchat", icon: "👻" },
  { name: "Facebook", icon: "👤" },
  { name: "WhatsApp", icon: "💬" },
  { name: "Reddit", icon: "🔴" },
];

const TIPS = [
  "Deixa el mòbil en una altra habitació 📱➡️🚪",
  "Activa el mode avió per evitar notificacions ✈️",
  "Estableix objectius d'estudi concrets per aquesta sessió 🎯",
  "Premia't cada vegada que completis una tasca 🎁",
  "Avisa els teus amics que estàs estudiant 💬",
  "Neteja l'escriptori, deixa només el material d'estudi 🧹",
  "Escolta música instrumental o soroll blanc 🎧",
  "Utilitza la tècnica Pomodoro per mantenir el ritme ⏱️",
  "Beu aigua, un cervell hidratat funciona millor 💧",
  "Recorda: 1 hora de focus val més que 3 hores amb distraccions ⚡",
];

const BREATHING_STEPS = ["Inspira... 🌬️", "Aguanta... 🧘", "Expira... 😌"];

export default function FocusMode() {
  const [active, setActive] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [breathStep, setBreathStep] = useState(0);

  const nextTip = () => setTipIndex((i) => (i + 1) % TIPS.length);

  // Timer while active
  useEffect(() => {
    if (!active) {
      setElapsed(0);
      return;
    }
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [active]);

  // Breathing animation cycle
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setBreathStep((s) => (s + 1) % 3), 4000);
    return () => clearInterval(id);
  }, [active]);

  // Auto-rotate tips
  useEffect(() => {
    if (!active) return;
    const id = setInterval(nextTip, 15000);
    return () => clearInterval(id);
  }, [active]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {active ? (
          <motion.div
            key="active"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="space-y-6"
          >
            {/* Status + Timer */}
            <div className="flex flex-col items-center gap-4 rounded-xl bg-primary/5 border border-primary/20 p-6">
              <div className="relative">
                <ShieldCheck className="h-16 w-16 text-primary" />
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-primary/30"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <h3 className="font-display text-xl font-bold text-primary">
                Mode Focus activat
              </h3>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="font-mono text-lg tabular-nums">{formatTime(elapsed)}</span>
              </div>
              <p className="text-sm text-muted-foreground text-center max-w-xs">
                Allunya't de les xarxes socials i concentra't en el que importa. Tu pots! 💪
              </p>
            </div>

            {/* Breathing exercise */}
            <div className="flex flex-col items-center gap-2">
              <p className="text-xs text-muted-foreground font-medium">Exercici de respiració</p>
              <AnimatePresence mode="wait">
                <motion.div
                  key={breathStep}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="rounded-full bg-accent/10 border border-accent/20 px-6 py-2"
                >
                  <p className="text-sm font-medium text-accent">
                    {BREATHING_STEPS[breathStep]}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Blocked apps */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                🚫 Aplicacions bloquejades (simulació)
              </p>
              <div className="flex flex-wrap gap-2">
                {BLOCKED_APPS.map((app) => (
                  <span
                    key={app.name}
                    className="rounded-full bg-destructive/10 border border-destructive/20 px-3 py-1 text-xs text-destructive font-medium"
                  >
                    {app.icon} {app.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Tip */}
            <motion.div
              key={tipIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg bg-info/10 border border-info/20 p-4 text-center cursor-pointer"
              onClick={nextTip}
            >
              <p className="text-xs text-muted-foreground mb-1">
                💡 Consell (clica per canviar)
              </p>
              <p className="text-sm font-medium text-info">{TIPS[tipIndex]}</p>
            </motion.div>

            <Button
              onClick={() => setActive(false)}
              variant="outline"
              className="w-full gap-2"
            >
              <X className="h-4 w-4" /> Sortir del mode focus
            </Button>

            {elapsed > 0 && (
              <p className="text-xs text-center text-muted-foreground/70">
                Has estat concentrat durant {formatTime(elapsed)}. Ben fet!
              </p>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="inactive"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-6 py-8"
          >
            <Zap className="h-16 w-16 text-muted-foreground/30" />
            <div className="text-center space-y-2">
              <h3 className="font-display text-lg font-semibold">
                Preparat per concentrar-te?
              </h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Activa el mode focus per bloquejar les distraccions i entrar en un estat de
                concentració profunda. El teu jo del futur t'ho agrairà! 🚀
              </p>
            </div>
            <Button onClick={() => setActive(true)} size="lg" className="gap-2">
              <ShieldCheck className="h-5 w-5" /> Activar mode focus
            </Button>
            <div className="text-center space-y-1">
              <p className="text-xs text-muted-foreground">Què fa el mode focus?</p>
              <ul className="text-xs text-muted-foreground/70 space-y-0.5">
                <li>✓ Simula el bloqueig d'aplicacions de xarxes socials</li>
                <li>✓ Mostra consells per mantenir la concentració</li>
                <li>✓ Inclou un exercici de respiració per relaxar-te</li>
                <li>✓ Compta el temps que portes concentrat</li>
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}