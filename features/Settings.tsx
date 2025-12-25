
import React from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { User, Bell, Shield, Globe, Moon } from 'lucide-react';

const Settings: React.FC = () => {
  return (
    <Layout title="Settings">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card title="Profile Information" subtitle="Update your personal details and public profile.">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <Input label="Full Name" defaultValue="Alex Johnson" />
            <Input label="Email Address" defaultValue="alex.j@example.com" />
            <div className="md:col-span-2">
              <Input label="Location" defaultValue="San Francisco, CA" />
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-slate-800 flex justify-end">
            <Button>Save Changes</Button>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="Notifications">
            <div className="space-y-4">
              {[
                { label: 'Email Alerts', description: 'Monthly summaries and report ready' },
                { label: 'Push Notifications', description: 'Large transaction warnings' },
                { label: 'Security Alerts', description: 'New login detected' }
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">{item.label}</p>
                    <p className="text-xs text-slate-500">{item.description}</p>
                  </div>
                  <div className="w-10 h-5 bg-teal-500 rounded-full relative cursor-pointer">
                    <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Security">
            <div className="space-y-4">
              <Button variant="secondary" className="w-full justify-start gap-3">
                <Shield size={18} />
                Change Password
              </Button>
              <Button variant="secondary" className="w-full justify-start gap-3">
                <Globe size={18} />
                Manage Active Sessions
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
