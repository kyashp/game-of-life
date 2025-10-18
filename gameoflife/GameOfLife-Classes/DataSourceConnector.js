//4. Data Source Connector class - handles CORS-safe data fetching from various sources

class DataSourceConnector {
    constructor(sourceType, dataPath = './data/', useProxy = false, proxyUrl = '/api/proxy') {
        this.sourceType = sourceType; // supported source types include 'ECDA_CHILDCARE' for childcare centers, 'MOE_SCHOOLS' for schools, and 'SINGSTAT_CPI' for consumer price index data
        this.dataPath = dataPath; // path to the directory containing pre-fetched JSON files for offline data access
        this.useProxy = useProxy; // flag to enable or disable the use of a backend proxy for API calls
        this.proxyUrl = proxyUrl; // URL of the backend proxy endpoint for handling API requests
        this.cacheDuration = 24; // duration in hours for which cached data remains valid
        this.lastFetch = null;
        this.cachedData = null;

        // initialize pre-fetched data
        this.initializeStaticData();
    }

    /**
     * initialize the connector with pre-fetched Singapore government data to ensure CORS-safe operations without external API calls
     */
    initializeStaticData() {
        this.staticData = {
            'ECDA_CHILDCARE': {
                result: {
                    records: [
                        // sample data for ECDA childcare centers, including center names, daily fees, and addresses
                        {
                            centre_name: "PCF SPARKLETOTS PRESCHOOL @ ADMIRALTY BLK 676",
                            full_day_fee: "800",
                            half_day_fee: "600",
                            centre_type: "FULL-DAY",
                            address: "676 WOODLANDS DRIVE 71, #01-01, SINGAPORE 730676"
                        },
                        {
                            centre_name: "PCF SPARKLETOTS PRESCHOOL @ ANG MO KIO BLK 406",
                            full_day_fee: "850",
                            half_day_fee: "650", 
                            centre_type: "FULL-DAY",
                            address: "406 ANG MO KIO AVENUE 10, #01-01, SINGAPORE 560406"
                        },
                        {
                            centre_name: "MY FIRST SKOOL @ BISHAN EAST",
                            full_day_fee: "1200",
                            half_day_fee: "800",
                            centre_type: "FULL-DAY",
                            address: "51 BISHAN STREET 13, #01-01, SINGAPORE 579799"
                        },
                        {
                            centre_name: "LITTLE SKOOL-HOUSE @ MARINA BAY",
                            full_day_fee: "1800",
                            half_day_fee: "1200",
                            centre_type: "PREMIUM",
                            address: "8 MARINA BOULEVARD, #02-01, SINGAPORE 018981"
                        }
                    ]
                },
                last_updated: new Date().toISOString()
            },

            'MOE_SCHOOLS': {
                result: {
                    records: [
                        // sample data for Ministry of Education (MOE) schools, including school names, sections, addresses, and zone codes
                        {
                            school_name: "ADMIRALTY PRIMARY SCHOOL",
                            school_section: "PRIMARY",
                            address: "31 WOODLANDS STREET 31, SINGAPORE 738582",
                            zone_code: "NORTH",
                            type_code: "GOVERNMENT"
                        },
                        {
                            school_name: "ANG MO KIO PRIMARY SCHOOL", 
                            school_section: "PRIMARY",
                            address: "21 ANG MO KIO STREET 61, SINGAPORE 569149",
                            zone_code: "NORTH",
                            type_code: "GOVERNMENT"
                        },
                        {
                            school_name: "ADMIRALTY SECONDARY SCHOOL",
                            school_section: "SECONDARY", 
                            address: "31 WOODLANDS STREET 31, SINGAPORE 738582",
                            zone_code: "NORTH",
                            type_code: "GOVERNMENT"
                        },
                        {
                            school_name: "HSINCHU JUNIOR COLLEGE",
                            school_section: "JUNIOR COLLEGE",
                            address: "661 BUKIT TIMAH ROAD, SINGAPORE 269734",
                            zone_code: "WEST",
                            type_code: "GOVERNMENT"
                        }
                    ]
                },
                last_updated: new Date().toISOString()
            },

            'POLY_FEES': {
                result: {
                    records: [
                        // sample data for polytechnic course fees, including institution names, course titles, and annual fees for locals and internationals
                        {
                            institution: "NGEE ANN POLYTECHNIC",
                            course_name: "Diploma in Information Technology",
                            annual_fee_local: "2650",
                            annual_fee_international: "13200"
                        },
                        {
                            institution: "TEMASEK POLYTECHNIC",
                            course_name: "Diploma in Business",
                            annual_fee_local: "2650", 
                            annual_fee_international: "13200"
                        },
                        {
                            institution: "SINGAPORE POLYTECHNIC",
                            course_name: "Diploma in Engineering",
                            annual_fee_local: "2650",
                            annual_fee_international: "13200"
                        }
                    ]
                },
                last_updated: new Date().toISOString()
            },

            'SINGSTAT_CPI': {
                result: {
                    records: [
                        // sample Consumer Price Index (CPI) data for Singapore, with year, month, and CPI values for all items
                        { year: "2019", month: "12", cpi_value: "100.0", cpi_category: "ALL_ITEMS" },
                        { year: "2020", month: "12", cpi_value: "99.6", cpi_category: "ALL_ITEMS" },
                        { year: "2021", month: "12", cpi_value: "102.3", cpi_category: "ALL_ITEMS" },
                        { year: "2022", month: "12", cpi_value: "108.2", cpi_category: "ALL_ITEMS" },
                        { year: "2023", month: "12", cpi_value: "112.1", cpi_category: "ALL_ITEMS" },
                        { year: "2024", month: "06", cpi_value: "115.2", cpi_category: "ALL_ITEMS" }
                    ]
                },
                last_updated: new Date().toISOString()
            },

            'SCHOOL_CCAS': {
                result: {
                    records: [
                        // sample data for Co-Curricular Activities (CCA) in schools, including school names, CCA names, types, and monthly costs
                        {
                            school_name: "ADMIRALTY PRIMARY SCHOOL",
                            cca_name: "Basketball",
                            cca_type: "SPORTS",
                            estimated_monthly_cost: "50"
                        },
                        {
                            school_name: "ADMIRALTY PRIMARY SCHOOL", 
                            cca_name: "Piano",
                            cca_type: "PERFORMING_ARTS",
                            estimated_monthly_cost: "120"
                        },
                        {
                            school_name: "ANG MO KIO PRIMARY SCHOOL",
                            cca_name: "Science Club",
                            cca_type: "CLUBS_SOCIETIES",
                            estimated_monthly_cost: "30"
                        }
                    ]
                },
                last_updated: new Date().toISOString()
            }
        };

        console.log(`Initialized static data for ${this.sourceType} (CORS-safe)`);
    }

