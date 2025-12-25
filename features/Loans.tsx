import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import { api } from '../lib/api';
import { Loan } from '../types';
import { Wallet, ArrowUpRight, Edit2, Trash2, Plus, Loader2 } from 'lucide-react';

const Loans: React.FC = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [emi, setEmi] = useState('');
  const [balance, setBalance] = useState('');
  const [rate, setRate] = useState('');
  const [totalMonths, setTotalMonths] = useState('');
  const [paidMonths, setPaidMonths] = useState('');

  const fetchLoans = async () => {
    setIsLoading(true);
    try {
      const data = await api.get<Loan[]>('/loan');
      setLoans(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const totalDebt = loans.reduce((acc, loan) => acc + loan.remainingBalance, 0);
  const totalEmi = loans.reduce((acc, loan) => acc + loan.emi, 0);

  const handleOpenModal = (loan?: Loan) => {
    if (loan) {
      setEditingLoan(loan);
      setName(loan.name);
      setEmi(loan.emi.toString());
      setBalance(loan.remainingBalance.toString());
      setRate(loan.interestRate.toString());
      setTotalMonths(loan.totalDurationMonths.toString());
      setPaidMonths(loan.paidMonths.toString());
    } else {
      setEditingLoan(null);
      setName('');
      setEmi('0');
      setBalance('0');
      setRate('0');
      setTotalMonths('12');
      setPaidMonths('0');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name,
      emi: parseFloat(emi),
      remainingBalance: parseFloat(balance),
      interestRate: parseFloat(rate),
      totalDurationMonths: parseInt(totalMonths),
      paidMonths: parseInt(paidMonths)
    };

    try {
      if (editingLoan) {
        await api.put('/loan/update', { ...payload, id: editingLoan.id });
      } else {
        await api.post('/loan/add', payload);
      }
      setIsModalOpen(false);
      fetchLoans();
    } catch (err) {
      alert('Save failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this loan tracking?')) {
      try {
        await api.delete(`/loan/delete?loan_id=${id}`);
        fetchLoans();
      } catch (err) {
        alert('Delete failed');
      }
    }
  };

  return (
    <Layout title="Loans & Debt">
      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-teal-500" size={40} /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-white">Active Obligations</h3>
              <Button onClick={() => handleOpenModal()} size="sm" className="gap-2">
                <Plus size={16} /> Add Loan
              </Button>
            </div>
            {loans.map((loan) => {
              const progress = loan.totalDurationMonths > 0 ? (loan.paidMonths / loan.totalDurationMonths) * 100 : 0;
              return (
                <Card key={loan.id} className="group hover:border-teal-500/30 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500">
                        <Wallet size={24} />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white">{loan.name}</h4>
                        <p className="text-slate-400 text-sm">{loan.interestRate}% Interest Rate</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleOpenModal(loan)} className="p-2 text-slate-500 hover:text-white rounded-lg">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(loan.id)} className="p-2 text-slate-500 hover:text-rose-500 rounded-lg">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 mt-6">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400">Repayment Progress</span>
                      <span className="text-white font-medium">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="bg-teal-500 h-full rounded-full transition-all duration-1000"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>{loan.paidMonths} months paid</span>
                      <span>{Math.max(0, loan.totalDurationMonths - loan.paidMonths)} months left</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-800">
                    <div className="bg-slate-800/50 p-3 rounded-lg">
                      <p className="text-xs text-slate-500 mb-1">Monthly EMI</p>
                      <p className="text-white font-bold">${loan.emi.toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-800/50 p-3 rounded-lg">
                      <p className="text-xs text-slate-500 mb-1">Remaining</p>
                      <p className="text-white font-bold">${loan.remainingBalance.toLocaleString()}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-slate-900 to-teal-900/20">
              <h4 className="text-lg font-bold text-white mb-2">Liability Summary</h4>
              <div className="space-y-4">
                <div>
                  <p className="text-slate-400 text-sm">Total Debt</p>
                  <h5 className="text-2xl font-bold text-rose-400">${totalDebt.toLocaleString()}</h5>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Total Monthly EMI</p>
                  <h5 className="text-xl font-bold text-white">${totalEmi.toLocaleString()}</h5>
                </div>
              </div>
              <Button variant="secondary" className="w-full mt-6 gap-2">
                <ArrowUpRight size={18} />
                Debt Reduction Plan
              </Button>
            </Card>
          </div>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingLoan ? 'Edit Loan' : 'Add Loan'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Loan Name" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Home Mortgage" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="EMI" type="number" step="0.01" value={emi} onChange={e => setEmi(e.target.value)} required />
            <Input label="Balance" type="number" step="0.01" value={balance} onChange={e => setBalance(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Interest Rate (%)" type="number" step="0.1" value={rate} onChange={e => setRate(e.target.value)} required />
            <Input label="Duration (Months)" type="number" value={totalMonths} onChange={e => setTotalMonths(e.target.value)} required />
          </div>
          <Input label="Months Paid" type="number" value={paidMonths} onChange={e => setPaidMonths(e.target.value)} required />
          <div className="pt-4">
            <Button type="submit" className="w-full">{editingLoan ? 'Update Loan' : 'Add Loan'}</Button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};

export default Loans;