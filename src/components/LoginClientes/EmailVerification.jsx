import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

const EmailVerification = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    setIsSending(true);
    setMessage('');

    try {
      await axios.post(`${API_URL}/send-email-verification`, { email });
      setMessage('Verification code sent to your email.');
    } catch (error) {
      setMessage('Error sending verification code.');
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyEmail = async () => {
    setIsVerifying(true);
    setMessage('');

    try {
      const response = await axios.post(`${API_URL}/email-verification`, { email, otp });

      if (response.status === 200) {
        setMessage('Email verified successfully!');
        navigate('/login');
      } else {
        setMessage(`Verification failed: ${response.data.error || 'Error'}`);
      }
    } catch (error) {
      setMessage('Invalid verification code.');
    } finally {
      setIsVerifying(false);
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
        <button onClick={handleSendOtp} style={styles.button} disabled={isSending}>
          {isSending ? 'Sending...' : 'Send Verification Code'}
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
        <button onClick={handleVerifyEmail} style={styles.button} disabled={isVerifying}>
          {isVerifying ? 'Verifying...' : 'Verify Email'}
        </button>
      </div>
      {message && <p style={styles.message}>{message}</p>}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
  },
  formGroup: {
    margin: '10px 0',
  },
  input: {
    padding: '10px',
    fontSize: '16px',
    margin: '5px 0',
  },
  button: {
    padding: '10px 20px',
    fontSize: '16px',
    margin: '5px 0',
    cursor: 'pointer',
  },
  message: {
    marginTop: '20px',
    fontSize: '16px',
    color: '#ff0000',
  },
};

export default EmailVerification;