    /**
     * fetch data using a CORS-safe approach that prioritizes pre-fetched static data over external API calls to avoid browser restrictions
     * @param {Object} params - optional query parameters for filtering or specifying the data request
     * @returns {Promise<Object>} - a promise that resolves to the fetched data object
     */
    async fetchData(params = {}) {
        try {
            // Check if cached data is still valid
            if (this.isCacheValid()) {
                console.log(`Using cached data for ${this.sourceType}`);
                return this.cachedData;
            }

            // Try different data fetching strategies in order of preference

            // Strategy 1: Try to load from pre-fetched JSON file (CORS-safe)
            const jsonData = await this.loadFromJSONFile(params);
            if (jsonData) {
                this.cacheData(jsonData);
                return jsonData;
            }

            // Strategy 2: Try backend proxy if enabled (requires backend setup)
            if (this.useProxy) {
                const proxyData = await this.fetchViaProxy(params);
                if (proxyData) {
                    this.cacheData(proxyData);
                    return proxyData;
                }
            }

            // Strategy 3: Return static data (always works)
            console.log(`Using static data for ${this.sourceType} (CORS fallback)`);
            const staticData = this.staticData[this.sourceType];
            if (staticData) {
                this.cacheData(staticData);
                return staticData;
            }

            // Strategy 4: Last resort fallback
            return this.getEmptyResponse();

        } catch (error) {
            console.error(`Error fetching data for ${this.sourceType}:`, error);
            return this.handleDataFetchFailure();
        }
    }

    /**
     * load data from a pre-fetched JSON file to avoid CORS issues when fetching from external APIs
     * @param {Object} params - optional query parameters to specify the data request
     * @returns {Promise<Object|null>} - a promise that resolves to the JSON data or null if not found
     */
    async loadFromJSONFile(params) {
        try {
            const fileName = this.getJSONFileName(params);
            const filePath = `${this.dataPath}${fileName}`;

            console.log(`Attempting to load JSON file: ${filePath}`);

            const response = await fetch(filePath);
            if (response.ok) {
                const data = await response.json();
                console.log(`Successfully loaded JSON data from ${fileName}`);
                return data;
            }
        } catch (error) {
            console.log(`JSON file not found for ${this.sourceType}, using static data`);
        }
        return null;
    }

