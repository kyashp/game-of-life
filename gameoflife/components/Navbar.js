"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import Help_popup from './Help_popup';

export default function Navbar() {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
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
              Login / Sign up
            </Link>
            <Link 
              href="/Profile_Page" 
              className="hover:text-black transition-colors duration-200 text-lg"
            >
              Profile
            </Link>
            <Link 
              href="/Life_Sim_Page" 
              className="hover:text-black transition-colors duration-200 text-lg"
            >
              Life Sim 
            </Link>
            <Link 
              href="/Insights_Page" 
              className="hover:text-black transition-colors duration-200 text-lg"
            >
              Insights
            </Link>
            <button 
              onClick={() => setIsHelpOpen(true)}
              className="hover:text-black transition-colors duration-200 text-lg"
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