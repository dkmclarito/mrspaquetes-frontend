import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

const EmailVerification = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    try {
      await axios.post(`${API_URL}/send-email-verification`, { email });
      setMessage('Verification code sent to your email.');
    } catch (error) {
      setMessage('Error sending verification code.');
    }
  };

  const handleVerifyEmail = async () => {
    try {
      await axios.post(`${API_URL}/email-verification`, { email, otp });
      setMessage('Email verified successfully!');
      navigate('/login');
    } catch (error) {
      setMessage('Invalid verification code.');
    }
  };

  return (
    <div className="email-verification" style={styles.container}>
      <h1>Email Verification</h1>
      <div style={styles.formGroup}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          style={styles.input}
        />
        <button onClick={handleSendOtp} style={styles.button}>
          Send Verification Code
        </button>
      </div>
      <div style={styles.formGroup}>
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter verification code"
          style={styles.input}
        />
        <button onClick={handleVerifyEmail} style={styles.button}>
          Verify Email
        </button>
      </div>
      {message && <p style={styles.message}>{message}</p>}
    </div>
  );
};

export default EmailVerification;