    /**
     * determine the JSON filename to load based on the source type and query parameters
     * @param {Object} params - optional query parameters to customize the filename
     * @returns {string} - the filename of the JSON file to load
     */
    getJSONFileName(params) {
        const fileMap = {
            'ECDA_CHILDCARE': 'childcare-centres.json',
            'MOE_SCHOOLS': 'singapore-schools.json',
            'POLY_FEES': 'polytechnic-fees.json',
            'SINGSTAT_CPI': 'singapore-cpi.json',
            'SCHOOL_CCAS': 'school-ccas.json'
        };

        return fileMap[this.sourceType] || `${this.sourceType.toLowerCase()}.json`;
    }

    /**
     * fetch data via a backend proxy server to bypass CORS restrictions when direct API calls are not possible
     * @param {Object} params - optional query parameters to include in the proxy request
     * @returns {Promise<Object|null>} - a promise that resolves to the proxy response data or null if the request fails
     */
    async fetchViaProxy(params) {
        try {
            const proxyRequest = {
                sourceType: this.sourceType,
                params: params
            };

            const response = await fetch(this.proxyUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(proxyRequest)
            });

            if (response.ok) {
                const data = await response.json();
                console.log(`Successfully fetched via proxy for ${this.sourceType}`);
                return data;
            }
        } catch (error) {
            console.log(`Proxy fetch failed for ${this.sourceType}:`, error.message);
        }
        return null;
    }

    /**
     * check if the cached data is still valid based on the cache duration and last fetch timestamp
     * @returns {boolean} - returns true if the cache is valid, false otherwise
     */
    isCacheValid() {
        if (!this.cachedData || !this.lastFetch) {
            return false;
        }

        const now = new Date();
        const fetchTime = new Date(this.lastFetch);
        const hoursDiff = (now - fetchTime) / (1000 * 60 * 60);

        return hoursDiff < this.cacheDuration;
    }

    /**
     * Cache data with timestamp
     * @param {Object} data - Data to cache
     */
    cacheData(data) {
        this.cachedData = data;
        this.lastFetch = new Date().toISOString();

        // Also store in localStorage for persistence
        const cacheKey = `data_cache_${this.sourceType}`;
        const cacheData = {
            data: data,
            timestamp: this.lastFetch,
            sourceType: this.sourceType
        };

        try {
            localStorage.setItem(cacheKey, JSON.stringify(cacheData));
        } catch (error) {
            console.warn('Failed to cache data in localStorage:', error);
        }
    }

    /**
     * Handle data fetch failure
     * @returns {Object} - Fallback data
     */
    handleDataFetchFailure() {
        // Try to load from localStorage cache
        const cacheKey = `data_cache_${this.sourceType}`;
        const cachedString = localStorage.getItem(cacheKey);

        if (cachedString) {
            try {
                const cached = JSON.parse(cachedString);
                console.warn(`All methods failed, using localStorage cache from ${cached.timestamp}`);
                this.cachedData = cached.data;
                this.lastFetch = cached.timestamp;
                return cached.data;
            } catch (error) {
                console.error('Failed to parse cached data:', error);
            }
        }

        // Final fallback to static data
        return this.staticData[this.sourceType] || this.getEmptyResponse();
    }

    /**
     * Get empty response structure
     * @returns {Object} - Empty response
     */
    getEmptyResponse() {
        return {
            result: { records: [] },
            error: `No data available for ${this.sourceType}`,
            last_updated: new Date().toISOString()
        };
    }

    /**
     * Clear cached data
     */
    clearCache() {
        this.cachedData = null;
        this.lastFetch = null;
        localStorage.removeItem(`data_cache_${this.sourceType}`);
    }

    /**
     * Get sample record for testing
     * @returns {Object} - Sample data record
     */
    getSampleRecord() {
        const staticData = this.staticData[this.sourceType];
        if (staticData && staticData.result && staticData.result.records.length > 0) {
            return staticData.result.records[0];
        }
        return null;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DataSourceConnector };
}

if (typeof window !== 'undefined') {
    window.GOL = { DataSourceConnector };
}
