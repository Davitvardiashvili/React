import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";
import "./css/login.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';

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
    <div className="loginBody">
      <div id="logo">
      <form className="login-block" onSubmit={handleSubmit}>
        <h1>ავტორიზაცია</h1>
        <label>
          
          <input
          
            type="text"
            name="username"
            id="username"
            placeholder="მომხმარებელი"
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
            placeholder="პაროლი"
            value={formData.password}
            onChange={handleChange}/>
        </label>
        <br />
        <button type="submit">შესვლა</button>
      </form>
    </div>
    </div>
    
  );
};

export default LogIn;