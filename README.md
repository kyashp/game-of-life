# game-of-life

### Things to be done: 

Pages: 


- ## Landing Page: [Abhi]

    - Frontend: 
        - Header                        (done)
        - description                   (done)
        - [Start simulating Now] button (done) 
        - [How to use Game of life] button- link to the help popup --> [Nigel] (created, just need to link)


        - Login: (done)
            - Username input field 
            - Password input field

        - Sign Up: (done)
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
        - incorporate authentication 
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

    - Frontend: [Yash]
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


### Things we need to try & settle by TMR: 

1. Standardise the flow of the Web App :
- interaction between pages 
- purpose and implementation of LifeSim & Insights
- Idea of Realism 
- tax calculator & other classes deem if necessary


2. Code of the Web App (by pages) : 
- Frontend done, now mostly backend left 

# (Landing Page)
- Settle Authentication & security (lower priority, need meet functionality first)
- Add guest mode to User account component 
- Settle some bugs to go to different pages 


# (Profile Page)
- Create & Link Firebase storage for profile data (Authorised user mode)
- Create & Link Local Storage for Profile data (guest mode)

# (LifeSim Page)
- Finalise what APIs we are going to use 
- Animation of the Child's life: 
- Implement the APIs and Dashboard 

(starts here) Newborn --> Kindergarten --> Pri Sch --> Sec Sch --> JC --->  Uni --> Adult (stops here)
                                                                --> Poly -/--^

- Implement Export as CSV/ PDF Logic (for both guests & Users)-- or maybe only for Users ? 



# (Insights Page)
- Finalise the logic to get the Median value 
- Use Dashboard component to show results 



3. Diagrams :
- Use Case
- Class 
- Sequence 
- Dialog Map 
- System Architecture 


4. Presentation Slides : 
- flow of slides 
- Presentation time is 13-15 Mins so split evenly 

- Evaluation Criteria from Github: 
    - framework
    - quality
    - diversity
    - completeness
    - novelty
    - Usefulness 
    - presentation quality 

- Good SWE practices & system design incorporated into our project 

5. May not need but best to have: 
(from lab4&5 handout)
- Test cases & Testing Results (black box & white box testing techniques)
- Demo Script 
- Key public classes 
- test one important control classes 






