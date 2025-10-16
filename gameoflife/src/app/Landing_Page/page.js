'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Help_popup from '../../../components/Help_popup';
import Link from 'next/link';
import LoginForm from '../../../components/Login';
import SignUpForm from '../../../components/Sign_Up';
// import { signUp, signIn } from '@/lib/authHelpers';
// import { GuestStorageManager } from '@/utils/guestStorage';

export default function Landing() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Form states
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Handle Sign Up
  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      alert('Password must be at least 6 characters!');
      setIsLoading(false);
      return;
    }

    try {
      const result = await signUp(email, password, username);

      if (result.success) {
        alert('Account created successfully!');
        router.push('/Profile_Page');
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
        router.push('/Profile_Page');
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
    const guestId = GuestStorageManager.initGuestSession();
    console.log('Guest session created:', guestId);
    router.push('/Profile_Page?mode=guest');
  };

  return (
    <div className="flex bg-[#fefcf3] -mt-2">
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
          <Link
            href="/Profile_Page"
            className="px-6 pt-5 bg-[#f47068] text-white rounded-lg hover:bg-[#e55d55] transition-colors cursor-pointer"
          >
            Start simulating now →
          </Link>

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
      </div>

      {/* Right Section - Login/Signup */}
      <div className="w-1/3 flex flex-col items-center justify-center p-8 pt-10 max-h-screen overflow-y-auto">
        <div className="bg-white px-8 pt-8 pb-6 rounded-3xl shadow-lg border border-black w-full max-w-sm">
          {!isSignUp ? (
            <LoginForm
              email={email}
              password={password}
              setEmail={setEmail}
              setPassword={setPassword}
              isLoading={isLoading}
              handleLogin={handleLogin}
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
      </div>
    </div>
  );
}
