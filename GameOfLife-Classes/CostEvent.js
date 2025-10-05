 //9. Cost Event class - represents cost events in the simulation with decision options

class CostEvent {
    constructor(eventId, title, description, eventType, stage, realism, cost, decisionOptionsJSON) {
        this.eventId = eventId;
        this.title = title;
        this.description = description;
        this.eventType = eventType; // 'MANDATORY', 'OPTIONAL', 'EMERGENCY'
        this.stage = stage;
        this.realism = realism; // 'BASIC', 'REALISTIC', 'PREMIUM'
        this.cost = cost;
        this.decisionOptionsJSON = decisionOptionsJSON;
    }

    isApplicable(stage, realism) {
        try {
            const stageMatch = this.stage === 'ALL' || this.stage === stage;

            const realismLevels = ['BASIC', 'REALISTIC', 'PREMIUM'];
            const currentRealismIndex = realismLevels.indexOf(realism);
            const eventRealismIndex = realismLevels.indexOf(this.realism);

            const realismMatch = eventRealismIndex <= currentRealismIndex;

            return stageMatch && realismMatch;
        } catch (error) {
            console.error('Error checking event applicability:', error);
            return false;
        }
    }

    getDecisionOptions() {
        try {
            if (this.decisionOptionsJSON) {
                return JSON.parse(this.decisionOptionsJSON);
            }

            switch(this.eventType) {
                case 'MANDATORY':
                    return [
                        { id: 'accept', text: 'Accept', costMultiplier: 1.0 },
                        { id: 'budget', text: 'Budget Option', costMultiplier: 0.8 }
                    ];
                case 'OPTIONAL':
                    return [
                        { id: 'accept', text: 'Accept', costMultiplier: 1.0 },
                        { id: 'premium', text: 'Premium Option', costMultiplier: 1.5 },
                        { id: 'decline', text: 'Decline', costMultiplier: 0.0 }
                    ];
                case 'EMERGENCY':
                    return [
                        { id: 'immediate', text: 'Immediate Action', costMultiplier: 1.2 },
                        { id: 'wait', text: 'Wait and See', costMultiplier: 0.9 }
                    ];
            default:
                return [
                    { id: 'default', text: 'Proceed', costMultiplier: 1.0 }
                ];
        }
    } catch (error) {
        console.error('Error parsing decision options:', error);
        return [{ id: 'default', text: 'Proceed', costMultiplier: 1.0 }];
    }
}

    calculateFinalCost(decisionId) {
        const options = this.getDecisionOptions();
        const selectedOption = options.find(option => option.id === decisionId);

        if (selectedOption) {
            return this.cost * selectedOption.costMultiplier;
        }

        return this.cost;
    }

    static createSampleEvents() {
        return [
            new CostEvent(
                'event_001',
                'Hospital Delivery',
                'Cost of hospital delivery and initial medical care',
                'MANDATORY',
                'NEWBORN',
                'BASIC',
                3000,
                JSON.stringify([
                    { id: 'public', text: 'Public Hospital', costMultiplier: 1.0 },
                    { id: 'private', text: 'Private Hospital', costMultiplier: 2.5 }
                ])
            ),

            new CostEvent(
                'event_002',
                'Baby Equipment',
                'Essential baby equipment and furniture',
                'MANDATORY',
                'NEWBORN',
                'REALISTIC',
                2500,
                JSON.stringify([
                    { id: 'basic', text: 'Basic Set', costMultiplier: 0.8 },
                    { id: 'complete', text: 'Complete Set', costMultiplier: 1.0 },
                    { id: 'premium', text: 'Premium Set', costMultiplier: 1.5 }
                ])
            ),

            new CostEvent(
                'event_003',
                'Preschool Enrollment',
                'Monthly preschool fees and related costs',
                'MANDATORY',
                'PRESCHOOL',
                'BASIC',
                800,
                JSON.stringify([
                    { id: 'local', text: 'Local Preschool', costMultiplier: 1.0 },
                    { id: 'international', text: 'International Preschool', costMultiplier: 2.0 }
                ])
            )
        ];
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CostEvent };
}

if (typeof window !== 'undefined') {
    window.GOL = { CostEvent };
}
