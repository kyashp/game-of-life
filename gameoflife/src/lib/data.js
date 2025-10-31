// --- Live API Data Library ---
// This file replaces hardcoded data with live API calls to data.gov.sg where possible.
// For data not on a .gov API (e.g., MSF subsidy tiers), it uses the 2024/2025 hardcoded values.

// --- API Configuration ---
const API_BASE_URL = "https://data.gov.sg/api/action/datastore_search";
const RESOURCE_IDS = {
    // UPDATED: Resource ID for "Individual Income Tax Rates"
    TAX_RATES: "f73055c6-9144-d2e7-734c-28811d3982aa",
    
    // UPDATED: Resource ID for "Fees for Full-Day Childcare"
    // This dataset is used to find the average fee for Singapore Citizens.
    CHILDCARE_FEES: "d_253a7e348279bf0a87666a71f7ea2e67",
    
    // UPDATED: Resource ID for "General Information of Schools" (from your link)
    SCHOOL_LIST: "d_688b934f82c1059ed0a6993d2a829089",

    // UPDATED: Resource ID for "Temasek Polytechnic Fees"
    POLY_FEES: "d_ee025f3d886cd9e4d1db3ed9ef219cd6"
};

// --- Cached Data ---
// To avoid fetching the same data multiple times in one session
let taxBracketsCache = null;
let polyFeeCache = null;

// --- API-Powered Functions ---

/**
 * Fetches childcare fees, filtering for Full Day & Singapore Citizens.
 * Calculates an average market rate from this data.
 */
export async function getChildcareFees() {
    console.log("Fetching live childcare fee data...");
    // We filter for "Full Day" and "Singapore Citizen"
    const filters = JSON.stringify({
        "type_of_service": "Full Day",
        "type_of_citizenship": "Singapore Citizen"
    });
    const url = `${API_BASE_URL}?resource_id=${RESOURCE_IDS.CHILDCARE_FEES}&filters=${filters}&limit=500`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`API request failed: ${response.status}`);
        const data = await response.json();
        const records = data.result.records;

        if (!records || records.length === 0) {
            throw new Error("No 'Singapore Citizen' records found, using fallback.");
        }

        let totalFee = 0;
        let validRecords = 0;

        for (const record of records) {
            const fee = parseFloat(record.fees); // Field is 'fees'
            if (!isNaN(fee) && fee > 0) {
                totalFee += fee;
                validRecords++;
            }
        }

        if (validRecords === 0) return 800; // Fallback
        const averageFee = totalFee / validRecords;
        console.log(`Live average childcare fee: $${averageFee.toFixed(2)} (from ${validRecords} centres)`);
        return Math.round(averageFee); // Return rounded average
    } catch (error) {
        console.error("Error fetching childcare fees, using fallback:", error);
        return 800; // Fallback on API error
    }
}

/**
 * Fetches the list of all schools from data.gov.sg
 */
export async function getSchoolsList() {
    console.log("Fetching live school list...");
    const url = `${API_BASE_URL}?resource_id=${RESOURCE_IDS.SCHOOL_LIST}&limit=50`; // Get first 50
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`API request failed: ${response.status}`);
        const data = await response.json();
        return data.result.records; // Return the actual school data
    } catch (error) {
        console.error("Error fetching school list:", error);
        return [];
    }
}

/**
 * Fetches and parses the official tax brackets from data.gov.sg
 * Caches the result to avoid multiple API calls.
 */
export async function getTaxBracketsFromAPI() {
    if (taxBracketsCache) {
        console.log("Using cached tax brackets.");
        return taxBracketsCache;
    }
    
    console.log("Fetching live tax bracket data...");
    const url = `${API_BASE_URL}?resource_id=${RESOURCE_IDS.TAX_RATES}&limit=20`; // All brackets
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`API request failed: ${response.status}`);
        const data = await response.json();

        const brackets = [];
        let cumulativeIncome = 0;
        let cumulativeTax = 0;

        // Sort records by _id to ensure they are in the correct order
        const records = data.result.records.sort((a, b) => a._id - b._id);

        for (const record of records) {
            const incomeStr = record.chargeable_income; // e.g., "First $20,000" or "Next $10,000"
            const rateStr = record.tax_rate; // e.g., "0" or "2"
            
            let incomeAmount = 0;
            if (incomeStr.includes("First $")) {
                incomeAmount = parseFloat(incomeStr.replace("First $", "").replace(/,/g, ""));
            } else if (incomeStr.includes("Next $")) {
                incomeAmount = parseFloat(incomeStr.replace("Next $", "").replace(/,/g, ""));
            } else if (incomeStr.includes("Above $")) {
                incomeAmount = Infinity; 
                cumulativeIncome = parseFloat(incomeStr.replace("Above $", "").replace(/,/g, "")); 
            }
            
            const rate = parseFloat(rateStr) / 100; 
            const previousCap = (incomeStr.includes("First $") || incomeStr.includes("Above $")) ? 0 : cumulativeIncome;
            const incomeInBracket = incomeAmount;
            
            if (incomeAmount !== Infinity) {
                cumulativeIncome += incomeAmount;
            }

            const bracketTaxOnMax = parseFloat(record.tax_payable.replace(/,/g, ""));

            brackets.push({
                cap: cumulativeIncome, 
                rate: rate, 
                baseTax: cumulativeTax, 
                incomeInBracket: incomeInBracket 
            });

            if (incomeAmount !== Infinity) {
                cumulativeTax += bracketTaxOnMax;
            }
        }

        taxBracketsCache = brackets;
        console.log("Processed tax brackets:", brackets);
        return brackets;
    } catch (error) {
        console.error("Error fetching tax brackets:", error);
        return []; // Fallback to empty
    }
}

