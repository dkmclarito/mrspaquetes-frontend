import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Form, FormGroup, Label, Input, Button, FormFeedback } from 'reactstrap';
import styles from '../styles/RegisterClientes.module.css';
import logo from '../assets/logo.png';

const API_URL = import.meta.env.VITE_API_URL;

const RegisterCliente = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [message, setMessage] = useState('');
    const [isRegistered, setIsRegistered] = useState(false);
    const navigate = useNavigate();

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password) => {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
    };

    const handleEmailChange = (e) => {
        const value = e.target.value;
        setEmail(value);
        if (!validateEmail(value)) {
            setEmailError('Formato de correo electrónico no válido.');
        } else {
            setEmailError('');
        }
    };

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setPassword(value);
        if (!validatePassword(value)) {
            setPasswordError('La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una letra minúscula, un número y un carácter especial.');
        } else {
            setPasswordError('');
        }
    };

    const handleConfirmPasswordChange = (e) => {
        const value = e.target.value;
        setConfirmPassword(value);
        if (value !== password) {
            setConfirmPasswordError('Las contraseñas no coinciden.');
        } else {
            setConfirmPasswordError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        if (emailError || passwordError || confirmPasswordError) {
            return; // Prevenir el envío del formulario si hay errores de validación
        }

        try {
            const response = await axios.post(`${API_URL}/register`, { email, password });

            if (response.status === 200) {
                setIsRegistered(true);
                setMessage('¡Registro exitoso! Por favor, revisa tu correo electrónico para obtener el código de verificación.');
                
                // Redirigir después de un retraso para mostrar el mensaje
                setTimeout(() => navigate('/email-verification'), 3000);
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
                <img src={logo} alt="Logo" className={styles.logo} />
                <h2 className={styles.registerTitle}>
                    {isRegistered ? 'Verifica tu correo electrónico' : 'Registro de Cliente'}
                </h2>
                {message && (
                    <p className={`${styles.message} ${message.includes('exitoso') ? styles.success : styles.error}`}>
                        {message}
                    </p>
                )}
                {!isRegistered && (
                    <Form onSubmit={handleSubmit}>
                        <FormGroup className={styles.formGroup}>
                            <Label for="email" className={styles.formLabel}>Correo Electrónico</Label>
                            <Input
                                type="email"
                                name="email"
                                id="email"
                                placeholder="Ingresa tu correo electrónico"
                                value={email}
                                onChange={handleEmailChange}
                                className={styles.formInput}
                                invalid={!!emailError}
                            />
                            {emailError && <FormFeedback>{emailError}</FormFeedback>}
                        </FormGroup>
                        <FormGroup className={styles.formGroup}>
                            <Label for="password" className={styles.formLabel}>Contraseña</Label>
                            <Input
                                type="password"
                                name="password"
                                id="password"
                                placeholder="Ingresa tu contraseña"
                                value={password}
                                onChange={handlePasswordChange}
                                className={styles.formInput}
                                invalid={!!passwordError}
                            />
                            {passwordError && <FormFeedback>{passwordError}</FormFeedback>}
                        </FormGroup>
                        <FormGroup className={styles.formGroup}>
                            <Label for="confirmPassword" className={styles.formLabel}>Confirmar Contraseña</Label>
                            <Input
                                type="password"
                                name="confirmPassword"
                                id="confirmPassword"
                                placeholder="Confirma tu contraseña"
                                value={confirmPassword}
                                onChange={handleConfirmPasswordChange}
                                className={styles.formInput}
                                invalid={!!confirmPasswordError}
                            />
                            {confirmPasswordError && <FormFeedback>{confirmPasswordError}</FormFeedback>}
                        </FormGroup>
                        <Button
                            type="submit"
                            className={styles.submitButton}
                            disabled={!!emailError || !!passwordError || !!confirmPasswordError}
                        >
                            Registrar
                        </Button>
                    </Form>
                )}
            </div>
        </div>
    );
};

export default RegisterCliente;
