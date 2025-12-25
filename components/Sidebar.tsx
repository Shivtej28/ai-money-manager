
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { NAV_ITEMS } from '../constants';
import { removeAuthToken } from '../lib/api';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    removeAuthToken();
    // Force a reload or navigation to trigger App.tsx state change
    window.location.reload(); 
  };

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 h-screen sticky top-0 flex flex-col">
      <div className="p-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">
          Z
        </div>
        <h1 className="text-xl font-bold tracking-tight text-white">ZenMoney</h1>
      </div>

      <nav className="flex-1 px-4 py-2 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-xl transition-all
              ${isActive 
                ? 'bg-teal-500/10 text-teal-500 font-semibold border border-teal-500/20' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }
            `}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
