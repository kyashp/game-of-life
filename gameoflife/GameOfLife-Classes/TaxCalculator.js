 //6. Tax Calculator class (Singapore-specific) - calculates income tax, reliefs, and rebates

class TaxCalculator2025 {
    constructor() {
        // Singapore 2025 Individual Income Tax Rates (same brackets)  
        this.taxBrackets2025 = [
            { min: 0, max: 20000, rate: 0 },
            { min: 20000, max: 30000, rate: 0.02 },
            { min: 30000, max: 40000, rate: 0.035 },
            { min: 40000, max: 80000, rate: 0.07 },
            { min: 80000, max: 120000, rate: 0.115 },
            { min: 120000, max: 160000, rate: 0.15 },
            { min: 160000, max: 200000, rate: 0.18 },
            { min: 200000, max: 240000, rate: 0.19 },
            { min: 240000, max: 280000, rate: 0.195 },
            { min: 280000, max: 320000, rate: 0.20 },
            { min: 320000, max: Infinity, rate: 0.22 }
        ];

        // Parenthood Tax Rebate for 2025
        this.parenthoodTaxRebate = {
            firstChild: 5000,
            secondChild: 10000,
            thirdChild: 20000,
            fourthAndBeyond: 20000
        };

        // Some relief / fixed amounts (you may need to expand)
        this.reliefAmounts = {
            spouse: 2000,
            child: 4000,  // QCR / child relief amount per child
            // workingMotherFixedRelief for children born on/after 2024
            workingMotherFixedRelief: {
                1: 8000,
                2: 10000,
                3: 12000
                // any beyond 3 also get fixed for “third and beyond”
            },
            workingMotherPercentBefore2024: {
                1: 0.15,
                2: 0.20,
                3: 0.25
            },
            workingMotherCapBefore2024: 50000  // cap per child for combined QCR + WMCR
        };

        // Personal relief cap
        this.reliefCap = 80000;

        // PIT rebate parameters for 2025
        this.pitRebateRate = 0.60;
        this.pitRebateCap = 200;
    }

    calculateIncomeTax(annualIncome, residencyStatus = 'CITIZEN') {
        if (residencyStatus === 'FOREIGNER') {
            const progressive = this.calculateProgressiveTax(annualIncome);
            const flat = annualIncome * 0.22;
            return Math.max(progressive, flat);
        }
        return this.calculateProgressiveTax(annualIncome);
    }

    calculateProgressiveTax(annualIncome) {
        let totalTax = 0;
        for (const bracket of this.taxBrackets2025) {
            if (annualIncome <= bracket.min) break;
            const taxable = Math.min(annualIncome, bracket.max) - bracket.min;
            totalTax += taxable * bracket.rate;
        }
        return totalTax;
    }

    calculateParenthoodTaxRebate(childOrder) {
        if (childOrder === 1) return this.parenthoodTaxRebate.firstChild;
        if (childOrder === 2) return this.parenthoodTaxRebate.secondChild;
        return this.parenthoodTaxRebate.thirdChild;  // treat 3+ the same
    }

