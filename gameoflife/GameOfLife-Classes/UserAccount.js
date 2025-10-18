//2. User Account Class - manages user account creation, login, password reset, and validation

class UserAccount {
    constructor(userId, username, email, authProvider = 'local') {
        this.userId = userId;
        this.username = username;
        this.email = email;
        // authentication provider can be 'local' for username/password authentication or 'google' for OAuth
        this.authProvider = authProvider;
    }

    /**
     * sign up a new user account by validating inputs and storing user data securely in localStorage
     * @param {string} username - the desired username for the new account
     * @param {string} email - the email address associated with the account
     * @param {string} password - the password chosen by the user for authentication
     * @returns {boolean} - returns true if the signup process completes successfully, false otherwise
     */
    signup(username, email, password) {
        try {
            if (!this.validateEmail(email) || !this.validatePassword(password)) {
                return false;
            }

            if (localStorage.getItem(`user_${username}`)) {
                console.error('User already exists');
                return false;
            }

            // Generate userId first
            const newUserId = this.generateUserId();

            // Create Authentication with proper parameters
            const auth = new Authentication(null, null, null);
            
            const userData = {
                userId: newUserId,
                username: username,
                email: email,
                password: auth.hashPassword(password), // ✅ Fixed - use instance method
                createdAt: new Date().toISOString(),
                authProvider: this.authProvider
            };

            localStorage.setItem(`user_${username}`, JSON.stringify(userData));

            // Update instance properties after successful save
            this.userId = newUserId;
            this.username = username;
            this.email = email;

            console.log('User signup successful:', { userId: newUserId, username, email });
            return true;
        } catch (error) {
            console.error('Error during signup:', error);
            return false;
        }
    }

    /**
     * log in the user by verifying the provided password against the stored hashed password and generating an auth token
     * @param {string} password - the password entered by the user for login
     * @returns {boolean} - returns true if login is successful and token is generated, false otherwise
     */
    login(password) {
        try {
            if (!this.username) {
                console.error('No username set for login');
                return false;
            }

            // Create Authentication with proper parameters
            const auth = new Authentication(null, null, null);
            if (auth.verifyCredentials(this.username, password)) {
                const token = auth.generateToken(this.userId);
                localStorage.setItem(`auth_token_${this.userId}`, token);
                console.log('Login successful for user:', this.username);
                return true;
            }
            console.error('Invalid credentials');
            return false;
        } catch (error) {
            console.error('Error during login:', error);
            return false;
        }
    }

    /**
     * initiate password reset by simulating sending a reset email and storing reset token in localStorage
     * @param {string} email - the email address associated with the account requesting password reset
     * @returns {boolean} - returns true if the reset process is initiated successfully, false otherwise
     */
    forgotPassword(email) {
        try {
            console.log(`Password reset email sent to ${email}`);

            const resetToken = Math.random().toString(36).substring(2);
            const resetData = {
                email: email,
                token: resetToken,
                expiry: new Date(Date.now() + 60 * 60 * 1000).toISOString()
            };

            localStorage.setItem(`reset_${email}`, JSON.stringify(resetData));
            return true;
        } catch (error) {
            console.error('Error sending password reset:', error);
            return false;
        }
    }

    generateUserId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2);
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validatePassword(password) {
        return password && password.length >= 6;
    }
}

 //3. Registered Users Class - extends UserAccount with password hashing for registered users

class RegisteredUsers extends UserAccount {
    constructor(userId, username, email, passwordHash, authProvider = 'local') {
        super(userId, username, email, authProvider);
        this.passwordHash = passwordHash;
    }

    login(password) {
        try {
            const auth = new Authentication();
            const hashedPassword = auth.hashPassword(password);

            // check if the hashed input password matches the stored password hash
            if (hashedPassword === this.passwordHash) {
                const token = auth.generateToken(this.userId);
                localStorage.setItem(`auth_token_${this.userId}`, token);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error during login:', error);
            return false;
        }
    }

    forgotPassword(email) {
        // verify that the provided email matches the registered email before proceeding with reset
        if (email === this.email) {
            return super.forgotPassword(email);
        }
        console.error('Email does not match registered email');
        return false;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UserAccount, RegisteredUsers };
}

if (typeof window !== 'undefined') {
    window.GOL = { UserAccount, RegisteredUsers };
}
