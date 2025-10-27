'use client'; //required for using client side features like useState, event handlers

import React,{useState, useEffect} from 'react';
import {useSearchParams, useRouter} from 'next/navigation';
import { GuestStorageManager } from '@/utils/guestStorage';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

// === Content from styles.css embedded as a string ===
const CSS_STYLES = `
body{
    background-color: #8b93ff80;
    min-height: 100vh;
    margin: 0;
}
.page-center-wrapper{
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    width: auto;
}
.profile-container{
    background-color: #8b93ff80;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    padding: 25px;
    border-radius: 25px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    width: 1000px;
    max-width: 90%;
    margin-top: -100px;
}
.profile-container h2{
    font-size: xx-large;
    font-weight: bold;
    text-align: center;
    color: #2f2e48;
    margin-bottom: 25px;
}
.form-grid-layout{
    display: grid;
    grid-template-columns: repeat(3,1fr); /* 3 columns */
    gap: 20px;
}
.form-group{
    border-radius: 100%;
    display: flex;
    flex-direction: column;
}
label{
    font-weight: bold;
    color: #484670;
    margin-bottom: 5px;
    font-size: 0.9em;
}
input, select{
    padding: 10px 12px;
    border: 1px solid #ccc;
    border-radius: 8px;
    font-size: 1em;
    background-color: #fff;
    color: #333;
    background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="%238a8a8a" d="M7 10l5 5 5-5z"/></svg>');
    background-repeat: no-repeat;
    background-position: right 10px center;
    background-size: 14px;
    appearance: none;
    -webkit-appearance: none;
}
.actions{
    grid-column: 1 / -1; /* Span all columns */
    display: flex;
    justify-content: center;
    gap: 15px;
    margin-top: 30px;
}
.button-group {
    display: flex;
    gap: 10px; /* Replaces margin-right */
}

.button-group button{
    padding: 12px 25px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: bold;
    font-size: 1em;
    transition: background-color 0.2s;
}
.save-button{
    background-color: #00bf63;
    color: white;
}
.modify-button{
    background-color: #ffc107;
    color: white;
}
.delete-button{
    background-color: #ff3131;
    color: white;
}
.button-group button:hover{
    opacity: 0.7;
}
.error-message{
    color: #dc3545;
    font-size: 0.85em;
    margin-top: 5px;
}
.input-error{
    border-color: #dc3545 !important;
}
`;

// Component to inject the CSS string into the DOM
const GlobalStyles = () => {
    return (
        <style dangerouslySetInnerHTML={{ __html: CSS_STYLES }} />
    );
};
// =======================================================


//Initial state of Profile Data
const initialProfileData={
  Father_Residency:'',
  Mother_Residency:'',
  Household_Income_Type:'',
  Father_Gross_Monthly_Income: null,
  Mother_Gross_Monthly_Income: null,
  Father_Disposable_Income: null,
  Mother_Disposable_Income: null,
  Child_Name:'',
  Family_Savings: null, 
  Child_Gender: '', //Male, Female
  Realism_Level: '', //pessimistic, neutral, optimistic
}

