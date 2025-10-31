'use client';

import { useState, useRef } from 'react';
import LifeSim from '../../components/LifeSim';
import LifeSimDashboard from '../../components/LifeSimDashboard';

export default function LifeSimPage() {
  const [simulationData, setSimulationData] = useState(null);
  const dashboardRef = useRef(null);

  const handleSimulationEnd = (data) => {
    const placeholderData = {
      numChildren: 1,
      totalExpenditure: 17500,
      totalReliefs: 4500,
      totalMiscCosts: 2500,
    };
    setSimulationData(placeholderData);
    setTimeout(() => {
      dashboardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <div>
      <LifeSim onSimulationEnd={handleSimulationEnd} />
      {simulationData && (
        <div ref={dashboardRef}>
          <LifeSimDashboard simulationData={simulationData} />
        </div>
      )}
    </div>
  );
}
