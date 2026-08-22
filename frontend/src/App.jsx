import { Routes, Route } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/ui/ProtectedRoute";
import Loading from "./components/ui/Loading";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import ProductForm from "./pages/ProductForm";
import Categories from "./pages/Categories";
import Sales from "./pages/Sales";
import SaleForm from "./pages/SaleForm";
import Combos from "./pages/Combos";
import ComboForm from "./pages/ComboForm";
import ComboDetail from "./pages/ComboDetail";
import Promotions from "./pages/Promotions";
import Recommendations from "./pages/Recommendations";
import Assistant from "./pages/Assistant";

function App() {
  const { loading } = useAuth();

  if (loading) return <Loading />;

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/dashboard"
        element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>}
      />
      <Route
        path="/products"
        element={<ProtectedRoute><Layout><Products /></Layout></ProtectedRoute>}
      />
      <Route
        path="/products/new"
        element={<ProtectedRoute adminOnly><Layout><ProductForm /></Layout></ProtectedRoute>}
      />
      <Route
        path="/products/edit/:id"
        element={<ProtectedRoute adminOnly><Layout><ProductForm /></Layout></ProtectedRoute>}
      />
      <Route
        path="/categories"
        element={<ProtectedRoute><Layout><Categories /></Layout></ProtectedRoute>}
      />
      <Route
        path="/sales"
        element={<ProtectedRoute><Layout><Sales /></Layout></ProtectedRoute>}
      />
      <Route
        path="/sales/new"
        element={<ProtectedRoute adminOnly><Layout><SaleForm /></Layout></ProtectedRoute>}
      />
      <Route
        path="/combos"
        element={<ProtectedRoute><Layout><Combos /></Layout></ProtectedRoute>}
      />
      <Route
        path="/combos/new"
        element={<ProtectedRoute adminOnly><Layout><ComboForm /></Layout></ProtectedRoute>}
      />
      <Route
        path="/combos/edit/:id"
        element={<ProtectedRoute adminOnly><Layout><ComboForm /></Layout></ProtectedRoute>}
      />
      <Route
        path="/combos/:id"
        element={<ProtectedRoute><Layout><ComboDetail /></Layout></ProtectedRoute>}
      />
      <Route
        path="/promotions"
        element={<ProtectedRoute><Layout><Promotions /></Layout></ProtectedRoute>}
      />
      <Route
        path="/recommendations"
        element={<ProtectedRoute><Layout><Recommendations /></Layout></ProtectedRoute>}
      />
      <Route
        path="/assistant"
        element={<ProtectedRoute><Layout><Assistant /></Layout></ProtectedRoute>}
      />

      <Route path="*" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
    </Routes>
  );
}

export default App;
