// =====================================================
// CORS-SAFE EXAMPLE USAGE
// =====================================================

async function corsFixedExampleUsage() {
    console.log('=== CORS-Fixed Game of Life Classes Example ===');

    // 1. User Registration
    const userAccount = new UserAccount();
    const signupSuccess = userAccount.signup('jane_doe', 'jane@example.com', 'password123');
    console.log('Signup successful:', signupSuccess);

    // 2. Create Parent Profile
    const profileId = generateUniqueId('profile');
    const parentProfile = new ParentProfile(profileId, userAccount.userId);
    parentProfile.residencyStatusFather = 'CITIZEN';
    parentProfile.residencyStatusMother = 'PR';
    parentProfile.householdIncomeType = 'DUAL_INCOME';
    parentProfile.grossMthlyIncomeFather = 6000;
    parentProfile.grossMthlyIncomeMother = 4500;
    parentProfile.familySavings = 75000;
    parentProfile.childName = 'Alex';
    parentProfile.childGender = 'MALE';
    parentProfile.realism = 'REALISTIC';

    const profileSaved = parentProfile.save();
    console.log('Profile saved:', profileSaved);

    // 3. Calculate Tax Information (works without CORS issues)
    const taxInfo = parentProfile.calculateTaxInformation(1);
    console.log('Tax Information:');
    console.log(`  Total Gross Tax: ${formatCurrency(taxInfo.totalGrossTax)}`);
    console.log(`  Total Tax Reliefs: ${formatCurrency(taxInfo.reliefs.total)}`);
    console.log(`  Net Tax Payable: ${formatCurrency(taxInfo.netTaxPayable)}`);
    console.log(`  Effective Tax Rate: ${taxInfo.effectiveTaxRate.toFixed(2)}%`);

    // 4. Test Inflation Adjustment (CORS-safe)
    const futureCost = parentProfile.inflationAdjuster.adjustCostForFutureInflation(1000, 18);
    console.log(`Inflation Test: $1000 today = ${formatCurrency(futureCost)} in 18 years`);

    // 5. Test Static Data Integration (no CORS issues)
    const dataConnector = new DataSourceConnector('ECDA_CHILDCARE');
    const childcareData = await dataConnector.fetchData();
    console.log(`Childcare Data: ${childcareData.result.records.length} centres loaded (CORS-safe)`);

    // 6. Start CORS-Safe Simulation
    const sessionId = generateUniqueId('session');
    const simulation = new SimulationSession(sessionId, userAccount.userId, profileId);
    await simulation.start();
    console.log('CORS-safe simulation started successfully');

    // 7. Generate Inflation-Adjusted Insights (CORS-safe)
    const insightsId = generateUniqueId('insights');
    const insights = new InsightsRequest(insightsId, profileId, 2, 'JC_UNIVERSITY');
    const projections = await insights.calculateProjections();
    console.log('Inflation-Adjusted Projections (CORS-safe):');
    projections.forEach((range, scenario) => {
        console.log(`  ${scenario}: ${formatCurrency(range.min)} - ${formatCurrency(range.max)}`);
    });

    console.log('=== CORS-fixed example completed successfully ===');
    console.log('✅ All functionality works in browsers without CORS issues!');
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { corsFixedExampleUsage };
}

if (typeof window !== 'undefined') {
    window.GOL = { corsFixedExampleUsage };
}
