# game-of-life

### Things to be done: 

Pages: 


- ## Landing Page: [Abhi]

    - Frontend: 
        - Header
        - description
        - [Start simulating Now] button 
        - [How to use Game of life] button- link to the help popup --> [Nigel]


        - Login: 
            - Username input field
            - Password input field

        - Sign Up: 
            - Input fields: 
                - Username
                - Email
                - Password
                - Confirm Password

        - Play as Guest: 
                - will log in as guest and will be stored in sessionstorage ( stored in browser and deleted once user closes the browser)

        - Once signed in, logout feature 


    - Backend: 
        [Use FireBase]
        - Create database for storing registered users, Username, Email, Hashed Password, password  
        - create a session storage feature for guest users (client-side)
        -  maybe also local storage 
        - route api via /api 
        



- ## Profile Page: [Wei_Yong]

    - Frontend: 
        - profile requirements ( Parent Info, residency, nationality, child info etc. ) --> (done)
        - Guest Mode indicatore --> [Abhi]
        

    - Backend: 
        - create database for profile data 
        - save to session storage for guests --> [Abhi]
        - use /api to route the functions to save, modify, delete  

- ## LifeSim Page: [Yash]

    - Frontend: 
        - Simulation Interface
        - load profile data 
        - Simulation dashboard 
        - export dashboard as csv 

    - Backend: 
        - read and load from sesionstorage for guests --> [Abhi] 
        - load form database for registered users 
        


- ## Insights Page: 

    - Frontend: [Sujith]
        -  interface to input number of children 
        - disclaimer 
        - [generate insights] button 
        -  catch any errors for empty input 
        


    - Backend: [Nigel]
        - read from sessionstorage for guests --> [Abhi]
        - incorporate dashboard component after click of [generate insights] button 



## Others: 
- ### Components: 

    - NavBar --> [Abhi] (done) 
    - Logo (under public) (done)
    - Dashboard (for LifeSim & Insights pages) --> [Yash]
    - Help Popup --> [Candice] (done)
    - GuestModeIndicator Component --> [Abhi]


## Storage Architecture

### Guest Users (Client-Side Only)
```
SessionStorage (Browser)
├── guest_id
├── guest_profile
├── guest_simulations
└── guest_insights

Auto-deleted when:
- Tab closed
- Browser closed
```

### Registered Users (Client + Server)
```
LocalStorage (Browser) - Temporary
├── user_token
└── user_profile (cached)

Database (Firebase) - Permanent
├── users table
│   ├── id
│   ├── username
│   ├── email
│   ├── password_hash
│   └── created_at
├── profiles table
│   ├── id
│   ├── user_id
│   ├── child_name
│   ├── parent_income
│   └── ...
└── simulations table
    ├── id
    ├── user_id
    ├── profile_id
    ├── results
    └── created_at
```


### Technical Stack

- **Frontend:** Next.js 14, React, Tailwind CSS
- **Client Storage:** SessionStorage (guests), LocalStorage (cache)
- **Database:** Firebase
- **Authentication:** JWT tokens (stored in LocalStorage)
- **Deployment:** Vercel (serverless)




### Round 1 code submissions: 
19 Oct = Week 9 Sun 



### Final Lab Deliverables: 

- Working Application Prototype (source code)
 Design test cases using black box and white box testing techniques
- need to deliver: Test cases and Testing results 
- Plan Live Demo + script
- Demo Video after the presentation 




### Testing Checklist

- [ ] Guest login works (SessionStorage created)
- [ ] Guest can create profile (saved to SessionStorage)
- [ ] Guest can run simulation (results in SessionStorage)
- [ ] Guest logout clears all SessionStorage
- [ ] Registered signup saves to database
- [ ] Registered login authenticates against database
- [ ] Registered user data persists across sessions
- [ ] All features work on deployed Vercel app






