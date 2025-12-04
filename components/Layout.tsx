import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-green-500 to-emerald-700 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm">
              M
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              Math Mentor
            </h1>
          </div>
          <div className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
            AI педагог
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col max-w-3xl w-full mx-auto p-4 md:p-6">
        {children}
      </main>

      <footer className="text-center py-4 text-xs text-gray-400">
        Powered by Gemini 2.0 Flash & Pro
      </footer>
    </div>
  );
};

export default Layout;
