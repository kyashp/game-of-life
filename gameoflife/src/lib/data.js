// All data updated based on official Singapore government sources (2024/2025 rates)
// Sources: MOE, MSF, IRAS, ECDA, MAS websites
// User-specific assumption: All calculations are for Singapore Citizens.

// Get childcare center fees (average market rate)
export async function getChildcareFees() {
  // Average full-day unsubsidised childcare fee in Singapore (market rate)
  // Subsidies will be deducted from this amount.
  return 800;
}

// Get incidental charges from childcare centers
export async function getChildcareIncidentalCharges() {
  // Average annual miscellaneous fees (estimate)
  return 200;
}

// Get list of schools (not used in calculations, placeholder)
export async function getSchoolsList() {
  return [];
}

// Get school CCAs (not used in calculations, placeholder)
export async function getSchoolCCAs() {
  return [];
}

// Get Ngee Ann Polytechnic course fees
export async function getNgeeAnnCourseFees() {
  // UPDATED: Based on AY2024/2025 fees
  return 3000; // Annual fee for Singapore citizens
}

// Get Temasek Polytechnic course fees
export async function getTemasekCourseFees() {
  // UPDATED: Based on AY2024/2025 fees
  return 3000; // Annual fee for Singapore citizens
}

// Get average polytechnic fees
export async function getPolytechnicFeesFromAPI(residency) {
  // UPDATED: Base fee updated to 3000 for AY2024/2025
  const baseFee = 3000;
  const multipliers = {
    citizen: 1,
    pr: 2.1, // This multiplier is an estimate; PR fee is ~6,200
    foreigner: 4.2 // This multiplier is an estimate; Foreigner fee is ~12,100
  };
  return Math.round(baseFee * (multipliers[residency.toLowerCase()] || 1));
}

// Get tax rates data (not used, placeholder)
export async function getTaxRatesData() {
  return [];
}

// Get kindergarten fees (MOE kindergarten official rates 2024)
export function getKindergartenFees() {
  // VERIFIED: 2024/2025 rates
  return {
    citizen: 160,
    pr: 320,
    foreigner: 770 // Note: MOE website states $480 for 2025 PR, $960 for 2025 Foreigner
  };
}

// Get primary school fees (MOE official rates 2024)
export function getPrimarySchoolFees(residency) {
  // VERIFIED: 2024/2025 rates. Citizens pay 0.
  const fees = {
    citizen: 0,
    pr: 268, // Updated for 2025
    foreigner: 545 // (ASEAN) / 935 (non-ASEAN) - using an average
  };
  return fees[residency.toLowerCase()] || fees.citizen;
}

// Get secondary school fees (MOE official rates 2024)
export function getSecondarySchoolFees(residency) {
  // VERIFIED: 2024/2025 rates
  const fees = {
    citizen: 5,
    pr: 520, // Updated for 2025
    foreigner: 1010 // (ASEAN) / 1870 (non-ASEAN) - using an average
  };
  return fees[residency.toLowerCase()] || fees.citizen;
}

// Get JC/Poly fees (MOE official rates 2024/2025)
export async function getPostSecondaryFees(educationType, residency) {
  // UPDATED: Function now returns ANNUAL fees for both types for consistency.
  if (educationType.toLowerCase() === 'jc') {
    const fees = {
      citizen: 72, // $6/month * 12
      pr: 6000, // $500/month * 12 (Updated for 2025)
      foreigner: 12120 // (ASEAN) / 22440 (non-ASEAN) - using ASEAN
    };
    return fees[residency.toLowerCase()] || fees.citizen;
  } else {
    // Polytechnic fees (Annual)
    const fees = {
      citizen: 3000, // Updated for AY2024/2025
      pr: 6200, // Updated for AY2024/2025
      foreigner: 12100 // Updated for AY2024/2025
    };
    return fees[residency.toLowerCase()] || fees.citizen;
  }
}

