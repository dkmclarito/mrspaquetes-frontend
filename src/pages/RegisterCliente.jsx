import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/RegisterClientes.module.css';

const API_URL = import.meta.env.VITE_API_URL;

const RegisterCliente = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); // Clear any previous messages
  
    try {
      // Validate email format and password length
      if (!email || !password || password.length < 6) {
        setMessage('Please provide a valid email and a password with at least 6 characters.');
        return;
      }
  
      // Send registration request
      const response = await axios.post(`${API_URL}/register`, { email, password });
  
      if (response.status === 200) {
        setIsRegistered(true);
        setMessage('Registration successful! Please check your email for a verification code.');
        // Optionally, redirect or perform other actions
      } else {
        setMessage(`Registration failed: ${response.data.message || 'Error'}`);
      }
    } catch (error) {
      if (error.response && error.response.status === 422) {
        // Handle validation errors
        const errors = error.response.data.errors || {};
        let errorMessage = 'Validation failed: ';
        for (const [field, messages] of Object.entries(errors)) {
          errorMessage += `${field}: ${messages.join(', ')}; `;
        }
        setMessage(errorMessage || `Registration failed: ${error.response.data.message || 'Error'}`);
      } else {
        setMessage(`Registration failed: ${error.response?.data?.message || 'Error'}`);
      }
    }
  };
  
  return (
    <div className={styles.registerContainer}>
      <div className={styles.registerCard}>
        <h2 className={styles.registerTitle}>{isRegistered ? 'Verify Your Email' : 'Client Registration'}</h2>
        {message && (
          <p className={`${styles.message} ${message.includes('successful') ? styles.success : styles.error}`}>
            {message}
          </p>
        )}
        {!isRegistered ? (
          <form onSubmit={handleSubmit} className={styles.registerForm}>
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.formLabel}>Email:</label>
              <input
                type="email"
                id="email"
                className={styles.formInput}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.formLabel}>Password:</label>
              <input
                type="password"
                id="password"
                className={styles.formInput}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className={styles.submitButton}>Register</button>
          </form>
        ) : (
          <p>Please check your email for a verification code.</p>
        )}
      </div>
    </div>
  );
};

export default RegisterCliente;
