'use client'; //required for using client side features like useState, event handlers

import React,{useState} from 'react';
import './styles.css';

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
  Realism_Level: '', //High, Med, Low
}

export default function Profile() {
  const [profileData, setProfileData] = useState(initialProfileData);
  const [errors, setErrors] = useState({});

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
          options={['Singaporean', 'PR', 'Foreigner']}
        />
        <FormGroup
          id="Mother_Residency"
          label="Mother Residency"
          type="select"
          value={profileData.Mother_Residency}
          onChange={handleChange}
          error={errors.Mother_Residency}
          options={['Singaporean', 'PR', 'Foreigner']}
        />
        <FormGroup
          id="Household_Income_Type"
          label="Household Income Type"
          type="select"
          value={profileData.Household_Income_Type}
          onChange={handleChange}
          error={errors.Household_Income_Type}
          options={['Salaried', 'Self-Employed', 'Mixed']}
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
          options={['High', 'Medium', 'Low']}
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