/**
 * Calculates tax based on the live brackets from the API.
 */
export async function calculateTax(annualIncome) {
    const brackets = await getTaxBracketsFromAPI();
    if (brackets.length === 0) {
        console.error("Using hardcoded tax fallback.");
        return calculateTaxHardcoded(annualIncome); // Use hardcoded fallback
    }

    let tax = 0;
    let lastCap = 0;

    for (const bracket of brackets) {
        if (annualIncome <= bracket.cap) {
            // This is the final bracket for this income
            const incomeInThisBracket = annualIncome - lastCap;
            tax = bracket.baseTax + (incomeInThisBracket * bracket.rate);
            break; // Exit loop
        }
        
        if (bracket.cap === Infinity) {
             const incomeInThisBracket = annualIncome - lastCap;
             tax = bracket.baseTax + (incomeInThisBracket * bracket.rate);
             break;
        }
        lastCap = bracket.cap;
    }
    
    return tax;
}

/**
 * Fetches and calculates the annual polytechnic fee from the API.
 * It finds the latest year and sums Semester 1 & 2 fees.
 */
async function getPolytechnicFeesFromAPI() {
    if (polyFeeCache) {
        console.log("Using cached polytechnic fees.");
        return polyFeeCache;
    }
    
    console.log("Fetching live polytechnic fee data...");
    const url = `${API_BASE_URL}?resource_id=${RESOURCE_IDS.POLY_FEES}&filters=${JSON.stringify({"citizenship": "Singapore Citizens"})}&limit=20`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Poly fee API request failed");
        const data = await response.json();
        
        const records = data.result.records;
        if (!records || records.length === 0) {
            throw new Error("No poly fee records found.");
        }

        // Find the latest year in the data
        let latestYear = 0;
        for (const record of records) {
            const year = parseInt(record.year, 10);
            if (year > latestYear) {
                latestYear = year;
            }
        }
        
        // Filter for latest year and sum semester fees
        let annualFee = 0;
        for (const record of records) {
            if (parseInt(record.year, 10) === latestYear && (record.semester.includes("Semester 1") || record.semester.includes("Semester 2"))) {
                annualFee += parseFloat(record.fees);
            }
        }

        if (annualFee === 0) {
            throw new Error("Could not parse annual poly fee.");
        }
        
        console.log(`Live polytechnic fee (Year ${latestYear}): $${annualFee}`);
        polyFeeCache = Math.round(annualFee); // Cache the result
        return polyFeeCache;
        
    } catch (error) {
        console.error("Error fetching polytechnic fees, using fallback:", error);
        return 3000; // Hardcoded fallback
    }
}


// --- Hardcoded Fallback & Non-API Functions ---

// Get kindergarten fees (MOE official rates 2024)
export function getKindergartenFees() {
  // VERIFIED: 2024/2025 rates
  return {
    citizen: 160,
    pr: 320,
    foreigner: 770
  };
}

// Get primary school fees (MOE official rates 2024)
export function getPrimarySchoolFees(residency) {
  // VERIFIED: 2024/2025 rates. Citizens pay 0.
  const fees = {
    citizen: 0,
    pr: 268, // Updated for 2025
    foreigner: 545
  };
  return fees[residency.toLowerCase()] || fees.citizen;
}

// Get secondary school fees (MOE official rates 2024)
export function getSecondarySchoolFees(residency) {
  // VERIFIED: 2024/2025 rates
  const fees = {
    citizen: 5,
    pr: 520, // Updated for 2025
    foreigner: 1010
  };
  return fees[residency.toLowerCase()] || fees.citizen;
}

// Get JC/Poly fees (MOE official rates 2024/2025)
export async function getPostSecondaryFees(educationType, residency) {
  // UPDATED: Now uses API for Poly fees.
  if (educationType.toLowerCase() === 'jc') {
    const fees = {
      citizen: 72, // $6/month * 12
      pr: 6000, // $500/month * 12 (Updated for 2025)
      foreigner: 12120
    };
    return fees[residency.toLowerCase()] || fees.citizen;
  } else {
    // Polytechnic fees (Annual) - Fetched from API
    // We only fetch for citizen. For PR/Foreigner, we'll use hardcoded multipliers
    // based on the live citizen fee.
    const citizenFee = await getPolytechnicFeesFromAPI(); // e.g., ~3000
    const fees = {
      citizen: citizenFee,
      pr: citizenFee * 2.07, // Approx 6200
      foreigner: citizenFee * 4.04 // Approx 12100
    };
    return Math.round(fees[residency.toLowerCase()] || fees.citizen);
  }
}

