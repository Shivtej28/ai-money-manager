import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import { api } from '../lib/api';
import { Category } from '../types';
import { Plus, Search, Edit2, Trash2, Loader2, AlertCircle } from 'lucide-react';

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'expense' | 'income' | 'transfer'>('expense');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🏷️');
  const [colour, setColour] = useState('#14b8a6');

  const fetchCategories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.get<Category[]>('/categories');
      setCategories(data || []);
    } catch (err: any) {
      setError('Connection failed. Backend might be offline.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = categories.filter(
    (cat) => cat.type === activeTab && cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenModal = (cat?: Category) => {
    if (cat) {
      setEditingCategory(cat);
      setName(cat.name);
      setIcon(cat.icon);
      setColour(cat.colour);
    } else {
      setEditingCategory(null);
      setName('');
      setIcon('🏷️');
      setColour('#14b8a6');
    }
    setIsCategoryModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const payload = {
      name,
      type: activeTab,
      is_parent: true,
      colour,
      icon,
      is_default: false
    };
    try {
      if (editingCategory && editingCategory.id) {
        // Update category
        await api.put(`/categories/${editingCategory.id}`, payload);
      } else {
        // Create category
        await api.post('/categories/add', payload);
      }
      setIsCategoryModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      setError(err.message || (editingCategory ? 'Category update failed' : 'Category addition failed'));
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm(`Delete category #${id}?`)) {
      try {
        // DELETE /categories/{id}
        await api.delete(`/categories/${id}`);
        fetchCategories();
      } catch (err: any) {
        setError(err.message || 'API Delete Failed');
      }
    }
  };

  return (
    <Layout title="Expense Labels">
      {error && (
        <div className="mb-6 bg-rose-500/10 border border-rose-500/20 text-rose-500 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div className="flex bg-slate-800 p-1 rounded-xl w-full md:w-auto border border-slate-700">
          {(['expense', 'income', 'transfer'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${
                activeTab === tab ? 'bg-teal-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Filter list..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <Button onClick={() => handleOpenModal()} className="gap-2">
            <Plus size={18} />
            Add Label
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-teal-500" size={40} /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCategories.map((cat) => (
            <Card key={cat.id || cat.name} className="hover:border-slate-600 transition-colors group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-white/10"
                    style={{ backgroundColor: `${cat.colour}20`, borderColor: `${cat.colour}40` }}
                  >
                    {cat.icon}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white group-hover:text-teal-400 transition-colors">{cat.name}</h4>
                    <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Category #{cat.id}</p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleOpenModal(cat)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => cat.id && handleDelete(cat.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              {/* Subcategories UI */}
              {cat.sub_categories && cat.sub_categories.length > 0 && (
                <div className="mt-4 ml-8 border-l-2 border-slate-700 pl-4">
                  <h5 className="text-slate-400 text-xs font-semibold mb-2">Subcategories</h5>
                  <ul className="space-y-2">
                    {cat.sub_categories.map((sub) => (
                      <li key={sub.id || sub.name} className="flex items-center gap-2">
                        <span className="text-lg">{sub.icon}</span>
                        <span className="text-white font-medium">{sub.name}</span>
                        <span className="text-xs text-slate-500">#{sub.id}</span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleOpenModal(sub)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => sub.id && handleDelete(sub.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} title={editingCategory ? 'Edit Label' : 'New Label'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Label Display Name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Subscriptions" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Icon/Emoji" value={icon} onChange={(e) => setIcon(e.target.value)} required placeholder="e.g. 🍿" />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-400">Theme Colour</label>
              <input type="color" value={colour} onChange={(e) => setColour(e.target.value)} className="w-full h-10 bg-slate-800 border border-slate-700 rounded-lg p-1 cursor-pointer" />
            </div>
          </div>
          <div className="pt-6">
            <Button type="submit" className="w-full h-11 text-lg">Save Category</Button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};

export default Categories;