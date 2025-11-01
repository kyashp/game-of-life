'use client';

import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// --- Data Transformation Helpers ---

// Transforms an object like { 'Newborn': 100, 'Kindergarten': 200 }
// into [{ stage: 'Newborn', cost: 100 }, { stage: 'Kindergarten', cost: 200 }]
const transformStageData = (dataObject) => {
    return Object.entries(dataObject).map(([stage, cost]) => ({
        stage,
        cost,
    }));
};

// Transforms an object like { 'Baby Bonus': 11000, 'Edusave': 500 }
// into [{ name: 'Baby Bonus', value: 11000 }, { name: 'Edusave', value: 500 }]
// Also calculates percentages for the pie chart
const transformPieData = (dataObject) => {
    const total = Object.values(dataObject).reduce((sum, value) => sum + value, 0);
    if (total === 0) return [];
    
    return Object.entries(dataObject).map(([name, value]) => ({
        name,
        value: (value / total) * 100, // Store as percentage
        absoluteValue: value, // Store original value for tooltip
    }));
};

// Define colors for charts
const PIE_COLORS = {
    expenditure: ['#FF8A80', '#7E57C2', '#FFB74D', '#4DB6AC'], // --- NEW: Added 4th color
    misc: ['#FF8A80', '#7E57C2', '#FFB74D', '#4DB6AC', '#FFA726', '#F06292', '#81C784'],
    reliefs: ['#FF8A80', '#F06292', '#8E24AA', '#7E57C2', '#5C6BC0', '#FFB74D', '#7986CB', '#4DB6AC']
};

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-SG', {
        style: 'currency',
        currency: 'SGD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};


// --- Main Dashboard Component ---

export default function LifeSimDashboard({ simulationData }) {

  // Use useMemo to calculate chart data only when simulationData changes
  const {
    costBreakdownData,
    educationCostsData,
    expenditureData,
    miscData,
    reliefsData,
    totalEducationCosts,
    totalMiscCosts, // This is the calculated total misc cost
    totalMedicalCosts,
    miscCosts, // This is the raw miscCosts object
    taxCosts // --- NEW: Get taxCosts ---
  } = useMemo(() => {
    if (!simulationData) return { all: [] };

    // --- NEW: Destructure taxCosts ---
    const { stageCosts, educationCosts, medicalCosts, miscCosts, reliefs, taxCosts } = simulationData;

    // 1. Bar Chart: Total Cost Breakdown
    const costBreakdownData = transformStageData(stageCosts);

    // 2. Bar Chart: Education Costs
    const educationCostsData = transformStageData(educationCosts);
    const totalEducationCosts = Object.values(educationCosts).reduce((s, v) => s + v, 0);

    // 3. Pie Chart: Expenditure Breakdown
    const totalMedicalCosts = Object.values(medicalCosts).reduce((s, v) => s + v, 0);
    const totalMiscOnly = Object.values(miscCosts).reduce((s, v) => s + v, 0);
    
    // --- NEW: Add taxCosts to expenditure breakdown ---
    const expBreakdown = {
        'Education': totalEducationCosts,
        'Medical': totalMedicalCosts,
        'Miscellaneous': totalMiscOnly,
        'Income Tax': taxCosts || 0,
    };
    const expenditureData = transformPieData(expBreakdown).map((item, index) => ({
      ...item,
      color: PIE_COLORS.expenditure[index % PIE_COLORS.expenditure.length]
    }));

    // 4. Pie Chart: Miscellaneous Breakdown
    const miscData = transformPieData(miscCosts).map((item, index) => ({
      ...item,
      color: PIE_COLORS.misc[index % PIE_COLORS.misc.length]
    }));
    
    // 5. Pie Chart: Reliefs Breakdown
    const reliefsData = transformPieData(reliefs).map((item, index) => ({
      ...item,
      color: PIE_COLORS.reliefs[index % PIE_COLORS.reliefs.length]
    }));

    return {
        costBreakdownData,
        educationCostsData,
        expenditureData,
        miscData,
        reliefsData,
        totalEducationCosts,
        totalMiscCosts: totalMiscOnly, // Use the calculated total
        totalMedicalCosts,
        miscCosts, // Pass raw object for export
        taxCosts: taxCosts || 0, // --- NEW: Pass taxCosts ---
    };
  }, [simulationData]);


  if (!simulationData) {
    return <div>Loading simulation data...</div>;
  }
  
  const { profile, totalExpenditure, totalBenefits, decisionsMade } = simulationData;

  return (
    <div className="max-w-[1400px] mx-auto px-10 pb-20 mt-10">
      <h2 className="text-4xl font-bold mb-9 text-[#2D3142]">Life Sim Dashboard</h2>

      {/* --- Summary Cards (Dynamic) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-9">
        <SummaryCard label="Child Name" value={profile.Child_Name} />
        <SummaryCard label="Total Expenditure" value={formatCurrency(totalExpenditure)} valueColor="text-[#E53935]" />
        <SummaryCard label="Total Government Reliefs" value={formatCurrency(totalBenefits)} valueColor="text-[#3F51B5]" />
        <SummaryCard label="Total Miscellaneous Costs" value={formatCurrency(totalMiscCosts)} valueColor="text-gray-600" />
      </div>

      {/* --- Bar Charts (Dynamic) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <ChartCard 
            title="Total Cost Breakdown by Stage of Growth" 
            data={costBreakdownData} 
        />
        <ChartCard 
            title="Education Costs at each Stage of Growth" 
            data={educationCostsData} 
            footer 
            footerValue={totalEducationCosts}
        />
      </div>
      
      {/* --- Pie Charts (Dynamic) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
        <div className="flex flex-col gap-8">
          <PieChartCard 
            title="Breakdown of Total Expenditure" 
            data={expenditureData} 
            outerRadius={100} 
          />
          <PieChartCard 
            title="Breakdown of Miscellaneous Costs" 
            data={miscData} 
            outerRadius={100} 
          />
        </div>
        <div className="flex flex-col gap-8">
          <GovernmentReliefsPieChartCard 
            title="Breakdown of Total Government Reliefs" 
            data={reliefsData} 
          />
          
          {/* --- Export Section (FIXED) --- */}
          <ExportSection 
            simulationData={simulationData}
            // Pass all calculated data needed for the export
            chartData={{ 
                costBreakdownData, 
                educationCostsData, 
                miscCosts, // Pass the raw object
                totalEducationCosts,
                totalMiscCosts,
                taxCosts, // --- NEW: Pass tax costs ---
            }}
            decisionsMade={decisionsMade} // --- NEW: Pass decisions ---
          />
        </div>
      </div>
    </div>
  );
}

