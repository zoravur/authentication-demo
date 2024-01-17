// import './SignIn.css';
import React, { useState, ChangeEvent, FormEvent } from 'react';

const SignInPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleSignIn = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Handle sign in logic here
    console.log('Signing in with:', email, password);
  };

  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  return (
    <div className="sign-in-container">
      <form onSubmit={handleSignIn}>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={handleEmailChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={handlePasswordChange}
            required
          />
        </div>
        <button type="submit">Sign in</button>
        <div className="links">
          <a href="/signup">Sign up</a>
          <a href="/forgot-password">Forgot password?</a>
        </div>
      </form>
    </div>
  );
};

export default SignInPage;
