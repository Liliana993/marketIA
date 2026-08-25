import { useState, useEffect } from "react";
import { DollarSign, ShoppingCart, Package, BarChart3 } from "lucide-react";
import { dashboardApi } from "../api/api";
import Card, { CardHeader, CardBody } from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Loading from "../components/ui/Loading";

const StatCard = ({ icon: Icon, title, value, subtitle, color }) => (
  <Card className="overflow-hidden">
    <CardBody>
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
    </CardBody>
  </Card>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await dashboardApi.getStats();
        setStats(data.stats);
      } catch (err) {
        console.error("Error loading dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <Loading text="Cargando dashboard..." />;
  if (!stats) return <p className="text-center text-gray-500 py-16">No se pudieron cargar los datos.</p>;

  const { todaySales, weekSales, totalProducts, activeCombos, lowStockProducts, topSelling } = stats;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={DollarSign}
          title="Ventas del día"
          value={`$${todaySales?.total?.toLocaleString() || 0}`}
          subtitle={`${todaySales?.count || 0} ventas`}
          color="bg-success-500"
        />
        <StatCard
          icon={ShoppingCart}
          title="Ventas de la semana"
          value={`$${weekSales?.total?.toLocaleString() || 0}`}
          subtitle={`${weekSales?.count || 0} ventas`}
          color="bg-brand-500"
        />
        <StatCard
          icon={Package}
          title="Productos totales"
          value={totalProducts || 0}
          color="bg-warning-500"
        />
        <StatCard
          icon={BarChart3}
          title="Combos activos"
          value={activeCombos || 0}
          color="bg-gray-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Productos para reponer</h2>
          </CardHeader>
          <CardBody>
            {lowStockProducts?.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {lowStockProducts.map((product) => (
                  <div key={product._id} className="flex items-center justify-between py-3">
                    <span className="text-sm text-gray-700">{product.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500">
                        Mín: {product.minimumStock}
                      </span>
                      <Badge variant={product.stock === 0 ? "danger" : "warning"}>
                        Stock: {product.stock}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 py-4 text-center">Todos los productos están abastecidos.</p>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Más vendidos</h2>
          </CardHeader>
          <CardBody>
            {topSelling?.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {topSelling.map((product, index) => (
                  <div key={product._id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-400 w-5">{index + 1}</span>
                      <span className="text-sm text-gray-700">{product.name}</span>
                    </div>
                    <Badge variant="brand">{product.totalSold} vendidos</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 py-4 text-center">Aún no hay ventas registradas.</p>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
