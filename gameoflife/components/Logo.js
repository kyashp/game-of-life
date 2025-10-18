// component to render the logo 

import Image from 'next/image';

export default function Logo() {
  return (
    <div className="top-0 left-0 right-0 z-50 p-4" style={{ display: 'flex', alignItems: 'center' }}>
      <Image src="/logo.png" alt="Game of Life Logo" width={50} height={50} style={{ filter: 'contrast(0.4)' }} />
      <div style={{ marginLeft: '10px' }}>
        <h1 style={{ fontWeight: '800', textTransform: 'uppercase', color: '#9BA4F5', margin: 0, fontSize: '24px' }}>
          GAME OF LIFE
        </h1>
        <p style={{ color: '#9BA4F5', margin: 0, fontSize: '14px' }}>
          Plan your family&apos;s financial future
        </p>
      </div>
    </div>
  );
}