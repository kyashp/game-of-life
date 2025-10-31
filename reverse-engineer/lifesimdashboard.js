import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, HelpCircle, ArrowLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function LifeSimDashboard() {
  const navigate = useNavigate();
  const [exportFormat, setExportFormat] = React.useState('CSV');

  const { data: sessions } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => base44.entities.SimulationSession.list('-updated_date', 1),
    initialData: [],
  });

  const { data: results } = useQuery({
    queryKey: ['results'],
    queryFn: () => base44.entities.SimulationResult.list('-updated_date', 1),
    initialData: [],
  });

  const latestSession = sessions && sessions.length > 0 ? sessions[0] : null;
  const latestResult = results && results.length > 0 ? results[0] : null;

  // Use data from session or result
  const householdSavings = latestSession?.householdSavingsBalance || latestResult?.finalHouseholdSavings || 10000;
  const totalExpenditure = latestSession?.totalExpenditure || latestResult?.totalExpenditure || 0;
  const totalReliefs = latestSession?.totalReliefs || latestResult?.totalReliefs || 0;
  const totalMiscCosts = totalExpenditure * 0.11;

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

  const handleExport = () => {
    const csvContent = [
      ['Life Sim Dashboard Export'],
      [''],
      ['Summary'],
      ['Household Savings Balance', householdSavings.toFixed(2)],
      ['Total Expenditure', totalExpenditure.toFixed(2)],
      ['Total Government Reliefs', totalReliefs.toFixed(2)],
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

  const formatCurrency = (value) => `$${Math.round(value).toLocaleString()}`;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate(createPageUrl('LifeSim'))}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Simulation
          </Button>
          <h1 className="text-4xl font-bold">Life Sim Dashboard</h1>
        </div>
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
          <p className="text-3xl font-bold text-blue-600">{formatCurrency(totalReliefs)}</p>
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