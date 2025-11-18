import React, { useState, useMemo } from 'react';
import { Task } from '../types';
import { ChevronLeft, ChevronRight, CheckCircle2, Calendar as CalendarIcon, Clock, Trophy } from 'lucide-react';

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
    <div className="flex flex-col lg:flex-row gap-6 lg:h-[calc(100vh-8rem)] h-auto min-h-[600px]">
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
        <div className="flex-1 grid grid-cols-7 auto-rows-fr p-3 gap-2 overflow-y-auto min-h-[300px]">
          {days.map((date, idx) => {
            if (!date) return <div key={`empty-${idx}`} className="bg-transparent" />;
            
            const dateKey = toDateKey(date);
            const hasEvents = !!eventsByDate[dateKey];
            const isSelected = dateKey === selectedKey;
            const isToday = toDateKey(new Date()) === dateKey;
            const eventCount = eventsByDate[dateKey]?.length || 0;

            // Dynamic classes for day styling
            let bgClass = 'bg-white hover:bg-slate-50 text-slate-700 border border-transparent';
            
            if (isSelected) {
                bgClass = 'bg-slate-900 text-white shadow-lg shadow-slate-200 scale-105 z-10 border-slate-900';
            } else if (hasEvents) {
                // Green background for days with events
                bgClass = 'bg-green-50 text-green-700 hover:bg-green-100 border-green-100 font-medium';
            }

            return (
              <button
                key={dateKey}
                onClick={() => setSelectedDate(date)}
                className={`
                  relative flex flex-col items-center justify-center rounded-xl transition-all duration-200 p-2 border
                  ${bgClass}
                  ${isToday && !isSelected ? 'ring-2 ring-slate-900 ring-inset' : ''}
                `}
              >
                <span className={`text-sm ${isSelected || isToday ? 'font-bold' : ''}`}>{date.getDate()}</span>
                
                {/* Event Indicators */}
                {hasEvents && (
                  <div className="mt-1.5 flex gap-0.5 items-center">
                     {/* Show a checkmark for accomplishment feeling */}
                     {isSelected ? (
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                     ) : (
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] opacity-70">{eventCount}项</span>
                        </div>
                     )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: Details Panel */}
      <div className="w-full lg:w-96 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        <div className={`p-6 border-b border-slate-100 transition-colors ${selectedEvents.length > 0 ? 'bg-green-50/30' : 'bg-slate-50/30'}`}>
          <div className="flex justify-between items-start">
            <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <CalendarIcon size={20} className={selectedEvents.length > 0 ? "text-green-600" : "text-slate-400"} />
                    {selectedDate.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}
                </h3>
                <p className={`text-sm mt-1 ${selectedEvents.length > 0 ? 'text-green-700 font-medium' : 'text-slate-500'}`}>
                    {selectedEvents.length > 0 ? `太棒了！完成了 ${selectedEvents.length} 项任务` : '当天暂无完成记录'}
                </p>
            </div>
            {selectedEvents.length > 0 && (
                <div className="bg-white p-2 rounded-full shadow-sm border border-green-100">
                    <Trophy size={20} className="text-yellow-500 fill-yellow-500" />
                </div>
            )}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 max-h-[400px] lg:max-h-none">
          {selectedEvents.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center text-slate-400 py-10">
               <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                  <Clock size={28} className="text-slate-300" />
               </div>
               <p className="text-sm font-medium">这一天没有打卡记录</p>
               <p className="text-xs mt-1 opacity-60">继续加油！</p>
             </div>
          ) : (
            <div className="space-y-4">
              <div className="relative pl-5 border-l-2 border-slate-100 space-y-8 py-2">
              {selectedEvents.map((event, idx) => (
                <div key={`${event.id}-${idx}`} className="relative animate-fadeIn group">
                   <div className="absolute -left-[27px] top-1 bg-white p-1.5 rounded-full border border-green-100 group-hover:border-green-300 transition-colors">
                      <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                   </div>
                   
                   <div>
                      <p className="text-xs text-slate-400 font-mono mb-1 flex items-center gap-1.5 bg-slate-50 w-fit px-2 py-0.5 rounded">
                        <Clock size={12} />
                        {event.completedAt.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className={`font-bold text-slate-800 mt-1.5 ${event.type === 'TASK' ? 'text-base' : 'text-sm'}`}>
                        {event.title}
                      </p>
                      {event.type === 'SUBTASK' && (
                        <div className="inline-flex items-center gap-1 mt-2 px-2.5 py-1 bg-slate-50 border border-slate-100 text-slate-500 text-xs rounded-lg">
                           <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
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