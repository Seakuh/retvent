import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, UserContext } from "../../contexts/UserContext";
import { syncFavorites } from "../../service";
import { AuthService } from "../../services/auth.service";
import "./Auth.css";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const authService = new AuthService();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    isArtist: true, // Immer true für Artists
  });
  const [error, setError] = useState<string>("");
  const { setLoggedIn, setUser } = useContext(UserContext);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await authService.loginV2({
        username: formData.username,
        password: formData.password,
        isArtist: true,
      });
      localStorage.setItem("access_token", response.access_token);
      localStorage.setItem("user", JSON.stringify(response.user));
      syncFavorites();
      setLoggedIn(true);
      setUser(response.user as User);
      navigate(`/`);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Login failed 😢");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Login 🔑</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input
            type="username  "
            placeholder="Username"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required
          />
          <button type="submit">Login</button>
        </form>
        <p>
          Don't have an account?
          <span onClick={() => navigate("/register")}>Register here</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
