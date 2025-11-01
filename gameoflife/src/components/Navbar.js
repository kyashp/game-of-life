// component to render the navbar for each page
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import Help_popup from './Help_popup';
import { GuestStorageManager } from '@/utils/guestStorage';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function Navbar() {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if user is guest or logged in
  useEffect(() => {
    const guestMode = GuestStorageManager.isGuest();
    setIsGuest(guestMode);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });

    return () => unsubscribe();
  }, []);

  return (
    // <div className="top-0 left-0 right-0 z-50 p-4"> 
    <>

      {/* Small Navbar - Top Right */}
      <div className="absolute top-4 right-8 "> {/* right padding */}
        <nav className="bg-[#8b93ff] text-white shadow-lg rounded-full px-8 py-4"> {/* navbar div */}
          <div className="flex space-x-10"> {/* increased space between links */}
            <Link 
              href="/Landing_Page" 
              className="hover:text-black transition-colors duration-200 text-lg"
            >
              { isGuest ?  'Login / Sign up' : 'Account'}
            </Link>
            <Link 
              href={isGuest ? "/Profile_Page?mode=guest" : "/Profile_Page"}
              className="hover:text-black transition-colors duration-200 text-lg"
            >
              Profile
            </Link>
            <Link 
              href={isGuest ? "/Life_Sim_Page?mode=guest" : "/Life_Sim_Page"}
              className="hover:text-black transition-colors duration-200 text-lg"
            >
              Life Sim 
            </Link>
            <Link 
              href={isGuest ? "/Insights_Page?mode=guest" : "/Insights_Page"}
              className="hover:text-black transition-colors duration-200 text-lg"
            >
              Insights
            </Link>
            <button 
              onClick={() => setIsHelpOpen(true)}
              className="hover:text-black transition-colors duration-200 text-lg cursor-pointer"
            >
              Help
            </button>

          </div>
        </nav>
      </div>

      {/* Help Popup */}
      <Help_popup isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

    </>
    
  );
}