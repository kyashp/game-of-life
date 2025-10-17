// User Account component to display user info and logout button
'use client';

import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { getUser } from '@/lib/firestoreHelpers';
import { logout } from '@/lib/authHelpers';
import { useRouter } from 'next/navigation';
import { LogOut, User, Mail, Hash } from 'lucide-react';

export default function UserAccount({ user }) {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const result = await getUser(user.uid);
        if (result.success) {
          setUserData(result.data);
        }
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      router.push('/Landing_Page');
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white shadow-lg border-2 border-gray-200 rounded-3xl p-8 max-w-sm w-full mx-auto">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin text-5xl">⏳</div>
        </div>
      </div>
    );
  }

  const initial = userData?.username?.charAt(0).toUpperCase() || 
                  user.displayName?.charAt(0).toUpperCase() || 
                  user.email?.charAt(0).toUpperCase() || 
                  'U';

  return (
    <div className="bg-white shadow-lg border-2 border-gray-200 rounded-3xl p-8 max-w-sm w-full mx-auto">
      
      {/* Header */}
      <h2 className="text-3xl font-bold text-center text-slate-800 mb-7">
        Welcome Back!
      </h2>
      
      {/* Avatar */}
      <div className="w-32 h-32 mx-auto mb-5 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center border-4 border-white shadow-xl">
        <span className="text-5xl font-bold text-white">{initial}</span>
      </div>

      {/* Username */}
      <p className="text-2xl font-bold text-center text-slate-800 mb-6">
        {userData?.username || user.displayName || 'User'}
      </p>

      {/* User Info Cards */}
      <div className="space-y-3 mb-6">
        
        {/* Email */}
        <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3 border border-gray-200">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Mail className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 font-medium">Email</p>
            <p className="text-sm text-gray-800 truncate">{user.email}</p>
          </div>
        </div>

       
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 mb-6 flex ">
        <button
          onClick={() => router.push('/Profile_Page')}
          className="flex-1 bg-blue-500 text-white font-semibold rounded-xl px-6 py-3 hover:bg-blue-600 shadow-md transition-all duration-200 hover:shadow-lg"
        >
          Go to Profile
        </button>

        <button
          onClick={() => router.push('/Life_Sim_Page')}
          className="flex-1 bg-green-500 text-white font-semibold rounded-xl px-6 py-3 hover:bg-green-600 shadow-md transition-all duration-200 hover:shadow-lg"
        >
          Start Simulation
        </button>
      </div>

      


      {/* Log Out Button */}
      <button 
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 bg-gray-500 text-white font-semibold rounded-xl px-6 py-3 hover:bg-gray-600 shadow-md transition-all duration-200 hover:shadow-lg"
      >
        <LogOut className="w-5 h-5" />
        Log Out
      </button>
    </div>
  );
}
