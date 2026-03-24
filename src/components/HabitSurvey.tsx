import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Button } from "@/components/ui/button";
import { RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";

const QUESTIONS = [
  {
    q: "Quant de temps passes a les xarxes socials cada dia?",
    emoji: "📱",
    options: ["Menys d'1 hora", "1-3 hores", "3-5 hores", "Més de 5 hores"],
  },
  {
    q: "A quina hora sol·les anar a dormir?",
    emoji: "🌙",
    options: [
      "Abans de les 22:00",
      "Entre 22:00 i 00:00",
      "Entre 00:00 i 2:00",
      "Després de les 2:00",
    ],
  },
  {
    q: "Amb quina freqüència fas exercici?",
    emoji: "🏃",
    options: ["Cada dia", "3-5 cops per setmana", "De tant en tant", "Mai o gairebé mai"],
  },
  {
    q: "Quina creus que és la causa principal de la teva procrastinació?",
    emoji: "🤔",
    options: [
      "La temptació del mòbil i les xarxes",
      "Falta de motivació o interès",
      "No saber per on començar",
      "Estar massa cansat o sense energia",
    ],
  },
  {
    q: "Com descriuries la teva capacitat de concentració?",
    emoji: "🧠",
    options: [
      "Em concentro bé durant llarga estona",
      "Puc concentrar-me però em distrec fàcilment",
      "Em costa molt mantenir l'atenció",
      "Gairebé no puc concentrar-me",
    ],
  },
  {
    q: "Què t'agradaria millorar més?",
    emoji: "🎯",
    options: [
      "Eficiència d'estudi i treball",
      "Rutina de son i descans",
      "Reduir el temps de pantalla",
      "Hàbits d'exercici i alimentació",
    ],
  },
  {
    q: "Quantes hores dediques a estudiar/treballar al dia?",
    emoji: "📚",
    options: [
      "Menys d'1 hora",
      "1-3 hores",
      "3-6 hores",
      "Més de 6 hores",
    ],
  },
];

function getPersonalizedAdvice(answers: Record<number, string>): string[] {
  const advice: string[] = [];

  // Screen time advice
  if (answers[0] === "3-5 hores" || answers[0] === "Més de 5 hores") {
    advice.push("📵 Prova d'establir un límit diari de pantalla. Comença reduint 30 minuts cada setmana.");
  }

  // Sleep advice
  if (answers[1] === "Entre 00:00 i 2:00" || answers[1] === "Després de les 2:00") {
    advice.push("😴 Intenta avançar l'hora de dormir 15 minuts cada nit. El teu cos s'adaptarà gradualment.");
  }

  // Exercise advice
  if (answers[2] === "De tant en tant" || answers[2] === "Mai o gairebé mai") {
    advice.push("🏃 Comença amb 10 minuts de caminada diària. L'exercici millora la concentració i l'ànim.");
  }

  // Procrastination advice
  if (answers[3] === "La temptació del mòbil i les xarxes") {
    advice.push("📱 Utilitza el Mode Focus d'aquesta app! Deixa el mòbil en una altra habitació mentre estudies.");
  } else if (answers[3] === "No saber per on començar") {
    advice.push("📋 Divideix les tasques grans en passos petits. El Gestor de Tasques t'ajudarà a organitzar-te.");
  }

  // Concentration advice
  if (answers[4] === "Em costa molt mantenir l'atenció" || answers[4] === "Gairebé no puc concentrar-me") {
    advice.push("⏱️ La tècnica Pomodoro (25 min de focus + 5 min de descans) és perfecta per a tu!");
  }

  if (advice.length === 0) {
    advice.push("🌟 Sembla que ja tens bons hàbits! Continua així i utilitza l'app per mantenir el ritme.");
  }

  return advice;
}

export default function HabitSurvey() {
  const [answers, setAnswers] = useLocalStorage<Record<number, string>>("focus-survey", {});
  const [currentQ, setCurrentQ] = useState(0);
  const [submitted, setSubmitted] = useState(
    Object.keys(answers).length === QUESTIONS.length
  );

  const selectAnswer = (answer: string) => {
    const newAnswers = { ...answers, [currentQ]: answer };
    setAnswers(newAnswers);
    if (currentQ < QUESTIONS.length - 1) {
      setTimeout(() => setCurrentQ(currentQ + 1), 300);
    } else {
      setTimeout(() => setSubmitted(true), 300);
    }
  };

  const goBack = () => {
    if (currentQ > 0) setCurrentQ(currentQ - 1);
  };

  const goForward = () => {
    if (answers[currentQ] !== undefined && currentQ < QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1);
    }
  };

  const reset = () => {
    setAnswers({});
    setCurrentQ(0);
    setSubmitted(false);
  };

  if (submitted) {
    const advice = getPersonalizedAdvice(answers);
    return (
      <div className="space-y-6">
        <div className="text-center py-4 space-y-2">
          <p className="text-4xl">🎉</p>
          <h3 className="font-display text-lg font-bold">
            Gràcies per les teves respostes!
          </h3>
          <p className="text-sm text-muted-foreground">
            Aquí tens consells personalitzats basats en les teves respostes.
          </p>
        </div>

        {/* Personalized advice */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            💡 Consells personalitzats per a tu
          </p>
          {advice.map((tip, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15 }}
              className="rounded-lg bg-primary/5 border border-primary/20 p-3"
            >
              <p className="text-sm">{tip}</p>
            </motion.div>
          ))}
        </div>

        {/* Answers summary */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">📊 Les teves respostes</p>
          <div className="rounded-lg bg-muted p-4 space-y-3">
            {QUESTIONS.map((q, i) => (
              <div key={i}>
                <p className="text-xs text-muted-foreground">
                  {q.emoji} {q.q}
                </p>
                <p className="text-sm font-medium">{answers[i]}</p>
              </div>
            ))}
          </div>
        </div>

        <Button onClick={reset} variant="outline" size="sm" className="w-full gap-2">
          <RotateCcw className="h-4 w-4" /> Tornar a respondre
        </Button>
      </div>
    );
  }

  const q = QUESTIONS[currentQ];

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex gap-1">
          {QUESTIONS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i < currentQ
                  ? "bg-primary"
                  : i === currentQ
                  ? "bg-primary/60"
                  : "bg-muted"
              }`}
            />
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground text-right">
          {currentQ + 1} de {QUESTIONS.length}
        </p>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-4"
        >
          <div className="text-center space-y-2">
            <span className="text-3xl">{q.emoji}</span>
            <h3 className="font-display text-lg font-semibold">{q.q}</h3>
          </div>

          <div className="space-y-2">
            {q.options.map((opt) => (
              <button
                key={opt}
                onClick={() => selectAnswer(opt)}
                className={`w-full rounded-lg border p-3 text-left text-sm transition hover:border-primary hover:bg-primary/5 ${
                  answers[currentQ] === opt
                    ? "border-primary bg-primary/10 font-medium"
                    : "border-border bg-card"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={goBack}
          disabled={currentQ === 0}
          className="gap-1"
        >
          <ChevronLeft className="h-4 w-4" /> Anterior
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={goForward}
          disabled={answers[currentQ] === undefined || currentQ === QUESTIONS.length - 1}
          className="gap-1"
        >
          Següent <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}