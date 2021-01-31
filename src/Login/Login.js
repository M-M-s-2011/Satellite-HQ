import React from "react";

const Login = ({
  email,
  setEmail,
  password,
  setPassword,
  handleLogin,
  handleSignUp,
  hasAccount,
  emailError,
  passwordError,
  setHasAccount,
}) => {
  return (
    <section className="login">
      <div className="loginContainer">
        <label>Username:</label>
        <input
          type="text"
          autoFocus
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <p className="errorMsg">{emailError}</p>
        <label>Password:</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <p className="errorMsg">{passwordError}</p>
        <div className="buttonContainer">
          {hasAccount ? (
            <>
              <button onClick={handleLogin}>Sign in</button>
              <p>
                Don't have an account ?
                <span onClick={() => setHasAccount(!hasAccount)}>Sign Up</span>
              </p>
            </>
          ) : (
            <>
              <button onClick={handleSignUp}>Sign Up</button>
              <p>
                Have an account ?
                <span onClick={() => setHasAccount(!hasAccount)}>Login</span>
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
};
export default Login;
