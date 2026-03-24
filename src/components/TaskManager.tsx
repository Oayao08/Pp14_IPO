import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Check, ListFilter, SortAsc } from "lucide-react";
import { Task } from "@/types";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PRIORITY_STYLES = {
  high: "bg-priority-high/10 text-priority-high border-priority-high/30",
  medium: "bg-priority-medium/10 text-priority-medium border-priority-medium/30",
  low: "bg-priority-low/10 text-priority-low border-priority-low/30",
};

const PRIORITY_LABELS: Record<Task["priority"], string> = {
  high: "Alta",
  medium: "Mitjana",
  low: "Baixa",
};

const PRIORITY_ORDER: Record<Task["priority"], number> = {
  high: 0,
  medium: 1,
  low: 2,
};

type SortMode = "recent" | "priority";
type FilterMode = "all" | "high" | "medium" | "low";

export default function TaskManager() {
  const [tasks, setTasks] = useLocalStorage<Task[]>("focus-tasks", []);
  const [newTask, setNewTask] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("medium");
  const [sortMode, setSortMode] = useState<SortMode>("recent");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");

  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks([
      ...tasks,
      {
        id: crypto.randomUUID(),
        title: newTask.trim(),
        priority,
        completed: false,
        createdAt: new Date().toISOString(),
      },
    ]);
    setNewTask("");
  };

  const toggleTask = (id: string) =>
    setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));

  const deleteTask = (id: string) => setTasks(tasks.filter((t) => t.id !== id));

  const clearCompleted = () => setTasks(tasks.filter((t) => !t.completed));

  let pending = tasks.filter((t) => !t.completed);
  let completed = tasks.filter((t) => t.completed);

  // Filter
  if (filterMode !== "all") {
    pending = pending.filter((t) => t.priority === filterMode);
  }

  // Sort
  if (sortMode === "priority") {
    pending = [...pending].sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
  }

  return (
    <div className="space-y-4">
      {/* Input row */}
      <div className="flex gap-2">
        <Input
          placeholder="Afegir una tasca nova..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
          className="flex-1"
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as Task["priority"])}
          className="rounded-md border border-border bg-card px-2 text-sm font-body"
        >
          <option value="high">🔴 Alta</option>
          <option value="medium">🟡 Mitjana</option>
          <option value="low">🟢 Baixa</option>
        </select>
        <Button onClick={addTask} size="icon" aria-label="Afegir tasca">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Controls */}
      {tasks.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <SortAsc className="h-3 w-3" />
            <button
              onClick={() => setSortMode(sortMode === "recent" ? "priority" : "recent")}
              className="underline hover:text-foreground transition"
            >
              {sortMode === "recent" ? "Ordenar per prioritat" : "Ordenar per data"}
            </button>
          </div>
          <span className="text-muted-foreground/30">·</span>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <ListFilter className="h-3 w-3" />
            <select
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value as FilterMode)}
              className="bg-transparent text-xs underline hover:text-foreground transition cursor-pointer"
            >
              <option value="all">Totes</option>
              <option value="high">Només alta</option>
              <option value="medium">Només mitjana</option>
              <option value="low">Només baixa</option>
            </select>
          </div>
          {completed.length > 0 && (
            <>
              <span className="text-muted-foreground/30">·</span>
              <button
                onClick={clearCompleted}
                className="text-xs text-destructive/70 hover:text-destructive underline transition"
              >
                Esborrar completades
              </button>
            </>
          )}
        </div>
      )}

      {/* Pending tasks */}
      <AnimatePresence mode="popLayout">
        {pending.map((task) => (
          <motion.div
            key={task.id}
            layout
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
          >
            <button
              onClick={() => toggleTask(task.id)}
              aria-label={`Completar: ${task.title}`}
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-muted-foreground/30 transition hover:border-primary"
            />
            <span className="flex-1 text-sm">{task.title}</span>
            <span
              className={`rounded-full border px-2 py-0.5 text-xs font-medium ${PRIORITY_STYLES[task.priority]}`}
            >
              {PRIORITY_LABELS[task.priority]}
            </span>
            <button
              onClick={() => deleteTask(task.id)}
              aria-label={`Eliminar: ${task.title}`}
              className="text-muted-foreground hover:text-destructive transition"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Completed tasks */}
      {completed.length > 0 && (
        <div className="space-y-2 pt-2">
          <p className="text-xs font-medium text-muted-foreground">
            ✅ Completades ({completed.length})
          </p>
          {completed.map((task) => (
            <motion.div
              key={task.id}
              layout
              className="flex items-center gap-3 rounded-lg border border-border/50 bg-muted/50 p-3 opacity-60"
            >
              <button
                onClick={() => toggleTask(task.id)}
                aria-label={`Desfer: ${task.title}`}
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary"
              >
                <Check className="h-3 w-3 text-primary-foreground" />
              </button>
              <span className="flex-1 text-sm line-through">{task.title}</span>
              <button
                onClick={() => deleteTask(task.id)}
                className="text-muted-foreground hover:text-destructive transition"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {tasks.length === 0 && (
        <div className="py-8 text-center space-y-2">
          <p className="text-4xl">📋</p>
          <p className="text-sm text-muted-foreground">
            Encara no tens tasques. Afegeix-ne una per començar! 🚀
          </p>
        </div>
      )}

      {/* Pending filtered empty */}
      {tasks.length > 0 && pending.length === 0 && completed.length === 0 && (
        <p className="py-4 text-center text-sm text-muted-foreground">
          Cap tasca amb aquest filtre.
        </p>
      )}
    </div>
  );
}