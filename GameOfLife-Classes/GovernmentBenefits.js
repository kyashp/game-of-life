class GovernmentBenefits {
    constructor(benefitId, name, description, eligibilityCriteria, valueFormula, applicableGrowthStage) {
        this.benefitId = benefitId;
        this.name = name;
        this.description = description;
        this.eligibilityCriteria = eligibilityCriteria;
        this.valueFormula = valueFormula;
        this.applicableGrowthStage = applicableGrowthStage;

        // Initialize CORS-safe data connector
        this.dataConnector = new DataSourceConnector('ECDA_CHILDCARE');
    }

    /**
     * Fetch childcare subsidy rates (CORS-safe)
     * @returns {Promise<Array>} - Childcare subsidy data
     */
    async fetchChildcareSubsidyRates() {
        try {
            const data = await this.dataConnector.fetchData({
                dataset: 'childcare_centres'
            });

            if (data && data.result && data.result.records) {
                console.log(`Loaded ${data.result.records.length} childcare centres`);
                return data.result.records;
            }
        } catch (error) {
            console.log('Using static childcare data:', error.message);
        }

        // Return static data as fallback
        return this.dataConnector.staticData.ECDA_CHILDCARE.result.records;
    }

    calculateEligibility(profile) {
        try {
            const eligibilityChecks = {
                citizenship: () => {
                    return profile.residencyStatusFather === 'CITIZEN' || 
                           profile.residencyStatusMother === 'CITIZEN' ||
                           profile.residencyStatusFather === 'PR' || 
                           profile.residencyStatusMother === 'PR';
                },

                income: () => {
                    const totalIncome = profile.grossMthlyIncomeFather + profile.grossMthlyIncomeMother;
                    return totalIncome <= 12000; // Childcare subsidy income ceiling
                },

                childAge: (currentChildAge) => {
                    if (this.applicableGrowthStage.includes('ALL')) return true;
                    if (this.applicableGrowthStage.includes('INFANT') && currentChildAge <= 24) return true;
                    if (this.applicableGrowthStage.includes('PRESCHOOL') && currentChildAge >= 25 && currentChildAge <= 72) return true;
                    if (this.applicableGrowthStage.includes('SCHOOL') && currentChildAge >= 73 && currentChildAge <= 216) return true;
                    return false;
                }
            };

            const criteriaArray = this.eligibilityCriteria.split(',').map(c => c.trim());

            return criteriaArray.every(criteria => {
                switch(criteria.toLowerCase()) {
                    case 'citizenship': return eligibilityChecks.citizenship();
                    case 'income': return eligibilityChecks.income();
                    case 'child_age': return eligibilityChecks.childAge(0);
                    default: return true;
                }
            });

        } catch (error) {
            console.error('Error calculating benefit eligibility:', error);
            return false;
        }
    }

    calculateValue(profile) {
        try {
            const totalHouseholdIncome = profile.grossMthlyIncomeFather + profile.grossMthlyIncomeMother;

            switch(this.name.toLowerCase()) {
                case 'childcare_subsidy':
                    return this.calculateChildcareSubsidy(totalHouseholdIncome);
                case 'baby_bonus':
                    return this.calculateBabyBonus(profile);
                case 'working_mother_child_relief':
                    return this.calculateWorkingMotherRelief(profile);
                case 'tax_benefits':
                    return this.calculateTaxBenefits(profile);
                default:
                    return this.parseFormulaAndCalculate(this.valueFormula, profile);
            }
        } catch (error) {
            console.error('Error calculating benefit value:', error);
            return 0;
        }
    }

    /**
     * Calculate tax benefits using integrated tax calculator
     * @param {ParentProfile} profile - Parent profile
     * @returns {number} - Total annual tax benefits
     */
    calculateTaxBenefits(profile) {
        const taxInfo = profile.calculateTaxInformation(1);
        return taxInfo.reliefs.total;
    }

    /**
     * Calculate childcare subsidy based on 2024 rates
     * @param {number} householdIncome - Monthly household income
     * @returns {number} - Monthly childcare subsidy
     */
    calculateChildcareSubsidy(householdIncome) {
        // Singapore childcare subsidy tiers (2024 rates)
        if (householdIncome <= 3000) return 770;
        if (householdIncome <= 4500) return 710;
        if (householdIncome <= 6000) return 650;
        if (householdIncome <= 7500) return 590;
        if (householdIncome <= 9000) return 440;
        if (householdIncome <= 12000) return 340;
        return 150; // Basic subsidy for higher income families
    }

    calculateBabyBonus(profile) {
        const isCitizen = profile.residencyStatusFather === 'CITIZEN' || profile.residencyStatusMother === 'CITIZEN';
        // Singapore Baby Bonus (first and second child: $8000, third child onward: $10000)
        return isCitizen ? 8000 : 0;
    }

    calculateWorkingMotherRelief(profile) {
        const motherIncome = profile.grossMthlyIncomeMother;
        if (motherIncome > 0) {
            // 15% of mother's annual income, capped at $25,000
            return Math.min(motherIncome * 12 * 0.15, 25000);
        }
        return 0;
    }

    parseFormulaAndCalculate(formula, profile) {
        try {
            let result = formula;
            result = result.replace(/income_father/g, profile.grossMthlyIncomeFather);
            result = result.replace(/income_mother/g, profile.grossMthlyIncomeMother);
            result = result.replace(/family_savings/g, profile.familySavings);
            return eval(result);
        } catch (error) {
            console.error('Error parsing formula:', error);
            return 0;
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GovernmentBenefits };
}

if (typeof window !== 'undefined') {
    window.GOL = { GovernmentBenefits };
}
