'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { GuestStorageManager } from '../utils/guestStorage'; // Import GuestStorageManager
import {
  getChildcareFees,
  getKindergartenFees,
  getPrimarySchoolFees,
  getSecondarySchoolFees,
  getPostSecondaryFees,
  getUniversityFees,
  getChildcareSubsidy,
  getBabyBonus,
  getCDAMatching,
  getEdusaveContribution,
  getMiscellaneousCosts,
  getQualifyingChildRelief, // Import tax reliefs
  getWorkingMotherChildRelief, // Import tax reliefs
  calculateTax, // --- NEW: Import calculateTax ---
} from '../lib/data.js'; // Assuming data.js is in '@/lib/data.js'

// --- NEW FIREBASE IMPORTS ---
import { auth, db } from '../lib/firebase'; // Adjust this path if needed
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
// ------------------------------

// --- UI Components (Unchanged) --

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

// --- Helper Functions (Re-implemented) ---

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-SG', {
        style: 'currency',
        currency: 'SGD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

// --- FIX: Updated Growth Stages (Ends at 22) ---
const MAX_AGE_MONTHS_FINAL = 264; // 22 years * 12

const getGrowthStage = (ageMonths) => {
    if (ageMonths < 24) return 'Newborn'; // 0-2Y
    if (ageMonths < 72) return 'Kindergarten'; // 2-6Y
    if (ageMonths < 144) return 'Primary School'; // 7-12Y
    if (ageMonths < 192) return 'Secondary School'; // 13-16Y
    if (ageMonths < 216) return 'JC/Poly'; // 17-18Y (Covers 2-year JC)
    return 'University'; // 19-22Y
};

// Gets the specific education stage for cost calculation
const getEducationStage = (ageMonths, isJCStudent) => {
    if (ageMonths < 24) return 'Newborn';
    if (ageMonths < 72) return 'Kindergarten'; // Use Kindergarten for ages 2-6
    if (ageMonths < 144) return 'Primary School';
    if (ageMonths < 192) return 'Secondary School';
    
    if (isJCStudent) {
      if (ageMonths < 216) return 'JC'; // 17-18Y
    } else {
      // Poly path is 3 years, 17-19Y
      if (ageMonths < 228) return 'Poly'; // 17-19Y
    }
    
    // University now starts at 18 (JC) or 19 (Poly) and ends at 22
    return 'University';
};

/**
 * Calculates monthly costs using data.js
 */
const calculateMonthlyCosts = async (ageMonths, profile, isJCStudent) => {
    const ageYears = Math.floor(ageMonths / 12);
    const stage = getEducationStage(ageMonths, isJCStudent);
    
    // --- FIX: Translate profile realism to API realism ---
    const realismLevel = profile.Realism_Level || 'Optimistic';
    let apiRealism = 'Realistic'; // Default
    if (realismLevel === 'Optimistic') apiRealism = 'Optimistic';
    if (realismLevel === 'Pessimistic') apiRealism = 'Conservative';
    if (realismLevel === 'Neutral') apiRealism = 'Realistic';
    // -----------------------------------------------------
    
    // Determine residency (Citizen > PR > Foreigner)
    const getResidency = (r) => (r === 'Singaporean' ? 'citizen' : 'pr');
    const residency = getResidency(profile.Father_Residency || profile.Mother_Residency);
    const householdIncome = (profile.Father_Gross_Monthly_Income || 0) + (profile.Mother_Gross_Monthly_Income || 0);

    let educationCost = 0;
    let subsidy = 0;

    switch (stage) {
        // --- FIX: Use getChildcareFees for Kindergarten stage (ages 2-6) ---
        case 'Kindergarten':
            educationCost = await getChildcareFees(); // This is an avg monthly fee
            subsidy = getChildcareSubsidy(householdIncome);
            break;
        case 'Primary School':
            educationCost = getPrimarySchoolFees(residency);
            break;
        case 'Secondary School':
            educationCost = getSecondarySchoolFees(residency);
            break;
        case 'JC':
            educationCost = (await getPostSecondaryFees('jc', residency)) / 12; // API returns annual
            break;
        case 'Poly':
            educationCost = (await getPostSecondaryFees('poly', residency)) / 12; // API returns annual
            break;
        case 'University':
            educationCost = getUniversityFees(residency) / 12; // API returns annual
            break;
    }
    
    const finalEducationCost = Math.max(0, educationCost - subsidy);

    // Get miscellaneous costs object using the corrected realism level
    const miscCostObject = await getMiscellaneousCosts(ageYears, apiRealism);
    
    let medicalCost = 0;
    let otherMiscCost = 0;

    // Separate medical from other misc costs
    for (const key in miscCostObject) {
        if (key === 'medical') {
            medicalCost = miscCostObject[key];
        } else {
            otherMiscCost += miscCostObject[key];
        }
    }

    return {
        total: finalEducationCost + medicalCost + otherMiscCost,
        education: finalEducationCost,
        medical: medicalCost,
        miscellaneous: otherMiscCost,
        miscBreakdown: miscCostObject // Pass full object for detailed tracking
    };
};

