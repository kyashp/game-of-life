// User Account component to display user info and logout button
'use client';

import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { getUser } from '@/lib/firestoreHelpers';
import { logout } from '@/lib/authHelpers';
import { useRouter } from 'next/navigation';
import { LogOut, User, Mail, Hash, AlertTriangle } from 'lucide-react';
import { GuestStorageManager } from '@/utils/guestStorage';

export default function UserAccount({ user, isGuest = false, onExitGuest }) {
  // State for user data
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLogoutWarning, setShowLogoutWarning] = useState(false);
  const router = useRouter();

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      if (user && !isGuest) { // for registered users
        const result = await getUser(user.uid);
        if (result.success) {
          setUserData(result.data);
        }
        setIsLoading(false);
      } else if (isGuest) { // for guest users
        // Load guest data
        const guestId = GuestStorageManager.getGuestId();
        
        // Use guest ID as username
        setUserData({ 
          username: `Guest_${guestId?.slice(-6)}` || 'Guest User',
          guestId: guestId
        });

        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user, isGuest]);

  // Handle logout for both guest and registered users
  const handleLogout = async () => {
    if (isGuest) {
      // Guest logout - show warning first
      setShowLogoutWarning(true);
    } else {
      // Regular user logout
      const result = await logout();
      if (result.success) {
        router.push('/Landing_Page');
      }
    }
  };

  // Confirm guest logout and clear data
  const confirmGuestLogout = () => {
    console.log('Confirming guest logout...');
    // Delete all guest data
    GuestStorageManager.clearAllData();
    
    // Call the exit handler from parent
    if (onExitGuest) {
      onExitGuest();
    }
    
    // Redirect to landing page
    router.push('/Landing_Page');
  };

  // Cancel guest logout
  const cancelLogout = () => {
    setShowLogoutWarning(false);
  };

  // Loading state when fetching user data from either Firebase or localStorage
  if (isLoading) {
    return (
      <div className="bg-white shadow-lg border-2 border-gray-200 rounded-3xl max-w-sm w-full mx-auto">
        <div className="flex items-center justify-center py-20">
          <div className=" text-2xl">Loading...</div>
        </div>
      </div>
    );
  }

  // Determine initial for avatar
  const initial = isGuest ? 'G' : (
    userData?.username?.charAt(0).toUpperCase() || 
    user?.displayName?.charAt(0).toUpperCase() || 
    user?.email?.charAt(0).toUpperCase() || 
    'U'
  );

  return (
    <>
      <div className="bg-white shadow-lg border-2 border-gray-200 rounded-3xl p-5 max-w-sm w-full mx-auto">
        
        {/* Header */}
        <h2 className="text-3xl font-bold text-center text-slate-800 mb-7">
          {isGuest ? 'Guest Mode' : 'Welcome Back!'}
        </h2>
        
        {/* Avatar */}
        <div className={`w-32 h-32 mx-auto mb-5 rounded-full ${isGuest ? 'bg-gradient-to-br from-gray-400 to-gray-600' : 'bg-gradient-to-br from-emerald-400 to-blue-500'} flex items-center justify-center border-4 border-white shadow-xl`}>
          <span className="text-5xl font-bold text-white">{initial}</span>
        </div>

        {/* Username */}
        <p className="text-2xl font-bold text-center text-slate-800 mb-6">
          {isGuest ? (userData?.username || 'Guest User') : (userData?.username || user?.displayName || 'User')}
        </p>

        {/* Guest Warning Banner */}
        {isGuest && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-yellow-800">Guest Mode Active</p>
                <p className="text-xs text-yellow-700 mt-1">
                  Your data will be permanently deleted when you logout. Create an account to save your progress!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* User Info Cards - Only show for registered users */}
        {!isGuest && (
          <div className="space-y-3 mb-6">
            
            {/* Email */}
            <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3 border border-gray-200">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 font-medium">Email</p>
                <p className="text-sm text-gray-800 truncate">{user?.email}</p>
              </div>
            </div>
          </div>
        )}

      {/* Action Buttons */}
      <div className="mb-6 flex gap-2">
        
        <button
          onClick={() => router.push(isGuest ? '/Profile_Page?mode=guest' : '/Profile_Page')}
          className="flex-1 bg-blue-500 text-white font-semibold rounded-xl px-6 py-2 hover:bg-blue-600 shadow-md transition-all duration-200 hover:shadow-lg cursor-pointer"
        >
          Go to Profile
        </button>

        <button
          onClick={() => router.push(isGuest ? '/Life_Sim_Page?mode=guest' : '/Life_Sim_Page')}
          className="flex-1 bg-green-500 text-white font-semibold rounded-xl px-6 py-2 hover:bg-green-600 shadow-md transition-all duration-200 hover:shadow-lg cursor-pointer"
        >
          Start Simulation
        </button>
      </div>

      {/* Log Out Button */}
      <button 
        onClick={handleLogout}
        className={`w-full flex items-center justify-center gap-2 ${isGuest ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-500 hover:bg-gray-600'} text-white font-semibold rounded-xl px-6 py-3 shadow-md transition-all duration-200 hover:shadow-lg cursor-pointer`}
      >
        <LogOut className="w-5 h-5" />
        {isGuest ? 'Go to Login Page' : 'Log Out'}
      </button>
    </div>

    {/* Logout Warning pop up */}
    {showLogoutWarning && (
      <div className="fixed inset-0 bg-black bg-opacity-5 flex items-center justify-center z-50">
        <div className="bg-white rounded-3xl shadow-2xl border-2 border-red-500 p-8 max-w-md mx-4">
          
          {/* Warning Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-12 h-12 text-red-600" />
            </div>
          </div>

          {/* Warning Text */}
          <h3 className="text-2xl font-bold text-center text-red-600 mb-4">
            Warning: Data Will Be Lost!
          </h3>
          
          <p className="text-gray-700 text-center mb-6">
            You are currently in <strong>Guest Mode</strong>. If you logout now, <strong className="text-red-600">all your data will be permanently deleted</strong> and cannot be recovered.
          </p>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <p className="text-sm text-yellow-800">
             <strong>Tip:</strong> Create an account to save your progress permanently!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            

            <button
              onClick={confirmGuestLogout}
              className="w-full bg-red-500 text-white font-semibold rounded-xl px-6 py-3 hover:bg-red-600 transition-all"
            >
              Yes, Delete All Data and Logout
            </button>

            <button
              onClick={cancelLogout}
              className="w-full bg-gray-200 text-gray-700 font-semibold rounded-xl px-6 py-3 hover:bg-gray-300 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )}


  </>
  );
}
