'use client';

import { useState, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const costBreakdownData = [
  { stage: 'Newborn', cost: 10 },
  { stage: 'Kindergarten', cost: 13 },
  { stage: 'Primary School', cost: 9 },
  { stage: 'Secondary School', cost: 15 },
  { stage: 'JC/Poly', cost: 18 },
  { stage: 'Adulthood', cost: 20 },
];

const educationCostsData = [
  { stage: 'Childcare', cost: 8 },
  { stage: 'Kindergarten', cost: 10 },
  { stage: 'Primary School', cost: 7 },
  { stage: 'Secondary School', cost: 12 },
  { stage: 'JC/Poly', cost: 15 },
  { stage: 'University', cost: 18 },
];

const expenditureData = [
  { name: 'Education', value: 55.6, color: '#FF8A80' },
  { name: 'Medical', value: 33.3, color: '#7E57C2' },
  { name: 'Miscellaneous', value: 11.1, color: '#FFB74D' }
];

const miscData = [
  { name: 'Clothing', value: 35.3, color: '#FF8A80' },
  { name: 'Enrichment', value: 35.3, color: '#7E57C2' },
  { name: 'Allowance', value: 29.4, color: '#FFB74D' }
];

const reliefsData = [
  { name: 'Baby Bonus Scheme', value: 23.8, color: '#FF8A80' },
  { name: 'Childcare Subsidy', value: 4.8, color: '#F06292' },
  { name: 'Grandparent Caregiver Relief', value: 21.4, color: '#8E24AA' },
  { name: 'Working Mother\'s Child Relief', value: 9.5, color: '#7E57C2' },
  { name: 'Qualifying Child Relief', value: 19, color: '#5C6BC0' },
  { name: 'Medisave Grants', value: 4.8, color: '#FFB74D' },
  { name: 'Child Development Account', value: 14.3, color: '#7986CB' }
];

export default function Insights() {
  const [numChildren, setNumChildren] = useState('');
  const [educationPath, setEducationPath] = useState('');
  const [error, setError] = useState('');
  const [showDashboard, setShowDashboard] = useState(false);
  const dashboardRef = useRef(null);

  const handleGenerateInsights = () => {
    if (!numChildren || !educationPath) {
      setError('Error: Please complete the required field');
      setShowDashboard(false);
    } else {
      setError('');
      setShowDashboard(true);
      setTimeout(() => {
        dashboardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#2D3142]">
      <div className="pt-20 pb-16 text-center">
        <h1 className="text-5xl font-bold mb-8">Insights</h1>

        <div className="bg-[#FFF9C4] rounded-lg border-l-4 border-[#FFA726] w-[800px] mx-auto p-5 mb-10">
          <p className="text-lg leading-snug">
            Note: Insights generates information based on the assumption that both parents are tax residents of Singapore
          </p>
        </div>

        <div className="bg-[#F4C4C4] rounded-3xl w-[480px] mx-auto p-8 mb-8">
          <div className="flex justify-between items-start gap-6">
            <div>
              <label htmlFor="numChildren" className="block text-[#6B5B95] text-lg font-semibold mb-2">
                Number of Children
              </label>
              <select
                id="numChildren"
                value={numChildren}
                onChange={(e) => setNumChildren(e.target.value)}
                className="bg-white border-2 border-[#2D3142] rounded-full w-[200px] h-12 px-4 text-lg appearance-none 
                           focus:outline-none focus:ring-2 focus:ring-[#6B5B95]"
              >
                <option value="" disabled>Select</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
              </select>
            </div>

            <div>
              <label htmlFor="educationPath" className="block text-[#6B5B95] text-lg font-semibold mb-2">
                Education path
              </label>
              <select
                id="educationPath"
                value={educationPath}
                onChange={(e) => setEducationPath(e.target.value)}
                className="bg-white border-2 border-[#2D3142] rounded-full w-[200px] h-12 px-4 text-lg appearance-none 
                           focus:outline-none focus:ring-2 focus:ring-[#6B5B95]"
              >
                <option value="" disabled>Select</option>
                <option value="junior college">Junior College</option>
                <option value="polytechnic">Polytechnic</option>
              </select>
            </div>
          </div>
        </div>

        <button
          onClick={handleGenerateInsights}
          className="bg-[#00C853] text-white font-bold text-xl rounded-full w-72 h-16 flex items-center justify-center mx-auto mb-4
                     hover:bg-green-700 transition-colors duration-300 cursor-pointer"
        >
          Generate Insights <span className="ml-2">→</span>
        </button>

        {error && <p className="text-[#E53935] text-lg mt-2">{error}</p>}
      </div>

      {showDashboard && (
        <div ref={dashboardRef} className="max-w-[1400px] mx-auto px-10 pb-20 mt-10">
          <h2 className="text-4xl font-bold mb-9">Insights Dashboard</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-9">
            <SummaryCard label="Number of Children" value={numChildren} />
            <SummaryCard label="Total Expenditure" value="$10,000 - $20,000" valueColor="text-[#E53935]" />
            <SummaryCard label="Total Government Reliefs" value="$10,000 - $20,000" valueColor="text-[#3F51B5]" />
            <SummaryCard label="Total Miscellaneous Costs" value="$10,000 - $20,000" valueColor="text-gray-600" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            <ChartCard title="Total Cost Breakdown by Stage of Growth" data={costBreakdownData} />
            <ChartCard title="Education Costs at each Stage of Growth" data={educationCostsData} footer />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
            <div className="flex flex-col gap-8">
              <PieChartCard title="Breakdown of Total Expenditure" data={expenditureData} outerRadius={100} />
              <PieChartCard title="Breakdown of Miscellaneous Costs" data={miscData} outerRadius={100} />
            </div>
            <div className="flex flex-col gap-8">
              <GovernmentReliefsPieChartCard title="Breakdown of Total Government Reliefs" data={reliefsData} />
              <ExportSection />
            </div>
          </div>

          <div className="flex items-center gap-6 mt-10">
            <div className="bg-[#FFF9C4] rounded-lg border-l-4 border-[#FFA726] p-5 inline-block">
              <p className="text-lg text-[#00695C]">Note: For all visualisations, the median of the Cost Ranges are used.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const SummaryCard = ({ label, value, valueColor }) => (
  <div className="bg-[#E8EAF6] rounded-2xl p-6 text-center">
    <p className="text-lg font-semibold mb-4">{label}</p>
    <p className={`text-4xl font-bold ${valueColor || 'text-[#2D3142]'}`}>{value}</p>
  </div>
);

const ChartCard = ({ title, data, footer }) => (
  <div className="bg-[#E8EAF6] rounded-2xl p-8">
    <h3 className="text-xl font-semibold text-center mb-6">{title}</h3>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="stage" angle={-45} textAnchor="end" interval={0} height={80} />
        <YAxis />
        <Tooltip />
        <Bar dataKey="cost" radius={[6, 6, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={['#FF8A80', '#7E57C2', '#FFB74D', '#4DB6AC', '#FFA726', '#F06292'][index % 6]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
    {footer && (
      <div className="text-center mt-5">
        <p className="text-lg font-semibold inline">Total Education Costs : </p>
        <p className="text-2xl font-bold text-[#00C853] inline">$10,000 - $20,000</p>
      </div>
    )}
  </div>
);

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
      <h3 className="text-xl font-semibold text-center mb-6">{title}</h3>
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
          <Tooltip formatter={(value) => `${value}%`} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

const PieChartCard = ({ title, data, outerRadius = 120 }) => (
  <div className="bg-[#E8EAF6] rounded-2xl p-8 h-full">
    <h3 className="text-xl font-semibold text-center mb-6">{title}</h3>
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={outerRadius}
          fill="#8884d8"
          dataKey="value"
          label={renderCustomizedLabel}
          labelLine={{ stroke: '#888', strokeWidth: 1 }}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `${value}%`} />
      </PieChart>
    </ResponsiveContainer>
  </div>
);

const ExportSection = () => (
  <div className="bg-[#E8EAF6] rounded-2xl p-8 mt-[-1rem]">
    <div className="flex items-center justify-center mb-6">
      <h3 className="text-2xl font-semibold mr-4">Export Insights Dashboard as:</h3>
      <select
        className="bg-white border-2 border-[#2D3142] rounded-full w-48 h-14 px-4 text-lg appearance-none 
                   focus:outline-none focus:ring-2 focus:ring-[#6B5B95]"
      >
        <option>PDF</option>
        <option>CSV</option>
      </select>
    </div>
    <button
      className="bg-[#FF8A80] text-white font-bold text-xl rounded-full w-60 h-16 flex items-center justify-center mx-auto mb-4
                 hover:bg-red-500 transition-colors duration-300 cursor-pointer shadow-lg"
    >
      Export Insights Dashboard
    </button>
  </div>
);
