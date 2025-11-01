'use client';

import { useState, useRef } from 'react';
import LifeSim from '../../components/LifeSim';
import LifeSimDashboard from '../../components/LifeSimDashboard';

export default function LifeSimPage() {
  const [simulationData, setSimulationData] = useState(null);
  const dashboardRef = useRef(null);

  const handleSimulationEnd = (data) => {
    // The 'data' object now contains the complete results from the simulation
    setSimulationData(data);
    
    // Scroll to the dashboard after it renders
    setTimeout(() => {
      dashboardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <div>
      {/* Pass the onSimulationEnd handler to LifeSim.
        When simulationData is null, LifeSim is visible.
        When simulationData is set, LifeSim will be hidden by its own logic,
        and the Dashboard will be shown below.
      */}
      {!simulationData && (
        <LifeSim onSimulationEnd={handleSimulationEnd} />
      )}
      
      {/* The Dashboard component is now only rendered when simulationData exists.
      */}
      {simulationData && (
        <div ref={dashboardRef}>
          <LifeSimDashboard simulationData={simulationData} />
        </div>
      )}
    </div>
  );
}