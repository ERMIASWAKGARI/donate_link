// // components/LoginModal.jsx
// import { useState, useContext } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { motion } from 'framer-motion';
// import AlertMessage from '../../src/components/AlertMessage';
// import GoogleAuth from '../../src/components/GoogleAuth';
// import RegisterWithGoogle from '../../src/components/RegisterWithGoogle';
// import { UserContext } from '../context/UserContext';

// export default function LoginModal({ onClose }) {
//   const { login } = useContext(UserContext);
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({
//     email: '',
//     phone: '',
//     countryCode: '+251',
//     password: '',
//   });
//   const [message, setMessage] = useState({ type: '', text: '' });
//   const [googleUser, setGoogleUser] = useState(null);
//   const [isRegisteringWithGoogle, setIsRegisteringWithGoogle] = useState(false);

//   // ... keep all your existing login logic ...

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//       <motion.div
//         initial={{ scale: 0.9, opacity: 0 }}
//         animate={{ scale: 1, opacity: 1 }}
//         className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 mx-4"
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* Your existing login form JSX */}
//         <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
//           &times;
//         </button>
//         {/* ... rest of your form ... */}
//       </motion.div>
//     </div>
//   );
// }