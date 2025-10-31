
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Square, Baby, Download, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import CostEventModal from '../components/simulation/CostEventModal';
import { generateCostEvent, getGrowthStage, calculateMonthlyCosts } from '../components/utils/costEvents';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';

export default function LifeSim() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1); // Changed from 0.5 to 1
  const [ageMonths, setAgeMonths] = useState(0);
  const [householdSavings, setHouseholdSavings] = useState(10000);
  const [edusave, setEdusave] = useState(0);
  const [totalExpenditure, setTotalExpenditure] = useState(0);
  const [totalBenefits, setTotalBenefits] = useState(0);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [previousStage, setPreviousStage] = useState('none');
  const [educationChoice, setEducationChoice] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [simulationEnded, setSimulationEnded] = useState(false);

  const { data: profiles } = useQuery({
    queryKey: ['profiles'],
    queryFn: () => base44.entities.ParentProfile.list(),
    initialData: [],
  });

  const { data: sessions } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => base44.entities.SimulationSession.list(),
    initialData: [],
  });

  const createSessionMutation = useMutation({
    mutationFn: (data) => base44.entities.SimulationSession.create(data),
    onSuccess: (newSession) => {
      setSessionId(newSession.id);
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });

  const updateSessionMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SimulationSession.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });

  const createResultMutation = useMutation({
    mutationFn: (data) => base44.entities.SimulationResult.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['results'] });
    },
  });

  useEffect(() => {
    if (profiles && profiles.length > 0) {
      const profile = profiles[0];
      const initialSavings = (profile.fatherDisposableIncome || profile.fatherGrossMonthlyIncome || 0) +
                             (profile.motherDisposableIncome || profile.motherGrossMonthlyIncome || 0) +
                             (profile.familySavings || 0);
      setHouseholdSavings(initialSavings);
    }
  }, [profiles]);

  // Check for cost events when age changes
  useEffect(() => {
    const checkForEvents = async () => {
      if (!profiles || profiles.length === 0) return;
      
      const profile = profiles[0];
      const currentStage = getGrowthStage(ageMonths, profile.childGender);
      
      if (currentStage !== previousStage) {
        setIsRunning(false);
        
        const event = await generateCostEvent(ageMonths, profile, {
          previousStage,
          educationChoice,
        });
        
        if (event) {
          setCurrentEvent(event);
        }
        
        setPreviousStage(currentStage);
      }
    };

    checkForEvents();
  }, [ageMonths, profiles, previousStage, educationChoice]);

  // Simulation loop - FIXED to handle async cost calculation
  useEffect(() => {
    if (!isRunning || !profiles || profiles.length === 0) return;

    const interval = setInterval(async () => {
      const profile = profiles[0];
      
      // Calculate monthly costs - NOW ASYNC
      const costs = await calculateMonthlyCosts(ageMonths, profile, educationChoice);
      const monthlyCost = costs.total;
      
      // Update age
      const newAge = ageMonths + 1;
      setAgeMonths(newAge);
      
      // Update finances
      setTotalExpenditure(prev => prev + monthlyCost);
      
      // Add monthly income first
      const monthlyIncome = (profile.fatherDisposableIncome || profile.fatherGrossMonthlyIncome || 0) +
                            (profile.motherDisposableIncome || profile.motherGrossMonthlyIncome || 0);
      
      setHouseholdSavings(prev => {
        const newSavings = prev + monthlyIncome - monthlyCost;
        
        // End simulation if out of money
        if (newSavings <= 0) {
          setIsRunning(false);
          endSimulation(newAge, true);
          return 0; // Set savings to 0 if run out of money
        }
        
        return newSavings;
      });

      // Check if simulation should end (child reaches adulthood)
      const maxAge = profile.childGender === 'Male' ? 264 : 240; // 22 or 20 years
      if (newAge >= maxAge) {
        setIsRunning(false);
        endSimulation(newAge, false);
      }

      // Update session every 6 months
      if (sessionId && newAge % 6 === 0) {
        updateSessionMutation.mutate({
          id: sessionId,
          data: {
            currentChildAgeMonths: newAge,
            currentGrowthStage: getGrowthStage(newAge, profile.childGender),
            householdSavingsBalance: householdSavings,
            edusaveBalance: edusave,
            totalExpenditure,
            totalReliefs: totalBenefits,
            simulationSpeed: speed,
          }
        });
      }
    }, 1000 / speed);

    return () => clearInterval(interval);
  }, [isRunning, speed, ageMonths, profiles, educationChoice, sessionId, householdSavings, edusave, totalExpenditure, totalBenefits]); // Added all states used in updateSessionMutation payload

  const endSimulation = async (finalAge, ranOutOfMoney) => {
    if (!profiles || profiles.length === 0) return;

    // Create simulation result
    await createResultMutation.mutateAsync({
      sessionId: sessionId || 'guest-session',
      finalHouseholdSavings: householdSavings,
      totalExpenditure,
      totalReliefs: totalBenefits,
      costBreakdownByStage: {},
      educationCostsByStage: {},
      expenditureBreakdown: {
        education: totalExpenditure * 0.56,
        medical: totalExpenditure * 0.33,
        miscellaneous: totalExpenditure * 0.11
      },
      reliefBreakdown: {},
      miscellaneousBreakdown: {
        allowance: 0,
        clothing: 0,
        enrichment: 0
      }
    });

    // Update session as completed if exists
    if (sessionId) {
      await updateSessionMutation.mutateAsync({
        id: sessionId,
        data: {
          isCompleted: true,
          currentChildAgeMonths: finalAge,
          householdSavingsBalance: householdSavings,
          totalExpenditure,
          totalReliefs: totalBenefits,
        }
      });
    }

    // Show dashboard
    setSimulationEnded(true);
  };

  const handleStart = () => {
    if (!profiles || profiles.length === 0) {
      alert('Please create a profile first!');
      navigate(createPageUrl('Profile'));
      return;
    }

    // Reset simulation state
    setSimulationEnded(false);
    setAgeMonths(0);
    setPreviousStage('none');
    setTotalExpenditure(0);
    setTotalBenefits(0);
    setEdusave(0);

    const profile = profiles[0];
    const initialSavings = (profile.fatherDisposableIncome || profile.fatherGrossMonthlyIncome || 0) +
                           (profile.motherDisposableIncome || profile.motherGrossMonthlyIncome || 0) +
                           (profile.familySavings || 0);
    setHouseholdSavings(initialSavings);

    // Create new session if none exists or if it's a new simulation run
    if (!sessionId || sessions.some(s => s.id === sessionId && s.isCompleted)) {
      createSessionMutation.mutate({
        profileId: profiles[0].id,
        currentChildAgeMonths: 0,
        currentGrowthStage: 'Newborn',
        householdSavingsBalance: initialSavings,
        edusaveBalance: 0,
        totalExpenditure: 0,
        totalReliefs: 0,
        simulationSpeed: speed,
      });
    }

    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleEnd = () => {
    setIsRunning(false);
    endSimulation(ageMonths, false);
  };

  const handleSpeedChange = (value) => {
    setSpeed(value[0]);
  };

  const handleEventAcknowledge = () => {
    if (currentEvent) {
      // Apply event costs and benefits
      const netImpact = (currentEvent.totalBenefits || 0) - (currentEvent.totalCost || 0);
      setHouseholdSavings(s => Math.max(0, s + netImpact));
      setTotalExpenditure(e => e + (currentEvent.totalCost || 0));
      setTotalBenefits(b => b + (currentEvent.totalBenefits || 0));
      
      // Add to Edusave if applicable
      if (currentEvent.benefits) {
        const edusaveContribution = currentEvent.benefits.find(b => 
          b.item.includes('Edusave')
        );
        if (edusaveContribution) {
          setEdusave(e => e + edusaveContribution.amount);
        }
      }
    }
    
    setCurrentEvent(null);
    setIsRunning(true);
  };

  const handleEventDecision = (decision) => {
    if (currentEvent && currentEvent.options) {
      const selectedOption = currentEvent.options.find(opt => opt.value === decision);
      
      if (selectedOption) {
        setEducationChoice(decision);
        
        // Apply decision cost
        if (selectedOption.cost) {
          setHouseholdSavings(s => Math.max(0, s - selectedOption.cost));
          setTotalExpenditure(e => e + selectedOption.cost);
        }
        
        // Apply benefits
        if (currentEvent.totalBenefits) {
          setHouseholdSavings(s => s + currentEvent.totalBenefits);
          setTotalBenefits(b => b + currentEvent.totalBenefits);
        }
      }
    }
    
    setCurrentEvent(null);
    setIsRunning(true);
  };

  const currentStage = profiles && profiles.length > 0 
    ? getGrowthStage(ageMonths, profiles[0].childGender)
    : 'Newborn';

  // If simulation ended, show dashboard
  if (simulationEnded) {
    return <LifeSimDashboardView 
      householdSavings={householdSavings}
      totalExpenditure={totalExpenditure}
      totalBenefits={totalBenefits}
      totalMiscCosts={totalExpenditure * 0.11}
      onBack={handleStart} // Pass handleStart to re-initialize simulation
    />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Card className="p-8 bg-gradient-to-br from-pink-100 to-pink-200">
        <h1 className="text-4xl font-bold text-center mb-8">Life Sim</h1>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Left Column */}
          <div className="space-y-6">
            <Card className="p-6 bg-white">
              <div className="flex items-center gap-4 mb-4">
                <Baby className="w-16 h-16 text-blue-400" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Name:</p>
                  <p className="font-semibold">{profiles[0]?.childName || 'Child 1'}</p>
                  <p className="text-sm text-gray-600 mt-2">Age:</p>
                  <p className="font-semibold">{Math.floor(ageMonths / 12)} years {ageMonths % 12} months</p>
                  <p className="text-sm text-gray-600 mt-2">Stage:</p>
                  <p className="font-semibold">{currentStage}</p>
                  <p className="text-sm text-gray-600 mt-2">Realism:</p>
                  <p className="font-semibold">{profiles[0]?.realismLevel || 'Optimistic'}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white">
              <p className="text-sm text-gray-600 mb-2">Edusave</p>
              <p className="text-3xl font-bold text-blue-600">${edusave.toLocaleString()}</p>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <Card className="p-6 bg-white">
              <p className="text-sm text-gray-600 mb-2">Household Savings</p>
              <p className="text-3xl font-bold text-green-600">${Math.round(householdSavings).toLocaleString()}</p>
            </Card>

            <Card className="p-6 bg-white">
              <p className="text-sm text-gray-600 mb-2">Total Government Benefits</p>
              <p className="text-3xl font-bold text-purple-600">${Math.round(totalBenefits).toLocaleString()}</p>
            </Card>

            <Card className="p-6 bg-white">
              <p className="text-sm text-gray-600 mb-2">Cumulative Expenditure</p>
              <p className="text-3xl font-bold text-red-600">${Math.round(totalExpenditure).toLocaleString()}</p>
            </Card>
          </div>
        </div>

        {/* Speed Control */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Speed</span>
            <Slider
              value={[speed]}
              onValueChange={handleSpeedChange}
              min={0.5} // Changed from 0.1 to 0.5
              max={6} // Changed from 2 to 6
              step={0.5}
              className="flex-1"
              // disabled={!isRunning} // Removed disabled attribute
            />
            <span className="text-sm font-medium w-12">{speed.toFixed(1)}x</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center gap-4">
          <Button
            onClick={handleStart}
            disabled={isRunning}
            className="bg-green-500 hover:bg-green-600 text-white px-8 py-6"
          >
            <Play className="w-5 h-5 mr-2" />
            Start Simulation
          </Button>
          <Button
            onClick={handlePause}
            disabled={!isRunning}
            className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-6"
          >
            <Pause className="w-5 h-5 mr-2" />
            Pause
          </Button>
          <Button
            onClick={handleEnd}
            disabled={!isRunning}
            className="bg-red-500 hover:bg-red-600 text-white px-8 py-6"
          >
            <Square className="w-5 h-5 mr-2" />
            End Simulation
          </Button>
        </div>
      </Card>

      {/* Cost Event Modal */}
      <CostEventModal
        event={currentEvent}
        onAcknowledge={handleEventAcknowledge}
        onDecision={handleEventDecision}
      />
    </div>
  );
}

