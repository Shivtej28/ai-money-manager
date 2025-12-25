
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-sm font-medium text-slate-400">{label}</label>}
      <input
        className={`bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all placeholder:text-slate-500 ${className}`}
        {...props}
      />
    </div>
  );
};

export default Input;
