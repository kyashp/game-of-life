//5. Inflation Adjuster class - adjusts costs for inflation using CPI data and projections

class InflationAdjuster {
    constructor() {
        this.cpiData = new Map(); // year -> CPI value
        this.dataConnector = new DataSourceConnector('SINGSTAT_CPI');
        this.baseCPIYear = 2024;
        this.defaultInflationRate = 2.4; // Singapore average inflation rate

        // initialize with fallback Singapore CPI data immediately since no async operations are required
        this.initializeFallbackCPIData();
    }

    /**
     * initialize the adjuster with CPI data, attempting to fetch updated data but falling back to static data if needed
     * @returns {Promise<boolean>} - returns true if initialization completes successfully, false otherwise
     */
    async initialize() {
        try {
            // attempt to fetch updated CPI data from the data connector
            const cpiData = await this.dataConnector.fetchData({
                dataset: 'cpi_all_items'
            });

            if (cpiData && cpiData.result && cpiData.result.records.length > 0) {
                this.processCPIData(cpiData.result.records);
                console.log('CPI data updated from external source');
            } else {
                console.log('using fallback CPI data since external data is not available');
            }
            return true;
        } catch (error) {
            console.log('CPI initialization failed, using static data:', error.message);
            // Fallback data already initialized in constructor
            return true;
        }
    }

    /**
     * process CPI data records from the API response and store them in the internal map
     * @param {Array} records - array of CPI data records containing year, month, and CPI values
     */
    processCPIData(records) {
        records.forEach(record => {
            if (record.year && record.cpi_value) {
                this.cpiData.set(parseInt(record.year), parseFloat(record.cpi_value));
            }
        });

        console.log(`Processed CPI data for ${this.cpiData.size} years`);
    }

    /**
     * initialize fallback CPI data for Singapore using static values that are always available
     */
    initializeFallbackCPIData() {
        // static Singapore CPI data with base year 2019 = 100, sourced from SingStat
        const singaporeCPI = {
            2019: 100.0,
            2020: 99.6,   // COVID-19 deflation
            2021: 102.3,  // Recovery
            2022: 108.2,  // High inflation
            2023: 112.1,  // Continued inflation
            2024: 115.2,  // Current estimate
            2025: 118.0   // Projected (2.4% inflation)
        };

        Object.entries(singaporeCPI).forEach(([year, cpi]) => {
            this.cpiData.set(parseInt(year), cpi);
        });

        console.log('Initialized Singapore CPI data (2019-2025)');
    }

    /**
     * calculate the inflation rate between two years using CPI data
     * @param {number} baseYear - the starting year for the inflation calculation
     * @param {number} targetYear - the target year for the inflation calculation
     * @returns {number} - the inflation rate as a decimal (e.g., 0.024 for 2.4%)
     */
    calculateInflationRate(baseYear, targetYear) {
        const baseCPI = this.cpiData.get(baseYear);
        const targetCPI = this.cpiData.get(targetYear);

        if (baseCPI && targetCPI) {
            return (targetCPI - baseCPI) / baseCPI;
        }

        // Fallback to compound annual growth rate using default inflation
        const years = targetYear - baseYear;
        return Math.pow(1 + this.defaultInflationRate / 100, years) - 1;
    }

    /**
     * adjust a cost for inflation from a base year to a target year using CPI data
     * @param {number} baseCost - the original cost in the base year
     * @param {number} baseYear - the year in which the base cost is measured
     * @param {number} targetYear - the year to which the cost should be adjusted
     * @returns {number} - the cost adjusted for inflation to the target year
     */
    adjustCostForInflation(baseCost, baseYear, targetYear) {
        if (baseYear === targetYear) {
            return baseCost;
        }

        const baseCPI = this.cpiData.get(baseYear) || this.getCurrentCPI();
        let targetCPI = this.cpiData.get(targetYear);

        // If target year CPI not available, project it
        if (!targetCPI) {
            targetCPI = this.projectCPI(targetYear);
        }

        const adjustmentFactor = targetCPI / baseCPI;
        return baseCost * adjustmentFactor;
    }

    /**
     * adjust a cost for inflation over a specified number of years from the current date
     * @param {number} baseCost - the current cost to be adjusted
     * @param {number} years - the number of years into the future for the adjustment
     * @returns {number} - the cost adjusted for inflation after the specified years
     */
    adjustCostForFutureInflation(baseCost, years) {
        const currentYear = new Date().getFullYear();
        const targetYear = currentYear + years;
        return this.adjustCostForInflation(baseCost, currentYear, targetYear);
    }

    /**
     * project CPI value for future years using trend analysis based on the default inflation rate
     * @param {number} targetYear - the year for which to project the CPI value
     * @returns {number} - the projected CPI value for the target year
     */
    projectCPI(targetYear) {
        const currentYear = new Date().getFullYear();
        const currentCPI = this.getCurrentCPI();

        if (targetYear <= currentYear) {
            return currentCPI;
        }

        const yearsAhead = targetYear - currentYear;
        const annualInflationRate = this.defaultInflationRate / 100;

        return currentCPI * Math.pow(1 + annualInflationRate, yearsAhead);
    }

    /**
     * get the current CPI value for the present year
     * @returns {number} - the CPI value for the current year
     */
    getCurrentCPI() {
        const currentYear = new Date().getFullYear();
        return this.cpiData.get(currentYear) || 115.2; // Default to 2024 value
    }

    /**
     * get inflation-adjusted cost breakdown for different growth stages based on starting year
     * @param {Object} stageCosts - an object mapping growth stages to their base costs
     * @param {number} startYear - the year from which to start inflation adjustment
     * @returns {Object} - an object mapping growth stages to their inflation-adjusted costs
     */
    getInflationAdjustedStageCosts(stageCosts, startYear = new Date().getFullYear()) {
        const adjustedCosts = {};

        // Typical age progression for stages
        const stageAges = {
            'NEWBORN': 0,
            'INFANT': 1,
            'TODDLER': 2,
            'PRESCHOOL': 4,
            'PRIMARY': 7,
            'SECONDARY': 13,
            'TERTIARY': 17,
            'ADULT': 21
        };

        Object.entries(stageCosts).forEach(([stage, cost]) => {
            const stageStartAge = stageAges[stage] || 0;
            const targetYear = startYear + stageStartAge;
            adjustedCosts[stage] = this.adjustCostForInflation(cost, startYear, targetYear);
        });

        return adjustedCosts;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { InflationAdjuster };
}

if (typeof window !== 'undefined') {
    window.GOL = { InflationAdjuster };
}