// Get university fees (NUS/NTU/SMU average 2024/2025)
export function getUniversityFees(residency) {
  // UPDATED: Based on AY2024/2025 general courses
  const fees = {
    citizen: 8250,
    pr: 11900,
    foreigner: 32000
  };
  return fees[residency.toLowerCase()] || fees.citizen;
}

// Calculate monthly childcare subsidy (MSF Basic + Additional Subsidy 2025)
export function getChildcareSubsidy(householdIncome) {
  // UPDATED: Reflects 2025 subsidy structure
  const basicSubsidy = 300;
  let additionalSubsidy = 0;
  if (householdIncome <= 3000) additionalSubsidy = 467;
  else if (householdIncome <= 4500) additionalSubsidy = 440;
  else if (householdIncome <= 6000) additionalSubsidy = 340;
  else if (householdIncome <= 7500) additionalSubsidy = 240;
  else if (householdIncome <= 9000) additionalSubsidy = 110;
  else if (householdIncome <= 10500) additionalSubsidy = 70;
  else if (householdIncome <= 12000) additionalSubsidy = 40;
  return basicSubsidy + additionalSubsidy;
}

// Calculate baby bonus (MSF Baby Bonus Scheme 2024/2025)
export function getBabyBonus(childNumber) {
  // UPDATED: Reflects enhanced Baby Bonus Cash Gift
  if (childNumber === 1) return 11000;
  if (childNumber === 2) return 11000;
  if (childNumber >= 3) return 13000;
  return 11000;
}

// Calculate CDA matching cap (MSF CDA 2024/2025)
export function getCDAMatching(childNumber) {
  // UPDATED: Reflects new dollar-for-dollar matching caps
  if (childNumber === 1) return 4000;
  if (childNumber === 2) return 7000;
  if (childNumber === 3) return 9000;
  if (childNumber === 4) return 9000;
  if (childNumber >= 5) return 15000;
  return 4000;
}

// Calculate Edusave contribution (MOE Edusave 2024/2025)
export function getEdusaveContribution(ageYears) {
  if (ageYears >= 7 && ageYears <= 12) return 230; // Primary
  else if (ageYears >= 13 && ageYears <= 16) return 290; // Secondary
  return 0;
}

// Calculate qualifying child relief (IRAS YA2025)
export function getQualifyingChildRelief(childNumber, disabled = false) {
  if (disabled) return 7500;
  return 4000;
}

// Calculate working mother's child relief (IRAS YA2025)
export function getWorkingMotherChildRelief(childNumber) {
  if (childNumber === 1) return 8000;
  if (childNumber === 2) return 10000;
  if (childNumber >= 3) return 12000;
  return 8000;
}

// Calculate grandparent caregiver relief (IRAS YA2025)
export function getGrandparentCaregiverRelief() {
  return 3000;
}

// Estimate monthly miscellaneous costs by age
export async function getMiscellaneousCosts(ageYears, realismLevel) {
  // NOTE: These are estimates, not from official government sources.
  const multiplier = {
    'Optimistic': 0.6,
    'Realistic': 1.0,
    'Conservative': 1.3
  }[realismLevel] || 1.0;
  let baseCosts = {};
  if (ageYears < 3) {
    baseCosts = { clothing: 150, diapers: 200, formula: 150, medical: 150, toys: 15 };
  } else if (ageYears < 7) {
    baseCosts = { clothing: 120, allowance: 50, enrichment: 200, medical: 100, transport: 50 };
  } else if (ageYears < 13) {
    baseCosts = { clothing: 150, allowance: 100, enrichment: 300, medical: 100, transport: 50, schoolSupplies: 20, cca: 5 };
  } else if (ageYears < 17) {
    baseCosts = { clothing: 200, allowance: 200, enrichment: 400, medical: 120, transport: 100, schoolSupplies: 25, cca: 5 };
  } else if (ageYears < 20) {
    baseCosts = { clothing: 250, allowance: 300, enrichment: 200, medical: 150, transport: 150, schoolSupplies: 25 };
  } else {
    baseCosts = { clothing: 300, allowance: 300, medical: 100, transport: 200, textbooks: 20, meals: 300 };
  }
  const finalCosts = {};
  for (const key in baseCosts) {
    finalCosts[key] = Math.round(baseCosts[key] * multiplier);
  }
  return finalCosts;
}

// Hardcoded tax calculation, as a fallback if the API fails
function calculateTaxHardcoded(annualIncome) {
  console.log("Using hardcoded tax calculation.");
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

