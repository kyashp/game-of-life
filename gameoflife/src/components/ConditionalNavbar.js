// helper component to hide or show navbar based on the page

'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Logo from './Logo';

export default function ConditionalNavbar() {
  const pathname = usePathname();
  
  // Hide navbar on these pages
  const hideNavbarPaths = ['/Landing_Page', '/'];
  const shouldHideNavbar = hideNavbarPaths.includes(pathname);

  if (shouldHideNavbar) {
    return(
    <div className="flex justify-center border-b-2 border-b-[#e5e7eb]">
      <Logo/>
    </div>);
  }

  return (
    <>
      <Logo/>
      <Navbar />
    </>);
}