// --- UI Sub-components (Mostly Unchanged) ---

const SummaryCard = ({ label, value, valueColor }) => (
    <div className="bg-[#E8EAF6] rounded-2xl p-6 text-center">
      <p className="text-lg font-semibold mb-4 text-[#2D3142]">{label}</p>
      <p className={`text-4xl font-bold ${valueColor || 'text-[#2D3142]'}`}>{value}</p>
    </div>
  );
  
  const ChartCard = ({ title, data, footer, footerValue = 0 }) => (
    <div className="bg-[#E8EAF6] rounded-2xl p-8">
      <h3 className="text-xl font-semibold text-center mb-6 text-[#2D3142]">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="stage" angle={-45} textAnchor="end" interval={0} height={80} />
          <YAxis tickFormatter={(val) => formatCurrency(val)} />
          {/* --- FIX: Added dark text style to Tooltip --- */}
          <Tooltip 
            labelStyle={{ color: '#2D3142' }} 
            itemStyle={{ color: '#2D3142' }} 
            formatter={(val) => formatCurrency(val)}
          />
          <Bar dataKey="cost" radius={[6, 6, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={['#FF8A80', '#7E57C2', '#FFB74D', '#4DB6AC', '#FFA726', '#F06292'][index % 6]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {footer && (
        <div className="text-center mt-5">
          <p className="text-lg font-semibold inline text-[#2D3142]">Total Education Costs : </p>
          <p className="text-2xl font-bold text-[#00C853] inline">{formatCurrency(footerValue)}</p>
        </div>
      )}
    </div>
  );

  // --- FIX: This function now displays the percentage correctly ---
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 25;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
  
    return (
      <text
        x={x}
        y={y}
        fill="#2D3142"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={11}
      >
        {`${name} ${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };
  
  const GovernmentReliefsPieChartCard = ({ title, data }) => {
    const renderWrappedLabel = (props) => {
      const { cx, cy, midAngle, outerRadius, percent, name } = props;
      const RADIAN = Math.PI / 180;
      const radius = outerRadius + 30;
      const x = cx + radius * Math.cos(-midAngle * RADIAN);
      const y = cy + radius * Math.sin(-midAngle * RADIAN);
  
      const words = name.split(' ');
  
      return (
        <g>
          <text x={x} y={y} fill="#2D3142" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={11}>
            {words.map((word, index) => (
              <tspan key={index} x={x} dy={index === 0 ? 0 : 12}>
                {word}
              </tspan>
            ))}
          </text>
          <text x={x} y={y + (words.length) * 12} fill="#2D3142" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={11} fontWeight="bold">
            {`${(percent * 100).toFixed(1)}%`}
          </text>
        </g>
      );
    };
  
    return (
      <div className="bg-[#E8EAF6] rounded-2xl p-8 h-full">
        <h3 className="text-xl font-semibold text-center mb-6 text-[#2D3142]">{title}</h3>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart margin={{ top: 40, right: 40, bottom: 40, left: 40 }}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
              label={renderWrappedLabel}
              labelLine={{ stroke: '#888', strokeWidth: 1 }}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            {/* --- FIX: Added dark text style to Tooltip --- */}
            <Tooltip 
              labelStyle={{ color: '#2D3142' }} 
              itemStyle={{ color: '#2D3142' }} 
              formatter={(value, name, entry) => `${formatCurrency(entry.payload.absoluteValue)} (${entry.payload.value.toFixed(1)}%)`}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  };
  
  const PieChartCard = ({ title, data, outerRadius = 120 }) => (
    <div className="bg-[#E8EAF6] rounded-2xl p-8 h-full">
      <h3 className="text-xl font-semibold text-center mb-6 text-[#2D3142]">{title}</h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={outerRadius}
            fill="#8884d8"
            dataKey="value" // dataKey="value" means it uses the 'value' (percentage) for layout
            label={renderCustomizedLabel}
            labelLine={{ stroke: '#888', strokeWidth: 1 }}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          {/* --- FIX: Added dark text style to Tooltip --- */}
          <Tooltip 
            labelStyle={{ color: '#2D3142' }} 
            itemStyle={{ color: '#2D3142' }} 
            formatter={(value, name, entry) => `${formatCurrency(entry.payload.absoluteValue)} (${entry.payload.value.toFixed(1)}%)`}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
  
// --- New Export Component (FIXED) ---

const ExportSection = ({ simulationData, chartData, decisionsMade }) => { // --- NEW: Added decisionsMade ---
    const [exportFormat, setExportFormat] = useState('CSV');

    const handleExport = () => {
        if (!simulationData || !chartData) return;

        // FIX: Get base data from simulationData
        const { profile, totalExpenditure, totalBenefits, isJCStudent } = simulationData;
        
        // FIX: Get calculated data from chartData prop
        const { 
            costBreakdownData, 
            educationCostsData, 
            totalEducationCosts, 
            miscCosts, // This is the raw object
            totalMiscCosts, // This is the calculated total
            taxCosts // --- NEW: Get tax costs ---
        } = chartData; 

        // Helper to format text for CSV (handles commas)
        const csvFormat = (val) => {
            const str = String(val);
            if (str.includes(',')) {
                return `"${str}"`;
            }
            return str;
        };
        
        // Use the raw miscCosts object
        const miscBreakdownArray = Object.entries(miscCosts).map(([name, value]) => [name, value.toFixed(2)]);

        // --- NEW: Format decisions for CSV ---
        const decisionsArray = (decisionsMade || []).map(d => [d.event, d.choice, d.cost.toFixed(2)]);

        const csvContent = [
            ['Life Sim Dashboard Export'],
            [''],
            ['Summary'],
            ['Child Name', profile.Child_Name],
            ['Education Path', isJCStudent ? 'Junior College' : 'Polytechnic'],
            ['Total Expenditure', totalExpenditure.toFixed(2)],
            ['Total Government Reliefs', totalBenefits.toFixed(2)],
            ['Total Miscellaneous Costs', totalMiscCosts.toFixed(2)],
            ['Total Education Costs', totalEducationCosts.toFixed(2)],
            ['Total Income Tax Paid', taxCosts.toFixed(2)], // --- NEW ---
            [''],
            ['Cost Breakdown by Stage'],
            ['Stage', 'Cost'],
            ...costBreakdownData.map(item => [item.stage, item.cost.toFixed(2)]),
            [''],
            ['Education Costs by Stage'],
            ['Stage', 'Cost'],
            ...educationCostsData.map(item => [item.stage, item.cost.toFixed(2)]),
            [''],
            ['Miscellaneous Cost Breakdown (Total)'],
            ['Category', 'Cost'],
            ...miscBreakdownArray,
            [''], // --- NEW SECTION ---
            ['One-Time Decisions Made'],
            ['Event', 'Choice', 'Cost'],
            ...decisionsArray,
        ].map(row => row.map(csvFormat).join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        // Ensure child name is valid for a filename
        const safeName = profile.Child_Name.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'child';
        a.download = `life-sim-dashboard-${safeName}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
      <div className="bg-[#E8EAF6] rounded-2xl p-8 mt-[-1rem]">
        <div className="flex items-center justify-center mb-6">
          <h3 className="text-2xl font-semibold mr-4 text-[#2D3142]">Export Life Sim Dashboard as:</h3>
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
            className="bg-white border-2 border-[#2D3142] rounded-full w-48 h-14 px-4 text-lg appearance-none text-[#2D3142] 
                       focus:outline-none focus:ring-2 focus:ring-[#6B5B95]"
          >
            <option value="CSV">CSV</option>
          </select>
        </div>
        <button
          onClick={handleExport}
          className="bg-[#FF8A80] text-white font-bold text-xl rounded-full w-60 h-16 flex items-center justify-center mx-auto mb-4
                     hover:bg-red-500 transition-colors duration-300 cursor-pointer shadow-lg"
        >
          Export Dashboard
        </button>
      </div>
    );
};
