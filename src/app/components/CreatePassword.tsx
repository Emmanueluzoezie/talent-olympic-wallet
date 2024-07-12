"use client"
import React, { useCallback, useState } from 'react'
import { PasswordFormProps } from '../types/Components';
import { encryptPassword } from '../utils/PasswordEncryption';

const CreatePassword: React.FC<PasswordFormProps> = ({ password, setPassword, projectKey, onPasswordSet }) => {
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
  
    const handleSubmit = useCallback((e: React.FormEvent) => {
      e.preventDefault();
  
      if (password.length < 8) {
        setError('Password must be at least 8 characters long');
        return;
      }
  
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
  
      setError('');
      encryptPassword.encrypt(projectKey, password);
      onPasswordSet(password);
    }, [password, confirmPassword, projectKey, onPasswordSet]);
  
    return (
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>
        <div>
          <label htmlFor="confirmPassword">Confirm Password:</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">Create Wallet</button>
      </form>
    );
  };

export default CreatePassword