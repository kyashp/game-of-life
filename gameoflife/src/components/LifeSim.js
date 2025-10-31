'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
    width={50}
    height={50}
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
// static initial profile
const INITIAL_PROFILE = {
    Child_Name: 'Child 1',
    Child_Gender: 'Female', // 'Male' or 'Female' (affects max age)
    Family_Savings: null,
    Father_Disposable_Income: null,
    Father_Gross_Monthly_Income: 0,
    Father_Residency: "Singaporean",
    Household_Income_Type: "Single",
    Mother_Disposable_Income: null,
    Mother_Gross_Monthly_Income: 10000,
    Mother_Residency: "PR",
    Realism_Level: 'Optimistic',
};

const MAX_AGE_MONTHS = INITIAL_PROFILE.Child_Gender === 'Male' ? 300 : 276;

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-SG', {
        style: 'currency',
        currency: 'SGD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

const getGrowthStage = (ageMonths, childGender, isJCStudent=true) => {
    if (ageMonths < 24) return 'Newborn (0-2Y)';
    if (ageMonths < 72) return 'Kindergarten (2-6Y)'; // 6 years old is 72 months
    if (ageMonths < 144) return 'Primary School (7-12Y)';
    if (ageMonths < 192) return 'Secondary School (13-16Y)';
    
    if (isJCStudent) { //jc student
      if (ageMonths < 216) return 'JC (17-18Y)';
      if (childGender==='Male'){
        if (ageMonths < 288) return 'University (21-24Y)';
      } else {
        if (ageMonths < 264) return 'University (19-22Y)';
      } 
    } else { //poly student
      if (ageMonths < 228) return 'Poly (17-19Y)';
      if (childGender==='Male'){
        if (ageMonths < 300) return 'University (22-25Y)';
      } else {
        if (ageMonths < 276) return 'University (20-23Y)';
      } 
    }
    return 'Adult';
};

const calculateMonthlyCosts = async (ageMonths, profile, isJCStudent) => {
    let baseCost = 500; // Base cost for food, clothes, etc.
    let educationCost = 0;
    let transportCost = 50;

    const stage = getGrowthStage(ageMonths, profile.Child_Gender, isJCStudent);
    
    if (stage.includes('Kindergarten')) {
      educationCost = 300;
    } else if (stage.includes('Primary School')) {
      educationCost = 100;
    } else if (stage.includes('Secondary School')) {
      educationCost = 150;
    } else if (stage.includes('JC')) {
      educationCost = 200; 
    } else if (stage.includes('Poly')) {
      educationCost = 200;
    } else if (stage.includes('University')) {
        educationCost = 400; // Allowance/Living expenses
    }
    return {
        total: baseCost + educationCost,
        base: baseCost,
        education: educationCost,
        transport: transportCost
    };
};

const generateCostEvent = async (ageMonths, profile, context) => {
  const isJCStudent = context.isJCStudent;

    // EVENT 1: Baby Bonus (Age 1 month)
    if (ageMonths === 1) {
        return {
            title: "Baby Bonus Payout & CDA Grant",
            description: `Congratulations! You received the initial Baby Bonus cash gift (S$3000) and the Child Development Account (CDA) First Step Grant (S$6000).`,
            type: "notification",
            category: "birth",
            totalBenefits: 9000, 
            totalCost: 0,
            requiresDecision: false,
        };
    }

    // EVENT 2: Primary School Path Decision (Age 6 / 72 months)
    if (ageMonths === 72) {
        return {
            title: "Primary School Path",
            description: "Your child is starting Primary School. Decide on the level of extra enrichment and tuition you will commit to.",
            type: "decision",
            category: 'education',
            totalBenefits: 0,
            options: [
                { label: "High Commitment", description: "One-time cost:" + formatCurrency(2000) + ". This choice adds S$200/month in tuition.", value: 'high_tuition', cost: 2000 },
                { label: "Low Commitment", description: "One-time cost:" + formatCurrency(500) + ". This choice adds S$50/month in enrichment.", value: 'low_tuition', cost: 500},
            ],
            requiresDecision: true,
            // NOTE: Logic for changing monthly cost based on decision is currently not implemented but decision can still be recorded.
        };
    }

    // EVENT 3: Post-Secondary Path Decision (Age 16 / 192 months)
    if (ageMonths === 192) {
         return {
            title: "Post-Secondary Path Choice",
            description: `Your child has completed Secondary School. Please decide if they will pursue the Junior College (JC) or Polytechnic (Poly) path.`,
            type: "decision",
            category: 'education',
            totalBenefits: 0,
            options: [
                { label: "Junior College (JC)", description: "Requires 2 years (plus NS if Male), typically leads to faster university entry.", value: true, cost: 0 },
                { label: "Polytechnic (Poly)", description: "Requires 3 years (plus NS if Male), offers practical skills and industry exposure.", value: false, cost: 0},
            ],
            requiresDecision: true,
        };
    }
  return null;
};

