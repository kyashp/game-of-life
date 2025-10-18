 //10. Simulation Session class - manages simulation sessions with CORS-safe data integration

class SimulationSession {
    constructor(sessionId, userId, profileId) {
        this.sessionId = sessionId;
        this.userId = userId;
        this.profileId = profileId;
        this.currentChildAgeMths = 0;
        this.currentGrowthStage = 'NEWBORN';
        this.isPaused = false;
        this.simulationSpeed = 1.0;
        this.householdIncomeBalance = 0.0;
        this.totalExpenditure = 0.0;
        this.totalReliefs = 0.0;
        this.edusaveBalance = 0.0;
        this.growthStage = new Map();

        // Initialize CORS-safe components
        this.inflationAdjuster = new InflationAdjuster();
        this.dataConnectors = {
            childcare: new DataSourceConnector('ECDA_CHILDCARE'),
            schools: new DataSourceConnector('MOE_SCHOOLS'),
            polytechnic: new DataSourceConnector('POLY_FEES')
        };

        this.initializeGrowthStages();
    }

    async initialize() {
        try {
            await this.inflationAdjuster.initialize();
            console.log('Simulation initialized with CORS-safe data integration');
            return true;
        } catch (error) {
            console.error('Failed to initialize simulation:', error);
            return true; // Continue with static data
        }
    }

    initializeGrowthStages() {
        const stages = {
            'MALE': [
                ['NEWBORN', 0], ['INFANT', 2], ['TODDLER', 12], 
                ['PRESCHOOL', 36], ['PRIMARY', 72], ['SECONDARY', 144], 
                ['TERTIARY', 192], ['ADULT', 216]
            ],
            'FEMALE': [
                ['NEWBORN', 0], ['INFANT', 2], ['TODDLER', 12], 
                ['PRESCHOOL', 36], ['PRIMARY', 72], ['SECONDARY', 144], 
                ['TERTIARY', 192], ['ADULT', 216]
            ]
        };

        stages['MALE'].forEach(([stage, age]) => {
            this.growthStage.set(`MALE_${stage}`, age);
        });

        stages['FEMALE'].forEach(([stage, age]) => {
            this.growthStage.set(`FEMALE_${stage}`, age);
        });
    }

    async start() {
        try {
            await this.initialize();

            this.isPaused = false;
            this.currentChildAgeMths = 0;
            this.currentGrowthStage = 'NEWBORN';

            const profile = ParentProfile.load(this.profileId);
            if (profile) {
                this.householdIncomeBalance = profile.familySavings;
            }

            console.log('CORS-safe simulation started successfully');
            this.saveState();
        } catch (error) {
            console.error('Error starting simulation:', error);
        }
    }

    // Additional methods would continue with CORS-safe implementations...
    // [Rest of SimulationSession methods with CORS fixes]

    getCurrentGrowthStage(childAgeMths = null, childGender = null) {
        const ageMonths = childAgeMths || this.currentChildAgeMths;
        const profile = ParentProfile.load(this.profileId);
        const gender = childGender || (profile ? profile.childGender : 'MALE');

        const stages = ['NEWBORN', 'INFANT', 'TODDLER', 'PRESCHOOL', 'PRIMARY', 'SECONDARY', 'TERTIARY', 'ADULT'];

        for (let i = stages.length - 1; i >= 0; i--) {
            const stageKey = `${gender}_${stages[i]}`;
            const stageAge = this.growthStage.get(stageKey);
            if (ageMonths >= stageAge) {
                return stages[i];
            }
        }

        return 'NEWBORN';
    }

    saveState() {
        try {
            const stateData = {
                sessionId: this.sessionId,
                userId: this.userId,
                profileId: this.profileId,
                currentChildAgeMths: this.currentChildAgeMths,
                currentGrowthStage: this.currentGrowthStage,
                isPaused: this.isPaused,
                simulationSpeed: this.simulationSpeed,
                householdIncomeBalance: this.householdIncomeBalance,
                totalExpenditure: this.totalExpenditure,
                totalReliefs: this.totalReliefs,
                edusaveBalance: this.edusaveBalance,
                lastSaved: new Date().toISOString()
            };

            localStorage.setItem(`simulation_${this.sessionId}`, JSON.stringify(stateData));
        } catch (error) {
            console.error('Error saving simulation state:', error);
        }
    }

    static load(sessionId) {
        try {
            const stateData = localStorage.getItem(`simulation_${sessionId}`);
            if (stateData) {
                const data = JSON.parse(stateData);
                const session = new SimulationSession(data.sessionId, data.userId, data.profileId);
                Object.assign(session, data);
                return session;
            }
            return null;
        } catch (error) {
            console.error('Error loading simulation state:', error);
            return null;
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SimulationSession };
}

if (typeof window !== 'undefined') {
    window.GOL = { SimulationSession };
}
