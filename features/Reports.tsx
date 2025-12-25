
import React from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, Download, ChevronDown } from 'lucide-react';

const DATA = [
  { month: 'Jan', income: 4500, expense: 3200, savings: 1300 },
  { month: 'Feb', monthNum: 1, income: 4200, expense: 2800, savings: 1400 },
  { month: 'Mar', income: 4800, expense: 4100, savings: 700 },
  { month: 'Apr', income: 4600, expense: 3000, savings: 1600 },
  { month: 'May', income: 5200, expense: 3100, savings: 2100 },
  { month: 'Jun', income: 4900, expense: 3500, savings: 1400 },
];

const Reports: React.FC = () => {
  return (
    <Layout title="Financial Reports">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white cursor-pointer hover:bg-slate-700 transition-colors">
            <Calendar size={18} />
            <span className="text-sm font-medium">Last 6 Months</span>
            <ChevronDown size={14} className="text-slate-500" />
          </div>
          <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white cursor-pointer hover:bg-slate-700 transition-colors">
            <span className="text-sm font-medium">All Accounts</span>
            <ChevronDown size={14} className="text-slate-500" />
          </div>
        </div>
        <Button variant="primary" className="gap-2">
          <Download size={18} />
          Download PDF Report
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <Card title="Income vs Expenses Trends">
          <div className="h-96 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                  cursor={{ fill: 'rgba(51, 65, 85, 0.4)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} name="Income" />
                <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card title="Monthly Avg Income">
            <h4 className="text-3xl font-bold text-white">$4,700</h4>
            <p className="text-emerald-500 text-sm font-medium mt-1">↑ 4.5% from previous period</p>
          </Card>
          <Card title="Monthly Avg Expense">
            <h4 className="text-3xl font-bold text-white">$3,283</h4>
            <p className="text-rose-500 text-sm font-medium mt-1">↓ 2.1% from previous period</p>
          </Card>
          <Card title="Savings Rate">
            <h4 className="text-3xl font-bold text-teal-500">30.2%</h4>
            <p className="text-slate-400 text-sm font-medium mt-1">Avg savings per month</p>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Reports;
