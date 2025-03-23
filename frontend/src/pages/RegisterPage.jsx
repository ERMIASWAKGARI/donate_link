import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdditionalInfoForm from './register/AdditionalInfoForm';
import BasicInfoForm from './register/BasicInfoForm';
import RoleSelection from './register/RoleSelection';

function RegisterPage() {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: '',
    address: '',
    location: '',
    verificationDocs: [],
    skills: [],
    availability: [],
  });

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle file upload
  const handleFileChange = (e) => {
    setFormData({ ...formData, verificationDocs: e.target.files });
  };

  // Handle role selection
  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setFormData({ ...formData, role });
    setCurrentStep(2);
  };

  // Handle step navigation
  const nextStep = () => {
    if (selectedRole === 'individual_donor') {
      handleSubmit(); // ✅ Skip Step 3 & Submit Directly
    } else {
      setCurrentStep(3);
    }
  };
  const prevStep = () => setCurrentStep(1);

  // Handle form submission
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    // 🔹 Only keep required fields for Individual Donors
    let filteredData = { ...formData };
    if (formData.role === 'individual_donor') {
      filteredData = {
        role: formData.role,
        name: formData.name,
        email: formData.email,
        password: formData.password,
      };
    }

    try {
      const response = await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filteredData),
      });

      console.log(filteredData);

      const data = await response.json();
      console.log(data.data);
      if (data.status === 'success') {
        if (data.data.requiresVerification) {
          alert(
            `Registration successful! Please verify your ${data.data.verificationType}.`
          );

          // ✅ Redirect based on verification type
          if (data.data.verificationType === 'email') {
            navigate(`/verify?email=${data.data.email}`);
          } else if (data.data.verificationType === 'phone') {
            navigate(`/verify?phone=${data.data.phone}`);
          }
        } else {
          alert('Registration successful! You can now log in.');
          navigate('/login'); // ✅ Redirect to login
        }
      } else {
        alert('Registration Failed: ' + data.message);
      }
    } catch (error) {
      console.error('Registration Error:', error.message);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        {currentStep === 1 && <RoleSelection onSelect={handleRoleSelect} />}
        {currentStep === 2 && (
          <BasicInfoForm
            formData={formData}
            onChange={handleChange}
            onNext={nextStep} // ✅ Skips Step 3 for Individual Donors
          />
        )}
        {currentStep === 3 && selectedRole !== 'individual_donor' && (
          <AdditionalInfoForm
            selectedRole={selectedRole}
            formData={formData}
            onChange={handleChange}
            onFileChange={handleFileChange}
            onBack={prevStep}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  );
}

export default RegisterPage;
