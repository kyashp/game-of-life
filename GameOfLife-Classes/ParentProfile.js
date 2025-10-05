 //7. Parent Profile class - enhanced profile with tax and inflation calculators integrated

class ParentProfile {
    constructor(profileId, userId) {
        this.profileId = profileId;
        this.userId = userId;
        this.residencyStatusFather = null; // Enum: 'CITIZEN', 'PR', 'FOREIGNER'
        this.residencyStatusMother = null; // Enum: 'CITIZEN', 'PR', 'FOREIGNER'
        this.householdIncomeType = null;   // Enum: 'DUAL_INCOME', 'SINGLE_INCOME'
        this.grossMthlyIncomeFather = 0.0;
        this.grossMthlyIncomeMother = 0.0;
        this.mthlyDisposableIncomeFather = 0.0;
        this.mthlyDisposableIncomeMother = 0.0;
        this.familySavings = 0.0;
        this.childName = '';
        this.childGender = null; // Enum: 'MALE', 'FEMALE'
        this.realism = null;     // Enum: 'BASIC', 'REALISTIC', 'PREMIUM'

        // Initialize calculators (now CORS-safe)
        this.taxCalculator = new TaxCalculator();
        this.inflationAdjuster = new InflationAdjuster();
    }

    /**
     * Calculate comprehensive tax information for this profile
     * @param {number} childOrderNumber - Child order number
     * @returns {Object} - Complete tax calculation results
     */
    calculateTaxInformation(childOrderNumber = 1) {
        return this.taxCalculator.calculateNetTaxPayable(this, childOrderNumber);
    }

    /**
     * Get inflation-adjusted income projections (now works without CORS issues)
     * @param {number} years - Number of years to project
     * @returns {Array} - Income projections with inflation
     */
    getInflationAdjustedIncomeProjection(years = 18) {
        const currentYear = new Date().getFullYear();
        const projections = [];

        for (let year = 0; year <= years; year++) {
            const targetYear = currentYear + year;
            const adjustedFatherIncome = this.inflationAdjuster.adjustCostForInflation(
                this.grossMthlyIncomeFather * 12, currentYear, targetYear
            );
            const adjustedMotherIncome = this.inflationAdjuster.adjustCostForInflation(
                this.grossMthlyIncomeMother * 12, currentYear, targetYear
            );

            projections.push({
                year: targetYear,
                fatherAnnualIncome: adjustedFatherIncome,
                motherAnnualIncome: adjustedMotherIncome,
                totalHouseholdIncome: adjustedFatherIncome + adjustedMotherIncome,
                inflationFromBase: year === 0 ? 0 : ((adjustedFatherIncome + adjustedMotherIncome) / 
                                   ((this.grossMthlyIncomeFather + this.grossMthlyIncomeMother) * 12) - 1) * 100
            });
        }

        return projections;
    }

    validate() {
        const validationRules = [
            () => this.residencyStatusFather && ['CITIZEN', 'PR', 'FOREIGNER'].includes(this.residencyStatusFather),
            () => this.residencyStatusMother && ['CITIZEN', 'PR', 'FOREIGNER'].includes(this.residencyStatusMother),
            () => this.householdIncomeType && ['DUAL_INCOME', 'SINGLE_INCOME'].includes(this.householdIncomeType),
            () => this.grossMthlyIncomeFather >= 0,
            () => this.grossMthlyIncomeMother >= 0,
            () => this.familySavings >= 0,
            () => this.childName && this.childName.trim().length > 0,
            () => this.childGender && ['MALE', 'FEMALE'].includes(this.childGender),
            () => this.realism && ['BASIC', 'REALISTIC', 'PREMIUM'].includes(this.realism)
        ];

        return validationRules.every(rule => rule());
    }

    save() {
        try {
            if (!this.validate()) {
                console.error('Profile validation failed');
                return false;
            }

            const profileData = {
                profileId: this.profileId,
                userId: this.userId,
                residencyStatusFather: this.residencyStatusFather,
                residencyStatusMother: this.residencyStatusMother,
                householdIncomeType: this.householdIncomeType,
                grossMthlyIncomeFather: this.grossMthlyIncomeFather,
                grossMthlyIncomeMother: this.grossMthlyIncomeMother,
                mthlyDisposableIncomeFather: this.mthlyDisposableIncomeFather,
                mthlyDisposableIncomeMother: this.mthlyDisposableIncomeMother,
                familySavings: this.familySavings,
                childName: this.childName,
                childGender: this.childGender,
                realism: this.realism,
                savedAt: new Date().toISOString()
            };

            localStorage.setItem(`profile_${this.profileId}`, JSON.stringify(profileData));
            return true;
        } catch (error) {
            console.error('Error saving profile:', error);
            return false;
        }
    }

    update() {
        return this.save();
    }

    static load(profileId) {
        try {
            const profileData = localStorage.getItem(`profile_${profileId}`);
            if (profileData) {
                const data = JSON.parse(profileData);
                const profile = new ParentProfile(data.profileId, data.userId);
                Object.assign(profile, data);

                // Reinitialize calculators
                profile.taxCalculator = new TaxCalculator();
                profile.inflationAdjuster = new InflationAdjuster();

                return profile;
            }
            return null;
        } catch (error) {
            console.error('Error loading profile:', error);
            return null;
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ParentProfile };
}

if (typeof window !== 'undefined') {
    window.GOL = { ParentProfile };
}
