import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";
import "./css/login.css";

const LogIn = () => {
  const { login, isAuthenticated, setCredential } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", password: "" });

  useEffect(() => {
    setCredential({ username: formData.username, password: formData.password });
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/admin");
    }
  }, [isAuthenticated]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login();
  };

  return (
    <body className="loginBody">
      <div id="logo">
      <form className="login-block" onSubmit={handleSubmit}>
        <h1>Sign In</h1>
        <label>
          <input
            type="text"
            name="username"
            id="username"
            placeholder="username"
            value={formData.username}
            onChange={handleChange}
          />
        </label>
        <br />
        <label>
          <input
            type="password"
            name="password"
            id="password"
            placeholder="password"
            value={formData.password}
            onChange={handleChange}/>
        </label>
        <br />
        <button type="submit">Login</button>
      </form>
    </div>
    </body>
    
  );
};

export default LogIn;