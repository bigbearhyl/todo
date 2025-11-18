import React, { useState, useRef } from 'react';
import { Task, TaskStatus, SubTask } from '../types';
import { Calendar, CheckCircle2, Circle, Clock, Trash2, ChevronDown, ChevronUp, Plus, GripVertical, Share } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onUpdate: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onUpdate, onDelete }) => {
  const [newSubTaskInput, setNewSubTaskInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(task.status === TaskStatus.ACTIVE);
  
  // Drag and Drop State
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const isCompleted = task.status === TaskStatus.COMPLETED;

  const handleToggleMainTask = () => {
    const newStatus = isCompleted ? TaskStatus.ACTIVE : TaskStatus.COMPLETED;
    const completedAt = newStatus === TaskStatus.COMPLETED ? new Date().toISOString() : undefined;
    
    onUpdate({
      ...task,
      status: newStatus,
      completedAt,
    });
  };

  const handleToggleSubTask = (subTaskId: string) => {
    const updatedSubTasks = task.subTasks.map(st => {
      if (st.id === subTaskId) {
        return {
          ...st,
          isCompleted: !st.isCompleted,
          completedAt: !st.isCompleted ? new Date().toISOString() : undefined
        };
      }
      return st;
    });

    onUpdate({ ...task, subTasks: updatedSubTasks });
  };

  const handleAddSubTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubTaskInput.trim()) return;

    const newSubTask: SubTask = {
      id: crypto.randomUUID(),
      content: newSubTaskInput.trim(),
      isCompleted: false,
    };

    onUpdate({
      ...task,
      subTasks: [...task.subTasks, newSubTask]
    });
    setNewSubTaskInput('');
  };

  const handleDeleteSubTask = (subTaskId: string) => {
    const updatedSubTasks = task.subTasks.filter(st => st.id !== subTaskId);
    onUpdate({ ...task, subTasks: updatedSubTasks });
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent<HTMLLIElement>, position: number) => {
    dragItem.current = position;
    e.dataTransfer.effectAllowed = "move";
    // Create a transparent drag image or style
    if (e.currentTarget) {
       e.currentTarget.style.opacity = "0.5";
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLLIElement>, position: number) => {
    dragOverItem.current = position;
    e.preventDefault();
  };

  const handleDragEnd = (e: React.DragEvent<HTMLLIElement>) => {
    e.currentTarget.style.opacity = "1";
    
    if (dragItem.current !== null && dragOverItem.current !== null && dragItem.current !== dragOverItem.current) {
        const _subTasks = [...task.subTasks];
        const draggedItemContent = _subTasks[dragItem.current];
        _subTasks.splice(dragItem.current, 1);
        _subTasks.splice(dragOverItem.current, 0, draggedItemContent);
        
        onUpdate({ ...task, subTasks: _subTasks });
    }
    
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const handleAddToCalendar = () => {
    // 创建 .ics 文件内容
    const startTime = task.startDate.replace(/-/g, '');
    const endTime = task.endDate.replace(/-/g, '');
    
    // 简单的 ICS 格式
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//SmartPlan//Todo App//CN
BEGIN:VEVENT
UID:${task.id}@smartplan.app
DTSTAMP:${new Date().toISOString().replace(/[-:.]/g, '')}
DTSTART;VALUE=DATE:${startTime}
DTEND;VALUE=DATE:${endTime}
SUMMARY:${task.title}
DESCRIPTION:${task.description}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${task.title}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleString('zh-CN', { 
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
  };

  const progress = task.subTasks.length > 0 
    ? Math.round((task.subTasks.filter(t => t.isCompleted).length / task.subTasks.length) * 100) 
    : 0;

  return (
    <div className={`group relative bg-white rounded-xl border transition-all duration-300 ${isCompleted ? 'border-slate-100 shadow-sm bg-slate-50/50' : 'border-slate-200 shadow-md hover:shadow-xl hover:border-brand-200'}`}>
      
      {/* Completion Line Animation */}
      <div className={`absolute top-1/2 left-4 right-4 h-0.5 bg-slate-400 transform origin-left transition-transform duration-500 ease-in-out z-20 pointer-events-none ${isCompleted ? 'scale-x-100' : 'scale-x-0'}`} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <button 
            onClick={handleToggleMainTask}
            className={`mt-1 flex-shrink-0 transition-colors ${isCompleted ? 'text-green-500' : 'text-slate-300 hover:text-brand-500'}`}
          >
            {isCompleted ? <CheckCircle2 size={24} className="fill-green-100" /> : <Circle size={24} />}
          </button>

          <div className="flex-1 min-w-0">
            {/* Title and Completion Time Row */}
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-1">
               <h3 className={`text-lg font-semibold break-words transition-all ${isCompleted ? 'text-slate-400' : 'text-slate-900'}`}>
                {task.title}
              </h3>
              {isCompleted && task.completedAt && (
                <span className="text-xs font-mono text-slate-400">
                  {formatTime(task.completedAt)}
                </span>
              )}
            </div>

            <p className={`text-sm mb-3 break-words ${isCompleted ? 'text-slate-400' : 'text-slate-600'}`}>
              {task.description}
            </p>

            {/* Metadata Bar */}
            <div className={`flex flex-wrap items-center gap-3 text-xs ${isCompleted ? 'text-slate-400' : 'text-slate-500'}`}>
              <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-md">
                <Calendar size={12} />
                <span>{formatDate(task.startDate)} - {formatDate(task.endDate)}</span>
              </div>
              
              {!isCompleted && (
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500 transition-all duration-500" style={{ width: `${progress}%` }} />
                  </div>
                  <span>{progress}%</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
                onClick={handleAddToCalendar}
                title="添加到系统日历"
                className="text-slate-300 hover:text-brand-600 transition-colors p-1"
            >
                <Share size={18} />
            </button>
            <button onClick={() => onDelete(task.id)} className="text-slate-300 hover:text-red-500 transition-colors p-1">
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        {/* Expand Toggle */}
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full mt-4 flex items-center justify-center gap-1 text-xs font-medium text-slate-400 hover:text-brand-600 transition-colors py-1"
        >
          {isExpanded ? (
            <>收起详情 <ChevronUp size={14} /></>
          ) : (
            <>展开 {task.subTasks.length} 个每日打卡 <ChevronDown size={14} /></>
          )}
        </button>
      </div>

      {/* Subtasks Section */}
      {isExpanded && (
        <div className="border-t border-slate-100 bg-slate-50/50 p-4 rounded-b-xl">
           <ul className="space-y-2 mb-3">
            {task.subTasks.map((sub, index) => (
              <li 
                key={sub.id}
                draggable={!isCompleted}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnter={(e) => handleDragEnter(e, index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
                className={`group/sub flex items-center gap-3 text-sm p-2 rounded-md border border-transparent ${!isCompleted ? 'hover:bg-white hover:shadow-sm hover:border-slate-100 cursor-move' : ''}`}
              >
                {!isCompleted && (
                   <div className="text-slate-300 opacity-0 group-hover/sub:opacity-100 cursor-grab active:cursor-grabbing">
                     <GripVertical size={14} />
                   </div>
                )}

                <button 
                  onClick={() => handleToggleSubTask(sub.id)}
                  className={`flex-shrink-0 transition-colors ${sub.isCompleted ? 'text-green-500' : 'text-slate-300 hover:text-brand-500'}`}
                >
                  {sub.isCompleted ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                </button>
                <span className={`flex-1 transition-all select-none break-words ${sub.isCompleted ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                  {sub.content}
                </span>
                {sub.isCompleted && sub.completedAt && (
                    <span className="text-[10px] text-slate-400 font-mono mr-2">
                        {formatTime(sub.completedAt)}
                    </span>
                )}
                <button 
                    onClick={() => handleDeleteSubTask(sub.id)}
                    className="opacity-0 group-hover/sub:opacity-100 text-slate-300 hover:text-red-500 transition-opacity"
                >
                    <Trash2 size={14} />
                </button>
              </li>
            ))}
           </ul>

           {!isCompleted && (
             <form onSubmit={handleAddSubTask} className="flex gap-2 mt-4">
               <input 
                 type="text" 
                 value={newSubTaskInput}
                 onChange={(e) => setNewSubTaskInput(e.target.value)}
                 placeholder="添加每日打卡..."
                 className="flex-1 text-sm px-3 py-2 rounded-md border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none bg-white shadow-sm"
               />
               <button 
                 type="submit" 
                 disabled={!newSubTaskInput.trim()}
                 className="bg-white text-brand-600 border border-brand-200 hover:bg-brand-50 px-3 py-2 rounded-md disabled:opacity-50 transition-colors shadow-sm"
               >
                 <Plus size={18} />
               </button>
             </form>
           )}
        </div>
      )}
    </div>
  );
};