// Life Sim Dashboard View Component
function LifeSimDashboardView({ householdSavings, totalExpenditure, totalBenefits, totalMiscCosts, onBack }) {
  const [exportFormat, setExportFormat] = useState('CSV');

  const stageData = [
    { stage: 'Newborn', cost: totalExpenditure * 0.15 },
    { stage: 'Kindergarten', cost: totalExpenditure * 0.20 },
    { stage: 'Primary School', cost: totalExpenditure * 0.15 },
    { stage: 'Secondary School', cost: totalExpenditure * 0.15 },
    { stage: 'JC / Poly', cost: totalExpenditure * 0.10 },
    { stage: 'University', cost: totalExpenditure * 0.25 },
  ];

  const educationData = [
    { stage: 'Childcare', cost: totalExpenditure * 0.14 },
    { stage: 'Kindergarten', cost: totalExpenditure * 0.18 },
    { stage: 'Primary School', cost: totalExpenditure * 0.12 },
    { stage: 'Secondary School', cost: totalExpenditure * 0.11 },
    { stage: 'JC / Poly', cost: totalExpenditure * 0.05 },
    { stage: 'University', cost: totalExpenditure * 0.18 },
  ];

  const expenditureData = [
    { name: 'Education', value: 56, color: '#FF9B9B' },
    { name: 'Medical', value: 33, color: '#7B8CDE' },
    { name: 'Miscellaneous', value: 11, color: '#FFB84D' },
  ];

  const reliefData = [
    { name: 'Baby Bonus Scheme', value: 22.7, color: '#FF9B9B' },
    { name: 'Child Development Account', value: 14.6, color: '#7B8CDE' },
    { name: 'Medisave Grants', value: 4.5, color: '#FFB84D' },
    { name: 'Qualifying Child Relief', value: 18.2, color: '#9B7BDE' },
    { name: "Working Mother's Child Relief", value: 8.1, color: '#DE7B9B' },
    { name: 'Grandparent Caregiver Relief', value: 20.5, color: '#7BBEDE' },
    { name: 'Childcare Subsidy', value: 4.5, color: '#BEDE7B' },
    { name: 'Edusave', value: 6.9, color: '#FFA07A' },
  ];

  const miscData = [
    { name: 'Clothing', value: 46, color: '#FF9B9B' },
    { name: 'Enrichment', value: 30, color: '#7B8CDE' },
    { name: 'Allowance', value: 24, color: '#FFB84D' },
  ];

  const formatCurrency = (value) => `$${Math.round(value).toLocaleString()}`;

  const handleExport = () => {
    const csvContent = [
      ['Life Sim Dashboard Export'],
      [''],
      ['Summary'],
      ['Household Savings Balance', householdSavings.toFixed(2)],
      ['Total Expenditure', totalExpenditure.toFixed(2)],
      ['Total Government Reliefs', totalBenefits.toFixed(2)],
      ['Total Miscellaneous Costs', totalMiscCosts.toFixed(2)],
      [''],
      ['Cost Breakdown by Stage'],
      ['Stage', 'Cost'],
      ...stageData.map(item => [item.stage, item.cost.toFixed(2)]),
      [''],
      ['Education Costs by Stage'],
      ['Stage', 'Cost'],
      ...educationData.map(item => [item.stage, item.cost.toFixed(2)]),
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `life-sim-dashboard.${exportFormat.toLowerCase()}`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Life Sim Dashboard</h1>
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          New Simulation
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100">
          <p className="text-sm text-gray-600 mb-2">Household Savings Balance</p>
          <p className="text-3xl font-bold text-green-600">{formatCurrency(householdSavings)}</p>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100">
          <p className="text-sm text-gray-600 mb-2">Total Expenditure</p>
          <p className="text-3xl font-bold text-red-600">{formatCurrency(totalExpenditure)}</p>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100">
          <p className="text-sm text-gray-600 mb-2">Total Government Reliefs</p>
          <p className="text-3xl font-bold text-blue-600">{formatCurrency(totalBenefits)}</p>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100">
          <p className="text-sm text-gray-600 mb-2">Total Miscellaneous Costs</p>
          <p className="text-3xl font-bold text-purple-600">{formatCurrency(totalMiscCosts)}</p>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card className="p-6 bg-blue-50">
          <h3 className="text-lg font-semibold mb-4">Total Cost Breakdown by Stage of Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="stage" angle={-45} textAnchor="end" height={100} interval={0} />
              <YAxis tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Bar dataKey="cost" fill="#7B8CDE" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6 bg-purple-50">
          <h3 className="text-lg font-semibold mb-4">Education Costs at each Stage of Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={educationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="stage" angle={-45} textAnchor="end" height={100} interval={0} />
              <YAxis tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Bar dataKey="cost" fill="#9B7BDE" />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-center mt-4 text-lg font-semibold text-green-600">
            Total Education Costs: {formatCurrency(totalExpenditure * 0.56)}
          </p>
        </Card>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
        <p className="text-sm text-gray-700">
          <strong>Note:</strong> For all visualisations, the median of the Cost Ranges are used.
        </p>
      </div>

      {/* Charts Row 2 */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="space-y-6">
          <Card className="p-6 bg-pink-50">
            <h3 className="text-lg font-semibold mb-4 text-center">Breakdown of Total Expenditure</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={expenditureData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}\n${entry.value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expenditureData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6 bg-orange-50">
            <h3 className="text-lg font-semibold mb-4 text-center">Breakdown of Miscellaneous Costs</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={miscData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}\n${entry.value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {miscData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <Card className="p-6 bg-indigo-50">
          <h3 className="text-lg font-semibold mb-4 text-center">Breakdown of Total Government Reliefs</h3>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={reliefData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}\n${entry.value}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {reliefData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          <div className="mt-6 space-y-4">
            <div>
              <p className="text-sm font-semibold mb-2">Export Life Sim Dashboard as:</p>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CSV">CSV</SelectItem>
                  <SelectItem value="Excel">Excel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleExport} className="w-full bg-red-400 hover:bg-red-500 text-white">
              <Download className="w-4 h-4 mr-2" />
              Export Life Sim Dashboard
            </Button>
          </div>
        </Card>
      </div>

      <div className="flex justify-end">
        <button className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
          <HelpCircle className="w-5 h-5" />
          <span>Click here for more info</span>
        </button>
      </div>
    </div>
  );
}
