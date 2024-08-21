import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './EmailVerification.module.css';

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
      setMessage('Código de verificación enviado a tu correo electrónico.');
    } catch (error) {
      setMessage('Error al enviar el código de verificación.');
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
        setMessage('¡Correo electrónico verificado con éxito!');
        setTimeout(() => {
          navigate('/clienteLogin');
        }, 4000);
      } else {
        setMessage(`La verificación falló: ${response.data.error || 'Error'}`);
      }
    } catch (error) {
      setMessage('Código de verificación inválido.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className={styles.registerContainer}>
      <div className={styles.registerCard}>
        <h1 className={styles.registerTitle}>Verificación de Correo Electrónico</h1>
        {message && (
          <div className={`${styles.message} ${message.includes('éxito') ? styles.success : styles.error}`}>
            {message}
          </div>
        )}
        <div className={styles.registerForm}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ingresa tu correo electrónico"
              className={styles.formInput}
            />
          </div>
          <button onClick={handleSendOtp} className={styles.submitButton} disabled={isSending}>
            {isSending ? 'Enviando...' : 'Enviar Código de Verificación'}
          </button>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Código de Verificación</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Ingresa el código de verificación"
              className={styles.formInput}
            />
          </div>
          <button onClick={handleVerifyEmail} className={styles.submitButton} disabled={isVerifying}>
            {isVerifying ? 'Verificando...' : 'Verificar Correo'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
