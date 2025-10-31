
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
  getQualifyingChildRelief,
  getWorkingMotherChildRelief,
  getGrandparentCaregiverRelief,
  getMiscellaneousCosts,
  applyInflation,
} from './singaporeData';

// Generate cost event based on child's age and profile
export async function generateCostEvent(ageMonths, profile, sessionData) {
  const ageYears = Math.floor(ageMonths / 12);
  const previousStage = sessionData.previousStage || 'none';
  const currentStage = getGrowthStage(ageMonths, profile.childGender);

  // Only trigger events at stage transitions
  if (previousStage === currentStage) {
    return null;
  }

  const residency = profile.fatherResidency === 'Citizen' || profile.fatherResidency === 'PR' 
    ? profile.fatherResidency.toLowerCase() 
    : profile.motherResidency.toLowerCase();

  const householdIncome = (profile.fatherGrossMonthlyIncome || 0) + 
                          (profile.motherGrossMonthlyIncome || 0);

  let event = null;

  switch (currentStage) {
    case 'Newborn':
      event = await generateBirthEvent(profile, householdIncome);
      break;
    case 'Kindergarten':
      event = await generateKindergartenEvent(profile, residency, householdIncome);
      break;
    case 'Primary School':
      event = await generatePrimarySchoolEvent(profile, residency);
      break;
    case 'Secondary School':
      event = await generateSecondarySchoolEvent(profile, residency);
      break;
    case 'JC/Poly':
      event = await generatePostSecondaryEvent(profile, residency);
      break;
    case 'University':
      event = await generateUniversityEvent(profile, residency);
      break;
  }

  return event;
}

async function generateBirthEvent(profile, householdIncome) {
  const babyBonus = getBabyBonus(1);
  const cdaMatching = getCDAMatching(1);
  
  const costs = [
    { item: 'Hospital delivery fees', amount: 2500 },
    { item: 'Initial baby essentials', amount: 2000 },
    { item: 'Cot and furniture', amount: 1500 },
    { item: 'First month supplies', amount: 1000 },
  ];

  const benefits = [
    { item: 'Baby Bonus Cash Gift', amount: babyBonus },
    { item: 'Child Development Account (CDA) Matching', amount: cdaMatching },
    { item: 'Medisave Grant for Newborns', amount: 4000 },
  ];

  return {
    title: '🎉 Welcome to Parenthood!',
    category: 'birth',
    stage: 'Newborn',
    description: `Congratulations on your new baby! Here are the initial costs and government support you'll receive.`,
    costs,
    benefits,
    totalCost: costs.reduce((sum, c) => sum + c.amount, 0),
    totalBenefits: benefits.reduce((sum, b) => sum + b.amount, 0),
    requiresDecision: false,
  };
}

async function generateKindergartenEvent(profile, residency, householdIncome) {
  const monthlyFee = getKindergartenFees()[residency] || getKindergartenFees().citizen;
  const annualFee = monthlyFee * 12;
  const subsidy = getChildcareSubsidy(householdIncome);
  const annualSubsidy = subsidy * 12;

  const costs = [
    { item: 'Kindergarten fees (annual)', amount: annualFee },
    { item: 'School uniform and supplies', amount: 300 },
    { item: 'Books and materials', amount: 200 },
  ];

  const benefits = [
    { item: 'Kindergarten Fee Assistance Scheme (KiFAS)', amount: annualSubsidy },
    { item: 'Start-Up Grant', amount: 160 },
  ];

  return {
    title: '🎒 Starting Kindergarten',
    category: 'education',
    stage: 'Kindergarten',
    description: `Your child is starting kindergarten! This is an important milestone in their education journey.`,
    costs,
    benefits,
    totalCost: costs.reduce((sum, c) => sum + c.amount, 0),
    totalBenefits: benefits.reduce((sum, b) => sum + b.amount, 0),
    requiresDecision: false,
  };
}

async function generatePrimarySchoolEvent(profile, residency) {
  const monthlyFee = getPrimarySchoolFees(residency);
  const annualFee = monthlyFee * 12;
  const edusave = getEdusaveContribution(7);

  const costs = [
    { item: 'School fees (annual)', amount: annualFee },
    { item: 'School uniform', amount: 200 },
    { item: 'Books and stationery', amount: 300 },
    { item: 'School bag and supplies', amount: 150 },
  ];

  const benefits = [
    { item: 'Edusave Contribution', amount: edusave },
    { item: 'MOE Financial Assistance (if eligible)', amount: 0 },
  ];

  return {
    title: '📚 Primary School Begins',
    category: 'education',
    stage: 'Primary School',
    description: `Your child is entering primary school! They'll receive their Edusave account and begin their formal education.`,
    costs,
    benefits,
    totalCost: costs.reduce((sum, c) => sum + c.amount, 0),
    totalBenefits: benefits.reduce((sum, b) => sum + b.amount, 0),
    requiresDecision: false,
  };
}

