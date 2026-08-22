import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard, Package, ShoppingCart, Tags, BarChart3,
  Sparkles, MessageSquare, Megaphone, LogOut, Menu, X, Store
} from "lucide-react";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/products", label: "Productos", icon: Package },
  { to: "/categories", label: "Categorías", icon: Tags },
  { to: "/sales", label: "Ventas", icon: ShoppingCart },
  { to: "/combos", label: "Combos", icon: BarChart3 },
  { to: "/promotions", label: "Publicaciones", icon: Megaphone },
  { to: "/recommendations", label: "Recomendaciones IA", icon: Sparkles },
  { to: "/assistant", label: "Asistente", icon: MessageSquare },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (!user) return null;

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          <Link to="/dashboard" className="flex items-center gap-2">
            <img src="/logo.svg" alt="MarketIA" className="h-9 w-9" />
            <span className="text-xl font-bold text-brand-700">MarketIA</span>
          </Link>

          <div className="hidden md:flex items-center gap-3">
            <span className="text-sm text-gray-600">Hola, {user.first_name}</span>
            <button
              onClick={handleLogout}
              title="Cerrar sesión"
              className="p-2 rounded-lg text-gray-400 hover:text-danger-600 hover:bg-gray-100 transition"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          <button
            className="md:hidden p-2"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <div className="border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="hidden md:flex items-center gap-1 py-2 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition ${
                    isActive
                      ? "bg-brand-50 text-brand-700 font-medium"
                      : "text-gray-500 hover:text-brand-600 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t py-3 px-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                  isActive
                    ? "bg-brand-50 text-brand-700 font-medium"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
          <div className="border-t pt-3 mt-3 flex items-center justify-between px-3">
            <span className="text-sm text-gray-500">Hola, {user.first_name}</span>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-gray-400 hover:text-danger-600 hover:bg-gray-100 transition"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
