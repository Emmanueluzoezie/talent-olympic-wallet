"use client"
import React, { useCallback, useState } from 'react'
import { PasswordFormProps } from '../types/Components';
import { storePassword } from '../utils/WalletStorage';

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
    storePassword(projectKey, password);
    onPasswordSet(password);
  }, [password, confirmPassword, projectKey, onPasswordSet]);

  return (
    <form onSubmit={handleSubmit}>
      <div className='px-6'>
        <h2 className='pb-10 primary-text-color font-semibold text-center text-[22px] pt-20'>Create your password</h2>
        <label htmlFor="password" className='primary-text-color pl-3 text-[14px]'>Password: </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className='w-full p-2 text-black  outline-none rounded'
          minLength={8}
        />
      </div>
      <div className='px-6 mt-6'>
        <label htmlFor="confirmPassword" className='primary-text-color pl-3 text-[14px]'>Confirm Password:</label>
        <input
          type="password"
          id="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className='w-full p-2 text-black  outline-none rounded'
          required
        />
      </div>
      {error && <p className='text-red-600 pl-6 text-[14px]'>{error}</p>}
      {confirmPassword.length <= 0 ? "" : ""}
      <div className='mt-20 px-6'>
        <button type="submit" className={` rounded  w-full p-1 font-semibold text-[16px] ${confirmPassword.length <= 0 ? "bg-zinc-600 text-zinc-500" : "button-bgcolor button-textcolor"}`}>Create Wallet</button>
      </div>
    </form>
  );
};

export default CreatePassword