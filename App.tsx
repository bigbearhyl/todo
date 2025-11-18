import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, CreateTaskPayload, SubTask } from './types';
import { TaskCard } from './components/TaskCard';
import { NewTaskModal } from './components/NewTaskModal';
import { Button } from './components/Button';
import { CalendarView } from './components/CalendarView';
import { Layout, Plus, CheckSquare, BarChart2, Filter, Calendar as CalendarIcon } from 'lucide-react';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ACTIVE');
  const [view, setView] = useState<'LIST' | 'CALENDAR'>('LIST');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('smartplan_tasks');
    if (saved) {
      try {
        setTasks(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load tasks", e);
      }
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('smartplan_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleCreateTask = (payload: CreateTaskPayload, initialSubtasks: string[]) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      ...payload,
      status: TaskStatus.ACTIVE,
      createdAt: new Date().toISOString(),
      subTasks: initialSubtasks.map(content => ({
        id: crypto.randomUUID(),
        content,
        isCompleted: false
      }))
    };
    setTasks(prev => [newTask, ...prev]);
    setView('LIST'); // Switch back to list to see the new task
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
  };

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm('确定要删除这个计划吗？')) {
      setTasks(prev => prev.filter(t => t.id !== taskId));
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'ALL') return true;
    return t.status === filter;
  });

  const activeCount = tasks.filter(t => t.status === TaskStatus.ACTIVE).length;
  const completedCount = tasks.filter(t => t.status === TaskStatus.COMPLETED).length;

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row">
      
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-64 bg-white border-r border-slate-100 flex-shrink-0 lg:h-screen sticky top-0 z-30">
        <div className="p-6 border-b border-slate-50">
          <div className="flex items-center gap-3 text-slate-900">
            <div className="bg-slate-900 text-white p-1.5 rounded-lg">
              <Layout size={20} />
            </div>
            <span className="text-lg font-bold tracking-tight">SmartPlan</span>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          <div className="mb-4">
            <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">视图</p>
            <button 
              onClick={() => setView('LIST')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${view === 'LIST' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <BarChart2 size={18} />
              <span>计划列表</span>
            </button>
            <button 
              onClick={() => setView('CALENDAR')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${view === 'CALENDAR' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <CalendarIcon size={18} />
              <span>日历视图</span>
            </button>
          </div>

          {view === 'LIST' && (
            <div className="animate-fadeIn">
              <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-6">过滤器</p>
              <button 
                onClick={() => setFilter('ACTIVE')}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${filter === 'ACTIVE' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <span>进行中</span>
                <span className="bg-white px-2 py-0.5 rounded-full text-xs border border-slate-200">{activeCount}</span>
              </button>

              <button 
                onClick={() => setFilter('COMPLETED')}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${filter === 'COMPLETED' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <span>已完成</span>
                <span className="bg-white px-2 py-0.5 rounded-full text-xs border border-slate-200">{completedCount}</span>
              </button>

              <button 
                onClick={() => setFilter('ALL')}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${filter === 'ALL' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <span>全部计划</span>
                <span className="bg-white px-2 py-0.5 rounded-full text-xs border border-slate-200">{tasks.length}</span>
              </button>
            </div>
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8 overflow-y-auto h-screen bg-white">
        {view === 'LIST' ? (
          <>
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {filter === 'ACTIVE' ? '当前计划' : filter === 'COMPLETED' ? '历史计划' : '所有计划'}
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                  {new Date().toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              
              <Button onClick={() => setIsModalOpen(true)} icon={<Plus size={18} />} className="bg-slate-900 hover:bg-slate-800 text-white border-none">
                新建计划
              </Button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
              {filteredTasks.map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onUpdate={handleUpdateTask}
                  onDelete={handleDeleteTask}
                />
              ))}
              
              {filteredTasks.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-24 text-slate-400 border border-dashed border-slate-200 rounded-2xl bg-slate-50/30">
                  <div className="bg-white p-4 rounded-full shadow-sm border border-slate-100 mb-4">
                    <Layout size={32} className="text-slate-300" />
                  </div>
                  <p className="text-lg font-medium text-slate-600">暂无任务</p>
                  <p className="text-sm mb-6 text-slate-400">通过创建一个新计划来开始吧。</p>
                  <Button variant="secondary" onClick={() => setIsModalOpen(true)}>创建第一个任务</Button>
                </div>
              )}
            </div>
          </>
        ) : (
          <CalendarView tasks={tasks} />
        )}
      </main>

      <NewTaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onCreate={handleCreateTask} 
      />
    </div>
  );
};

export default App;