async function generateSecondarySchoolEvent(profile, residency) {
  const monthlyFee = getSecondarySchoolFees(residency);
  const annualFee = monthlyFee * 12;
  const edusave = getEdusaveContribution(13);

  const costs = [
    { item: 'School fees (annual)', amount: annualFee },
    { item: 'School uniform', amount: 250 },
    { item: 'Books and materials', amount: 400 },
    { item: 'Calculator and supplies', amount: 200 },
    { item: 'CCA equipment', amount: 300 },
  ];

  const benefits = [
    { item: 'Edusave Contribution', amount: edusave },
  ];

  return {
    title: '🎓 Secondary School Transition',
    category: 'education',
    stage: 'Secondary School',
    description: `Your child is moving to secondary school. This phase brings new opportunities and slightly higher costs.`,
    costs,
    benefits,
    totalCost: costs.reduce((sum, c) => sum + c.amount, 0),
    totalBenefits: benefits.reduce((sum, b) => sum + b.amount, 0),
    requiresDecision: false,
  };
}

async function generatePostSecondaryEvent(profile, residency) {
  const edusave = getEdusaveContribution(17);

  const jcFee = await getPostSecondaryFees('jc', residency);
  const polyFee = await getPostSecondaryFees('poly', residency);

  return {
    title: '🎯 Post-Secondary Education Choice',
    category: 'education',
    stage: 'JC/Poly',
    description: `Your child has completed secondary school! Now you need to choose their post-secondary education path.`,
    requiresDecision: true,
    options: [
      {
        label: 'Junior College (JC)',
        value: 'jc',
        description: 'Prepares for university entrance',
        cost: jcFee * 2, // 2 years
      },
      {
        label: 'Polytechnic',
        value: 'poly',
        description: 'Diploma with practical skills',
        cost: polyFee * 3, // 3 years
      },
    ],
    benefits: [
      { item: 'Edusave Contribution', amount: edusave },
      { item: 'Post-Secondary Education Account', amount: 240 },
    ],
    totalBenefits: edusave + 240,
  };
}

async function generateUniversityEvent(profile, residency) {
  const annualFee = getUniversityFees(residency);

  const costs = [
    { item: 'University tuition (annual)', amount: annualFee },
    { item: 'Textbooks and materials', amount: 1000 },
    { item: 'Laptop and software', amount: 2000 },
    { item: 'Campus activities fee', amount: 300 },
  ];

  const benefits = [
    { item: 'Tuition Fee Loan (TFL) - eligible', amount: annualFee * 0.9 },
  ];

  return {
    title: '🎓 University Education',
    category: 'education',
    stage: 'University',
    description: `Your child is ready for university! This is a significant investment in their future.`,
    costs,
    benefits,
    totalCost: costs.reduce((sum, c) => sum + c.amount, 0),
    totalBenefits: benefits.reduce((sum, b) => sum + b.amount, 0),
    requiresDecision: false,
  };
}

export function getGrowthStage(ageMonths, gender) {
  const ageYears = Math.floor(ageMonths / 12);
  
  if (ageYears < 3) return 'Newborn';
  if (ageYears < 7) return 'Kindergarten';
  if (ageYears < 13) return 'Primary School';
  if (ageYears < 17) return 'Secondary School';
  if (ageYears < 19) return 'JC/Poly';
  if (gender === 'Male') {
    if (ageYears < 21) return 'National Service';
    if (ageYears < 23) return 'University';
    return 'Adulthood';
  } else {
    if (ageYears < 21) return 'University';
    return 'Adulthood';
  }
}

export async function calculateMonthlyCosts(ageMonths, profile, educationChoice = null) {
  const ageYears = Math.floor(ageMonths / 12);
  const stage = getGrowthStage(ageMonths, profile.childGender);
  
  const residency = profile.fatherResidency === 'Citizen' || profile.fatherResidency === 'PR' 
    ? profile.fatherResidency.toLowerCase() 
    : profile.motherResidency.toLowerCase();

  const householdIncome = (profile.fatherGrossMonthlyIncome || 0) + 
                          (profile.motherGrossMonthlyIncome || 0);

  let educationCost = 0;
  let subsidy = 0;

  // Calculate education costs based on stage
  if (stage === 'Kindergarten') {
    educationCost = getKindergartenFees()[residency] || getKindergartenFees().citizen;
    subsidy = getChildcareSubsidy(householdIncome);
  } else if (stage === 'Primary School') {
    educationCost = getPrimarySchoolFees(residency);
  } else if (stage === 'Secondary School') {
    educationCost = getSecondarySchoolFees(residency);
  }

  // Miscellaneous costs - NOW PROPERLY AWAITED
  const miscCosts = await getMiscellaneousCosts(ageYears, profile.realismLevel || 'Realistic');

  return {
    education: Math.max(0, educationCost - subsidy),
    miscellaneous: miscCosts,
    total: Math.max(0, educationCost - subsidy) + miscCosts,
  };
}
