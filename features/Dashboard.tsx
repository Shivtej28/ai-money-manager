import React, { useState, useEffect, useMemo } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Briefcase, Loader2 } from 'lucide-react';
import { api } from '../lib/api';
import { Bank, Transaction } from '../types';

const SummaryCard = ({ title, value, change, icon: Icon, isLoading }: any) => (
  <Card className="flex-1 transform transition-transform hover:scale-[1.02]">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl bg-teal-500/10 text-teal-500`}>
        <Icon size={24} />
      </div>
      {change !== undefined && (
        <div className={`flex items-center gap-1 text-sm font-medium ${change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
          {change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {Math.abs(change)}%
        </div>
      )}
    </div>
    <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">{title}</p>
    {isLoading ? (
      <div className="h-9 w-24 bg-slate-800 animate-pulse rounded mt-1"></div>
    ) : (
      <h4 className="text-3xl font-bold text-white mt-1">${(value || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</h4>
    )}
  </Card>
);

const Dashboard: React.FC = () => {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [banksData, txData] = await Promise.all([
          api.get<any>('/banks'),
          api.get<any>('/transaction')
        ]);
        
        const bList = Array.isArray(banksData) ? banksData : (banksData?.banks || banksData?.items || []);
        const tList = Array.isArray(txData) ? txData : (txData?.transactions || txData?.items || []);
        
        setBanks(bList);
        setTransactions(tList);
      } catch (err) {
        console.error('Dashboard load failed', err);
        setBanks([]);
        setTransactions([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const totalBalance = useMemo(() => {
    if (!Array.isArray(banks)) return 0;
    return banks.reduce((sum, b) => sum + (b.balance || 0), 0);
  }, [banks]);
  
  const monthlyIncome = useMemo(() => {
    if (!Array.isArray(transactions)) return 0;
    const now = new Date();
    return transactions
      .filter(tx => tx.type === 'income' && new Date(tx.date).getMonth() === now.getMonth())
      .reduce((sum, tx) => sum + (tx.amount || 0), 0);
  }, [transactions]);

  const monthlyExpenses = useMemo(() => {
    if (!Array.isArray(transactions)) return 0;
    const now = new Date();
    return transactions
      .filter(tx => tx.type === 'expense' && new Date(tx.date).getMonth() === now.getMonth())
      .reduce((sum, tx) => sum + (tx.amount || 0), 0);
  }, [transactions]);

  // Mock data for charts if none exists
  const chartData = [
    { name: 'Jan', income: 4000, expense: 2400 },
    { name: 'Feb', income: 4200, expense: 2800 },
    { name: 'Mar', income: 4500, expense: 3200 },
    { name: 'Apr', income: 4800, expense: 3100 },
    { name: 'May', income: 5200, expense: 3400 },
    { name: 'Jun', income: 4900, expense: 3600 },
    { name: 'Jul', income: 5500, expense: 3800 },
  ];

  const pieData = [
    { name: 'Housing', value: 1500, color: '#0ea5e9' },
    { name: 'Food', value: 550, color: '#10b981' },
    { name: 'Transport', value: 300, color: '#f59e0b' },
    { name: 'Leisure', value: 450, color: '#8b5cf6' },
    { name: 'Saving', value: 1000, color: '#ec4899' },
  ];

  return (
    <Layout title="Dashboard">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-white">Overview</h3>
        <div className="text-sm text-slate-500">Live data from connected accounts</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <SummaryCard title="Net Worth" value={totalBalance} icon={DollarSign} isLoading={isLoading} />
        <SummaryCard title="Monthly Income" value={monthlyIncome} change={8.2} icon={TrendingUp} isLoading={isLoading} />
        <SummaryCard title="Monthly Expenses" value={monthlyExpenses} change={-2.4} icon={TrendingDown} isLoading={isLoading} />
        <SummaryCard title="Investments" value={18750} change={15.0} icon={Briefcase} isLoading={isLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Cashflow Trends" className="lg:col-span-2 min-h-[400px]">
          <div className="h-80 w-full mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" axisLine={false} tickLine={false} dy={10} fontSize={12} />
                <YAxis stroke="#64748b" axisLine={false} tickLine={false} fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#fff' }}
                />
                <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                <Area type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Top Categories" className="min-h-[400px]">
          <div className="h-64 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2.5">
              {pieData.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }}></span>
                    <span className="text-slate-400 font-medium">{cat.name}</span>
                  </div>
                  <span className="text-white font-bold">${cat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;