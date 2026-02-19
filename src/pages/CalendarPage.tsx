import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface CalendarNote {
  date: string;
  hour: number;
  text: string;
}

const hours = Array.from({ length: 24 }, (_, i) => i);
const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [notes, setNotes] = useState<CalendarNote[]>([]);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [newNote, setNewNote] = useState({ hour: 9, text: "" });

  useEffect(() => {
    const saved = localStorage.getItem("calendarNotes");
    if (saved) {
      try {
        setNotes(JSON.parse(saved));
      } catch {
        setNotes([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("calendarNotes", JSON.stringify(notes));
  }, [notes]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: (Date | null)[] = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const formatDateKey = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };

  const getNotesForDate = (date: Date) => {
    const key = formatDateKey(date);
    return notes.filter((n) => n.date === key);
  };

  const getHeatLevel = (count: number) => {
    if (count === 0) return "bg-secondary";
    if (count === 1) return "bg-primary/30";
    if (count === 2) return "bg-primary/50";
    return "bg-primary/80";
  };

  const addNote = () => {
    if (!selectedDay || !newNote.text.trim()) return;
    const key = formatDateKey(selectedDay);
    setNotes((prev) => [...prev, { date: key, hour: newNote.hour, text: newNote.text }]);
    setNewNote({ hour: 9, text: "" });
  };

  const removeNote = (date: string, hour: number, text: string) => {
    setNotes((prev) =>
      prev.filter((n) => !(n.date === date && n.hour === hour && n.text === text))
    );
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const days = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-white">Calendario</h2>
        <p className="text-sm text-muted-foreground">
          Organize suas publicacoes e lembretes
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Calendar */}
        <div className="rounded-3xl border border-white/10 bg-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={prevMonth} className="text-white/60 hover:text-white">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h3 className="font-semibold text-white capitalize">{monthName}</h3>
            <Button variant="ghost" size="icon" onClick={nextMonth} className="text-white/60 hover:text-white">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {daysOfWeek.map((day) => (
              <div key={day} className="py-2 text-center text-xs font-medium text-muted-foreground">
                {day}
              </div>
            ))}
            {days.map((day, idx) => {
              if (!day) {
                return <div key={`empty-${idx}`} className="aspect-square" />;
              }
              const notesCount = getNotesForDate(day).length;
              const isSelected = selectedDay && formatDateKey(day) === formatDateKey(selectedDay);
              const isToday = formatDateKey(day) === formatDateKey(new Date());

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDay(day)}
                  className={cn(
                    "aspect-square rounded-lg text-sm font-medium transition-colors relative",
                    getHeatLevel(notesCount),
                    isSelected && "ring-2 ring-primary",
                    isToday && "ring-2 ring-white/50",
                    "hover:ring-2 hover:ring-primary/50"
                  )}
                >
                  <span className="text-white">{day.getDate()}</span>
                  {notesCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-white">
                      {notesCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-white/10">
            <p className="text-xs text-muted-foreground">Legenda do heatmap:</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1">
                <div className="h-4 w-4 rounded bg-secondary" />
                <span className="text-xs text-muted-foreground">0</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-4 w-4 rounded bg-primary/30" />
                <span className="text-xs text-muted-foreground">1</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-4 w-4 rounded bg-primary/50" />
                <span className="text-xs text-muted-foreground">2</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-4 w-4 rounded bg-primary/80" />
                <span className="text-xs text-muted-foreground">3+</span>
              </div>
            </div>
          </div>
        </div>

        {/* Day detail */}
        <div className="rounded-3xl border border-white/10 bg-card p-6 space-y-4">
          {selectedDay ? (
            <>
              <h3 className="font-semibold text-white">
                {selectedDay.toLocaleDateString("pt-BR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </h3>

              {/* Add note form */}
              <div className="flex gap-2">
                <select
                  value={newNote.hour}
                  onChange={(e) => setNewNote((p) => ({ ...p, hour: Number(e.target.value) }))}
                  className="rounded-lg bg-secondary border-white/10 px-3 py-2 text-sm text-white"
                >
                  {hours.map((h) => (
                    <option key={h} value={h}>
                      {String(h).padStart(2, "0")}:00
                    </option>
                  ))}
                </select>
                <Input
                  placeholder="Adicionar nota..."
                  value={newNote.text}
                  onChange={(e) => setNewNote((p) => ({ ...p, text: e.target.value }))}
                  className="flex-1 bg-secondary border-white/10"
                />
                <Button onClick={addNote} size="icon" className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Notes list */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {getNotesForDate(selectedDay).length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhuma nota para este dia
                  </p>
                ) : (
                  getNotesForDate(selectedDay)
                    .sort((a, b) => a.hour - b.hour)
                    .map((note, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-lg bg-secondary/30 px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-primary">
                            {String(note.hour).padStart(2, "0")}:00
                          </span>
                          <span className="text-sm text-white">{note.text}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeNote(note.date, note.hour, note.text)}
                          className="h-6 w-6 text-destructive hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))
                )}
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center py-12">
              <p className="text-sm text-muted-foreground">
                Selecione um dia no calendario
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
