import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import { api } from '../lib/api';
import { Bank, AccountType } from '../types';
import { Plus, Edit2, Trash2, Building2, Loader2, AlertCircle } from 'lucide-react';

const Banks: React.FC = () => {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBank, setEditingBank] = useState<Bank | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [type, setType] = useState<AccountType>('checking');

  const fetchBanks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.get<any>('/banks');
      // Defensive check: handle if API returns a list directly or wrapped in an object
      const banksList = Array.isArray(data) ? data : (data?.banks || data?.items || []);
      setBanks(banksList);
    } catch (err: any) {
      setError(`Connection Error: ${err.message}`);
      console.error(err);
      setBanks([]); // Reset to empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBanks();
  }, []);

  // Use Array.isArray check to prevent crash if state is somehow set to non-array
  const totalBalance = Array.isArray(banks) 
    ? banks.reduce((acc, bank) => acc + (bank.balance || 0), 0) 
    : 0;

  const handleOpenModal = (bank?: Bank) => {
    if (bank) {
      setEditingBank(bank);
      setName(bank.name);
      setBalance(bank.balance.toString());
      setType(bank.account_type);
    } else {
      setEditingBank(null);
      setName('');
      setBalance('0');
      setType('checking');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const payload = {
      name: name.trim(),
      account_type: type,
      balance: parseFloat(balance),
    };

    try {
      if (editingBank) {
        await api.put('/banks/update', { ...payload, id: editingBank.id });
      } else {
        await api.post('/banks/add', payload);
      }
      setIsModalOpen(false);
      await fetchBanks();
    } catch (err: any) {
      setError(`Operation Failed: ${err.message}`);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm(`Are you sure you want to delete bank account #${id}?`)) {
      try {
        await api.delete(`/banks/delete?bank_id=${id}`);
        await fetchBanks();
      } catch (err: any) {
        setError(`Delete Failed: ${err.message}`);
      }
    }
  };

  return (
    <Layout title="Linked Banks">
      {error && (
        <div className="mb-6 bg-rose-500/10 border border-rose-500/20 text-rose-500 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-xl font-semibold text-white">Your Bank Accounts</h3>
          <p className="text-slate-400">Manage balances across linked financial institutions</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="gap-2 shadow-lg shadow-teal-500/20">
          <Plus size={18} />
          Add Account
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="animate-spin text-teal-500" size={48} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-teal-500 to-teal-700 text-white border-none shadow-xl shadow-teal-500/10">
            <p className="text-teal-100 text-sm font-medium uppercase tracking-wider">Total Liquidity</p>
            <h3 className="text-3xl font-bold mt-2">${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
            <div className="mt-8 flex items-center gap-2 text-xs text-teal-100 bg-white/10 w-fit px-3 py-1 rounded-full border border-white/5">
              <Building2 size={14} />
              <span>{(Array.isArray(banks) ? banks.length : 0)} Connected Accounts</span>
            </div>
          </Card>

          {Array.isArray(banks) && banks.map((bank) => (
            <Card key={bank.id} className="relative group hover:border-teal-500/40 transition-all border-slate-800 bg-slate-900/40">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-2xl border border-slate-700">
                    {bank.account_type === 'savings' ? '💰' : '🏦'}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white group-hover:text-teal-400 transition-colors">{bank.name}</h4>
                    <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">{bank.account_type}</p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleOpenModal(bank)} className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(bank.id)} className="p-2 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="mt-2">
                <p className="text-xs font-bold text-slate-600 uppercase mb-1">Available Balance</p>
                <p className={`text-2xl font-bold ${bank.balance < 0 ? 'text-rose-400' : 'text-white'}`}>
                  ${(bank.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
            </Card>
          ))}
          {Array.isArray(banks) && banks.length === 0 && !isLoading && (
            <div className="col-span-full py-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl">
              No bank accounts connected yet.
            </div>
          )}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingBank ? 'Edit Bank Account' : 'Link New Bank Account'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Account Name" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            required 
            placeholder="e.g. Chase Checking" 
          />
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Current Balance" 
              type="number" 
              step="0.01" 
              value={balance} 
              onChange={e => setBalance(e.target.value)} 
              required 
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-400">Account Type</label>
              <select 
                className="bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-teal-500 h-[42px]" 
                value={type} 
                onChange={e => setType(e.target.value as any)}
              >
                <option value="checking">Checking</option>
                <option value="savings">Savings</option>
              </select>
            </div>
          </div>
          <div className="pt-6">
            <Button type="submit" className="w-full h-11 text-lg">
              {editingBank ? 'Save Changes' : 'Link Account'}
            </Button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};

export default Banks;