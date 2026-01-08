import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, UserContext } from "../../contexts/UserContext";
import { syncFavorites } from "../../service";
import { AuthService } from "../../services/auth.service";
import "./Auth.css";
import { ChevronLeft } from "lucide-react";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const authService = new AuthService();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    isArtist: true, // Immer true für Artists
  });
  const [error, setError] = useState<string>("");
  const { setLoggedIn, setUser, setFavoriteEventIds, setFollowedProfiles } =
    useContext(UserContext);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await authService.loginV2({
        username: formData.username,
        password: formData.password,
        isArtist: true,
      });

      // Erst den lokalen Speicher leeren
      localStorage.clear();

      // Neue Daten setzen
      localStorage.setItem("access_token", response.access_token);
      localStorage.setItem(
        "solanaWalletAddress",
        response.user.solanaWalletAddress
      );
      localStorage.setItem(
        "solanaWalletPrivateKey",
        response.user.solanaWalletPrivateKey
      );
      localStorage.setItem("user", JSON.stringify(response.user));

      // Favoriten synchronisieren und warten bis es fertig ist
      const { favoriteEventIds, followedProfiles } = await syncFavorites();

      // Context aktualisieren
      setLoggedIn(true);
      setUser(response.user as User);

      // WICHTIG: Die synchronisierten Daten direkt in den State setzen
      setFavoriteEventIds(favoriteEventIds);
      setFollowedProfiles(followedProfiles);

      // Navigation ohne Reload
      navigate(`/`);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Login failed");
    }
  };

  return (
    <div className="auth-container">
            <button onClick={() => navigate("/")} className="back-button">
          <ChevronLeft className="h-5 w-5" />{" "}
        </button>
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
