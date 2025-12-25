
import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col bg-[#0f172a]">
        <Header title={title} />
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
