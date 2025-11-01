'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Help_popup from '../../components/Help_popup';
import Link from 'next/link';
import LoginForm from '../../components/Login';
import SignUpForm from '../../components/Sign_Up';
import UserAccount from '../../components/User_Account';
import { signUp, signIn, onAuthChange } from '@/lib/authHelpers';
import { GuestStorageManager } from '@/utils/guestStorage';
import { auth } from '@/lib/firebase'; 

export default function Landing() {
  // State variables
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Mode State: 'default' | 'guest' | 'user'
  const [mode, setMode] = useState('default');  
  
  const router = useRouter(); // Next.js router for navigation

  // Form states
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Check auth state AND guest mode on mount
  useEffect(() => {
    // Immediate synchronous checks
    const currentAuthUser = auth.currentUser;
    const isGuest = GuestStorageManager.isGuest();
    
    console.log('Initial check:', { currentAuthUser, isGuest }); // Debug log
    
    // Set initial state immediately
    if (currentAuthUser) {
      setCurrentUser(currentAuthUser);
      setMode('user');
      setAuthLoading(false);
      console.log('Mode set to: user');
    } else if (isGuest) {
      setMode('guest');
      setAuthLoading(false);
      console.log('Mode set to: guest');
    } else {
      setMode('default');
      setAuthLoading(false);
      console.log('Mode set to: default');
    }

    // Listen for auth state changes
    const unsubscribe = onAuthChange((user) => {
      console.log('Auth changed:', user);
      setCurrentUser(user);
      
      if (user) {
        setMode('user');
      } else if (!GuestStorageManager.isGuest()) {
        setMode('default');
      }
    });

    return () => unsubscribe();
  }, []);

  // Handle Sign Up
  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      setIsLoading(false);
      return;
    }

    if (password.length < 12) {
      alert('Password must be at least 12 characters!');
      setIsLoading(false);
      return;
    }

    try {
      const result = await signUp(email, password, username);

      if (result.success) {
        alert('Account created successfully!');
        setMode('user');
      } else {
        alert(`Sign up failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Sign up error:', error);
      alert('An error occurred during sign up');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn(email, password);

      if (result.success) {
        alert('Login successful!');
        setMode('user');
      } else {
        alert(`Login failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Guest Login
  const handleGuestLogin = () => {
    try {
      // Initialize guest session
      const guestId = GuestStorageManager.initGuestSession();
      console.log('Guest session created:', guestId);

      // Switch to guest mode
      setMode('guest');

      // Show confirmation
      alert('Guest session started! Your progress will be deleted when you logout.');

      // Redirect to Profile Page in guest mode
      router.push('/Landing_Page?mode=guest');
    } catch (error) {
      console.error('Guest Login error:', error);
      alert('Failed to start guest session. Please try again.');
    }
  };

  // ✅ Handle Exit Guest Mode
  const handleExitGuest = () => {
    console.log('Exiting guest mode...');
    GuestStorageManager.clearAllData();
    setMode('default');
  };

  // Handle "Start Simulating Now" button click
  const handleStartSimulating = () => {
    if (mode === 'user') {
      // Regular user logged in
      router.push('/Profile_Page');
    } else if (mode === 'guest') {
      // Guest mode active
      router.push('/Profile_Page?mode=guest');
    } else {
      // Default mode - not logged in
      alert('Please log in or start a guest session to begin simulating.');
    }
  };

  return (
    <div className="flex bg-[#fefcf3]">
      {/* Left Section */}
      <div
        className="flex-1 flex flex-col items-center justify-center p-3"
        style={{
          backgroundImage: `
            linear-gradient(to right, #e5e7eb 1px, transparent 1px),
            linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      >
        <h1 className="text-5xl font-bold mb-4 text-gray-700 text-left pl-5.5">
          Strategise your parenthood{' '}
          <span className="text-[#f47068]">finances</span> with Game of Life
        </h1>

        <p className="text-2xl text-gray-700 text-left max-w-3xl">
          Simulate your child&apos;s future in Singapore, make strategic decisions,
          and secure your finances with our platform. Sign up for an account to
          save progress or play as a guest.
        </p>

        <div className="flex gap-4 mt-6">
          <button
            onClick={handleStartSimulating}
            className="px-6 py-4 bg-[#f47068] text-white rounded-lg hover:bg-[#e55d55] transition-colors cursor-pointer flex items-center"
          >
            Start simulating now →
          </button>

          <button
            onClick={() => setIsHelpOpen(true)}
            className="px-6 py-4 border border-[#8b93ff] text-[#8b93ff] rounded-lg hover:bg-[#8b93ff]/10 flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <span>How to use Game of Life?</span>
            <span className="text-3xl leading-none flex items-center">»</span>
          </button>

          {/* Help Popup */}
          <Help_popup isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
        </div>
        
        {/*------------------------------Comment this part out after testing -----------------------------*/}

        {/* Mode Indicator (Dev Only) */}
        <div className="mt-6 p-4 bg-white rounded-lg shadow-md border-2 border-gray-200">
          <p className="font-semibold text-gray-700 mb-2">Current Mode:</p>
          <div className="flex gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              mode === 'default' ? 'bg-gray-200 text-gray-700' : 'bg-gray-100 text-gray-400'
            }`}>
              {mode === 'default' ? '✅' : '⭕'} Default
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              mode === 'guest' ? 'bg-yellow-200 text-yellow-700' : 'bg-gray-100 text-gray-400'
            }`}>
              {mode === 'guest' ? '✅' : '⭕'} Guest
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              mode === 'user' ? 'bg-green-200 text-green-700' : 'bg-gray-100 text-gray-400'
            }`}>
              {mode === 'user' ? '✅' : '⭕'} User
            </span>
          </div>

          {/* UserId/ GuestId display*/}
          {mode === 'guest' ? ( 
            <p className="text-xs text-gray-600 mt-2">
              Guest ID: {GuestStorageManager.getGuestId()}
            </p>
              ) : mode === 'user' ? (
            <p className="text-xs text-gray-600 mt-2">
              User ID: {currentUser ? currentUser.uid : 'N/A'}
            </p>
          ) : null}

          {/* User Email Display */}
          {currentUser && (
            <p className="text-xs text-gray-600 mt-2">
              Email: {currentUser.email}
            </p>
          )}

          {/* Debug Info */}
          <p className="text-xs text-gray-500 mt-2">
            authLoading: {authLoading ? 'true' : 'false'}
          </p>
        </div>
        {/*------------------------------Comment this part out after testing -----------------------------*/}


      </div>

      {/* Right Section - Login/Signup/User Account */}
      <div className="w-1/3 flex flex-col items-center justify-center p-8 pt-5 max-h-screen overflow-y-auto">
        
        {authLoading ? (
          // Loading state
          <div className="bg-white px-8 pt-8 pb-6 rounded-3xl shadow-lg border border-black w-full max-w-sm flex items-center justify-center h-96">
            <div className="text-center">
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        ) : mode === 'default' ? (
          // DEFAULT MODE - Show Login/Signup
          <div className="bg-white px-8 pt-8 pb-6 rounded-3xl shadow-lg border border-black w-full max-w-sm">
            {!isSignUp ? (
              <LoginForm
                email={email}
                password={password}
                setEmail={setEmail}
                setPassword={setPassword}
                isLoading={isLoading}
                handleLogin={handleLogin}
                //handleGoogleLogin={handleGoogleLogin} - alr done in Login.js
                handleGuestLogin={handleGuestLogin}
                switchToSignUp={() => setIsSignUp(true)}
              />
            ) : (
              <SignUpForm
                username={username}
                email={email}
                password={password}
                confirmPassword={confirmPassword}
                setUsername={setUsername}
                setEmail={setEmail}
                setPassword={setPassword}
                setConfirmPassword={setConfirmPassword}
                isLoading={isLoading}
                handleSignUp={handleSignUp}
                switchToLogin={() => setIsSignUp(false)}
              />
            )}
          </div>
        ) : mode === 'guest' ? (
          // GUEST MODE - Show User Account with Guest Banner
          <UserAccount 
            user={null}
            isGuest={true}
            onExitGuest={handleExitGuest}
          />
        ) : mode === 'user' ? (
          // USER MODE - Show User Account
          <UserAccount 
            user={currentUser}
            isGuest={false}
            onLogout={() => setMode('default')}
          />
        ) : null}
      </div>
    </div>
  );
}
