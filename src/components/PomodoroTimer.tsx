import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocalStorage } from "@/hooks/useLocalStorage";

const PRESETS = [
  { label: "Clàssic", work: 25, rest: 5 },
  { label: "Curt", work: 15, rest: 3 },
  { label: "Llarg", work: 50, rest: 10 },
];

const MOTIVATIONAL = [
  "Estàs millorant! 💪",
  "La concentració és el teu superpoder 🧠",
  "Aguanta, l'èxit és a prop 🌟",
  "Cada minut compta 🚀",
  "Ets més fort del que creus ⚡",
  "L'esforç d'avui és la recompensa de demà 🌱",
  "No t'aturis ara, estàs fent-ho genial 🔥",
  "La disciplina venç el talent 🏆",
  "Pas a pas, arribaràs lluny 🛤️",
  "Creu en tu, la constància sempre guanya 🎯",
];

const BREAK_MESSAGES = [
  "Aixeca't i estira't una mica 🧘",
  "Beu una mica d'aigua 💧",
  "Mira per la finestra i descansa la vista 👀",
  "Fes unes quantes respiracions profundes 🌬️",
  "Has fet una gran feina, descansa! ☕",
];

export default function PomodoroTimer() {
  const [presetIndex, setPresetIndex] = useState(0);
  const [showPresets, setShowPresets] = useState(false);
  const preset = PRESETS[presetIndex];

  const workTime = preset.work * 60;
  const breakTime = preset.rest * 60;

  const [timeLeft, setTimeLeft] = useState(workTime);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessions, setSessions] = useLocalStorage("focus-pomodoro-sessions", 0);
  const [todaySessions, setTodaySessions] = useLocalStorage(
    `focus-pomodoro-${new Date().toDateString()}`,
    0
  );
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [motivationIndex, setMotivationIndex] = useState(0);

  const totalTime = isBreak ? breakTime : workTime;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const reset = useCallback(() => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(workTime);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, [workTime]);

  const changePreset = (index: number) => {
    setPresetIndex(index);
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(PRESETS[index].work * 60);
    setShowPresets(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (!isBreak) {
              setSessions((s) => s + 1);
              setTodaySessions((s) => s + 1);
              setIsBreak(true);
              setMotivationIndex((i) => (i + 1) % BREAK_MESSAGES.length);
              return breakTime;
            } else {
              setIsBreak(false);
              setIsRunning(false);
              return workTime;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, isBreak, setSessions, setTodaySessions, workTime, breakTime]);

  // Rotate motivation every 30 seconds while running
  useEffect(() => {
    if (!isRunning || isBreak) return;
    const id = setInterval(() => {
      setMotivationIndex((i) => (i + 1) % MOTIVATIONAL.length);
    }, 30000);
    return () => clearInterval(id);
  }, [isRunning, isBreak]);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Preset selector */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowPresets(!showPresets)}
          className="gap-1 text-xs text-muted-foreground"
        >
          <Settings2 className="h-3 w-3" />
          {preset.label} ({preset.work}/{preset.rest} min)
        </Button>
      </div>

      <AnimatePresence>
        {showPresets && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex gap-2 overflow-hidden"
          >
            {PRESETS.map((p, i) => (
              <button
                key={p.label}
                onClick={() => changePreset(i)}
                className={`rounded-full border px-3 py-1 text-xs transition ${
                  i === presetIndex
                    ? "border-primary bg-primary/10 text-primary font-medium"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {p.label} ({p.work}/{p.rest})
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timer circle */}
      <div className="relative flex h-52 w-52 items-center justify-center">
        <svg className="absolute h-full w-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--muted))" strokeWidth="5" />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={isBreak ? "hsl(var(--info))" : "hsl(var(--primary))"}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
            className="transition-all duration-1000"
          />
        </svg>
        {isRunning && (
          <motion.div
            className="absolute h-full w-full rounded-full border-2 border-primary/30"
            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
        <div className="z-10 text-center">
          <p className="font-display text-4xl font-bold tabular-nums">
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {isBreak ? "Temps de descans ☕" : "Estudiant 📚"}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        <Button onClick={() => setIsRunning(!isRunning)} size="lg" className="gap-2">
          {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {isRunning ? "Pausa" : "Començar"}
        </Button>
        <Button onClick={reset} variant="outline" size="lg" aria-label="Reiniciar">
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Session stats */}
      <div className="flex gap-6 text-center">
        <div>
          <p className="font-display text-2xl font-bold text-primary">{todaySessions}</p>
          <p className="text-xs text-muted-foreground">Sessions avui</p>
        </div>
        <div className="w-px bg-border" />
        <div>
          <p className="font-display text-2xl font-bold text-accent">{sessions}</p>
          <p className="text-xs text-muted-foreground">Total acumulat</p>
        </div>
        {todaySessions > 0 && (
          <>
            <div className="w-px bg-border" />
            <div>
              <p className="font-display text-2xl font-bold text-info">
                {todaySessions * preset.work}
              </p>
              <p className="text-xs text-muted-foreground">Minuts avui</p>
            </div>
          </>
        )}
      </div>

      {/* Motivational message */}
      {isRunning && (
        <AnimatePresence mode="wait">
          <motion.p
            key={isBreak ? `break-${motivationIndex}` : `work-${motivationIndex}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-sm text-muted-foreground italic text-center max-w-xs"
          >
            {isBreak ? BREAK_MESSAGES[motivationIndex] : MOTIVATIONAL[motivationIndex]}
          </motion.p>
        </AnimatePresence>
      )}
    </div>
  );
}