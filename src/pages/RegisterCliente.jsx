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
    setMessage(''); // Limpiar mensajes previos

    try {
      // Validar formato de email y longitud de contraseña
      if (!email || !password || password.length < 6) {
        setMessage('Por favor, ingrese un correo electrónico válido y una contraseña de al menos 6 caracteres.');
        return;
      }

      // Enviar solicitud de registro
      const response = await axios.post(`${API_URL}/register`, { email, password });

      if (response.status === 200) {
        setIsRegistered(true);
        setMessage('¡Registro exitoso! Por favor, revisa tu correo electrónico para obtener el código de verificación.');
        setTimeout(() => navigate('/email-verification'), 3000); // Redirigir después de 3 segundos
      } else {
        setMessage(`Fallo en el registro: ${response.data.message || 'Error'}`);
      }
    } catch (error) {
      if (error.response && error.response.status === 422) {
        // Manejar errores de validación
        const errors = error.response.data.errors || {};
        let errorMessage = 'Falló la validación: ';
        for (const [field, messages] of Object.entries(errors)) {
          errorMessage += `${field}: ${messages.join(', ')}; `;
        }
        setMessage(errorMessage || `Fallo en el registro: ${error.response.data.message || 'Error'}`);
      } else {
        setMessage(`Fallo en el registro: ${error.response?.data?.message || 'Error'}`);
      }
    }
  };

  return (
    <div className={styles.registerContainer}>
      <div className={styles.registerCard}>
        <h2 className={styles.registerTitle}>{isRegistered ? 'Verifica tu correo electrónico' : 'Registro de Cliente'}</h2>
        {message && (
          <p className={`${styles.message} ${message.includes('exitoso') ? styles.success : styles.error}`}>
            {message}
          </p>
        )}
        {!isRegistered ? (
          <form onSubmit={handleSubmit} className={styles.registerForm}>
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.formLabel}>Correo Electrónico:</label>
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
              <label htmlFor="password" className={styles.formLabel}>Contraseña:</label>
              <input
                type="password"
                id="password"
                className={styles.formInput}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className={styles.submitButton}>Registrar</button>
          </form>
        ) : (
          <p>Por favor, revisa tu correo electrónico para obtener el código de verificación.</p>
        )}
      </div>
    </div>
  );
};

export default RegisterCliente;
