import { base44 } from '@/api/base44Client';

// All data is now hardcoded from official Singapore government sources (2024 rates)
// Sources: MOE, MSF, IRAS, ECDA websites

// Get childcare center fees (average market rate)
export async function getChildcareFees() {
  // Average full-day childcare fee in Singapore
  return 800;
}

// Get incidental charges from childcare centers
export async function getChildcareIncidentalCharges() {
  // Average annual miscellaneous fees
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
  return 2900; // Average annual fee for Singapore citizens
}

// Get Temasek Polytechnic course fees
export async function getTemasekCourseFees() {
  return 2900; // Average annual fee for Singapore citizens
}

// Get average polytechnic fees
export async function getPolytechnicFeesFromAPI(residency) {
  const baseFee = 2900;
  const multipliers = {
    citizen: 1,
    pr: 2.1,
    foreigner: 4.2
  };
  return Math.round(baseFee * (multipliers[residency.toLowerCase()] || 1));
}

// Get tax rates data (not used, placeholder)
export async function getTaxRatesData() {
  return [];
}

// Get kindergarten fees (MOE kindergarten official rates 2024)
export function getKindergartenFees() {
  return {
    citizen: 160,
    pr: 320,
    foreigner: 770
  };
}

// Get primary school fees (MOE official rates 2024)
export function getPrimarySchoolFees(residency) {
  const fees = {
    citizen: 0,
    pr: 230,
    foreigner: 750
  };
  return fees[residency.toLowerCase()] || fees.citizen;
}

// Get secondary school fees (MOE official rates 2024)
export function getSecondarySchoolFees(residency) {
  const fees = {
    citizen: 5,
    pr: 440,
    foreigner: 1450
  };
  return fees[residency.toLowerCase()] || fees.citizen;
}

// Get JC/Poly fees (MOE official rates 2024)
export async function getPostSecondaryFees(educationType, residency) {
  if (educationType === 'jc') {
    const fees = {
      citizen: 6,
      pr: 500,
      foreigner: 1180
    };
    return fees[residency.toLowerCase()] || fees.citizen;
  } else {
    // Polytechnic fees
    const fees = {
      citizen: 2900,
      pr: 6200,
      foreigner: 12100
    };
    return fees[residency.toLowerCase()] || fees.citizen;
  }
}

// Get university fees (NUS/NTU/SMU average 2024)
export function getUniversityFees(residency) {
  const fees = {
    citizen: 8200,
    pr: 11900,
    foreigner: 32000
  };
  return fees[residency.toLowerCase()] || fees.citizen;
}

// Calculate monthly childcare subsidy (MSF Basic Subsidy 2024)
export function getChildcareSubsidy(householdIncome) {
  if (householdIncome <= 3000) return 600;
  if (householdIncome <= 4500) return 497;
  if (householdIncome <= 6000) return 440;
  if (householdIncome <= 7500) return 340;
  if (householdIncome <= 12000) return 150;
  return 0;
}

// Calculate baby bonus (MSF Baby Bonus Scheme 2024)
export function getBabyBonus(childNumber) {
  if (childNumber === 1) return 8000;
  if (childNumber === 2) return 8000;
  if (childNumber >= 3) return 10000;
  return 8000;
}

// Calculate CDA matching (MSF CDA 2024)
export function getCDAMatching(childNumber) {
  if (childNumber === 1) return 3000;
  if (childNumber === 2) return 3000;
  if (childNumber >= 3) return 9000;
  return 3000;
}

// Calculate Edusave contribution (MOE Edusave 2024)
export function getEdusaveContribution(ageYears) {
  if (ageYears >= 7 && ageYears <= 16) {
    return 200;
  } else if (ageYears >= 17 && ageYears <= 20) {
    return 240;
  }
  return 0;
}

// Calculate qualifying child relief (IRAS 2024)
export function getQualifyingChildRelief(childNumber, disabled = false) {
  if (disabled) return 7500;
  return 4000;
}

// Calculate working mother's child relief percentage (IRAS 2024)
export function getWorkingMotherChildRelief(childNumber) {
  if (childNumber === 1) return 15;
  if (childNumber === 2) return 20;
  if (childNumber >= 3) return 25;
  return 15;
}

// Calculate grandparent caregiver relief (IRAS 2024)
export function getGrandparentCaregiverRelief() {
  return 3000;
}

// Calculate parent relief (IRAS 2024)
export function getParentRelief() {
  return 9000;
}

// Estimate CCA costs
export async function getCCACosts(ageYears) {
  if (ageYears < 7) return 0;
  // Estimate average CCA cost based on typical school activities
  return 50; // Monthly estimate for CCA activities
}

// Estimate monthly miscellaneous costs by age
export async function getMiscellaneousCosts(ageYears, realismLevel) {
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

  const total = Object.values(baseCosts).reduce((a, b) => a + b, 0);
  return Math.round(total * multiplier);
}

// Calculate tax based on annual income using Singapore tax brackets (IRAS 2024)
export function calculateTax(annualIncome) {
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

// Get inflation rate (MAS average 2024)
export function getInflationRate() {
  return 0.025; // 2.5% average
}
