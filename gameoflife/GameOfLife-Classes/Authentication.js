//1. Authentication Class - handles user authentication, token generation, validation, and logout
class Authentication {
    constructor(authId, authToken, expiryTime) {
        this.authId = authId;
        this.authToken = authToken;
        this.expiryTime = expiryTime;
    }

    /**
     * verify the user's credentials by comparing the provided username and password against the stored values in localStorage
     * @param {string} username - the username provided by the user for authentication
     * @param {string} password - the password provided by the user for authentication
     * @returns {boolean} - returns true if the credentials match the stored values, false otherwise
     */
    verifyCredentials(username, password) {
        try {
            const storedUser = localStorage.getItem(`user_${username}`);
            if (storedUser) {
                const userData = JSON.parse(storedUser);
                return userData.password === this.hashPassword(password);
            }
            return false;
        } catch (error) {
            console.error('Error verifying credentials:', error);
            return false;
        }
    }

    /**
     * generate a unique authentication token for the user based on their userId, current timestamp, and a random string
     * @param {string} userId - the unique identifier of the user for whom the token is being generated
     * @returns {string} - the generated authentication token encoded in base64
     */
    generateToken(userId) {
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2);
        const token = btoa(`${userId}_${timestamp}_${randomString}`);

        // set the authentication token's expiry time to 24 hours from the current time
        // use ISO string format for the expiry time: YYYY-MM-DDTHH:mm:ss.sssZ
        this.expiryTime = new Date(timestamp + 24 * 60 * 60 * 1000).toISOString();
        this.authToken = token;

        return token;
    }

    /**
     * validate the provided authentication token by checking if it matches the stored token and has not expired
     * @param {string} authToken - the authentication token to be validated
     * @returns {boolean} - returns true if the token is valid and not expired, false otherwise
     */
    validateToken(authToken) {
        if (!authToken || authToken !== this.authToken) {
            return false;
        }

        const now = new Date();
        const expiry = new Date(this.expiryTime);

        return now < expiry;
    }

    /**
     * log out the user by invalidating their authentication token and removing it from localStorage
     * @param {string} userId - the unique identifier of the user being logged out
     * @returns {boolean} - returns true if the logout was successful, false if an error occurred
     */
    logout(userId) {
        try {
            this.authToken = null;
            this.expiryTime = null;
            localStorage.removeItem(`auth_token_${userId}`);
            return true;
        } catch (error) {
            console.error('Error during logout:', error);
            return false;
        }
    }

    /**
     * helper method to hash passwords using base64 encoding (simplified implementation, will be replaced with bcrypt later)
     * @param {string} password - the plain text password to be hashed
     * @returns {string} - the hashed password as a base64 encoded string
     */
    hashPassword(password) {
        // convert the password string to base64 encoded ASCII
        return btoa(password);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Authentication };
}

if (typeof window !== 'undefined') {
    window.GOL = { Authentication };
}
