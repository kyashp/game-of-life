'use client';

import { useState, useRef, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
// Import all functions from your data library
import {
    getChildcareFees,
    getKindergartenFees,
    getPrimarySchoolFees,
    getSecondarySchoolFees,
    getPostSecondaryFees,
    getUniversityFees,
    getBabyBonus,
    getCDAMatching,
    getQualifyingChildRelief,
    getMiscellaneousCosts,
    // getWorkingMotherChildRelief, // Removed
    // getGrandparentCaregiverRelief, // Removed
    getEdusaveContribution // Added
} from '../../lib/data.js'; // Assuming this path is correct

// Helper function to format currency ranges
const formatRange = (value) => {
    const lower = Math.round(value * 0.9); // Using a 10% range
    const upper = Math.round(value * 1.1);
    return `$${lower.toLocaleString()} - $${upper.toLocaleString()}`;
};

// Helper function to format currency
const formatCurrency = (value) => `$${Math.round(value).toLocaleString()}`;

// Helper to sum the values of a cost object
const sumMiscCost = (obj) => Object.values(obj).reduce((a, b) => a + b, 0);

// Helper to capitalize strings
const capitalize = (s) => {
    if (typeof s !== 'string') return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
}


export default function Insights() {
    const [numChildren, setNumChildren] = useState('');
    const [educationPath, setEducationPath] = useState('');
    const [error, setError] = useState('');
    const [showDashboard, setShowDashboard] = useState(false);
    
    const [loading, setLoading] = useState(false);
    const [calculations, setCalculations] = useState(null);
    
    const dashboardRef = useRef(null);

    useEffect(() => {
        // This effect runs when the user clicks "Generate Insights"
        if (!showDashboard || !numChildren || !educationPath) {
            return;
        }

        const calculateInsights = async () => {
            setLoading(true);
            setCalculations(null);

            try {
                const numChildrenInt = parseInt(numChildren);
                // Map dropdown value to data function key
                const eduPathKey = educationPath === 'junior college' ? 'jc' : 'polytechnic';
                
                // --- ASSUMPTIONS ---
                // As residency and realismLevel are not asked for in this form,
                // we'll use defaults based on the component's note ("tax residents")
                // and a standard scenario.
                const residency = 'citizen'; 
                const realismLevel = 'Realistic';

                // --- Stage Duration Constants ---
                const DURATION_NEWBORN = 1; // 0-1
                const DURATION_CHILDCARE = 3; // 1-3
                const DURATION_KINDERGARTEN = 3; // 4-6
                const DURATION_PRIMARY = 6;
                const DURATION_SECONDARY = 4;
                const DURATION_POST_SEC = eduPathKey === 'jc' ? 2 : 3;
                const DURATION_UNI = 4;
                const DURATION_TOTAL_LIFE = DURATION_NEWBORN + DURATION_CHILDCARE + DURATION_KINDERGARTEN + DURATION_PRIMARY + DURATION_SECONDARY + DURATION_POST_SEC + DURATION_UNI; // ~25 years

                // --- Calculate Costs (per child, for the *entire* stage) ---

                // 1. Education-related Fees
                const feeChildcare = (await getChildcareFees() * 12) * DURATION_CHILDCARE;
                const feeKindergarten = (getKindergartenFees()[residency] * 12) * DURATION_KINDERGARTEN;
                const feePrimary = (getPrimarySchoolFees(residency) * 12) * DURATION_PRIMARY;
                const feeSecondary = (getSecondarySchoolFees(residency) * 12) * DURATION_SECONDARY;
                const feePostSecondary = (await getPostSecondaryFees(eduPathKey, residency)) * DURATION_POST_SEC; // This fee is annual
                const feeUniversity = getUniversityFees(residency) * DURATION_UNI; // This fee is annual
                
                // 2. Miscellaneous Costs (per child, for the *entire* stage)
                //    getMiscellaneousCosts now returns an object (breakdown)
                const miscNebworn_breakdown = await getMiscellaneousCosts(0, realismLevel);
                const miscChildcare_breakdown = await getMiscellaneousCosts(2, realismLevel);
                const miscKindergarten_breakdown = await getMiscellaneousCosts(5, realismLevel);
                const miscPrimary_breakdown = await getMiscellaneousCosts(9, realismLevel);
                const miscSecondary_breakdown = await getMiscellaneousCosts(14, realismLevel);
                const miscPostSecondary_breakdown = await getMiscellaneousCosts(18, realismLevel);
                const miscUniversity_breakdown = await getMiscellaneousCosts(21, realismLevel);

                // Get total misc cost per stage (per child)
                const miscNebworn = (sumMiscCost(miscNebworn_breakdown) * 12) * DURATION_NEWBORN;
                const miscChildcare = (sumMiscCost(miscChildcare_breakdown) * 12) * DURATION_CHILDCARE;
                const miscKindergarten = (sumMiscCost(miscKindergarten_breakdown) * 12) * DURATION_KINDERGARTEN;
                const miscPrimary = (sumMiscCost(miscPrimary_breakdown) * 12) * DURATION_PRIMARY;
                const miscSecondary = (sumMiscCost(miscSecondary_breakdown) * 12) * DURATION_SECONDARY;
                const miscPostSecondary = (sumMiscCost(miscPostSecondary_breakdown) * 12) * DURATION_POST_SEC;
                const miscUniversity = (sumMiscCost(miscUniversity_breakdown) * 12) * DURATION_UNI;


                // 3. Total Costs by Stage (per child)
                const stageNewborn = miscNebworn; // Newborn has no "education" fee
                const stageChildcare = feeChildcare + miscChildcare;
                const stageKindergarten = feeKindergarten + miscKindergarten;
                const stagePrimary = feePrimary + miscPrimary;
                const stageSecondary = feeSecondary + miscSecondary;
                const stagePostSecondary = feePostSecondary + miscPostSecondary;
                const stageUniversity = feeUniversity + miscUniversity; // Using Uni fee for "Adulthood"

                // 4. Aggregate Totals (for *all* children)
                const totalEducationCosts = (
                    feeChildcare + feeKindergarten + feePrimary + feeSecondary + feePostSecondary + feeUniversity
                ) * numChildrenInt;
                
                const totalMiscCosts = (
                    miscNebworn + miscChildcare + miscKindergarten + miscPrimary + miscSecondary + miscPostSecondary + miscUniversity
                ) * numChildrenInt;

                const totalExpenditure = totalEducationCosts + totalMiscCosts;

                // 5. Calculate Benefits (for *all* children)
                // --- A: Calculate Cash Grants (Baby Bonus, CDA, Edusave) ---
                const cash_babyBonus = Array.from({ length: numChildrenInt }, (_, i) => getBabyBonus(i + 1)).reduce((a, b) => a + b, 0);
                const cash_cdaMatching = Array.from({ length: numChildrenInt }, (_, i) => getCDAMatching(i + 1)).reduce((a, b) => a + b, 0);
                
                // Edusave is from age 7-16
                const cash_edusavePrimary = getEdusaveContribution(7) * DURATION_PRIMARY; // 6 years
                const cash_edusaveSecondary = getEdusaveContribution(13) * DURATION_SECONDARY; // 4 years
                const cash_edusave = (cash_edusavePrimary + cash_edusaveSecondary) * numChildrenInt;

                // --- B: Calculate estimated *annual* Tax Reliefs ---
                const relief_cap_per_year = 80000;
                
                // QCR is per child. getQualifyingChildRelief(1) returns 4000.
                const annual_qcr = getQualifyingChildRelief(1) * numChildrenInt;
                
                // --- C: Estimate *lifetime value* of tax reliefs ---
                let total_tax_relief_value = 0;
                const tax_relief_years = 25; // Estimate 25 years of working
                
                for (let year = 1; year <= tax_relief_years; year++) {
                    let annual_reliefs = annual_qcr;
                    
                    // Apply the $80,000 cap
                    const capped_annual_relief = Math.min(annual_reliefs, relief_cap_per_year);
                    
                    // We sum the *capped* relief amount over the estimated lifetime
                    total_tax_relief_value += capped_annual_relief;
                }

                // --- D: Pro-rate the tax relief values for the pie chart ---
                // Only QCR is left as a tax relief
                const chart_qcr = total_tax_relief_value; // It's just the total capped QCR value

                // --- E. Final Total Reliefs (Grants + Capped Tax Reliefs) ---
                const totalReliefs = cash_babyBonus + cash_cdaMatching + cash_edusave + total_tax_relief_value;


                // --- Prepare Data for Charts ---

                // Bar Chart: Total Cost Breakdown by Stage
                const stageData = [
                    { stage: 'Newborn', cost: stageNewborn * numChildrenInt },
                    { stage: 'Childcare', cost: stageChildcare * numChildrenInt }, // Added Childcare
                    { stage: 'Kindergarten', cost: stageKindergarten * numChildrenInt },
                    { stage: 'Primary School', cost: stagePrimary * numChildrenInt },
                    { stage: 'Secondary School', cost: stageSecondary * numChildrenInt },
                    { stage: 'JC/Poly', cost: stagePostSecondary * numChildrenInt },
                    { stage: 'University', cost: stageUniversity * numChildrenInt }, // Renamed Adulthood
                ];

                // Bar Chart: Education Costs at each Stage
                const educationData = [
                    { stage: 'Childcare', cost: feeChildcare * numChildrenInt },
                    { stage: 'Kindergarten', cost: feeKindergarten * numChildrenInt },
                    { stage: 'Primary School', cost: feePrimary * numChildrenInt },
                    { stage: 'Secondary School', cost: feeSecondary * numChildrenInt },
                    { stage: 'JC/Poly', cost: feePostSecondary * numChildrenInt },
                    { stage: 'University', cost: feeUniversity * numChildrenInt },
                ];

                // Pie Chart: Breakdown of Total Expenditure
                const expenditureChartData = [
                    { name: 'Education', value: totalEducationCosts, color: '#FF8A80' },
                    { name: 'Miscellaneous', value: totalMiscCosts, color: '#FFB74D' }
                    // Note: Medical is included in Miscellaneous, so it's not broken out here
                ];

                // --- NEW: Pie Chart: Breakdown of Total Government Reliefs ---
                const reliefsChartData = [
                    { name: 'Baby Bonus Scheme', value: cash_babyBonus, color: '#FF8A80' },
                    { name: 'Child Development Account', value: cash_cdaMatching, color: '#7986CB' },
                    { name: 'Qualifying Child Relief', value: chart_qcr, color: '#5C6BC0' },
                    // { name: "Working Mother's Relief", value: chart_wmcr, color: '#F06292' }, // Removed
                    // { name: 'Grandparent Relief', value: chart_gcr, color: '#8E24AA' }, // Removed
                    { name: 'Edusave', value: cash_edusave, color: '#4DB6AC' },
                ];
                
                // Pie Chart: Breakdown of Miscellaneous Costs
                // Aggregate all breakdowns across all stages and all children
                const all_stage_breakdowns = [
                    { breakdown: miscNebworn_breakdown, duration: DURATION_NEWBORN },
                    { breakdown: miscChildcare_breakdown, duration: DURATION_CHILDCARE },
                    { breakdown: miscKindergarten_breakdown, duration: DURATION_KINDERGARTEN },
                    { breakdown: miscPrimary_breakdown, duration: DURATION_PRIMARY },
                    { breakdown: miscSecondary_breakdown, duration: DURATION_SECONDARY },
                    { breakdown: miscPostSecondary_breakdown, duration: DURATION_POST_SEC },
                    { breakdown: miscUniversity_breakdown, duration: DURATION_UNI }
                ];

                const aggregatedMiscBreakdown = {};
                for (const { breakdown, duration } of all_stage_breakdowns) {
                    for (const key in breakdown) {
                        if (key === 'cca' || key === 'textbooks') {
                            // Aggregate 'cca' and 'textbooks' into 'schoolSupplies'
                            if (!aggregatedMiscBreakdown['schoolSupplies']) {
                                aggregatedMiscBreakdown['schoolSupplies'] = 0;
                            }
                            aggregatedMiscBreakdown['schoolSupplies'] += (breakdown[key] * 12 * duration * numChildrenInt);
                        } else {
                            if (!aggregatedMiscBreakdown[key]) {
                                aggregatedMiscBreakdown[key] = 0;
                            }
                            // Add the monthly cost * 12 months * duration * numChildren
                            aggregatedMiscBreakdown[key] += (breakdown[key] * 12 * duration * numChildrenInt);
                        }
                    }
                }

                // Define colors for pie chart segments
                const miscColors = {
                    clothing: '#FF8A80',
                    diapers: '#7E57C2',
                    formula: '#FFB74D',
                    medical: '#4DB6AC',
                    toys: '#FFA726',
                    allowance: '#F06292',
                    enrichment: '#3F51B5',
                    transport: '#A1887F',
                    schoolSupplies: '#90CAF9', // Consolidated color for all school-related items
                    meals: '#FFCC80'
                };
                const defaultColor = '#9E9E9E';

                // Format for the pie chart
                const miscChartData = Object.keys(aggregatedMiscBreakdown)
                    .filter(key => aggregatedMiscBreakdown[key] > 0) // Only show items with cost
                    .map(key => ({
                        name: capitalize(key),
                        value: aggregatedMiscBreakdown[key],
                        color: miscColors[key] || defaultColor
                    }));


                // --- Set State ---
                setCalculations({
                    numChildren: numChildrenInt,
                    totalExpenditure,
                    totalReliefs,
                    totalMiscCosts,
                    totalEducationCosts,
                    stageData,
                    educationData,
                    expenditureChartData,
                    reliefsChartData,
                    miscChartData
                });

            } catch (err) {
                console.error("Error calculating insights:", err);
                setError('Error: Could not generate insights. Please try again.');
                setShowDashboard(false);
            } finally {
                setLoading(false);
                // Scroll to dashboard after calculations are done
                setTimeout(() => {
                    dashboardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            }
        };

        calculateInsights();

    }, [showDashboard, numChildren, educationPath]); // Re-run if these change and dashboard is shown

    const handleGenerateInsights = () => {
        if (!numChildren || !educationPath) {
            setError('Error: Please complete the required field');
            setShowDashboard(false);
            setCalculations(null);
        } else {
            setError('');
            setShowDashboard(true); // This will trigger the useEffect
        }
    };

    return (
        <div className="min-h-screen bg-[#FAF9F6] text-[#2D3142]">
            <div className="pt-20 pb-16 text-center">
                <h1 className="text-5xl font-bold mb-8">Insights</h1>

                <div className="bg-[#FFF9C4] rounded-lg border-l-4 border-[#FFA726] w-[800px] mx-auto p-5 mb-10">
                    <p className="text-lg leading-snug">
                        Note: Insights generates information based on the assumption that both parents are tax residents of Singapore (Citizens)
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
                    disabled={loading}
                    className="bg-[#00C853] text-white font-bold text-xl rounded-full w-72 h-16 flex items-center justify-center mx-auto mb-4
                                hover:bg-green-700 transition-colors duration-300 cursor-pointer disabled:bg-gray-400"
                >
                    {loading ? 'Generating...' : <>Generate Insights <span className="ml-2">→</span></>}
                </button>

                {error && <p className="text-[#E53935] text-lg mt-2">{error}</p>}
            </div>

            {/* --- Dashboard Section --- */}
            {showDashboard && (
                <div ref={dashboardRef} className="max-w-[1400px] mx-auto px-10 pb-20 mt-10">
                    {loading && (
                           <div className="text-center py-20">
                             <p className="text-2xl font-semibold">Generating your insights dashboard...</p>
                           </div>
                    )}

                    {!loading && calculations && (
                        <>
                            <h2 className="text-4xl font-bold mb-9">Insights Dashboard</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-9">
                                <SummaryCard label="Number of Children" value={calculations.numChildren} />
                                <SummaryCard label="Total Expenditure" value={formatRange(calculations.totalExpenditure)} valueColor="text-[#E53935]" />
                                <SummaryCard label="Total Government Reliefs" value={formatRange(calculations.totalReliefs)} valueColor="text-[#3F51B5]" />
                                <SummaryCard label="Total Miscellaneous Costs" value={formatRange(calculations.totalMiscCosts)} valueColor="text-gray-600" />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                                <ChartCard 
                                    title="Total Cost Breakdown by Stage of Growth" 
                                    data={calculations.stageData} 
                                    dataKey="cost"
                                    tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`}
                                    tooltipFormatter={(value) => formatCurrency(value)}
                                />
                                <ChartCard 
                                    title="Education Costs at each Stage of Growth" 
                                    data={calculations.educationData} 
                                    footerText={formatRange(calculations.totalEducationCosts)}
                                    dataKey="cost"
                                    tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`}
                                    tooltipFormatter={(value) => formatCurrency(value)}
                                />
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
                                <div className="flex flex-col gap-8">
                                    <PieChartCard 
                                        title="Breakdown of Total Expenditure" 
                                        data={calculations.expenditureChartData} 
                                        outerRadius={100} 
                                    />
                                    <PieChartCard 
                                        title="Breakdown of Miscellaneous Costs" 
                                        data={calculations.miscChartData} 
                                        outerRadius={100} 
                                    />
                                </div>
                                <div className="flex flex-col gap-8">
                                    <GovernmentReliefsPieChartCard 
                                        title="Breakdown of Total Government Reliefs" 
                                        data={calculations.reliefsChartData} 
                                    />
                                    <ExportSection calculations={calculations} numChildren={numChildren} educationPath={educationPath} />
                                </div>
                            </div>

                            <div className="flex items-center gap-6 mt-10">
                                <div className="bg-[#FFF9C4] rounded-lg border-l-4 border-[#FFA726] p-5 inline-block">
                                    <p className="text-lg text-[#00695C]">Note: For all visualisations, the median of the Cost Ranges are used.</p>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

// --- Re-usable Components ---

const SummaryCard = ({ label, value, valueColor }) => (
    <div className="bg-[#E8EAF6] rounded-2xl p-6 text-center h-full">
        <p className="text-lg font-semibold mb-4">{label}</p>
        <p className={`text-4xl font-bold ${valueColor || 'text-[#2D3142]'}`}>{value}</p>
    </div>
);

const ChartCard = ({ title, data, footerText, dataKey, tickFormatter, tooltipFormatter }) => (
    <div className="bg-[#E8EAF6] rounded-2xl p-8">
        <h3 className="text-xl font-semibold text-center mb-6">{title}</h3>
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 5, right: 20, left: 15, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="stage" angle={-45} textAnchor="end" interval={0} height={80} />
                <YAxis tickFormatter={tickFormatter} />
                <Tooltip formatter={tooltipFormatter} />
                <Bar dataKey={dataKey} radius={[6, 6, 0, 0]}>
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#FF8A80', '#7E57C2', '#FFB74D', '#4DB6AC', '#FFA726', '#F06292', '#3F51B5'][index % 7]} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
        {footerText && (
            <div className="text-center mt-5">
                <p className="text-lg font-semibold inline">Total Education Costs : </p>
                <p className="text-2xl font-bold text-[#00C853] inline">{footerText}</p>
            </div>
        )}
    </div>
);

// Helper to convert raw value data to percentage data for pie charts
const getPercentageData = (data) => {
    const total = data.reduce((acc, entry) => acc + entry.value, 0);
    if (total === 0) return data.map(entry => ({ ...entry, value: 0, percent: 0 }));
    
    return data.map(entry => ({
        ...entry,
        value: parseFloat(((entry.value / total) * 100).toFixed(1)), // now 'value' is percentage
        percent: (entry.value / total) // store original proportion
    }));
};


const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value, name }) => {
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
            {`${name} ${value}%`}
        </text>
    );
};

const GovernmentReliefsPieChartCard = ({ title, data }) => {
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        setChartData(getPercentageData(data));
    }, [data]);

    const renderWrappedLabel = (props) => {
        const { cx, cy, midAngle, outerRadius, value, name, percent } = props;

        // --- UPDATED: Do not render label for very small slices ---
        if (percent < 0.03) { // 3% threshold
            return null;
        }

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
                    {`${value}%`}
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
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value" // 'value' is now the percentage
                        label={renderWrappedLabel}
                        labelLine={false} // --- UPDATED: Set to false to hide all lines ---
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

const PieChartCard = ({ title, data, outerRadius = 120 }) => {
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        // Check if data is already percentages (like miscData) or needs conversion
        const total = data.reduce((acc, entry) => acc + entry.value, 0);
        // Use a tolerance for floating point comparison
        if (total === 0 || (total > 100.1 || total < 99.9)) { // It's raw data or all zeros
            setChartData(getPercentageData(data));
        } else { // It's already percentage data
            setChartData(data);
        }
    }, [data]);

    return (
        <div className="bg-[#E8EAF6] rounded-2xl p-8 h-full">
            <h3 className="text-xl font-semibold text-center mb-6">{title}</h3>
            <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={outerRadius}
                        fill="#8884d8"
                        dataKey="value"
                        label={renderCustomizedLabel}
                        labelLine={{ stroke: '#888', strokeWidth: 1 }}
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

const ExportSection = ({ calculations, numChildren, educationPath }) => {
    const [exportFormat, setExportFormat] = useState('CSV');

    const handleExport = () => {
        if (!calculations) return;

        const csvContent = [
            ['Insights Dashboard Export'],
            [''],
            ['Summary'],
            ['Number of Children', numChildren],
            ['Education Path', educationPath],
            ['Total Expenditure', `"${formatRange(calculations.totalExpenditure)}"`],
            ['Total Government Reliefs', `"${formatRange(calculations.totalReliefs)}"`],
            ['Total Miscellaneous Costs', `"${formatRange(calculations.totalMiscCosts)}"`],
            ['Total Education Costs', `"${formatRange(calculations.totalEducationCosts)}"`],
            [''],
            ['Cost Breakdown by Stage (Total for all children)'],
            ['Stage', 'Cost'],
            ...calculations.stageData.map(item => [item.stage, item.cost.toFixed(2)]),
            [''],
            ['Education Costs by Stage (Total for all children)'],
            ['Stage', 'Cost'],
            ...calculations.educationData.map(item => [item.stage, item.cost.toFixed(2)]),
            [''],
            ['Miscellaneous Cost Breakdown (Total for all children, all stages)'],
            ['Category', 'Cost'],
            // Updated to reflect the consolidated 'schoolSupplies'
            ...calculations.miscChartData.map(item => [item.name, item.value.toFixed(2)]), 
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `insights-dashboard-${numChildren}-children.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="bg-[#E8EAF6] rounded-2xl p-8 mt-[-1rem]">
            <div className="flex items-center justify-center mb-6">
                <h3 className="text-2xl font-semibold mr-4">Export Insights Dashboard as:</h3>
                <select
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value)}
                    className="bg-white border-2 border-[#2D3142] rounded-full w-48 h-14 px-4 text-lg appearance-none 
                                focus:outline-none focus:ring-2 focus:ring-[#6B5B95]"
                >
                    <option value="">CSV</option>
                    {/* <option value="PDF">PDF (Not implemented)</option> */}
                </select>
            </div>
            <button
                onClick={handleExport}
                className="bg-[#FF8A80] text-white font-bold text-xl rounded-full w-60 h-16 flex items-center justify-center mx-auto mb-4
                                hover:bg-red-500 transition-colors duration-300 cursor-pointer shadow-lg"
            >
                Export Insights Dashboard
            </button>
        </div>
    );
};

