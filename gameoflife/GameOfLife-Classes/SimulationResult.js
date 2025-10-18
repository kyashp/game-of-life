// 11. Simualation Result
class SimulationResult {
    constructor(resultId, sessionId, finalHouseholdSavings, totalExpenditure, totalReliefs, costBreakdownJSON) {
        this.resultId = resultId;
        this.sessionId = sessionId;
        this.finalHouseholdSavings = finalHouseholdSavings;
        this.totalExpenditure = totalExpenditure;
        this.totalReliefs = totalReliefs;
        this.costBreakdownJSON = costBreakdownJSON;
        this.generatedAt = new Date().toISOString();
    }

    generateChart() {
        try {
            const costBreakdown = JSON.parse(this.costBreakdownJSON);

            return {
                type: 'pie',
                title: 'Child-Raising Cost Breakdown (Inflation-Adjusted)',
                data: {
                    labels: Object.keys(costBreakdown).map(key => 
                        key.charAt(0).toUpperCase() + key.slice(1)
                    ),
                    datasets: [{
                        data: Object.values(costBreakdown),
                        backgroundColor: [
                            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'
                        ]
                    }]
                },
                summary: {
                    totalCost: this.totalExpenditure,
                    totalBenefits: this.totalReliefs,
                    netCost: this.totalExpenditure - this.totalReliefs,
                    finalSavings: this.finalHouseholdSavings
                }
            };
        } catch (error) {
            console.error('Error generating chart:', error);
            return null;
        }
    }

    save() {
        try {
            const resultData = {
                resultId: this.resultId,
                sessionId: this.sessionId,
                finalHouseholdSavings: this.finalHouseholdSavings,
                totalExpenditure: this.totalExpenditure,
                totalReliefs: this.totalReliefs,
                costBreakdownJSON: this.costBreakdownJSON,
                generatedAt: this.generatedAt
            };

            localStorage.setItem(`result_${this.resultId}`, JSON.stringify(resultData));
            return true;
        } catch (error) {
            console.error('Error saving simulation result:', error);
            return false;
        }
    }

    static load(resultId) {
        try {
            const resultData = localStorage.getItem(`result_${resultId}`);
            if (resultData) {
                const data = JSON.parse(resultData);
                return new SimulationResult(
                    data.resultId,
                    data.sessionId,
                    data.finalHouseholdSavings,
                    data.totalExpenditure,
                    data.totalReliefs,
                    data.costBreakdownJSON
                );
            }
            return null;
        } catch (error) {
            console.error('Error loading simulation result:', error);
            return null;
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SimulationResult };
}

if (typeof window !== 'undefined') {
    window.GOL = { SimulationResult };
}
