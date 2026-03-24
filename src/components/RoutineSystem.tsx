import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Check, Trash2, RotateCcw, Sun, Moon, Coffee } from "lucide-react";
import { RoutineItem } from "@/types";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const today = new Date().toDateString();

const DEFAULT_ROUTINES: RoutineItem[] = [
  { id: "1", title: "Llevar-se i fer el llit", time: "07:00", completed: false },
  { id: "2", title: "Esmorzar saludable", time: "07:30", completed: false },
  { id: "3", title: "Bloc d'estudi concentrat", time: "09:00", completed: false },
  { id: "4", title: "Pausa i estirar-se", time: "10:30", completed: false },
  { id: "5", title: "Segon bloc d'estudi", time: "11:00", completed: false },
  { id: "6", title: "Dinar", time: "13:00", completed: false },
  { id: "7", title: "Exercici o passejar", time: "17:00", completed: false },
  { id: "8", title: "Temps lliure (sense pantalles)", time: "19:00", completed: false },
  { id: "9", title: "Llegir abans de dormir", time: "21:30", completed: false },
  { id: "10", title: "Dormir", time: "22:30", completed: false },
];

function getTimeIcon(time: string) {
  const h = parseInt(time.split(":")[0]);
  if (h < 12) return <Sun className="h-3 w-3 text-warning" />;
  if (h < 18) return <Coffee className="h-3 w-3 text-accent" />;
  return <Moon className="h-3 w-3 text-info" />;
}

export default function RoutineSystem() {
  const [items, setItems] = useLocalStorage<RoutineItem[]>(
    `focus-routine-${today}`,
    DEFAULT_ROUTINES
  );
  const [newTitle, setNewTitle] = useState("");
  const [newTime, setNewTime] = useState("08:00");

  const addItem = () => {
    if (!newTitle.trim()) return;
    setItems(
      [
        ...items,
        {
          id: crypto.randomUUID(),
          title: newTitle.trim(),
          time: newTime,
          completed: false,
        },
      ].sort((a, b) => a.time.localeCompare(b.time))
    );
    setNewTitle("");
  };

  const toggleItem = (id: string) =>
    setItems(items.map((i) => (i.id === id ? { ...i, completed: !i.completed } : i)));
  const deleteItem = (id: string) => setItems(items.filter((i) => i.id !== id));
  const resetAll = () => setItems(items.map((i) => ({ ...i, completed: false })));

  const completedCount = items.filter((i) => i.completed).length;
  const progress = items.length > 0 ? (completedCount / items.length) * 100 : 0;
  const allDone = items.length > 0 && completedCount === items.length;

  // Group by time of day
  const morning = items.filter((i) => parseInt(i.time) < 12);
  const afternoon = items.filter((i) => parseInt(i.time) >= 12 && parseInt(i.time) < 18);
  const evening = items.filter((i) => parseInt(i.time) >= 18);

  const renderGroup = (label: string, icon: React.ReactNode, groupItems: RoutineItem[]) => {
    if (groupItems.length === 0) return null;
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
          {icon}
          <span>{label}</span>
        </div>
        <AnimatePresence mode="popLayout">
          {groupItems.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, x: -50 }}
              className={`flex items-center gap-3 rounded-lg border p-3 transition ${
                item.completed
                  ? "border-primary/20 bg-primary/5"
                  : "border-border bg-card"
              }`}
            >
              <button
                onClick={() => toggleItem(item.id)}
                aria-label={item.completed ? `Desfer: ${item.title}` : `Completar: ${item.title}`}
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${
                  item.completed
                    ? "border-primary bg-primary"
                    : "border-muted-foreground/30 hover:border-primary"
                }`}
              >
                {item.completed && <Check className="h-3 w-3 text-primary-foreground" />}
              </button>
              <div className="flex items-center gap-2 w-14">
                {getTimeIcon(item.time)}
                <span className="text-xs text-muted-foreground font-mono">{item.time}</span>
              </div>
              <span
                className={`flex-1 text-sm ${
                  item.completed ? "line-through text-muted-foreground" : ""
                }`}
              >
                {item.title}
              </span>
              <button
                onClick={() => deleteItem(item.id)}
                aria-label={`Eliminar: ${item.title}`}
                className="text-muted-foreground hover:text-destructive transition"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="space-y-1">
        <div className="overflow-hidden rounded-full bg-muted h-2.5">
          <motion.div
            className={`h-full rounded-full transition-colors ${
              allDone ? "bg-success" : "bg-primary"
            }`}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="flex justify-between items-center">
          <p className="text-xs text-muted-foreground">
            {allDone
              ? "🎉 Tota la rutina completada! Genial!"
              : `${completedCount}/${items.length} completats`}
          </p>
          {completedCount > 0 && !allDone && (
            <button
              onClick={resetAll}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition"
            >
              <RotateCcw className="h-3 w-3" /> Reiniciar
            </button>
          )}
        </div>
      </div>

      {/* Grouped items */}
      {renderGroup("Matí", <Sun className="h-3 w-3 text-warning" />, morning)}
      {renderGroup("Tarda", <Coffee className="h-3 w-3 text-accent" />, afternoon)}
      {renderGroup("Vespre / Nit", <Moon className="h-3 w-3 text-info" />, evening)}

      {/* Add new item */}
      <div className="flex gap-2">
        <Input
          value={newTime}
          type="time"
          onChange={(e) => setNewTime(e.target.value)}
          className="w-24"
          aria-label="Hora"
        />
        <Input
          placeholder="Afegir element a la rutina..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addItem()}
          className="flex-1"
        />
        <Button onClick={addItem} size="icon" aria-label="Afegir">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}