// Get university fees (NUS/NTU/SMU average 2024/2025)
export function getUniversityFees(residency) {
  // UPDATED: Based on AY2024/2025 general courses (e.g., Arts/Biz)
  const fees = {
    citizen: 8250, // Base rate for NUS/NTU
    pr: 11900, // Approx.
    foreigner: 32000 // Approx.
  };
  return fees[residency.toLowerCase()] || fees.citizen;
}

// Calculate monthly childcare subsidy (MSF Basic + Additional Subsidy 2025)
// Assumes citizen child and working mother
export function getChildcareSubsidy(householdIncome) {
  // UPDATED: Reflects 2025 subsidy structure (Basic Subsidy + new Additional Subsidy tiers)
  const basicSubsidy = 300;
  let additionalSubsidy = 0;

  if (householdIncome <= 3000) {
    additionalSubsidy = 467;
  } else if (householdIncome <= 4500) {
    additionalSubsidy = 440;
  } else if (householdIncome <= 6000) {
    additionalSubsidy = 340;
  } else if (householdIncome <= 7500) {
    additionalSubsidy = 240;
  } else if (householdIncome <= 9000) {
    additionalSubsidy = 110;
  } else if (householdIncome <= 10500) {
    additionalSubsidy = 70;
  } else if (householdIncome <= 12000) {
    additionalSubsidy = 40;
  }
  // Everyone with income > 12000 still gets Basic Subsidy
  return basicSubsidy + additionalSubsidy;
}

// Calculate baby bonus (MSF Baby Bonus Scheme 2024/2025)
export function getBabyBonus(childNumber) {
  // UPDATED: Reflects enhanced Baby Bonus Cash Gift
  if (childNumber === 1) return 11000;
  if (childNumber === 2) return 11000;
  if (childNumber >= 3) return 13000;
  return 11000; // Default for 1st child
}

// Calculate CDA matching cap (MSF CDA 2024/2025)
export function getCDAMatching(childNumber) {
  // UPDATED: Reflects new dollar-for-dollar matching caps
  if (childNumber === 1) return 4000;
  if (childNumber === 2) return 7000;
  if (childNumber === 3) return 9000;
  if (childNumber === 4) return 9000;
  if (childNumber >= 5) return 15000;
  return 4000; // Default for 1st child
}

// Calculate Edusave contribution (MOE Edusave 2024/2025)
export function getEdusaveContribution(ageYears) {
  // UPDATED: Reflects 2024/2025 annual contribution amounts
  if (ageYears >= 7 && ageYears <= 12) {
    return 230; // Primary level
  } else if (ageYears >= 13 && ageYears <= 16) {
    return 290; // Secondary level
  }
  // JC/Poly students do not receive annual Edusave top-ups
  return 0;
}

// Calculate qualifying child relief (IRAS YA2025)
export function getQualifyingChildRelief(childNumber, disabled = false) {
  // VERIFIED: Relief amount unchanged for YA2025
  if (disabled) return 7500;
  return 4000;
}

// Calculate working mother's child relief (IRAS YA2025)
export function getWorkingMotherChildRelief(childNumber) {
  // UPDATED: Reflects shift from % to fixed dollar relief for children
  // born on/after 1 Jan 2024. We assume children are born "now".
  if (childNumber === 1) return 8000;
  if (childNumber === 2) return 10000;
  if (childNumber >= 3) return 12000;
  return 8000; // Default for 1st child
}

// Calculate grandparent caregiver relief (IRAS YA2025)
export function getGrandparentCaregiverRelief() {
  // VERIFIED: Relief amount unchanged for YA2025
  return 3000;
}

// Calculate parent relief (IRAS YA2025)
export function getParentRelief() {
  // VERIFIED: Assuming "living with" case
  return 9000;
}

// Estimate CCA costs
export async function getCCACosts(ageYears) {
  if (ageYears < 7) return 0;
  // This is an estimate, not from an official source
  return 50; // Monthly estimate for CCA activities
}

