import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Plus, Trash2, Trophy, Calendar } from "lucide-react";
import { Habit } from "@/types";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ICONS = ["📚", "🏃", "💧", "🧘", "😴", "🥗", "💪", "📵", "🎵", "✍️", "🧹", "🌿"];

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

function getStreakMessage(streak: number): string {
  if (streak >= 30) return "Ets una llegenda! 🏆";
  if (streak >= 14) return "Dues setmanes! Increïble! 🌟";
  if (streak >= 7) return "Una setmana sencera! 💪";
  if (streak >= 3) return "Vas per bon camí! 🔥";
  if (streak >= 1) return "Bon començament! 🌱";
  return "";
}

function getLast7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    days.push(new Date(Date.now() - i * 86400000).toDateString());
  }
  return days;
}

const DAY_NAMES_SHORT = ["Dl", "Dt", "Dc", "Dj", "Dv", "Ds", "Dg"];

export default function HabitTracker() {
  const [habits, setHabits] = useLocalStorage<Habit[]>("focus-habits", [
    { id: "1", name: "Llegir 30 minuts", icon: "📚", completedDates: [] },
    { id: "2", name: "Fer exercici", icon: "🏃", completedDates: [] },
    { id: "3", name: "Beure 8 gots d'aigua", icon: "💧", completedDates: [] },
    { id: "4", name: "Meditar 10 minuts", icon: "🧘", completedDates: [] },
  ]);
  const [newHabit, setNewHabit] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("📚");
  const [showAdd, setShowAdd] = useState(false);
  const [showWeekly, setShowWeekly] = useState(false);

  const today = new Date().toDateString();
  const last7 = getLast7Days();

  const toggleToday = (id: string) => {
    setHabits(
      habits.map((h) => {
        if (h.id !== id) return h;
        const done = h.completedDates.includes(today);
        return {
          ...h,
          completedDates: done
            ? h.completedDates.filter((d) => d !== today)
            : [...h.completedDates, today],
        };
      })
    );
  };

  const addHabit = () => {
    if (!newHabit.trim()) return;
    setHabits([
      ...habits,
      {
        id: crypto.randomUUID(),
        name: newHabit.trim(),
        icon: selectedIcon,
        completedDates: [],
      },
    ]);
    setNewHabit("");
    setShowAdd(false);
  };

  const deleteHabit = (id: string) => setHabits(habits.filter((h) => h.id !== id));

  const completedToday = habits.filter((h) => h.completedDates.includes(today)).length;
  const allDoneToday = habits.length > 0 && completedToday === habits.length;

  return (
    <div className="space-y-4">
      {/* Habits list */}
      <AnimatePresence mode="popLayout">
        {habits.map((habit) => {
          const isDone = habit.completedDates.includes(today);
          const streak = getStreak(habit.completedDates);
          const streakMsg = getStreakMessage(streak);
          return (
            <motion.div
              key={habit.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, x: -50 }}
              className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                isDone ? "border-primary/30 bg-primary/5" : "border-border bg-card"
              }`}
            >
              <button
                onClick={() => toggleToday(habit.id)}
                aria-label={isDone ? `Desfer: ${habit.name}` : `Completar: ${habit.name}`}
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg transition-transform ${
                  isDone ? "scale-110 bg-primary/10" : "bg-muted"
                }`}
              >
                {isDone ? "✅" : habit.icon}
              </button>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium truncate ${
                    isDone ? "line-through text-muted-foreground" : ""
                  }`}
                >
                  {habit.name}
                </p>
                {streak > 0 && (
                  <p className="flex items-center gap-1 text-xs text-warning">
                    <Flame className="h-3 w-3" /> {streak} dies seguits
                    {streakMsg && <span className="text-muted-foreground ml-1">· {streakMsg}</span>}
                  </p>
                )}
              </div>
              <button
                onClick={() => deleteHabit(habit.id)}
                aria-label={`Eliminar: ${habit.name}`}
                className="text-muted-foreground hover:text-destructive transition"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Add habit form */}
      <AnimatePresence>
        {showAdd ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 rounded-lg border border-border bg-card p-3 overflow-hidden"
          >
            <div className="flex gap-2">
              <Input
                placeholder="Nom del nou hàbit..."
                value={newHabit}
                onChange={(e) => setNewHabit(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addHabit()}
                className="flex-1"
              />
              <Button onClick={addHabit} size="sm">
                Afegir
              </Button>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {ICONS.map((icon) => (
                <button
                  key={icon}
                  onClick={() => setSelectedIcon(icon)}
                  className={`rounded-md p-1.5 text-lg transition ${
                    selectedIcon === icon
                      ? "bg-primary/10 ring-2 ring-primary"
                      : "hover:bg-muted"
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <Button onClick={() => setShowAdd(true)} variant="outline" className="w-full gap-2">
            <Plus className="h-4 w-4" /> Afegir hàbit
          </Button>
        )}
      </AnimatePresence>

      {/* Summary */}
      {habits.length > 0 && (
        <div className="space-y-3">
          <motion.div
            className={`rounded-lg p-4 text-center transition-colors ${
              allDoneToday ? "bg-primary/10 border border-primary/20" : "bg-muted"
            }`}
          >
            {allDoneToday && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex justify-center mb-2"
              >
                <Trophy className="h-8 w-8 text-primary" />
              </motion.div>
            )}
            <p className="text-xs text-muted-foreground">
              {allDoneToday ? "🎉 Tots els hàbits completats avui!" : "Completats avui"}
            </p>
            <p className="font-display text-2xl font-bold text-primary">
              {completedToday}/{habits.length}
            </p>
          </motion.div>

          {/* Weekly mini-view toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowWeekly(!showWeekly)}
            className="w-full gap-1 text-xs text-muted-foreground"
          >
            <Calendar className="h-3 w-3" />
            {showWeekly ? "Amagar vista setmanal" : "Veure última setmana"}
          </Button>

          <AnimatePresence>
            {showWeekly && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden rounded-lg border border-border bg-card p-3"
              >
                <p className="text-xs text-muted-foreground mb-2 font-medium">
                  Últims 7 dies
                </p>
                <div className="space-y-2">
                  {habits.map((habit) => (
                    <div key={habit.id} className="flex items-center gap-2">
                      <span className="text-sm w-6 text-center">{habit.icon}</span>
                      <span className="text-xs text-muted-foreground truncate flex-1 max-w-[100px]">
                        {habit.name}
                      </span>
                      <div className="flex gap-1">
                        {last7.map((day, i) => {
                          const done = habit.completedDates.includes(day);
                          return (
                            <div key={day} className="flex flex-col items-center gap-0.5">
                              <div
                                className={`h-5 w-5 rounded-sm flex items-center justify-center text-[10px] ${
                                  done
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground/50"
                                }`}
                              >
                                {done ? "✓" : "·"}
                              </div>
                              <span className="text-[9px] text-muted-foreground/50">
                                {DAY_NAMES_SHORT[new Date(day).getDay() === 0 ? 6 : new Date(day).getDay() - 1]}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}