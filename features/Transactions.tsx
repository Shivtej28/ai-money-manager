import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { api } from '../lib/api';
import { Transaction, Bank, Category, User } from '../types';
import { Trash2, Plus, Edit2, Search, Loader2, AlertCircle } from 'lucide-react';
import { Console } from 'console';

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [categoryId, setCategoryId] = useState<string>('');
  const [bankId, setBankId] = useState<string>('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString());

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const results = await Promise.allSettled([
        api.get<any>('/transaction'),
        api.get<any>('/banks'),
        api.get<Category[]>('/categories'),
        api.get<User>('/user/me')
      ]);

      const txs = results[0].status === 'fulfilled' && Array.isArray(results[0].value?.transactions) ? results[0].value.transactions : [];
      const cats = results[2].status === 'fulfilled' && Array.isArray(results[2].value) ? results[2].value : [];
      const userData = results[3].status === 'fulfilled' ? results[3].value : null;
      const bks = results[1].status === 'fulfilled' && Array.isArray(results[1].value?.banks) ? results[1].value.banks : [];
      setTransactions(txs);
      setBanks(bks);
      setCategories(cats);
      setUser(userData);
      if (!categoryId && cats && cats.length > 0) setCategoryId(cats[0].id?.toString() || '');
      if (!bankId && bks && bks.length > 0) setBankId(bks[0].id.toString());
    } catch (err: any) {
      setError('Failed to fetch financial data.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("Hellllooooo")
    fetchData();
  }, []);

  useEffect(() => {
    console.log('Updated categories:', categories);
  }, [categories]);

  useEffect(() => {
    console.log('Updated banks:', banks);
  }, [banks]);

  const handleOpenModal = (tx?: Transaction) => {
    if (tx) {
      setEditingTx(tx);
      setAmount(tx.amount.toString());
      setType(tx.type as any);
      setCategoryId(tx.category_id.toString());
      setBankId(tx.bank_id.toString());
      setDescription(tx.description);
      setDate(tx.date);
    } else {
      setEditingTx(null);
      setAmount('');
      setType('expense');
      // Set defaults from loaded data
      setCategoryId(categories[0]?.id?.toString() || '');
      setBankId(banks[0]?.id.toString() || '');
      setDescription('');
      setDate(new Date().toISOString());
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return setError("User session not loaded.");

    // TransactionCreate / TransactionUpdate schemas
    const payload = {
      user_id: user.id || 1, // Mandatory
      category_id: parseInt(categoryId),
      amount: parseFloat(amount),
      type,
      date: new Date(date).toISOString(),
      description,
      bank_id: parseInt(bankId)
    };

    console.log('Submitting transaction:', payload, editingTx);

    try {
      if (editingTx) {
        // PUT /transaction/update
        await api.put('/transaction/update', { ...payload, id: editingTx.id });
      } else {
        // POST /transaction/add
        await api.post('/transaction/add', payload);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Transaction submission failed');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Permanently delete this transaction?')) {
      try {
        // DELETE /transaction/delete?transaction_id={id} (Query Param)
        await api.delete(`/transaction/delete?transaction_id=${id}`);
        fetchData();
      } catch (err: any) {
        setError(err.message || 'Delete failed');
      }
    }
  };

  const filteredTransactions = transactions.filter(tx => 
    tx.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  console.log(categories)

  return (
    <Layout title="Transactions">
      {error && (
        <div className="mb-6 bg-rose-500/10 border border-rose-500/20 text-rose-500 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Search transactions..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <Button onClick={() => handleOpenModal()} className="gap-2 w-full md:w-auto">
          <Plus size={18} /> Add New Entry
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-teal-500" size={40} /></div>
      ) : (
        <Card className="overflow-hidden border-slate-800 bg-slate-900/40 p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-800/50 text-slate-500 text-xs uppercase font-bold tracking-wider">
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Bank</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredTransactions.map((tx) => {
                  const bank = banks.find(b => b.id === tx.bank_id);
                  return (
                    <tr key={tx.id} className="hover:bg-slate-800/30 text-sm transition-colors group">
                      <td className="px-6 py-4 text-slate-400 whitespace-nowrap">
                        {new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-300">#{tx.category_id}</span>
                      </td>
                      <td className="px-6 py-4 text-white font-medium">{tx.description}</td>
                      <td className="px-6 py-4 text-slate-400 text-xs">{bank?.name || 'Unknown'}</td>
                      <td className={`px-6 py-4 font-bold ${tx.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleOpenModal(tx)} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDelete(tx.id)} className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-500/10">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500 italic">No transactions found matching your criteria.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingTx ? 'Edit Transaction' : 'New Transaction'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Amount ($)" type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required placeholder="0.00" />
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-400">Type</label>
              <select className="bg-slate-800 border border-slate-700 text-white p-2.5 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" value={type} onChange={e => setType(e.target.value as any)}>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-400">Account</label>
              <select className="bg-slate-800 border border-slate-700 text-white p-2.5 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" value={bankId} onChange={e => setBankId(e.target.value)}>
                {banks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-400">Category</label>
            <select className="bg-slate-800 border border-slate-700 text-white p-2.5 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" value={categoryId} onChange={e => setCategoryId(e.target.value)}>
              {categories && categories.length > 0 ? (
                categories
                  .filter(c => c.type === type && !c.parent_id)
                  .flatMap(c => [
                    <option key={c.id} value={c.id}>{c.name}</option>,
                    ...(Array.isArray(c.sub_categories) ? c.sub_categories.filter(sub => sub.type === type).map(sub => (
                      <option key={sub.id} value={sub.id}>&nbsp;&nbsp;↳ {sub.name}</option>
                    )) : [])
                  ])
              ) : (
                <option value="" disabled>No categories available</option>
              )}
            </select>
          </div>

          <Input label="Description" value={description} onChange={e => setDescription(e.target.value)} required placeholder="What was this for?" />
          <Input label="Date & Time" type="datetime-local" value={date.slice(0, 16)} onChange={e => setDate(e.target.value)} required />
          
          <div className="pt-4">
            <Button type="submit" className="w-full h-11 text-lg">
              {editingTx ? 'Update Entry' : 'Record Transaction'}
            </Button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};

export default Transactions;