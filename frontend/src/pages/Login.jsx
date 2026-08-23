import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Store } from "lucide-react";
import toast from "react-hot-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login(email, password);
      const name = data?.user?.first_name || "Usuario";
      toast.success(`¡Bienvenido/a, ${name}! 👋`, { duration: 3000 });
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Store className="w-10 h-10 text-brand-600" />
            <span className="text-3xl font-bold text-brand-700">MarketIA</span>
          </div>
          <p className="text-gray-500">Gestión inteligente para tu comercio</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h1 className="text-2xl font-bold text-center mb-6">Iniciar Sesión</h1>

          {error && (
            <div className="bg-danger-50 text-danger-600 p-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 text-white py-3 rounded-lg hover:bg-brand-700 transition font-medium disabled:opacity-50"
            >
              {loading ? "Entrando..." : "Iniciar Sesión"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            ¿No tenés cuenta?{" "}
            <Link to="/register" className="text-brand-600 hover:underline">
              Registrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
