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

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const validatePassword = (password) => {
        const minLength = 6;
        const maxLength = 50;
        return password.length >= minLength &&
               password.length <= maxLength &&
               /[A-Z]/.test(password) &&
               /[a-z]/.test(password) &&
               /\d/.test(password) &&
               /[!@#$%^&*(),.?":{}|<>]/.test(password);
    };

    const handleEmailChange = (e) => {
        const value = e.target.value;
        setEmail(value);
        setEmailError(validateEmail(value) ? '' : 'Formato de correo electrónico no válido.');
    };

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setPassword(value);
        setPasswordError(validatePassword(value) ? '' : 'La contraseña debe tener entre 6 y 50 caracteres, incluyendo al menos una letra mayúscula, una letra minúscula, un número y un carácter especial.');
    };

    const handleConfirmPasswordChange = (e) => {
        const value = e.target.value;
        setConfirmPassword(value);
        setConfirmPasswordError(value === password ? '' : 'Las contraseñas no coinciden.');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
    
        if (emailError || passwordError || confirmPasswordError) {
            return; // Prevenir el envío del formulario si hay errores de validación
        }
    
        if (password !== confirmPassword) {
            alert('Las contraseñas no coinciden.');
            return;
        }
    
        try {
            const response = await axios.post(`${API_URL}/register`, { email, password });
    
            if (response.status === 200) {
                setIsRegistered(true);
                setMessage('¡Registro exitoso! Por favor, revisa tu correo electrónico para obtener el código de verificación.');
                
                // Redirigir después de un retraso para mostrar el mensaje
                setTimeout(() => navigate('/email-verification'), 3000);
            } else {
                setMessage('Fallo en el registro: Error inesperado');
            }
        } catch (error) {
            if (error.response) {
                const status = error.response.status;
                const errorData = error.response.data;
    
                if (status === 422) {
                    // Manejar errores de validación
                    const errors = errorData.error || {};
                    let errorMessage = 'Falló la validación: ';
                    if (errors.email) {
                        setEmailError(errors.email.join(', '));
                    }
                    if (errors.password) {
                        setPasswordError(errors.password.join(', '));
                    }
                    if (errorMessage.endsWith(': ')) {
                        errorMessage = 'Falló la validación: ' + Object.values(errors).flat().join(', ');
                    }
                    setMessage(errorMessage || 'Error inesperado');
                } else if (status === 409) {
                    // Manejar conflicto, como correo electrónico ya registrado
                    setEmailError('El correo electrónico ya está registrado.');
                    setMessage('Fallo en el registro: El correo electrónico ya está registrado.');
                } else {
                    setMessage(`Fallo en el registro: ${errorData.message || 'Error inesperado'}`);
                }
            } else {
                setMessage('Error de red. Por favor, intenta de nuevo.');
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
