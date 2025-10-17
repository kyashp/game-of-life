// helper component to hide or show navbar based on the page

'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function ConditionalNavbar() {
  const pathname = usePathname();
  
  // Hide navbar on these pages
  const hideNavbarPaths = ['/Landing_Page', '/'];
  const shouldHideNavbar = hideNavbarPaths.includes(pathname);

  if (shouldHideNavbar) {
    return null;
  }

  return <Navbar />;
}