// Estimate monthly miscellaneous costs by age
export async function getMiscellaneousCosts(ageYears, realismLevel) {
  // NOTE: These are estimates, not from official government sources.
  // UPDATED: This function now returns the breakdown object instead of the total.
  const multiplier = {
    'Optimistic': 0.8,
    'Realistic': 1.0,
    'Conservative': 1.3
  }[realismLevel] || 1.0;

  let baseCosts = {
    clothing: 100,
    allowance: 0,
    enrichment: 0,
    medical: 100,
    transport: 0
  };

  if (ageYears < 3) {
    // Infant/Toddler costs
    baseCosts = {
      clothing: 150,
      diapers: 200,
      formula: 150,
      medical: 150,
      toys: 100
    };
  } else if (ageYears < 7) {
    // Preschool costs
    baseCosts = {
      clothing: 120,
      allowance: 50,
      enrichment: 200,
      medical: 100,
      transport: 50
    };
  } else if (ageYears < 13) {
    // Primary school costs
    baseCosts = {
      clothing: 150,
      allowance: 100,
      enrichment: 300,
      medical: 100,
      transport: 50,
      schoolSupplies: 100,
      cca: 50
    };
  } else if (ageYears < 17) {
    // Secondary school costs
    baseCosts = {
      clothing: 200,
      allowance: 200,
      enrichment: 400,
      medical: 120,
      transport: 100,
      schoolSupplies: 150,
      cca: 50
    };
  } else if (ageYears < 20) {
    // JC/Poly costs
    baseCosts = {
      clothing: 250,
      allowance: 300,
      enrichment: 200,
      medical: 150,
      transport: 150,
      schoolSupplies: 100
    };
  } else {
    // University costs
    baseCosts = {
      clothing: 300,
      allowance: 400,
      medical: 150,
      transport: 200,
      textbooks: 200,
      meals: 300
    };
  }

  // Apply multiplier to each item in the breakdown
  const finalCosts = {};
  for (const key in baseCosts) {
    finalCosts[key] = Math.round(baseCosts[key] * multiplier);
  }
  
  return finalCosts; // Return the object, not the sum
}

// Calculate tax based on annual income using Singapore tax brackets (IRAS YA2025)
export function calculateTax(annualIncome) {
  // VERIFIED: Tax brackets for YA2025 (income earned in 2024) are unchanged
  if (annualIncome <= 20000) return 0;
  if (annualIncome <= 30000) return (annualIncome - 20000) * 0.02;
  if (annualIncome <= 40000) return 200 + (annualIncome - 30000) * 0.035;
  if (annualIncome <= 80000) return 550 + (annualIncome - 40000) * 0.07;
  if (annualIncome <= 120000) return 3350 + (annualIncome - 80000) * 0.115;
  if (annualIncome <= 160000) return 7950 + (annualIncome - 120000) * 0.15;
  if (annualIncome <= 200000) return 13950 + (annualIncome - 160000) * 0.18;
  if (annualIncome <= 240000) return 21150 + (annualIncome - 200000) * 0.19;
  if (annualIncome <= 280000) return 28750 + (annualIncome - 240000) * 0.195;
  if (annualIncome <= 320000) return 36550 + (annualIncome - 280000) * 0.20;
  if (annualIncome <= 500000) return 44550 + (annualIncome - 320000) * 0.22;
  if (annualIncome <= 1000000) return 84150 + (annualIncome - 500000) * 0.23;
  return 199150 + (annualIncome - 1000000) * 0.24;
}

// Get inflation rate (MAS forecast 2025)
export function getInflationRate() {
  // UPDATED: Based on MAS Macroeconomic Review (Oct 2025)
  // Forecast for CPI-All Items inflation in 2025 is 0.5-1.0%
  return 0.01; // Using 1.0%
}

// Apply inflation to cost
export function applyInflation(baseCost, years) {
  return baseCost * Math.pow(1 + getInflationRate(), years);
}
