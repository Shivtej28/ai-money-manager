import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import { api } from '../lib/api';
import { Investment } from '../types';
import { TrendingUp, TrendingDown, Plus, Edit2, Trash2, Loader2 } from 'lucide-react';

const Investments: React.FC = () => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [invested, setInvested] = useState('');
  const [current, setCurrent] = useState('');

  const fetchInvestments = async () => {
    setIsLoading(true);
    try {
      const data = await api.get<Investment[]>('/investment');
      setInvestments(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestments();
  }, []);

  const portfolioValue = investments.reduce((acc, inv) => acc + inv.currentValue, 0);
  const totalInvested = investments.reduce((acc, inv) => acc + inv.investedAmount, 0);
  const realizedGain = portfolioValue - totalInvested;

  const handleOpenModal = (inv?: Investment) => {
    if (inv) {
      setEditingInvestment(inv);
      setName(inv.name);
      setInvested(inv.investedAmount.toString());
      setCurrent(inv.currentValue.toString());
    } else {
      setEditingInvestment(null);
      setName('');
      setInvested('0');
      setCurrent('0');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const invAmount = parseFloat(invested);
    const currAmount = parseFloat(current);
    const changePct = invAmount !== 0 ? ((currAmount - invAmount) / invAmount) * 100 : 0;

    const payload = {
      name,
      investedAmount: invAmount,
      currentValue: currAmount,
      changePercent: parseFloat(changePct.toFixed(2))
    };

    try {
      if (editingInvestment) {
        await api.put('/investment/update', { ...payload, id: editingInvestment.id });
      } else {
        await api.post('/investment/add', payload);
      }
      setIsModalOpen(false);
      fetchInvestments();
    } catch (err) {
      alert('Save failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this investment?')) {
      try {
        await api.delete(`/investment/delete?investment_id=${id}`);
        fetchInvestments();
      } catch (err) {
        alert('Delete failed');
      }
    }
  };

  return (
    <Layout title="Investments">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-xl font-semibold text-white">Portfolio Overview</h3>
          <p className="text-slate-400">Manage your stocks, crypto, and mutual funds</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="gap-2">
          <Plus size={18} />
          New Investment
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-teal-500" size={40} /></div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <p className="text-slate-400 text-sm">Portfolio Value</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h4 className="text-3xl font-bold text-white">${portfolioValue.toLocaleString()}</h4>
                <span className={`text-sm font-medium ${realizedGain >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {realizedGain >= 0 ? '↑' : '↓'} {totalInvested !== 0 ? Math.abs(((realizedGain/totalInvested)*100)).toFixed(1) : 0}%
                </span>
              </div>
            </Card>
            <Card>
              <p className="text-slate-400 text-sm">Total Invested</p>
              <h4 className="text-3xl font-bold text-white mt-1">${totalInvested.toLocaleString()}</h4>
            </Card>
            <Card>
              <p className="text-slate-400 text-sm">Total Gain/Loss</p>
              <h4 className={`text-3xl font-bold mt-1 ${realizedGain >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {realizedGain >= 0 ? '+' : '-'}${Math.abs(realizedGain).toLocaleString()}
              </h4>
            </Card>
          </div>

          <h3 className="text-lg font-semibold text-white mb-4">Your Assets</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {investments.map((inv) => (
              <Card key={inv.id} className="relative group hover:border-teal-500/50 transition-all">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="text-xl font-bold text-white">{inv.name}</h4>
                      <div className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded ${inv.changePercent >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                        {inv.changePercent >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {Math.abs(inv.changePercent)}%
                      </div>
                    </div>
                    <p className="text-slate-500 text-sm">Market Asset</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleOpenModal(inv)} className="p-2 text-slate-500 hover:text-white rounded-lg">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(inv.id)} className="p-2 text-slate-500 hover:text-rose-500 rounded-lg">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                  <div>
                    <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Invested</p>
                    <p className="text-white font-semibold text-lg">${inv.investedAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Current Value</p>
                    <p className="text-white font-semibold text-lg">${inv.currentValue.toLocaleString()}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingInvestment ? 'Edit Investment' : 'New Investment'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Asset Name" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Apple Stock" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Invested Amount" type="number" step="0.01" value={invested} onChange={e => setInvested(e.target.value)} required />
            <Input label="Current Value" type="number" step="0.01" value={current} onChange={e => setCurrent(e.target.value)} required />
          </div>
          <div className="pt-4">
            <Button type="submit" className="w-full">{editingInvestment ? 'Update Investment' : 'Add Investment'}</Button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};

export default Investments;