    /**
     * Simulate IRAS tax calculator integration
     * @param {Object} inputData - Tax calculation inputs
     * @returns {Promise<Object>} - Tax calculation results
     */
    async integrateWithIRAS(inputData) {
        // Simulate IRAS Excel calculator processing
        try {
            console.log('Simulating IRAS tax calculator integration...');

            // Simulate processing delay
            await new Promise(resolve => setTimeout(resolve, 500));

            const profile = inputData.profile;
            const results = this.calculateNetTaxPayable(profile, inputData.childOrderNumber);

            return {
                success: true,
                source: 'IRAS_CALCULATOR_SIMULATION',
                timestamp: new Date().toISOString(),
                results: results,
                note: 'This is a simulation based on Singapore tax brackets. For official calculations, use IRAS tools.'
            };

        } catch (error) {
            console.error('IRAS simulation error:', error);
            return {
                success: false,
                error: error.message,
                fallbackResults: this.calculateNetTaxPayable(inputData.profile, inputData.childOrderNumber)
            };
        }
    }
    calculateTaxReliefs(profile, childOrderNumber = 1, childBornOnOrAfter2024 = false) {
        // childBornOnOrAfter2024: boolean indicating whether the child qualifies for the new fixed WMCR rule
        const reliefs = {
            spouseRelief: 0,
            childRelief: 0,
            workingMotherChildRelief: 0,
            parenthoodTaxRebate: 0,
            totalBeforeCap: 0,
            total: 0
        };

        // Spouse relief if single income household
        if (profile.householdIncomeType === 'SINGLE_INCOME') {
            reliefs.spouseRelief = this.reliefAmounts.spouse;
        }

        // Child relief (QCR / CR)
        reliefs.childRelief = this.reliefAmounts.child;

        // Working Mother Child Relief (WMCR)
        if (profile.grossMthlyIncomeMother > 0) {
            if (childBornOnOrAfter2024) {
                // Use fixed relief
                const fixed = this.reliefAmounts.workingMotherFixedRelief[childOrderNumber] 
                               || this.reliefAmounts.workingMotherFixedRelief[3];
                reliefs.workingMotherChildRelief = fixed;
            } else {
                // Pre-2024 rule: percentage of mother income, capped (plus QCR cap)
                const motherAnnual = profile.grossMthlyIncomeMother * 12;
                const pct = this.reliefAmounts.workingMotherPercentBefore2024[childOrderNumber] || this.reliefAmounts.workingMotherPercentBefore2024[3];
                reliefs.workingMotherChildRelief = Math.min(motherAnnual * pct, this.reliefAmounts.workingMotherCapBefore2024);
            }
        }

        // Parenthood Tax Rebate (one-time)
        reliefs.parenthoodTaxRebate = this.calculateParenthoodTaxRebate(childOrderNumber);

        reliefs.totalBeforeCap = reliefs.spouseRelief + reliefs.childRelief +
                                 reliefs.workingMotherChildRelief + reliefs.parenthoodTaxRebate;

        // Enforce relief cap (if this is supposed to cap reliefs)
        reliefs.total = Math.min(reliefs.totalBeforeCap, this.reliefCap);

        return reliefs;
    }

    applyPITRebate(taxPayable) {
        const rebate = Math.min(taxPayable * this.pitRebateRate, this.pitRebateCap);
        return rebate;
    }

    calculateNetTaxPayable(profile, childOrderNumber = 1, childBornOnOrAfter2024 = false) {
        const fatherAnnual = profile.grossMthlyIncomeFather * 12;
        const motherAnnual = profile.grossMthlyIncomeMother * 12;
        const totalAnnualIncome = fatherAnnual + motherAnnual;

        const fatherGrossTax = this.calculateIncomeTax(fatherAnnual, profile.residencyStatusFather);
        const motherGrossTax = this.calculateIncomeTax(motherAnnual, profile.residencyStatusMother);
        const totalGrossTax = fatherGrossTax + motherGrossTax;

        const reliefs = this.calculateTaxReliefs(profile, childOrderNumber, childBornOnOrAfter2024);

        // Net after reliefs but before rebate
        const netBeforeRebate = Math.max(0, totalGrossTax - reliefs.total);

        // PIT Rebate for YA 2025
        const pitRebate = this.applyPITRebate(netBeforeRebate);

        const netAfterRebate = Math.max(0, netBeforeRebate - pitRebate);

        return {
            totalAnnualIncome,
            totalGrossTax,
            fatherGrossTax,
            motherGrossTax,
            reliefs,
            netBeforeRebate,
            pitRebate,
            netAfterRebate,
            effectiveTaxRate: totalAnnualIncome > 0 ? (netAfterRebate / totalAnnualIncome) * 100 : 0,
            taxSavings: reliefs.total + pitRebate
        };
    }

    getMarginalTaxRate(annualIncome) {
        for (const bracket of this.taxBrackets2025) {
            if (annualIncome <= bracket.max) {
                return bracket.rate * 100;
            }
        }
        return this.taxBrackets2025[this.taxBrackets2025.length - 1].rate * 100;
    }

    getTaxBrackets() {
        return this.taxBrackets2025.map(b => ({
            range: b.max === Infinity
                ? `${b.min.toLocaleString()} and above`
                : `${b.min.toLocaleString()} – ${b.max.toLocaleString()}`,
            rate: `${(b.rate * 100).toFixed(1)}%`
        }));
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TaxCalculator: TaxCalculator2025 };
}

if (typeof window !== 'undefined') {
    window.GOL = { TaxCalculator: TaxCalculator2025 };
}
