
import React from 'react';
import { Bell, Search } from 'lucide-react';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <header className="h-20 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
      <h2 className="text-2xl font-bold text-white">{title}</h2>
      
      <div className="flex items-center gap-6">
        <div className="relative group hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-teal-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search transactions..." 
            className="bg-slate-800 border border-slate-700 rounded-full pl-10 pr-4 py-2 text-sm text-white w-64 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all"
          />
        </div>

        <button className="relative text-slate-400 hover:text-white transition-colors">
          <Bell size={22} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full border-2 border-slate-900"></span>
        </button>

        <div className="flex items-center gap-3 pl-6 border-l border-slate-800">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-white leading-tight">Alex Johnson</p>
            <p className="text-xs text-slate-500">Pro Account</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-700 border-2 border-slate-800 flex items-center justify-center overflow-hidden">
            <img src="https://picsum.photos/id/64/100/100" alt="Profile" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
