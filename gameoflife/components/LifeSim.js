'use client';
import { useState } from 'react';
import Image from 'next/image';

const Card = ({ children, style }) => (
  <div style={{
    background: 'white',
    borderRadius: '25px',
    border: '1px solid #2D3142',
    padding: '10px',
    position: 'relative',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    ...style,
  }}>
    {children}
  </div>
);

const Icon = ({ src, alt }) => (
  <Image
    src={src}
    alt={alt}
    width={40}
    height={40}
    style={{ position: 'absolute', top: '0px', right: '0px' }}
  />
);

const Title = ({ children }) => (
  <h3 style={{
    color: '#2D3142',
    fontWeight: 'bold',
    fontSize: '20px',
    margin: 0,
    textAlign: 'center',
  }}>
    {children}
  </h3>
);

const Amount = ({ children, color }) => (
  <p style={{
    color: color || '#2D3142',
    fontWeight: 'bold',
    fontSize: '25px',
    margin: 0,
    textAlign: 'center',
  }}>
    {children}
  </p>
);

const ControlButton = ({ children, style, icon, onClick }) => (
    <button onClick={onClick} style={{
      borderRadius: '15px',
      width: '100px',
      height: '60px',
      border: 'none',
      color: 'white',
      textAlign: 'center',
      cursor: 'pointer',
      ...style,
    }}>
      <div style={{ fontSize: '28px' }}>{icon}</div>
      <div style={{ fontSize: '12px', marginTop: '2px' }}>{children}</div>
    </button>
);


export default function LifeSim() {
  const [status, setStatus] = useState('stopped'); // 'stopped', 'running', 'paused'
  const [speed, setSpeed] = useState(1);

  const handleStart = () => {
    setStatus('running');
    console.log('Simulation Started');
  };

  const handlePause = () => {
    setStatus('paused');
    console.log('Simulation Paused');
  };

  const handleEnd = () => {
    setStatus('stopped');
    console.log('Simulation Ended');
  };

  const handleSpeedChange = (e) => {
    setSpeed(e.target.value);
  };

  return (
    <div style={{
      backgroundColor: '#F4C4C4',
      borderRadius: '40px',
      border: '2px solid #2D3142',
      margin: '100px auto',
      width: '85%',
      maxWidth: '800px',
      padding: '30px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    }}>
      <h1 style={{
        color: '#2D3142',
        fontWeight: 'bold',
        fontSize: '40px',
        textAlign: 'center',
        marginBottom: '25px',
      }}>
        Life Sim
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Card style={{ minHeight: '150px' }}>
            <Image src="/baby.png" alt="Baby" width={100} height={100} style={{ position: 'absolute', top: '0px', right: '0px' }} />
            <div style={{ color: '#2D3142', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '16px' }}>
              <div><strong>Name:</strong> Child 1</div>
              <div><strong>Age:</strong> 0 years 0 months</div>
              <div><strong>Stage:</strong> Newborn</div>
              <div><strong>Realism:</strong> Optimistic</div>
            </div>
          </Card>
          <Card>
            <Icon src="/education.png" alt="Education" />
            <Title>Edusave</Title>
            <Amount>$10,000</Amount>
          </Card>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Card>
            <Icon src="/household_savings.png" alt="Savings" />
            <Title>Household Savings</Title>
            <Amount color="#00C853">$10,000</Amount>
          </Card>
          <Card>
            <Icon src="/government_benefits.png" alt="Government" />
            <Title>Total Government Benefits</Title>
            <Amount>$10,000</Amount>
          </Card>
          <Card>
            <Icon src="/expenditure.png" alt="Expenditure" />
            <Title>Cumulative Expenditure</Title>
            <Amount color="#FF3B3B">$10,000</Amount>
          </Card>
        </div>

        {/* Bottom Controls */}
        <div style={{ gridColumn: '1 / 2', marginTop: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ fontSize: '22px', color: '#2D3142', fontWeight: '500' }}>Speed</span>
            <input type="range" min="0.1" max="2" step="0.1" value={speed} onChange={handleSpeedChange} style={{ width: '100%' }} />
            <span style={{ fontSize: '20px', color: '#2D3142', width: '50px' }}>{speed}x</span>
        </div>
         <div style={{ gridColumn: '2 / 3', marginTop: '20px', display: 'flex', gap: '15px', justifyContent: 'flex-end', alignItems: 'center' }}>
            <ControlButton onClick={handleStart} style={{ background: '#00C853' }} icon="▶">Start Simulation</ControlButton>
            <ControlButton onClick={handlePause} style={{ background: '#A8A8A8' }} icon="❚❚">Pause</ControlButton>
            <ControlButton onClick={handleEnd} style={{ background: '#FF3B3B' }} icon="■">End Simulation</ControlButton>
        </div>
      </div>
    </div>
  );
}