function CostEventModal({event, onAcknowledge, onDecision}) {
  if (!event) return null;

  const netImpact = (event.totalBenefits || 0) - (event.totalCost || 0);

  return(
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)'
      }} onClick={e => event.requiresDecision ? e.stopPropagation() : onAcknowledge(event)}>
      <div style={{
        backgroundColor: 'white', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto'
        }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '30px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px', color: '#2D3142' }}>
            {event.title}
          </h2>
          <p style={{ color: '#555', marginBottom: '20px' }}>
            {event.description}
          </p>

          <div style={{ marginBottom: '20px', padding: '15px', borderRadius: '10px', border: '1px solid #ccc', backgroundColor: netImpact >= 0 ? '#e6ffe6' : '#ffe6e6' }}>
            <div style={{ fontWeight: 'bold', color: netImpact >= 0 ? '#008000' : '#ff0000' }}>
              Net Financial Impact: {formatCurrency(netImpact)}
            </div>
          </div>

          {/* Decision Options or Acknowledge Button */}
          <div className="pt-2">
            {event.requiresDecision && event.options ? (
              <div className="flex flex-col gap-3 pt-2">
                <h3 className="font-bold text-x1 text-gray-800">Choose an option:</h3>
                {event.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => onDecision(event, option)}
                    className="p-4 border-2 border-gray-300 rounded-x1 bg-white cursor-pointer text-left transition-all duration-200 hover:bg-indigo-50 hover:border-indigo-500 flex justify-between items-center"
                  >
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{option.label}</div>
                      <div style={{ fontSize: '12px', color: '#555' }}>{option.description}</div>
                    </div>
                    {option.cost !== undefined && (
                      <span style={{ color: '#FF3B3B', fontWeight: 'bold', marginLeft: '10px' }}>
                        -{formatCurrency(option.cost)}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <button
                onClick={() => onAcknowledge(event)}
                style={{
                  width: '100%', padding: '15px', background: '#00C853', color: 'white', border: 'none', borderRadius: '15px', fontWeight: 'bold', fontSize: '18px', cursor: 'pointer'
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#00a845'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#00C853'}
              >
                Continue Simulation
              </button>
            )}
          </div>
        </div>
      </div>
    </div> 
  );
}

export default function LifeSim({ onSimulationEnd }) {
  //Static profile data for testing
  const profile = INITIAL_PROFILE;
  
  const [status, setStatus] = useState('stopped'); // 'stopped', 'running', 'paused'
  const [speed, setSpeed] = useState(0.5);

  const [ageMonths, setAgeMonths] = useState(0);
  const [householdSavings, setHouseholdSavings] = useState(profile.Family_Savings);
  const [edusave, setEdusave] = useState(0);
  const [totalExpenditure, setTotalExpenditure] = useState(0);
  const [totalBenefits, setTotalBenefits] = useState(0);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [isJCStudent, setIsJCStudent] = useState (true);
  const [simulationEnded, setSimulationEnded] = useState(false);
  
  const ageYears = Math.floor(ageMonths/12);
  const ageRemainingMonths = ageMonths % 12;
  const currentStage = getGrowthStage(ageMonths, profile.Child_Gender, isJCStudent);

  // 1. Simulation end logic
  const endSimulation = useCallback(() => {
    setStatus('stopped');
    setSimulationEnded(true);
    console.log('Simulation Ended.', householdSavings);

    if (onSimulationEnd) {
      onSimulationEnd({
        finalSavings: householdSavings,
        totalExpenditure,
        totalBenefits,
        finalAgeMonths: ageMonths
      });
    }
  }, [householdSavings, totalExpenditure, totalBenefits, ageMonths, onSimulationEnd]);

  // 2. Event Checker (when not running or when age changes)
  useEffect(() => {
    const checkForEvents = async() => {
      if (currentEvent !== null) return;
      // Use static profile & state variables
      const event = await generateCostEvent(ageMonths, profile, {
        isJCStudent: isJCStudent,
        currentAgeMonths: ageMonths
      });

      if(event) {
        setStatus('paused');
        setCurrentEvent(event);
      }
    };

    if (!simulationEnded && ageMonths>0) {
      checkForEvents();
    }
  }, [ageMonths, profile, isJCStudent, currentEvent, simulationEnded]);

  // 3. Simulation Loop (Main logic)
  useEffect(() => {
    if (status !== 'running' || currentEvent !== null || simulationEnded) return;

    const effectiveSpeed = Math.max(0.1, parseFloat(speed));
    const intervalDuration = 1000/effectiveSpeed;

    const interval = setInterval(async () => {
      const costs = await calculateMonthlyCosts(ageMonths, profile, isJCStudent);
      const monthlyCost = costs.total;

      const newAge = ageMonths + 1;

      const monthlyIncome = (profile.Father_Gross_Monthly_Income || 0) + (profile.Mother_Gross_Monthly_Income || 0);

      setTotalExpenditure(prev => prev + monthlyCost);

      setHouseholdSavings(prev => {
        const newSavings = prev + monthlyIncome - monthlyCost;

        if (newSavings <= 0) {
          clearInterval(interval);
          setTimeout(() => endSimulation(), 0);
          return 0;
        }
        return newSavings;
      });

      setAgeMonths(newAge);

      if (newAge >= MAX_AGE_MONTHS) {
        clearInterval(interval);
        setTimeout(() => endSimulation(), 0);
      }

    }, intervalDuration);
    return () => clearInterval(interval);
  }, [status, speed, ageMonths, profile, isJCStudent, currentEvent, simulationEnded, endSimulation, MAX_AGE_MONTHS]);

  // 4. Handlers for simulation control and events
  const handleStart = () => {
    if (simulationEnded){
      handleReset();
    }
    setStatus('running');
    console.log('Simulation Started');
  };

  const handlePause = () => {
    setStatus('paused');
    console.log('Simulation Paused');
  };

  const handleEnd = () => {
    endSimulation();
    console.log('Simulation Ended');
  };

  const handleReset = () => {
    // Reset to initial profile values
    setAgeMonths(0);
    setHouseholdSavings(profile.Family_Savings);
    setTotalExpenditure(0);
    setTotalBenefits(0);
    setEdusave(0);
    setCurrentEvent(null);
    setIsJCStudent(true);
    setSimulationEnded(false);
    setStatus('stopped');
  };

  const handleSpeedChange = (e) => {
    setSpeed(e.target.value);
  };

  const handleAcknowledge = (event) => {
    // Apply benefits/costs from events
    if (event.totalBenefits) {
      setTotalBenefits(prev => prev + event.totalBenefits);
      setHouseholdSavings(prev => prev + event.totalBenefits);
    }
    if (event.totalCost) {
      setHouseholdSavings(prev => prev - event.totalCost);
    }
    setAgeMonths(prev => prev + 1);

    setCurrentEvent(null);
    setStatus('running');
  };

  const handleDecision = (event, chosenOption) => {
    if (chosenOption.cost) {
      setHouseholdSavings(prev => prev - chosenOption.cost);
      setTotalExpenditure(prev => prev + chosenOption.cost);
    }
    if (event.title === 'Post-Secondary Path Choice') {
      setIsJCStudent(chosenOption.value);
      console.log(`Decision made: ${chosenOption.label}`);
    } else if (event.title === 'Primary School Path') {
      // Placeholder
      console.log(`Decision made for Primary School: ${chosenOption.label}`);
    }
    setAgeMonths(prev => prev + 1);

    setCurrentEvent(null);
    setStatus('running');
  };

  // Determine if the simulation is active for the buttons
  const isPaused = status === 'paused';
  const isRunning = status === 'running';

  return (
    <div style={{
      backgroundColor: '#F4C4C4',
      borderRadius: '40px',
      border: '2px solid #2D3142',
      margin: '0px auto',
      width: '85%',
      maxWidth: '800px',
      padding: '30px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    }}>
      {currentEvent && (
        <CostEventModal
          event={currentEvent}
          onAcknowledge={handleAcknowledge}
          onDecision={handleDecision}
        />
      )}
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
            <Image src="/baby.png" alt="Baby" width={100} height={100} style={{ position: 'absolute', top: '0px', right: '0px' }}/>
            <div style={{ color: '#2D3142', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '16px' }}>
              <div><strong>Name:</strong> {profile.Child_Name} ({profile.Child_Gender})</div>
              <div><strong>Age:</strong> {ageYears} years {ageRemainingMonths} months</div>
              <div><strong>Stage:</strong> {currentStage}</div>
              <div><strong>Realism:</strong> {profile.Realism_Level}</div>
            </div>
          </Card>
          <Card>
            <Icon src="/education.png" alt="Education" />
            <Title>Edusave</Title>
            <Amount>{formatCurrency(edusave)}</Amount>
          </Card>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Card>
            <Icon src="/household_savings.png" alt="Savings" />
            <Title>Household Savings</Title>
            <Amount color={householdSavings >= 0 ? '#00C853' : '#FF3B3B'}>{formatCurrency(householdSavings)}</Amount>
          </Card>
          <Card>
            <Icon src="/government_benefits.png" alt="Government" />
            <Title>Total Government Benefits</Title>
            <Amount>{formatCurrency(totalBenefits)}</Amount>
          </Card>
          <Card>
            <Icon src="/expenditure.png" alt="Expenditure" />
            <Title>Cumulative Expenditure</Title>
            <Amount color="#FF3B3B">{formatCurrency(totalExpenditure)}</Amount>
          </Card>
        </div>

        {/* Bottom Controls */}
        <div style={{ gridColumn: '1 / 2', marginTop: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ fontSize: '22px', color: '#2D3142', fontWeight: '500' }}>Speed</span>
            <input type="range" min="0.1" max="6" step="0.1" value={speed} onChange={handleSpeedChange} style={{ width: '100%' }}/>
            <span style={{ fontSize: '20px', color: '#2D3142', width: '50px' }}>{parseFloat(speed).toFixed(1)}x</span>
        </div>
         <div style={{ gridColumn: '2 / 3', marginTop: '20px', display: 'flex', gap: '15px', justifyContent: 'flex-end', alignItems: 'center' }}>
            <ControlButton onClick={handleStart} style={{ background: '#00C853' }} icon="▶">{simulationEnded ? "Restart" : (isRunning? "Running" : (ageMonths > 0 ? "Resume": "Start"))}</ControlButton>
            <ControlButton onClick={handlePause} style={{ background: '#A8A8A8' }} icon="❚❚">Pause</ControlButton>
            <ControlButton onClick={handleEnd} style={{ background: '#FF3B3B' }} icon="■">End Simulation</ControlButton>
        </div>
      </div>
    </div>
  );
}
