
import React, { useState } from 'react';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { api, setAuthToken } from '../lib/api';
import { TokenResponse } from '../types';
import { Loader2, AlertCircle, ShieldAlert } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.post<TokenResponse>('/user/login', { 
        email: email.trim(), 
        password: password 
      });
      
      if (response && response.access_token) {
        setAuthToken(response.access_token);
        onLogin();
      } else {
        throw new Error("Server did not return an access token.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setAuthToken('demo_token_zenmoney');
    onLogin();
  };

  const isNetworkError = error?.toLowerCase().includes('failed to fetch');

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0f172a] p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-teal-500 rounded-2xl flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4 shadow-xl shadow-teal-500/20">
            Z
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">ZenMoney</h1>
          <p className="text-slate-400 mt-2">Sign in to manage your finances</p>
        </div>

        <Card className="shadow-2xl border-slate-800">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="space-y-4">
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-4 rounded-xl text-sm flex items-start gap-3">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <span className="font-medium break-all">{error}</span>
                </div>
                
                {isNetworkError && (
                  <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl">
                    <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase mb-2">
                      <ShieldAlert size={14} />
                      <span>Connection Issue</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Your browser is blocking the request. Since your <strong>curl</strong> works, ensure your FastAPI app has <code>CORSMiddleware</code> enabled and that you've restarted the backend after making changes.
                    </p>
                    <button 
                      type="button"
                      onClick={handleDemoLogin}
                      className="text-teal-400 font-bold underline mt-3 block text-xs"
                    >
                      Bypass to Demo Mode
                    </button>
                  </div>
                )}
              </div>
            )}
            
            <Input 
              label="Email Address" 
              type="email" 
              placeholder="name@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
            
            <Input 
              label="Password" 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
            
            <Button 
              type="submit" 
              className="w-full h-12 text-lg shadow-lg shadow-teal-500/20" 
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Sign In'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