/**
 * Generates cost events using data.js
 */
// --- FIX: Now returns an ARRAY of events ---
const generateCostEvent = async (ageMonths, profile, isJCStudent) => {
    const events = []; // --- NEW: Event array

    // Helper function to get residency and income
    const getResidency = (r) => (r === 'Singaporean' ? 'citizen' : 'pr');
    const residency = getResidency(profile.Father_Residency || profile.Mother_Residency);
    const householdIncome = (profile.Father_Gross_Monthly_Income || 0) + (profile.Mother_Gross_Monthly_Income || 0);

    // --- STAGE-BASED EVENTS (PRIORITY ORDER) ---

    // EVENT 1: Baby Bonus (Age 1 month)
    if (ageMonths === 1) {
        const bonus = getBabyBonus(1); // Assuming 1st child
        const cda = getCDAMatching(1); // Assuming 1st child
        events.push({
            title: "Stage: Newborn - Baby Bonus Payout",
            description: `Congratulations! You received the initial Baby Bonus cash gift (${formatCurrency(bonus)}) and the Child Development Account (CDA) First Step Grant (${formatCurrency(cda)}).`,
            type: "notification",
            category: "birth",
            totalBenefits: bonus + cda,
            totalCost: 0,
            requiresDecision: false,
            benefitBreakdown: {
                'Baby Bonus Scheme': bonus,
                'Child Development Account': cda
            }
        });
    }

    // EVENT 2: Kindergarten Start (Age 2 / 24 months)
    if (ageMonths === 24) { 
        const kFees = getKindergartenFees(); 
        const subsidy = getChildcareSubsidy(householdIncome);
        const fee = kFees[residency] || kFees.citizen;
         events.push({
            title: "Stage Change: Kindergarten (Ages 2-6)",
            description: `Your child is now 2 and entering the Kindergarten/Childcare stage. Based on your profile, the estimated monthly fee is ${formatCurrency(fee)} with a subsidy of ${formatCurrency(subsidy)}.`,
            type: "notification", category: "education",
            totalBenefits: 0, totalCost: 0, requiresDecision: false,
        });
    }

    // EVENT 3: Enrichment Class (Age 3 / 36 months)
    if (ageMonths === 36) {
        events.push({
            title: "Choose an Enrichment Class",
            description: "Your child is 3! It's a popular time to start enrichment classes. This is a one-time sign-up and materials fee.",
            type: "decision", category: 'education',
            totalBenefits: 0,
            options: [
                { label: "Brain Training Class", description: "Focuses on cognitive skills.", value: 'brain', cost: 800 },
                { label: "Swimming Lessons", description: "Essential life skill.", value: 'swim', cost: 450 },
                { label: "No Classes For Now", description: "Wait until they are older.", value: 'none', cost: 0 },
            ],
            requiresDecision: true,
        });
    }

    // EVENT 4: Primary School Path Decision (Age 6 / 72 months)
    if (ageMonths === 72) {
        events.push({
            title: "Stage Change: Primary School (Ages 7-12)",
            description: "Your child is starting Primary School. Decide on the level of extra enrichment and tuition you will commit to.",
            type: "decision", category: 'education',
            totalBenefits: 0,
            options: [
                { label: "High Commitment", description: "One-time cost for materials and deposits.", value: 'high_tuition', cost: 2000 },
                { label: "Low Commitment", description: "One-time cost for basic enrichment.", value: 'low_tuition', cost: 500},
            ],
            requiresDecision: true,
        });
    }
    
    // EVENT 5: Edusave (Age 7)
    if (ageMonths === 84) { // 7 years
        const contribution = getEdusaveContribution(7);
        if (contribution > 0) {
             events.push({
                title: "Edusave Contribution",
                description: `Your child is now 7 and has received an Edusave contribution of ${formatCurrency(contribution)}.`,
                type: "notification", category: "education",
                totalBenefits: contribution, totalCost: 0, requiresDecision: false,
                benefitBreakdown: { 'Edusave': contribution }
            });
        }
    }

    // EVENT 6: School Gear (Age 8 / 96 months)
    if (ageMonths === 96) {
        events.push({
            title: "Upgrade School Gear",
            description: "Your child needs a personal learning device for school. Choose which to get.",
            type: "decision", category: 'education',
            totalBenefits: 0,
            options: [
                { label: "High-End Laptop", description: "Powerful, will last many years.", value: 'laptop', cost: 1800 },
                { label: "Standard Tablet", description: "Meets all school requirements.", value: 'tablet', cost: 650 },
            ],
            requiresDecision: true,
        });
    }

    // EVENT 7: Secondary School Start (Age 12 / 144 months)
    // --- FIX: Combined Edusave (Age 13) event here to prevent conflict ---
    if (ageMonths === 144) { 
         const fee = getSecondarySchoolFees(residency);
         const contribution = getEdusaveContribution(13); // Get Age 13 contribution
         events.push({
            title: "Stage Change: Secondary School (Ages 13-16)",
            description: `Your child is now 13 and entering Secondary School. The estimated monthly fee is ${formatCurrency(fee)}. 
They have also received an Edusave contribution of ${formatCurrency(contribution)}.`,
            type: "notification", category: "education",
            totalBenefits: contribution, // Add edusave benefit
            totalCost: 0, 
            requiresDecision: false,
            benefitBreakdown: { 'Edusave': contribution }
        });
    }

    // EVENT 8: CCA Choice (Age 13 / 156 months)
    if (ageMonths === 156) {
        events.push({
            title: "Choose a CCA Type",
            description: "Your child is choosing their main CCA. This involves one-time fees for equipment, uniforms, or registration.",
            type: "decision", category: 'education',
            totalBenefits: 0,
            options: [
                { label: "Competitive Sports", description: "E.g., Sailing, Golf. High equipment/coaching costs.", value: 'high_cca', cost: 2500 },
                { label: "Uniformed Group", description: "E.g., NCC, Scouts. Cost for uniforms and camp gear.", value: 'mid_cca', cost: 400 },
                { label: "School Club", description: "E.g., Chess Club, Media. Low one-time cost.", value: 'low_cca', cost: 100 },
            ],
            requiresDecision: true,
        });
    }

    // EVENT 9: School Trip (Age 15 / 180 months)
    if (ageMonths === 180) {
        events.push({
            title: "Overseas School Trip",
            description: "The school is organizing an optional overseas immersion trip to a regional country.",
            type: "decision", category: 'education',
            totalBenefits: 0,
            options: [
                { label: "Accept Trip", description: "A great experience for your child.", value: 'go_trip', cost: 1200 },
                { label: "Decline Trip", description: "Save the money for other things.", value: 'no_trip', cost: 0 },
            ],
            requiresDecision: true,
        });
    }

    // EVENT 10: Post-Secondary Path Decision (Age 16 / 192 months)
    if (ageMonths === 192) {
         const jcFee = (await getPostSecondaryFees('jc', residency)) / 12;
         const polyFee = (await getPostSecondaryFees('poly', residency)) / 12;
        
         events.push({
            title: "Stage Change: Post-Secondary (Ages 17-19)",
            description: `Your child has completed Secondary School. Please decide their education path.`,
            type: "decision", category: 'education',
            totalBenefits: 0,
            options: [
                { label: "Junior College (JC)", description: `2 years. Est. ${formatCurrency(jcFee)}/month.`, value: true, cost: 0 },
                { label: "Polytechnic (Poly)", description: `3 years. Est. ${formatCurrency(polyFee)}/month.`, value: false, cost: 0},
            ],
            requiresDecision: true,
        });
    }

    // EVENT 11: University Start
    const uniStartDate = isJCStudent ? 216 : 228; 
    if (ageMonths === uniStartDate) {
        const fee = getUniversityFees(residency);
        const duration = isJCStudent ? 4 : 3; // 4 years for JC path, 3 for Poly
        events.push({
            title: "Stage Change: University",
            description: `Your child is now entering University for ${duration} years. The estimated annual tuition fee is ${formatCurrency(fee)}.`,
            type: "notification", category: "education",
            totalBenefits: 0, totalCost: 0, requiresDecision: false,
        });
    }

    // EVENT 12: Exchange Program (Age 20 / 240 months)
    if (ageMonths === 240) {
        events.push({
            title: "University Exchange Program",
            description: "Your child has an opportunity for a 6-month overseas exchange program. This will replace a local internship.",
            type: "decision", category: 'education',
            totalBenefits: 0,
            options: [
                { label: "Approve Exchange", description: "One-time cost for flights, housing, and living expenses.", value: 'go_exchange', cost: 10000 },
                { label: "Local Internship", description: "Gain work experience locally.", value: 'no_exchange', cost: 0 },
            ],
            requiresDecision: true,
        });
    }
    
    // --- FINAL EVENT: ANNUAL TAX (Lowest Priority) ---
    // --- FIX: This logic is now correct ---
    if (ageMonths > 0 && ageMonths % 12 === 0) {
        const qcr = getQualifyingChildRelief(1); // Assuming 1st child
        const wmcr = profile.Mother_Gross_Monthly_Income > 0 ? getWorkingMotherChildRelief(1) : 0;
        
        // **Calculate tax based on GROSS income**
        const fatherAnnualGross = (profile.Father_Gross_Monthly_Income || 0) * 12;
        const motherAnnualGross = (profile.Mother_Gross_Monthly_Income || 0) * 12;

        // Calculate tax *before* reliefs
        const taxWithoutReliefs_Father = await calculateTax(fatherAnnualGross);
        const taxWithoutReliefs_Mother = await calculateTax(motherAnnualGross);
        const totalTaxWithoutReliefs = taxWithoutReliefs_Father + taxWithoutReliefs_Mother;

        // Apply reliefs correctly
        const fatherTaxable = Math.max(0, fatherAnnualGross - (qcr / 2));
        const motherTaxable = Math.max(0, motherAnnualGross - (qcr / 2) - wmcr);

        // Calculate final tax owed
        const finalTax_Father = await calculateTax(fatherTaxable);
        const finalTax_Mother = await calculateTax(motherTaxable);
        const totalTaxPaid = finalTax_Father + finalTax_Mother;
        
        // Calculate the savings
        const totalTaxSavings = totalTaxWithoutReliefs - totalTaxPaid;
        // Re-calculate savings breakdown for display
        const taxSavingFromQCR = (taxWithoutReliefs_Father - finalTax_Father) + (taxWithoutReliefs_Mother - (await calculateTax(Math.max(0, motherAnnualGross - wmcr))));
        const taxSavingFromWMCR = totalTaxSavings - taxSavingFromQCR;

        let description = `It's the end of the year. Your annual income tax is calculated:

Total Gross Annual Income: ${formatCurrency(fatherAnnualGross + motherAnnualGross)}
- Tax Reliefs (QCR, WMCR): ${formatCurrency(qcr + wmcr)}
= Final Taxable Income: ${formatCurrency(fatherTaxable + motherTaxable)}

Total Tax Owed: ${formatCurrency(totalTaxPaid)}
(You saved ${formatCurrency(totalTaxSavings)} in taxes due to reliefs)`;
        
        events.push({
            title: "Annual Tax Calculation",
            description: description,
            type: "notification", 
            category: "financial",
            totalBenefits: 0, // --- FIX: No cash benefit ---
            totalCost: totalTaxPaid, // The tax owed is the cost
            requiresDecision: false,
            // --- FIX: This tracks the *tax savings* for the dashboard ---
            taxReliefBreakdown: { 
                'Qualifying Child Relief (Tax Savings)': taxSavingFromQCR,
                "Working Mother's Child Relief (Tax Savings)": taxSavingFromWMCR 
            },
            costBreakdown: { // To track tax cost
                'Income Tax': totalTaxPaid
            }
        });
    }
    
    return events; // --- NEW: Return array ---
};


