import React, { useState, useEffect } from 'react';
import { CreateTaskPayload } from '../types';
import { Button } from './Button';
import { X, Sparkles, Plus, Trash2, Calendar as CalendarIcon, AlignLeft, CheckSquare } from 'lucide-react';
import { generateSuggestedSubtasks } from '../services/geminiService';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (task: CreateTaskPayload, initialSubtasks: string[]) => void;
}

export const NewTaskModal: React.FC<NewTaskModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  
  // Subtask Management
  const [manualSubtask, setManualSubtask] = useState('');
  const [finalSubtasks, setFinalSubtasks] = useState<string[]>([]);
  
  // AI State
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestedSubtasks, setSuggestedSubtasks] = useState<string[]>([]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGenerateAI = async () => {
    if (!title) return;
    setIsGenerating(true);
    const suggestions = await generateSuggestedSubtasks(title, description);
    setSuggestedSubtasks(suggestions);
    setIsGenerating(false);
  };

  const addSubtask = (content: string) => {
    if (!content.trim()) return;
    if (!finalSubtasks.includes(content)) {
      setFinalSubtasks([...finalSubtasks, content]);
    }
    setManualSubtask('');
    // Remove from suggestions if picked
    setSuggestedSubtasks(prev => prev.filter(s => s !== content));
  };

  const removeSubtask = (index: number) => {
    setFinalSubtasks(finalSubtasks.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(
      { title, description, startDate, endDate },
      finalSubtasks
    );
    // Reset
    setTitle('');
    setDescription('');
    setSuggestedSubtasks([]);
    setFinalSubtasks([]);
    setManualSubtask('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Modal Positioning Wrapper - Allows page scrolling */}
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-6 lg:p-8">
        
        {/* Modal Card */}
        <div className="relative transform bg-white text-left shadow-2xl transition-all rounded-2xl sm:w-full sm:max-w-5xl border border-slate-100 flex flex-col overflow-hidden">
          
          <div className="absolute right-4 top-4 z-10">
             <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-50 p-2 rounded-full transition-colors">
                <X size={24} />
             </button>
          </div>

          <form id="create-task-form" onSubmit={handleSubmit} className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-100">
            
            {/* LEFT COLUMN: Basic Info */}
            <div className="flex-1 p-8 md:p-10 space-y-8">
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <div className="w-1 h-6 bg-slate-900 rounded-full"></div>
                  基本信息
                </h2>
                
                <div className="space-y-6">
                  {/* Title Input - Large & Clean */}
                  <div className="group">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">计划标题</label>
                    <input 
                      required
                      type="text" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="输入计划名称..."
                      className="w-full text-2xl font-semibold text-slate-800 placeholder:text-slate-300 border-b-2 border-slate-100 focus:border-slate-900 outline-none py-2 transition-colors bg-transparent"
                    />
                  </div>

                  {/* Date Range */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <CalendarIcon size={14} /> 开始日期
                      </label>
                      <input 
                        required
                        type="date" 
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full p-3 bg-slate-50 rounded-lg border border-slate-200 focus:border-slate-900 focus:ring-0 outline-none text-sm font-medium text-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <CalendarIcon size={14} /> 目标日期
                      </label>
                      <input 
                        required
                        type="date" 
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full p-3 bg-slate-50 rounded-lg border border-slate-200 focus:border-slate-900 focus:ring-0 outline-none text-sm font-medium text-slate-700"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <AlignLeft size={14} /> 详细描述
                    </label>
                    <textarea 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="描述这个计划的具体目标..."
                      rows={5}
                      className="w-full p-4 bg-slate-50 rounded-lg border border-slate-200 focus:border-slate-900 focus:ring-0 outline-none text-slate-700 resize-none placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Subtasks */}
            <div className="flex-1 p-8 md:p-10 bg-white md:bg-slate-50/30 flex flex-col">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <CheckSquare className="text-slate-900" size={24} />
                每日打卡清单
              </h2>

              {/* Input Area */}
              <div className="flex gap-2 mb-6">
                <input 
                  type="text"
                  value={manualSubtask}
                  onChange={(e) => setManualSubtask(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSubtask(manualSubtask))}
                  placeholder="例如：背诵 20 个单词"
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 shadow-sm focus:border-slate-900 focus:ring-0 outline-none bg-white"
                />
                <button 
                  type="button"
                  onClick={() => addSubtask(manualSubtask)}
                  disabled={!manualSubtask.trim()}
                  className="px-4 bg-slate-900 text-white rounded-xl hover:bg-slate-800 disabled:opacity-50 shadow-lg shadow-slate-200 transition-all"
                >
                  <Plus size={20} />
                </button>
              </div>

              {/* Task List */}
              <div className="flex-1 space-y-2 mb-8 min-h-[100px]">
                {finalSubtasks.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 py-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                    <span className="text-sm">添加一些每日重复的任务</span>
                  </div>
                ) : (
                  finalSubtasks.map((task, idx) => (
                    <div key={idx} className="group flex items-center justify-between bg-white p-3 pl-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all animate-fadeIn">
                      <span className="text-slate-700 font-medium">{task}</span>
                      <button 
                        type="button"
                        onClick={() => removeSubtask(idx)} 
                        className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* AI Suggestions */}
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2 text-indigo-600 font-semibold">
                    <Sparkles size={18} />
                    <span>AI 智能建议</span>
                  </div>
                  <Button 
                    type="button"
                    size="sm" 
                    variant="ghost"
                    onClick={handleGenerateAI}
                    disabled={!title || isGenerating}
                    isLoading={isGenerating}
                    className="text-xs hover:bg-indigo-50 hover:text-indigo-700 text-slate-400"
                  >
                    {suggestedSubtasks.length > 0 ? '换一批' : '生成建议'}
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {suggestedSubtasks.length > 0 ? (
                    suggestedSubtasks.map((s, idx) => (
                      <button 
                        key={idx}
                        type="button"
                        onClick={() => addSubtask(s)}
                        className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1.5 rounded-full text-xs font-medium hover:bg-indigo-100 hover:scale-105 transition-all"
                      >
                        <Plus size={12} />
                        {s}
                      </button>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 w-full text-center py-2">
                      {isGenerating ? "正在分析您的目标..." : "输入标题后，让 AI 帮您拆解任务"}
                    </p>
                  )}
                </div>
              </div>

            </div>
          </form>

          {/* Footer Actions */}
          <div className="bg-white p-6 border-t border-slate-100 flex justify-end gap-4">
            <Button variant="secondary" onClick={onClose} size="lg" className="border-slate-200">取消</Button>
            <Button type="submit" form="create-task-form" size="lg" className="bg-slate-900 hover:bg-slate-800 min-w-[120px]">
              创建计划
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
};
