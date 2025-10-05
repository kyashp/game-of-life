// index.js - Main export file
const { Authentication } = require('./Authentication.js');
const { UserAccount, RegisteredUsers } = require('./UserAccount.js');
const { ParentProfile } = require('./ParentProfile.js');
const { GovernmentBenefits } = require('./GovernmentBenefits.js');
const { SimulationSession } = require('./SimulationSession.js');
const { CostEvent } = require('./CostEvent.js');
const { SimulationResult } = require('./SimulationResult.js');
const { InsightsRequest } = require('./InsightsRequest');
const { DataSourceConnector } = require('./DataSourceConnector.js');
const { InflationAdjuster } = require('./InflationAdjuster.js');
const { TaxCalculator } = require('./TaxCalculator.js');
const { generateUniqueId, formatCurrency, validateEnum } = require('./helper.js');
const { corsFixedExampleUsage } = require('./corsUsage.js');

// Export all classes and functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        Authentication, 
        UserAccount, 
        RegisteredUsers, 
        ParentProfile, 
        GovernmentBenefits, 
        SimulationSession, 
        CostEvent, 
        SimulationResult, 
        InsightsRequest, 
        DataSourceConnector, 
        InflationAdjuster, 
        TaxCalculator,
        generateUniqueId,
        formatCurrency,
        validateEnum,
        corsFixedExampleUsage
    };
}

// For browser global scope
if (typeof window !== 'undefined') {
    window.GOL = {
        Authentication, 
        UserAccount, 
        RegisteredUsers, 
        ParentProfile, 
        GovernmentBenefits, 
        SimulationSession, 
        CostEvent, 
        SimulationResult, 
        InsightsRequest, 
        DataSourceConnector, 
        InflationAdjuster, 
        TaxCalculator,
        generateUniqueId,
        formatCurrency,
        validateEnum,
        corsFixedExampleUsage
    };
}