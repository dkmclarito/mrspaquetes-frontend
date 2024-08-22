import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Form, FormGroup, Label, Input, Button, FormFeedback } from 'reactstrap';
import styles from '../styles/EmailVerification.module.css';
import logo from '../assets/logo.png';

const API_URL = import.meta.env.VITE_API_URL;

const EmailVerification = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [emailError, setEmailError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateOtp = (otp) => {
    const otpRegex = /^\d{6}$/;
    return otpRegex.test(otp);
  };

  const handleSendOtp = async () => {
    setIsSending(true);
    setMessage('');
    setEmailError('');

    if (!validateEmail(email)) {
      setEmailError('Formato de correo electrónico no válido.');
      setIsSending(false);
      return;
    }

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
    setOtpError('');

    if (!validateOtp(otp)) {
      setOtpError('El código de verificación debe ser un número de 6 dígitos.');
      setIsVerifying(false);
      return;
    }

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
        <img src={logo} alt="Logo" className={styles.logo} />
        <h1 className={styles.registerTitle}>Verificación de Correo Electrónico</h1>
        {message && (
          <p className={`${styles.message} ${message.includes('enviado') || message.includes('éxito') ? styles.success : styles.error}`}>
            {message}
          </p>
        )}
        <Form>
          <FormGroup className={styles.formGroup}>
            <div className={styles.emailContainer}>
              <Input
                type="email"
                name="email"
                id="email"
                placeholder="Ingresa tu correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${styles.formInput} ${styles.emailInput}`}
                invalid={!!emailError}
              />
              <Button
                onClick={handleSendOtp}
                className={`${styles.submitButton} ${styles.reenviarButton}`}
                disabled={isSending}
              >
                {isSending ? 'Enviando...' : 'Reenviar código'}
              </Button>
            </div>
            {emailError && <FormFeedback>{emailError}</FormFeedback>}
          </FormGroup>
          <FormGroup className={styles.formGroup}>
            <Label for="otp" className={styles.formLabel}>Código de Verificación</Label>
            <Input
              type="text"
              name="otp"
              id="otp"
              placeholder="Ingresa el código de verificación"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className={styles.formInput}
              invalid={!!otpError}
              maxLength="6"
            />
            {otpError && <FormFeedback>{otpError}</FormFeedback>}
          </FormGroup>
          <Button
            onClick={handleVerifyEmail}
            className={styles.submitButton}
            disabled={isVerifying}
          >
            {isVerifying ? 'Verificando...' : 'Verificar Correo'}
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default EmailVerification;
