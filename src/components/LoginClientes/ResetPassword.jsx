import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './ForgetResetPassword.module.css';

const ResetPassword = ({ token }) => {
  const [email, setEmail] = useState(''); // Añadido para enviar el email al backend
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsResetting(true);
    setMessage('');

    if (newPassword !== confirmPassword) {
      setMessage('Las contraseñas no coinciden.');
      setIsResetting(false);
      return;
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/password/reset`, {
        email, // Enviar el email al backend
        otp,
        password: newPassword,
      });

      if (response.data.success) {
        setMessage('Tu contraseña ha sido restablecida.');
        setTimeout(() => {
          navigate('/clienteLogin');
        }, 4000); // Redirigir después de 4 segundos
      } else {
        setMessage('Error al restablecer la contraseña.');
      }
    } catch (error) {
      setMessage('Error al restablecer la contraseña.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.formCard}>
        <h1 className={styles.formTitle}>Restablecer Contraseña</h1>
        {message && (
          <div className={`${styles.message} ${message.includes('restablecida') ? styles.success : styles.error}`}>
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
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Código de Verificación (OTP)</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Ingresa el código de verificación"
              className={styles.formInput}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Nueva Contraseña</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Ingresa tu nueva contraseña"
              className={styles.formInput}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Confirmar Contraseña</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirma tu nueva contraseña"
              className={styles.formInput}
              required
            />
          </div>
          <button type="submit" className={styles.submitButton} disabled={isResetting}>
            {isResetting ? 'Restableciendo...' : 'Restablecer Contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
