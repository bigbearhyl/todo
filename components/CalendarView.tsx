import React, { useState, useMemo } from 'react';
import { Task } from '../types';
import { ChevronLeft, ChevronRight, CheckCircle2, Calendar as CalendarIcon, Clock } from 'lucide-react';

interface CalendarViewProps {
  tasks: Task[];
}

interface CompletedEvent {
  id: string;
  type: 'TASK' | 'SUBTASK';
  title: string;
  parentTitle?: string;
  completedAt: Date;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ tasks }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Helper to format date as YYYY-MM-DD for map keys
  const toDateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Process all tasks to find completed events grouped by date
  const eventsByDate = useMemo(() => {
    const map: Record<string, CompletedEvent[]> = {};

    tasks.forEach(task => {
      // Check if main task is completed
      if (task.status === 'COMPLETED' && task.completedAt) {
        const date = new Date(task.completedAt);
        const key = toDateKey(date);
        if (!map[key]) map[key] = [];
        map[key].push({
          id: task.id,
          type: 'TASK',
          title: `完成计划：${task.title}`,
          completedAt: date
        });
      }

      // Check all subtasks
      task.subTasks.forEach(sub => {
        if (sub.isCompleted && sub.completedAt) {
          const date = new Date(sub.completedAt);
          const key = toDateKey(date);
          if (!map[key]) map[key] = [];
          map[key].push({
            id: sub.id,
            type: 'SUBTASK',
            title: sub.content,
            parentTitle: task.title,
            completedAt: date
          });
        }
      });
    });

    // Sort events by time (newest first) for each day
    Object.keys(map).forEach(key => {
      map[key].sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());
    });

    return map;
  }, [tasks]);

  // Calendar Navigation
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  // Generate Calendar Grid
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday

  const days = [];
  // Fill empty slots for previous month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  // Fill days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }

  const selectedKey = toDateKey(selectedDate);
  const selectedEvents = eventsByDate[selectedKey] || [];
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)] min-h-[600px]">
      {/* Left: Calendar Grid */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 flex items-center justify-between border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">
            {year}年 {month + 1}月
          </h2>
          <div className="flex gap-2">
            <button onClick={prevMonth} className="p-2 hover:bg-slate-50 rounded-full transition-colors border border-slate-200 text-slate-600">
              <ChevronLeft size={20} />
            </button>
            <button onClick={nextMonth} className="p-2 hover:bg-slate-50 rounded-full transition-colors border border-slate-200 text-slate-600">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Week Header */}
        <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
          {weekDays.map(d => (
            <div key={d} className="py-3 text-center text-sm font-medium text-slate-400">
              {d}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="flex-1 grid grid-cols-7 auto-rows-fr p-2 gap-1 overflow-y-auto">
          {days.map((date, idx) => {
            if (!date) return <div key={`empty-${idx}`} className="bg-transparent" />;
            
            const dateKey = toDateKey(date);
            const hasEvents = !!eventsByDate[dateKey];
            const isSelected = dateKey === selectedKey;
            const isToday = toDateKey(new Date()) === dateKey;

            return (
              <button
                key={dateKey}
                onClick={() => setSelectedDate(date)}
                className={`
                  relative flex flex-col items-center justify-center rounded-xl transition-all duration-200 p-2
                  ${isSelected ? 'bg-slate-900 text-white shadow-md scale-105 z-10' : 'hover:bg-slate-50 text-slate-700'}
                  ${isToday && !isSelected ? 'ring-1 ring-slate-900 ring-inset font-semibold' : ''}
                `}
              >
                <span className={`text-sm ${isSelected ? 'font-bold' : ''}`}>{date.getDate()}</span>
                {hasEvents && (
                  <div className="mt-1.5 flex gap-0.5">
                     <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-green-500'}`} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: Details Panel */}
      <div className="w-full lg:w-96 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/30">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <CalendarIcon size={20} className="text-slate-400" />
            {selectedDate.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}
          </h3>
          <p className="text-slate-500 text-sm mt-1">
            完成 {selectedEvents.length} 项
          </p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          {selectedEvents.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center text-slate-400 py-10">
               <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3 border border-slate-100">
                  <Clock size={24} className="text-slate-300" />
               </div>
               <p className="text-sm font-medium">当天没有完成记录</p>
             </div>
          ) : (
            <div className="space-y-4">
              <div className="relative pl-4 border-l-2 border-slate-100 space-y-6">
              {selectedEvents.map((event, idx) => (
                <div key={`${event.id}-${idx}`} className="relative animate-fadeIn">
                   <div className="absolute -left-[21px] top-1 bg-white p-1">
                      <div className="w-2.5 h-2.5 bg-green-500 rounded-full ring-4 ring-white"></div>
                   </div>
                   
                   <div>
                      <p className="text-xs text-slate-400 font-mono mb-1 flex items-center gap-1">
                        <Clock size={10} />
                        {event.completedAt.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className={`font-medium text-slate-800 ${event.type === 'TASK' ? 'text-base' : 'text-sm'}`}>
                        {event.title}
                      </p>
                      {event.type === 'SUBTASK' && (
                        <div className="inline-block mt-1.5 px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded-md">
                           {event.parentTitle}
                        </div>
                      )}
                   </div>
                </div>
              ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};