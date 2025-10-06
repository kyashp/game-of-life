// Test configuration for GameOfLife Classes

const TEST_CONFIG = {
    // File paths relative to testing_classes directory
    CLASS_FILES: [
        '../GameOfLife-Classes/helper.js',
        '../GameOfLife-Classes/Authentication.js', 
        '../GameOfLife-Classes/UserAccount.js',
        '../GameOfLife-Classes/DataSourceConnector.js',
        '../GameOfLife-Classes/InflationAdjuster.js',
        '../GameOfLife-Classes/TaxCalculator.js',
        '../GameOfLife-Classes/ParentProfile.js',
        '../GameOfLife-Classes/GovernmentBenefits.js',
        '../GameOfLife-Classes/CostEvent.js',
        '../GameOfLife-Classes/SimulationSession.js',
        '../GameOfLife-Classes/SimulationResult.js',
        '../GameOfLife-Classes/InsightsRequest.js',
        '../GameOfLife-Classes/corsUsage.js'
    ],
    
    // Expected classes and their critical methods
    EXPECTED_CLASSES: {
        'Authentication': ['hashPassword', 'verifyCredentials', 'generateToken'],
        'UserAccount': ['signup', 'login', 'forgotPassword'],
        'ParentProfile': ['save', 'load', 'validate', 'calculateTaxInformation'],
        'TaxCalculator2025': ['calculateIncomeTax', 'calculateReliefs'],
        'InflationAdjuster': ['initialize', 'adjustCostForFutureInflation'],
        'DataSourceConnector': ['fetchData', 'loadStaticData'],
        'GovernmentBenefits': ['calculateEligibility', 'calculateValue'],
        'SimulationSession': ['start', 'pause', 'resume', 'processEvent'],
        'CostEvent': ['calculateCost', 'getDecisionOptions']
    },
    
    // Test data
    TEST_DATA: {
        USER: {
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123'
        },
        PROFILE: {
            residencyStatusFather: 'CITIZEN',
            residencyStatusMother: 'PR',
            grossMthlyIncomeFather: 6000,
            grossMthlyIncomeMother: 4500,
            familySavings: 75000,
            childName: 'TestChild',
            childGender: 'MALE'
        }
    }
};

// Utility function to load all class files dynamically
function loadClassFiles() {
    return new Promise((resolve, reject) => {
        let loadedCount = 0;
        const totalFiles = TEST_CONFIG.CLASS_FILES.length;
        
        TEST_CONFIG.CLASS_FILES.forEach(filePath => {
            const script = document.createElement('script');
            script.src = filePath;
            script.onload = () => {
                loadedCount++;
                if (loadedCount === totalFiles) {
                    resolve();
                }
            };
            script.onerror = () => {
                reject(new Error(`Failed to load ${filePath}`));
            };
            document.head.appendChild(script);
        });
    });
}1