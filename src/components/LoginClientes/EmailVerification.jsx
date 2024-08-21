import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "../../styles/EmailVerification.css";

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
    <div className="registerContainer">
      <div className="registerCard">
        <h1 className="registerTitle">Verificación de Correo Electrónico</h1>
        {message && (
          <div className={`message ${message.includes('éxito') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
        <div className="registerForm">
          <div className="formGroup">
            <label className="formLabel">Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ingresa tu correo electrónico"
              className="formInput"
            />
          </div>
          <button onClick={handleSendOtp} className="submitButton" disabled={isSending}>
            {isSending ? 'Enviando...' : 'Enviar Código de Verificación'}
          </button>
          <div className="formGroup">
            <label className="formLabel">Código de Verificación</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Ingresa el código de verificación"
              className="formInput"
            />
          </div>
          <button onClick={handleVerifyEmail} className="submitButton" disabled={isVerifying}>
            {isVerifying ? 'Verificando...' : 'Verificar Correo'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
