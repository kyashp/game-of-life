//12. Insights Request class - handles requests for inflation-adjusted projections

class InsightsRequest {
    constructor(requestId, profileId, noOfChildren, educationPath) {
        this.requestId = requestId;
        this.profileId = profileId;
        this.noOfChildren = noOfChildren;
        this.educationPath = educationPath;

        // Initialize CORS-safe inflation adjuster
        this.inflationAdjuster = new InflationAdjuster();
    }

    async calculateProjections() {
        try {
            const profile = ParentProfile.load(this.profileId);
            if (!profile) {
                throw new Error('Profile not found');
            }

            // Initialize inflation adjuster (CORS-safe)
            await this.inflationAdjuster.initialize();

            const projections = new Map();

            // Singapore education cost estimates (2024 baseline)
            const educationCosts = {
                'JC_UNIVERSITY': {
                    preschool: 60000,
                    primary: 24000,
                    secondary: 36000,
                    jc: 12000,
                    university: 40000,
                    total: 172000
                },
                'POLYTECHNIC': {
                    preschool: 60000,
                    primary: 24000,
                    secondary: 36000,
                    polytechnic: 20000,
                    total: 140000
                },
                'ITE': {
                    preschool: 50000,
                    primary: 20000,
                    secondary: 30000,
                    ite: 15000,
                    total: 115000
                }
            };

            const baseCost = educationCosts[this.educationPath] || educationCosts['POLYTECHNIC'];

            for (let children = 1; children <= this.noOfChildren; children++) {
                const totalCost = baseCost.total * children;

                // Apply sibling discounts
                const siblingDiscount = children > 1 ? 0.95 ** (children - 1) : 1.0;
                const discountedCost = totalCost * siblingDiscount;

                // Apply inflation adjustment for 18-year projection (CORS-safe)
                const inflationAdjustedCost = this.inflationAdjuster.adjustCostForFutureInflation(discountedCost, 18);

                // Calculate range based on realism level
                const ranges = {
                    min: inflationAdjustedCost * 0.8,
                    expected: inflationAdjustedCost,
                    max: inflationAdjustedCost * 1.3
                };

                projections.set(`${children}_child${children > 1 ? 'ren' : ''}`, ranges);
            }

            return projections;
        } catch (error) {
            console.error('Error calculating projections:', error);
            return new Map();
        }
    }

    save() {
        try {
            const requestData = {
                requestId: this.requestId,
                profileId: this.profileId,
                noOfChildren: this.noOfChildren,
                educationPath: this.educationPath,
                createdAt: new Date().toISOString()
            };

            localStorage.setItem(`insights_${this.requestId}`, JSON.stringify(requestData));
            return true;
        } catch (error) {
            console.error('Error saving insights request:', error);
            return false;
        }
    }

    static load(requestId) {
        try {
            const requestData = localStorage.getItem(`insights_${requestId}`);
            if (requestData) {
                const data = JSON.parse(requestData);
                return new InsightsRequest(
                    data.requestId,
                    data.profileId,
                    data.noOfChildren,
                    data.educationPath
                );
            }
            return null;
        } catch (error) {
            console.error('Error loading insights request:', error);
            return null;
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { InsightsRequest };
}

if (typeof window !== 'undefined') {
    window.GOL = { InsightsRequest };
}
