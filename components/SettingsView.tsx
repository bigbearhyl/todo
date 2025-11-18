import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { AISettings } from '../types';
import { Save, Key, Globe, Cpu, RotateCcw } from 'lucide-react';

const DEFAULT_MODEL = 'gemini-2.5-flash';

export const SettingsView: React.FC = () => {
  const [settings, setSettings] = useState<AISettings>({
    apiKey: '',
    baseUrl: '',
    modelName: DEFAULT_MODEL
  });
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('smartplan_ai_settings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  const handleChange = (key: keyof AISettings, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('smartplan_ai_settings', JSON.stringify(settings));
    
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const handleReset = () => {
    if(window.confirm('确定要重置所有设置吗？')) {
      const defaultSettings = {
        apiKey: '',
        baseUrl: '',
        modelName: DEFAULT_MODEL
      };
      setSettings(defaultSettings);
      localStorage.setItem('smartplan_ai_settings', JSON.stringify(defaultSettings));
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">系统设置</h1>
        <p className="text-slate-500 text-sm mt-1">配置 AI 助手连接参数</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Cpu size={20} className="text-slate-500" />
            AI 模型配置
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            设置用于生成任务建议的 Gemini API 参数。
          </p>
        </div>

        <form onSubmit={handleSave} className="p-6 md:p-8 space-y-6">
          
          {/* API Key */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Key size={16} className="text-slate-400" />
              API 密钥 (API Key)
            </label>
            <input 
              type="password" 
              value={settings.apiKey}
              onChange={(e) => handleChange('apiKey', e.target.value)}
              placeholder="例如：AIzaSy..."
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all font-mono text-sm"
            />
            <p className="text-xs text-slate-400">
              您的密钥仅存储在本地浏览器中，不会发送到任何中间服务器。
            </p>
          </div>

          {/* Base URL */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Globe size={16} className="text-slate-400" />
              代理地址 (Base URL) <span className="text-slate-400 font-normal text-xs">(可选)</span>
            </label>
            <input 
              type="text" 
              value={settings.baseUrl}
              onChange={(e) => handleChange('baseUrl', e.target.value)}
              placeholder="例如：https://generativelanguage.googleapis.com"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all font-mono text-sm"
            />
            <p className="text-xs text-slate-400">
              如果您使用 API 代理服务，请在此输入完整的 Base URL。留空则使用 Google 官方默认地址。
            </p>
          </div>

          {/* Model Name */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Cpu size={16} className="text-slate-400" />
              模型名称 (Model Name)
            </label>
            <input 
              type="text" 
              value={settings.modelName}
              onChange={(e) => handleChange('modelName', e.target.value)}
              placeholder="gemini-2.5-flash"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all font-mono text-sm"
            />
            <p className="text-xs text-slate-400">
              指定使用的 Gemini 模型版本。默认推荐：gemini-2.5-flash
            </p>
          </div>

          {/* Actions */}
          <div className="pt-6 flex items-center justify-between border-t border-slate-100 mt-8">
             <button 
              type="button"
              onClick={handleReset}
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-600 transition-colors px-2 py-1"
            >
              <RotateCcw size={14} />
              重置默认
            </button>

            <div className="flex items-center gap-4">
               {showSuccess && (
                 <span className="text-sm text-green-600 font-medium animate-fadeIn flex items-center gap-1">
                    ✓ 已保存
                 </span>
               )}
               <Button type="submit" className="bg-slate-900 hover:bg-slate-800 min-w-[100px]" icon={<Save size={16} />}>
                 保存配置
               </Button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
