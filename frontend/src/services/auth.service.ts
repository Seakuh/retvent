export interface LoginDto {
  email: string;
  password: string;
  isArtist: boolean;
}

export interface LoginV2Dto {
  username: string;
  password: string;
  isArtist: boolean;
}

export interface RegisterDto {
  username: string;
  email: string;
  password: string;
  isArtist: boolean;
  prompt?: string;
}

export interface RegisterDtoV2 {
  username: string;
  email: string;
  password: string;
  isArtist: boolean;
  prompt: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    username: string;
  };
}

export class AuthService {
  private baseUrl =
    import.meta.env.VITE_API_URL + "auth" || "http://localhost:4000" + "auth";

  async login(credentials: LoginDto): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed 😢");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  async loginV2(credentials: LoginV2Dto): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/v2/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed 😢");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  async register(userData: RegisterDto): Promise<AuthResponse> {
    console.log(userData);
    try {
      const response = await fetch(`${this.baseUrl}/v3/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Registration failed 😢");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  }

  logout(): void {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem("access_token");
  }
}