export default function Profile() {
  const searchParams = useSearchParams(); // to read URL query parameters
  const router = useRouter(); // to programmatically navigate
  const [isGuestMode, setIsGuestMode] = useState(false); // State to track if in guest mode
  const [currentUser, setCurrentUser] = useState(null); // State to track authenticated user

  const [profileData, setProfileData] = useState(initialProfileData);
  const [errors, setErrors] = useState({});

   // Check for guest mode on mount
  useEffect(() => {
    const mode = searchParams.get('mode');
    
    if (mode === 'guest') {
      setIsGuestMode(true);
      console.log('Guest mode activated');
      
      // Check if guest session exists
      const guestId = GuestStorageManager.getGuestId();
      if (!guestId) {
        // No guest session, redirect to landing
        alert('Guest session not found. Please try again.');
        router.push('/Landing_Page');
      }
    } else {
      // Check for authenticated user
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setCurrentUser(user);
          setIsGuestMode(false);
        } else if (!isGuestMode) {
          // Not logged in and not guest mode
          router.push('/Landing_Page');
        }
      });

      return () => unsubscribe();
    }
  }, [searchParams, router]);


  //Function to handle changes to input and update the state
  const handleChange=(e)=>{
    const {id, value, type} = e.target;
    const val = type === 'number' && value !== '' ? parseFloat(value): value; // Convert to number data type if type is number and value is not empty

    setProfileData(prevData => ({
      ...prevData,
      [id]: val===''? null: val //Use null for optional fields if left empty
    }));
    
    //Clear error message once user starts typing
    setErrors(prevErrors => ({
      ...prevErrors,
      [id]: null, //clears error message
    }))
  }

  //Validation Function to check required fields and numeric fields
  const ValidateProfileData=()=>{
    const newErrors={};
    let isValid=true;
    //Define acceptable numeric ranges
    const incomeRange={min: 1000, max: 50000};
    const savingsRange={min: 10000, max: 100000};

    //Helper function to check required fields are not empty
    const checkRequired=(field, fieldName)=>{
      if(!profileData[field]){
        newErrors[field]=`${fieldName} is required.`; 
        isValid=false;
      }
    };
    //Helper function to check numeric fields are within range
    const checkNumericRange=(field, fieldName, min, max, isOptional=false)=>{
      const value=profileData[field];
      if(!isOptional && !value){ //If field is required and empty
        newErrors[field]=`${fieldName} is required.`;
        isValid=false;
        return;
      }
      if(value!==null && (value<min || value>max || isNaN(value))){ //If field has value and is out of range or not a number
      newErrors[field]=`${fieldName} must be between ${min} and ${max} SGD.`;
      isValid=false;
      }
    };
    //Check required text fields
    checkRequired('Father_Residency', 'Father Residency');
    checkRequired('Mother_Residency', 'Mother Residency');
    checkRequired('Household_Income_Type', 'Household Income Type');
    checkRequired('Child_Name', 'Child Name');
    checkRequired('Child_Gender', 'Child Gender');
    checkRequired('Realism_Level', 'Realism Level');

    //Check required numeric fields
    checkNumericRange('Father_Gross_Monthly_Income', 'Father Gross Monthly Income', incomeRange.min, incomeRange.max, false);
    checkNumericRange('Mother_Gross_Monthly_Income', 'Mother Gross Monthly Income', incomeRange.min, incomeRange.max, false);

    //Check optional numeric fields
    checkNumericRange('Father_Disposable_Income', 'Monthly Disposable Income (Father)', incomeRange.min, incomeRange.max, true);
    checkNumericRange('Mother_Disposable_Income', 'Monthly Disposable Income (Mother)', incomeRange.min, incomeRange.max, true);
    checkNumericRange('Family_Savings', 'Family Savings', savingsRange.min, savingsRange.max, true);

    setErrors(newErrors);
    return isValid;
  }

  //Function to handle form submission
  const handleSubmit=async(e)=>{
    e.preventDefault(); //Prevent default form submission behavoir

    if(ValidateProfileData()){ //If all fields are valid
      console.log('Profile Data is Valid:', profileData);
      //Proceed to send data to backend
      
      //Placeholder     
    
    } else {
      console.log('Profile Data has errors:', errors);
      //Errors will be automatically displayed in the UI 
    }
  };

  // Save profile data
  const handleSaveProfile = () => {
    if (isGuestMode) {
      // Save to local storage for guest
      const success = GuestStorageManager.saveProfile(profileData);
      if (success) {
        alert('Profile saved locally!');
        console.log('Guest profile saved:', profileData);
      } else {
        alert('Failed to save profile. Please try again.');
      }
    } else {
      // Save to Firebase for authenticated user
      // ...your existing save logic...
      alert('Profile saved to your account!');
    }
  };

  //Function to handle Modify and Delete buttons
  const handleModifyButton=()=>{
    alert('Modify logic triggered. (Load existing profile)');
    //Placeholder
  };
  const handleDeleteButton=()=>{
    if(confirm('Are you sure you want to delete your profile? (This action cannot be undone)')){
      alert('Delete logic triggered. (Delete profile from backend)');
      //Placeholder
    }
  };

  return (
    <> {/* Used a React Fragment to render both the styles and the main content */}
    
    {/* Guest Mode Banner */}
      {isGuestMode && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded">
          <div className="flex items-center gap-2">
            <span className="text-2xl">👤</span>
            <div>
              <p className="font-bold">Guest Mode</p>
              <p className="text-sm">
                Your progress is saved locally. Create an account to save permanently.
              </p>
            </div>
          </div>
        </div>
      )}

      <GlobalStyles />
      <div className="page-center-wrapper"> 
        <div className="profile-container">
          <h2>Create your Profile</h2>
          <form onSubmit={handleSubmit} className="form-grid-layout">
            {/* Helper component for rendering group */}
            <FormGroup
              id="Father_Residency"
              label="Father Residency"
              type="select"
              value={profileData.Father_Residency}
              onChange={handleChange}
              error={errors.Father_Residency}
              options={['Singaporean', 'PR']}
            />
            <FormGroup
              id="Mother_Residency"
              label="Mother Residency"
              type="select"
              value={profileData.Mother_Residency}
              onChange={handleChange}
              error={errors.Mother_Residency}
              options={['Singaporean', 'PR']}
            />
            <FormGroup
              id="Household_Income_Type"
              label="Household Income Type"
              type="select"
              value={profileData.Household_Income_Type}
              onChange={handleChange}
              error={errors.Household_Income_Type}
              options={['Single', 'Mixed']}
            />
            <FormGroup
              id="Father_Gross_Monthly_Income"
              label="Father Gross Monthly Income"
              type="number"
              value={profileData.Father_Gross_Monthly_Income ?? ''}
              onChange={handleChange}
              error={errors.Father_Gross_Monthly_Income}
              placeholder="1000 - 50,000 (SGD)"
            />
            <FormGroup
              id="Mother_Gross_Monthly_Income"
              label="Mother Gross Monthly Income"
              type="number"
              value={profileData.Mother_Gross_Monthly_Income ?? ''}
              onChange={handleChange}
              error={errors.Mother_Gross_Monthly_Income}
              placeholder="1000 - 50,000 (SGD)"
            />
            <FormGroup
              id="Father_Disposable_Income"
              label="Monthly Disposable Income(Father)(Optional)"
              type="number"
              value={profileData.Father_Disposable_Income ?? ''}
              onChange={handleChange}
              error={errors.Father_Disposable_Income}
              placeholder="1000 - 50,000 (SGD)"
            />
            <FormGroup
              id="Mother_Disposable_Income"
              label="Monthly Disposable Income(Mother)(Optional) "
              type="number"
              value={profileData.Mother_Disposable_Income ?? ''}
              onChange={handleChange}
              error={errors.Mother_Disposable_Income}
              placeholder="1000 - 50,000 (SGD)"
            />
            <FormGroup
              id="Child_Name"
              label="Child Name"
              type="text"
              value={profileData.Child_Name}
              onChange={handleChange}
              error={errors.Household_Income_Type}
              placeholder="Enter Child's Name"
            />
            <FormGroup
              id="Family_Savings"
              label="Family Savings(Optional)"
              type="number"
              value={profileData.Family_Savings ?? ''}
              onChange={handleChange}
              error={errors.Family_Savings}
              placeholder="10,000 - 100,000 (SGD)"
            />
            <FormGroup
              id="Child_Gender"
              label="Child Gender"
              type="select"
              value={profileData.Child_Gender}
              onChange={handleChange}
              error={errors.Child_Gender}
              options={['Male', 'Female']}
            />
            <FormGroup
              id="Realism_Level"
              label="Realism Level"
              type="select"
              value={profileData.Realism_Level}
              onChange={handleChange}
              error={errors.Realism_Level}
              options={['Optimistic', 'Neutral', 'Pessimistic']}
            />
            <div className="form-group">
              {/* Empty spacer for layout alignment */}
            </div>

            {/* Buttons */}
            <div className="button-group">
              <button type="submit" className="save-button">Save</button>
              <button type="button" className="modify-button" onClick={handleModifyButton}>Modify</button>
              <button type="button" className="delete-button" onClick={handleDeleteButton}>Delete</button>
            </div>
          </form>
        </div>
      </div>
    </>
    );
}

//Component for individual form group
const FormGroup=({id, label, type, value, onChange, error, placeholder, options})=>{
  const isError=error !==null && error!==undefined;

  const inputElement=type==='select' ? (
    <select
      id={id}
      value={value}
      onChange={onChange}
      className={isError ? 'input-error' : ''}
    >
      <option value="">Select...</option>
      {options.map(opt=>(
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  ) : (
    <input
      type={type}
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={isError ? 'input-error' : ''}
    />
  );

  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      {inputElement}
      {isError && <span className="error-message">{error}</span>}
    </div>
  )
}