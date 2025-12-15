
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Activity, Users, Globe, Database } from 'lucide-react';

const activityData = [
  { name: 'Mon', calls: 4000 },
  { name: 'Tue', calls: 3000 },
  { name: 'Wed', calls: 2000 },
  { name: 'Thu', calls: 2780 },
  { name: 'Fri', calls: 1890 },
  { name: 'Sat', calls: 2390 },
  { name: 'Sun', calls: 3490 },
];

const StatCard = ({ title, value, change, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
      </div>
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
    </div>
    <div className="mt-4 flex items-center text-sm">
      <span className={change.startsWith('+') ? 'text-emerald-600' : 'text-red-600'}>
        {change}
      </span>
      <span className="text-slate-400 ml-2">vs last week</span>
    </div>
  </div>
);

export const Dashboard: React.FC = () => {
  return (
  <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">仪表盘概览</h1>
          <p className="text-slate-500">欢迎使用 ZFGA AI 控制台。</p>
        </div>
        <div className="flex gap-2">
           <button disabled className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-400 cursor-not-allowed">
             导出数据
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="API总调用" 
          value="--" 
          change="+0%" 
          icon={Activity} 
          color="bg-indigo-500" 
        />
        <StatCard 
          title="活跃用户" 
          value="--" 
          change="+0%" 
          icon={Users} 
          color="bg-emerald-500" 
        />
        <StatCard 
          title="平均延迟" 
          value="--" 
          change="0%" 
          icon={Globe} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="数据库状态" 
          value="在线" 
          change="活跃" 
          icon={Database} 
          color="bg-amber-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">API使用趋势</h3>
          <div className="h-72 flex items-center justify-center bg-slate-50 rounded-lg border border-dashed border-slate-300">
             <p className="text-slate-400 text-sm">后端暂未提供分析数据。</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">系统健康</h3>
          <div className="mt-8 p-4 bg-slate-50 rounded-lg border border-slate-100">
            <h4 className="text-sm font-semibold text-slate-800 mb-2">后端连接</h4>
            <div className="flex items-center gap-2 text-sm text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              API v1（运行正常）
            </div>
            <p className="text-xs text-slate-500 mt-2">经由 http://localhost:8000 连接</p>
          </div>
        </div>
      </div>
    </div>
  );
};
