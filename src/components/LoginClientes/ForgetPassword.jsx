import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './ForgetResetPassword.module.css';

const ForgetPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSending(true);
    setMessage('');

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/password/forget-password`, { email });
      if (response.data.success) {
        setMessage('Se ha enviado un enlace de restablecimiento a tu email.');
        setTimeout(() => {
          navigate('/reset-password');
        }, 4000); // Redirigir después de 4 segundos
      }
    } catch (error) {
      setMessage('Error al enviar el enlace. Verifique su email.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.formCard}>
        <h1 className={styles.formTitle}>Olvidé mi Contraseña</h1>
        {message && (
          <div className={`${styles.message} ${message.includes('enviado') ? styles.success : styles.error}`}>
            {message}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ingresa tu correo electrónico"
              className={styles.formInput}
              required
            />
          </div>
          <button type="submit" className={styles.submitButton} disabled={isSending}>
            {isSending ? 'Enviando...' : 'Enviar Enlace de Restablecimiento'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgetPassword;