// --- Modal Component (Updated) ---

function CostEventModal({event, onAcknowledge, onDecision}) {
  if (!event) return null;

  // --- FIX: Net impact is now correctly just the cost or benefit ---
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
          {/* FIX: Changed text color from #555 to #333 and added pre-wrap */}
          <p style={{ color: '#333', marginBottom: '20px', whiteSpace: 'pre-wrap' }}>
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
                      {/* --- FIX: Added explicit dark color to label --- */}
                      <div style={{ fontWeight: 'bold', color: '#2D3142' }}>{option.label}</div>
                      <div style={{ fontSize: '12px', color: '#333' }}>{option.description}</div>
                    </div>
                    {/* --- FIX: Changed cost color to black --- */}
                    {option.cost !== undefined && (
                      <span style={{ color: '#333', fontWeight: 'bold', marginLeft: '10px' }}>
                        {option.cost > 0 ? `-${formatCurrency(option.cost)}` : formatCurrency(0)}
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

// --- Main Simulation Component (Updated Logic) ---

export default function LifeSim({ onSimulationEnd }) {
  const [profile, setProfile] = useState(null);
  const [status, setStatus] = useState('stopped'); // 'stopped', 'running', 'paused'
  const [speed, setSpeed] = useState(1); // Default speed 1x
  const [ageMonths, setAgeMonths] = useState(0);
  const [householdSavings, setHouseholdSavings] = useState(0);
  const [edusave, setEdusave] = useState(0);
  const [totalExpenditure, setTotalExpenditure] = useState(0);
  const [totalBenefits, setTotalBenefits] = useState(0);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [isJCStudent, setIsJCStudent] = useState(true); // Default to JC
  const [simulationEnded, setSimulationEnded] = useState(false);

  // --- NEW: Event Queue ---
  const [eventQueue, setEventQueue] = useState([]);

  // Detailed tracking for dashboard
  const [stageCosts, setStageCosts] = useState({});
  const [educationCosts, setEducationCosts] = useState({});
  const [medicalCosts, setMedicalCosts] = useState({});
  const [miscCosts, setMiscCosts] = useState({});
  const [reliefs, setReliefs] = useState({});
  const [decisionsMade, setDecisionsMade] = useState([]); // --- NEW: Track decisions ---
  const [taxCosts, setTaxCosts] = useState(0); // --- NEW: Track tax ---

  // --- FIX: Replaced simple GuestStorage check with full Auth logic ---
  // 1. Load Profile on Mount
  useEffect(() => {
    const loadProfile = async () => {
      // Listen for auth state changes
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          // --- USER IS LOGGED IN (FIREBASE) ---
          console.log("User is logged in, fetching profile from Firebase...");
          try {
            const profilesCollectionRef = collection(db, 'profiles');
            const q = query(profilesCollectionRef, where('userId', '==', user.uid));
            const querySnapshot = await getDocs(q);
            
            if (!querySnapshot.empty) {
              const loadedProfileDoc = querySnapshot.docs[0];
              const loadedProfileData = { id: loadedProfileDoc.id, ...loadedProfileDoc.data() };
              
              setProfile(loadedProfileData);
              setHouseholdSavings(loadedProfileData.Family_Savings || 0);
              console.log('Loaded Firebase profile:', loadedProfileData);
              
              // Also save to guest storage to sync profile page
              GuestStorageManager.saveProfile(loadedProfileData); 
            } else {
              console.error("No profile found in Firebase for this user. Please visit the Profile page to create one.");
              // You might want to alert the user or redirect them
              alert("No profile found. Please create one on the Profile page.");
            }
          } catch (error) {
            console.error("Error loading user profile from Firebase:", error);
          }
        } else {
          // --- USER IS GUEST (GUEST STORAGE) ---
          console.log("User is guest, fetching profile from guest storage...");
          const loadedProfile = GuestStorageManager.getProfile();
          if (loadedProfile) {
            setProfile(loadedProfile);
            setHouseholdSavings(loadedProfile.Family_Savings || 0);
            console.log('Loaded guest profile:', loadedProfile);
          } else {
            console.error("No profile found in guest storage.");
            // Alert or redirect user to profile page
            alert("No profile found. Please create one on the Profile page.");
          }
        }
      });
      // Return the unsubscribe function to clean up the listener
      return () => unsubscribe();
    };
    
    loadProfile();
  }, []); // Empty dependency array, so it runs once on mount
  
  // 1.5 Pre-fetch Poly fee to warm cache and prevent lag
  useEffect(() => {
    // Call once on mount. 'citizen' is a safe default.
    getPostSecondaryFees('poly', 'citizen'); 
  }, []);

  // --- FIX: Use new simplified MAX_AGE ---
  const MAX_AGE_MONTHS = MAX_AGE_MONTHS_FINAL;
  
  const ageYears = Math.floor(ageMonths/12);
  const ageRemainingMonths = ageMonths % 12;
  const currentStage = getGrowthStage(ageMonths);

  // 2. Simulation end logic
  const endSimulation = useCallback((ranOutOfMoney = false) => { 
    setStatus('stopped');
    setSimulationEnded(true);
    console.log('Simulation Ended.', householdSavings);

    // --- Alert if simulation ended due to no money ---
    if (ranOutOfMoney) {
        alert("Simulation ended: Your household savings ran out, indicating an inability to cover the ongoing costs.");
    }
    // ----------------------------------------------------

    if (onSimulationEnd) {
      onSimulationEnd({
        // Pass all data to dashboard
        profile: profile,
        isJCStudent: isJCStudent,
        finalSavings: householdSavings,
        totalExpenditure: totalExpenditure,
        totalBenefits: totalBenefits,
        finalAgeMonths: ageMonths,
        stageCosts: stageCosts,
        educationCosts: educationCosts,
        medicalCosts: medicalCosts,
        miscCosts: miscCosts,
        reliefs: reliefs,
        decisionsMade: decisionsMade, // --- NEW: Pass decisions ---
        taxCosts: taxCosts, // --- NEW: Pass tax costs ---
      });
    }
  }, [householdSavings, totalExpenditure, totalBenefits, ageMonths, onSimulationEnd, profile, isJCStudent, stageCosts, educationCosts, medicalCosts, miscCosts, reliefs, decisionsMade, taxCosts]); // Added decisionsMade & taxCosts

  // 3. Event Checker
  useEffect(() => {
    // --- FIX: This hook now handles the event queue ---
    if (!profile || currentEvent !== null || simulationEnded) return;

    // If queue is empty, check for new events
    if (eventQueue.length === 0) {
      const checkForEvents = async() => {
          const events = await generateCostEvent(ageMonths, profile, isJCStudent); 

          if(events.length > 0) {
              setStatus('paused'); 
              setCurrentEvent(events[0]); // Set first event
              setEventQueue(events.slice(1)); // Put rest in queue
          }
      };

      if (ageMonths > 0) { 
         checkForEvents();
      }
    }
    
  }, [ageMonths, profile, simulationEnded, isJCStudent, currentEvent, eventQueue]); // Now depends on currentEvent and eventQueue

  // 4. Simulation Loop (Main logic)
  useEffect(() => {
    if (status !== 'running' || currentEvent !== null || simulationEnded || !profile) return;

    const effectiveSpeed = Math.max(0.1, parseFloat(speed));
    const intervalDuration = 1000 / effectiveSpeed;

    const interval = setInterval(async () => {
      // Get costs from data.js
      const costs = await calculateMonthlyCosts(ageMonths, profile, isJCStudent);
      const monthlyCost = costs.total;
      const stage = getGrowthStage(ageMonths);
      
      const newAge = ageMonths + 1;
      
      // --- FIX: Use Disposable Income if available, else Gross ---
      const fatherIncome = profile.Father_Disposable_Income || profile.Father_Gross_Monthly_Income || 0;
      const motherIncome = profile.Mother_Disposable_Income || profile.Mother_Gross_Monthly_Income || 0;
      const monthlyIncome = fatherIncome + motherIncome;
      // ------------------------------------------------------------

      // --- Update Totals ---
      setTotalExpenditure(prev => prev + monthlyCost);
      setHouseholdSavings(prev => {
        const newSavings = prev + monthlyIncome - monthlyCost;
        // --- CONSOLE LOG ---
        console.log(`Month ${ageMonths}: Savings ${prev.toFixed(0)} + Income ${monthlyIncome} - Cost ${monthlyCost.toFixed(0)} = ${newSavings.toFixed(0)}`); 
        if (newSavings <= 0) {
          clearInterval(interval);
          console.log("--- SIMULATION END: Ran out of money ---"); 
          setTimeout(() => endSimulation(true), 0); 
          return 0;
        }
        return newSavings;
      });
      
      // --- Update Detailed Tracking ---
      setStageCosts(prev => ({
        ...prev,
        [stage]: (prev[stage] || 0) + monthlyCost
      }));
      setEducationCosts(prev => ({
        ...prev,
        [stage]: (prev[stage] || 0) + costs.education
      }));
      setMedicalCosts(prev => ({
        ...prev,
        [stage]: (prev[stage] || 0) + costs.medical
      }));
      
      // Update detailed misc costs (excluding medical)
      setMiscCosts(prev => {
          const newMisc = { ...prev };
          for (const key in costs.miscBreakdown) {
              if (key !== 'medical') {
                  newMisc[key] = (newMisc[key] || 0) + costs.miscBreakdown[key];
              }
          }
          return newMisc;
      });
      
      // --- Advance Time ---
      setAgeMonths(newAge); 

      // --- FIX: Check against new MAX_AGE_MONTHS ---
      if (newAge >= MAX_AGE_MONTHS) {
        clearInterval(interval);
        console.log("--- SIMULATION END: Reached 22 years ---"); 
        setTimeout(() => endSimulation(false), 0); // Pass 'false' for normal end
      }

    }, intervalDuration);
    return () => clearInterval(interval);
  }, [status, speed, ageMonths, profile, isJCStudent, currentEvent, simulationEnded, endSimulation, MAX_AGE_MONTHS]);

  // 5. Handlers
  const handleStart = () => {
    if (simulationEnded){
      onSimulationEnd(null); 
      return;
    }
    if (!profile) {
      alert("Profile data is not loaded. Please visit the Profile page.");
      return;
    }

    // --- NEW: Reset decisions & tax on start ---
    setDecisionsMade([]);
    setTaxCosts(0);
    setReliefs({});
    setEdusave(0);
    setEventQueue([]); // Clear event queue
    
    setStatus('running');
    console.log('Simulation Started');
  };

  const handlePause = () => {
    setStatus('paused');
    console.log('Simulation Paused');
  };

  const handleEnd = () => {
    endSimulation(false); // Pass 'false' for manual end
    console.log('Simulation Ended');
  };

  const handleSpeedChange = (e) => {
    setSpeed(e.target.value);
  };

  // --- FIX: This handler now processes the event queue ---
  const processNextEvent = () => {
    if (eventQueue.length > 0) {
      setCurrentEvent(eventQueue[0]);
      setEventQueue(eventQueue.slice(1));
    } else {
      setCurrentEvent(null); 
      setStatus('running'); 
    }
  };

  const handleAcknowledge = (event) => {
    // 1. Handle CASH Benefits (e.g., Baby Bonus, Edusave)
    if (event.totalBenefits > 0) {
      console.log(`--- EVENT: Acknowledging CASH Benefit: +${formatCurrency(event.totalBenefits)} for ${event.title} ---`); 
      setTotalBenefits(prev => prev + event.totalBenefits);
      setHouseholdSavings(prev => prev + event.totalBenefits);
      
      if (event.benefitBreakdown && event.benefitBreakdown['Edusave']) {
        // --- FIX: Add to Edusave card *and* household savings ---
        setEdusave(prev => prev + event.benefitBreakdown['Edusave']);
      }
      
      // Track all NON-TAX reliefs for the dashboard
      if (event.benefitBreakdown) {
          setReliefs(prev => {
              const newReliefs = { ...prev };
              for (const key in event.benefitBreakdown) {
                  newReliefs[key] = (newReliefs[key] || 0) + event.benefitBreakdown[key];
              }
              return newReliefs;
          });
      }
    }
    
    // 2. Handle Costs (e.g., Annual Tax)
    if (event.totalCost > 0) {
      console.log(`--- EVENT: Acknowledging COST: -${formatCurrency(event.totalCost)} for ${event.title} ---`); 
      setHouseholdSavings(prev => prev - event.totalCost);
      setTotalExpenditure(prev => prev + event.totalCost);

      // Track tax cost separately
      if (event.costBreakdown && event.costBreakdown['Income Tax']) {
        setTaxCosts(prev => prev + event.costBreakdown['Income Tax']);
      }
    }
    
    // 3. Handle Tax *Savings* (for Dashboard)
    if (event.taxReliefBreakdown) {
      setReliefs(prev => {
            const newReliefs = { ...prev };
            for (const key in event.taxReliefBreakdown) {
                if(event.taxReliefBreakdown[key] > 0) {
                    newReliefs[key] = (newReliefs[key] || 0) + event.taxReliefBreakdown[key];
                }
            }
            return newReliefs;
        });
    }
    
    processNextEvent(); // Check queue instead of setting status
  };

  const handleDecision = (event, chosenOption) => {
    // Record the decision
    const newDecision = {
      event: event.title,
      choice: chosenOption.label,
      cost: chosenOption.cost || 0
    };
    setDecisionsMade(prev => [...prev, newDecision]);
    // -------------------------------

    if (chosenOption.cost) {
      console.log(`--- EVENT: Decision COST: -${formatCurrency(chosenOption.cost)} for ${chosenOption.label} ---`); 
      setHouseholdSavings(prev => prev - chosenOption.cost);
      setTotalExpenditure(prev => prev + chosenOption.cost); 
    }
    
    if (event.title.includes('Post-Secondary')) {
      setIsJCStudent(chosenOption.value);
      console.log(`--- EVENT: Decision made: ${chosenOption.label} ---`); 
    } else if (event.title.includes('Primary School')) {
      console.log(`--- EVENT: Decision made for Primary School: ${chosenOption.label} ---`); 
    }
    
    processNextEvent(); // Check queue instead of setting status
  };

  const isPaused = status === 'paused';
  const isRunning = status === 'running';

  // Show loading or error if profile isn't loaded
  if (!profile) {
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
          textAlign: 'center'
        }}>
          <h1 style={{color: '#2D3142', fontWeight: 'bold', fontSize: '30px'}}>
            Loading Profile...
          </h1>
          <p style={{color: '#555', fontSize: '18px'}}>
            Please ensure you have saved a profile on the Profile page.
          </p>
      </div>
    );
  }
  
  // --- Render UI (Unchanged) ---
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

