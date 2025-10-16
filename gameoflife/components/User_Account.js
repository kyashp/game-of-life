
'use client';

import { LogOut } from 'lucide-react';

export default function UserAccount({ user, onLogout }) {
  const initial = user?.username?.charAt(0).toUpperCase() || 'B';

  return (
    <div className="bg-white shadow-lg border-2 border-gray-200 rounded-3xl p-8 max-w-sm w-full mx-auto mr-16">
      <h2 className="text-3xl font-bold text-center text-slate-800 mb-7">Welcome Back !</h2>
      
      {/* Avatar */}
      <div className="w-36 h-36 mx-auto mb-5 rounded-full bg-gradient-to-br from-emerald-300 to-blue-300 flex items-center justify-center border-4 border-white shadow-lg">
        <span className="text-6xl font-bold text-white">{initial}</span>
      </div>

      {/* Username */}
      <p className="text-2xl font-bold text-center text-slate-800 mb-6">{user?.username || 'Bob123'}</p>

      {/* Log Out Button */}
      <button 
        onClick={onLogout}
        className="w-full flex items-center justify-center gap-2 bg-gray-400 text-white font-medium rounded-lg px-6 py-3 hover:bg-gray-500 shadow-md transition-colors duration-200"
      >
        <LogOut className="w-5 h-5" />
        Log Out
      </button>
    </div>
  );
}
