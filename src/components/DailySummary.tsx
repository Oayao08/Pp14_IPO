import { motion } from "framer-motion";
import { CheckSquare, Timer, Flame, Calendar, TrendingUp, Award } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Task } from "@/types";
import { Habit, RoutineItem } from "@/types";

function getStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  const sorted = [...dates].sort().reverse();
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  if (sorted[0] !== today && sorted[0] !== yesterday) return 0;
  let streak = 1;
  for (let i = 0; i < sorted.length - 1; i++) {
    const diff = new Date(sorted[i]).getTime() - new Date(sorted[i + 1]).getTime();
    if (diff === 86400000) streak++;
    else break;
  }
  return streak;
}

const MOTIVATIONAL_QUOTES = [
  "El secret de l'èxit és començar. — Mark Twain 🚀",
  "No és que tingui talent, és que soc curiós. — Albert Einstein 🧠",
  "L'únic impossible és allò que no intentes. — Jean-Paul Sartre 💪",
  "La disciplina és el pont entre objectius i resultats. 🌉",
  "Cada dia és una oportunitat per ser millor que ahir. 🌱",
  "No comptis els dies, fes que els dies comptin. — Muhammad Ali ⭐",
  "La perseverança no és una carrera llarga, són moltes curtes. 🏃",
  "Petit progrés cada dia suma grans resultats. 📈",
];

export default function DailySummary() {
  const today = new Date().toDateString();
  const [tasks] = useLocalStorage<Task[]>("focus-tasks", []);
  const [habits] = useLocalStorage<Habit[]>("focus-habits", []);
  const [routineItems] = useLocalStorage<RoutineItem[]>(`focus-routine-${today}`, []);
  const [pomodoroSessions] = useLocalStorage<number>(`focus-pomodoro-${today}`, 0);

  const completedTasks = tasks.filter((t) => t.completed).length;
  const pendingTasks = tasks.filter((t) => !t.completed).length;
  const completedHabits = habits.filter((h) => h.completedDates.includes(today)).length;
  const completedRoutine = routineItems.filter((r) => r.completed).length;
  const bestStreak = Math.max(0, ...habits.map((h) => getStreak(h.completedDates)));

  const totalActions = completedTasks + completedHabits + completedRoutine + pomodoroSessions;
  const quote = MOTIVATIONAL_QUOTES[new Date().getDate() % MOTIVATIONAL_QUOTES.length];

  const getProductivityLevel = () => {
    if (totalActions === 0) return { label: "Encara no has començat", emoji: "🌅", color: "text-muted-foreground" };
    if (totalActions <= 3) return { label: "Bon començament!", emoji: "🌱", color: "text-info" };
    if (totalActions <= 7) return { label: "Vas per bon camí!", emoji: "🔥", color: "text-warning" };
    return { label: "Dia increïble!", emoji: "🏆", color: "text-primary" };
  };

  const productivity = getProductivityLevel();

  const stats = [
    {
      icon: CheckSquare,
      label: "Tasques fetes",
      value: completedTasks,
      subtitle: pendingTasks > 0 ? `${pendingTasks} pendents` : "Tot fet! 🎉",
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      icon: Timer,
      label: "Sessions Pomodoro",
      value: pomodoroSessions,
      subtitle: pomodoroSessions > 0 ? `${pomodoroSessions * 25} min d'estudi` : "Cap sessió encara",
      color: "text-accent",
      bg: "bg-accent/10",
    },
    {
      icon: Flame,
      label: "Hàbits completats",
      value: `${completedHabits}/${habits.length}`,
      subtitle: bestStreak > 0 ? `Ratxa màxima: ${bestStreak} dies 🔥` : "Comença la teva ratxa!",
      color: "text-warning",
      bg: "bg-warning/10",
    },
    {
      icon: Calendar,
      label: "Rutina del dia",
      value: routineItems.length > 0 ? `${completedRoutine}/${routineItems.length}` : "—",
      subtitle: routineItems.length > 0
        ? `${Math.round((completedRoutine / routineItems.length) * 100)}% completat`
        : "Sense rutina definida",
      color: "text-info",
      bg: "bg-info/10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Productivity level */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-2 rounded-xl bg-primary/5 border border-primary/20 p-6"
      >
        <span className="text-4xl">{productivity.emoji}</span>
        <h3 className={`font-display text-xl font-bold ${productivity.color}`}>
          {productivity.label}
        </h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <TrendingUp className="h-4 w-4" />
          <span>{totalActions} accions completades avui</span>
        </div>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`rounded-lg ${stat.bg} border border-border p-4`}
          >
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <p className={`font-display text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
          </motion.div>
        ))}
      </div>

      {/* Best streak highlight */}
      {bestStreak >= 3 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 rounded-lg bg-warning/10 border border-warning/20 p-4"
        >
          <Award className="h-8 w-8 text-warning" />
          <div>
            <p className="text-sm font-semibold">Ratxa impressionant!</p>
            <p className="text-xs text-muted-foreground">
              Portes {bestStreak} dies seguits complint hàbits. No t'aturis! 🔥
            </p>
          </div>
        </motion.div>
      )}

      {/* Daily quote */}
      <div className="rounded-lg bg-muted p-4 text-center">
        <p className="text-xs text-muted-foreground mb-1">💡 Frase del dia</p>
        <p className="text-sm font-medium italic">{quote}</p>
      </div>
    </div>
  );
}