import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Sparkles, TrendingUp, Package, AlertTriangle, DollarSign, BarChart3, TrendingDown, TrendingUp as TrendingUpIcon, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import toast from 'react-hot-toast';
import { assistantApi } from '../api/api';
import { Button, Card, Badge, Loading } from '../components/ui';

function formatCurrency(amount) {
  return `$${Number(amount || 0).toLocaleString('es-AR')}`;
}

export default function Recommendations() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [margins, setMargins] = useState([]);
  const [prices, setPrices] = useState([]);
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsRes, suggestionsRes, alertsRes, marginsRes, pricesRes, trendsRes] = await Promise.allSettled([
          assistantApi.businessAnalysis(),
          assistantApi.comboSuggestions(),
          assistantApi.restockAlerts(),
          assistantApi.marginAnalysis(),
          assistantApi.priceSuggestions(),
          assistantApi.weeklyTrends(),
        ]);

        if (statsRes.status === 'fulfilled') setStats(statsRes.value.data.stats);
        if (suggestionsRes.status === 'fulfilled') setSuggestions(suggestionsRes.value.data.suggestions || []);
        if (alertsRes.status === 'fulfilled') setAlerts(alertsRes.value.data.alerts || []);
        if (marginsRes.status === 'fulfilled') setMargins(marginsRes.value.data.analysis || []);
        if (pricesRes.status === 'fulfilled') setPrices(pricesRes.value.data.suggestions || []);
        if (trendsRes.status === 'fulfilled') setTrends(trendsRes.value.data.trends);
      } catch {
        toast.error('Error al cargar las recomendaciones');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleCreateCombo = (suggestion) => {
    navigate('/combos/new', { state: { suggestion } });
  };

  if (loading) return <Loading text="Analizando tu negocio..." />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Brain className="w-6 h-6 text-brand-600" />
        Recomendaciones IA
      </h1>

      {stats && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-brand-500" />
            Resumen del negocio
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <span className="text-xs text-gray-500 block">Ventas hoy</span>
              <span className="text-2xl font-bold">{stats.todaySales?.count || 0}</span>
              <span className="text-sm text-gray-500 block">{formatCurrency(stats.todaySales?.total)}</span>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <span className="text-xs text-gray-500 block">Ventas semana</span>
              <span className="text-2xl font-bold">{stats.weekSales?.count || 0}</span>
              <span className="text-sm text-gray-500 block">{formatCurrency(stats.weekSales?.total)}</span>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <span className="text-xs text-gray-500 block">Productos</span>
              <span className="text-2xl font-bold">{stats.totalProducts || 0}</span>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <span className="text-xs text-gray-500 block">Combos activos</span>
              <span className="text-2xl font-bold">{stats.activeCombos || 0}</span>
            </div>
          </div>

          {stats.topSelling?.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <span className="text-xs text-gray-500 block mb-2">Productos más vendidos</span>
              {stats.topSelling.map((p, i) => (
                <div key={i} className="flex justify-between text-sm py-1">
                  <span>{p.name}</span>
                  <span className="font-medium">{p.totalQuantity} vendidos — {formatCurrency(p.totalRevenue)}</span>
                </div>
              ))}
            </div>
          )}

          {stats.lowStockProducts?.length > 0 && (
            <div className="mt-4 p-4 bg-warning-50 rounded-lg">
              <span className="text-xs text-warning-700 block mb-2 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Productos con stock bajo
              </span>
              {stats.lowStockProducts.map((p, i) => (
                <div key={i} className="flex justify-between text-sm py-1">
                  <span>{p.name}</span>
                  <Badge variant="warning">{p.stock} / {p.minimumStock} mínimo</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* ALERTAS DE REPOSICIÓN */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          Alertas de reposición
        </h2>
        {alerts.length > 0 ? (
          <div className="space-y-3">
            {alerts.map((item) => (
              <div
                key={item._id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  item.urgency === 'critical' ? 'bg-red-50 border border-red-200' :
                  item.urgency === 'high' ? 'bg-orange-50 border border-orange-200' :
                  'bg-yellow-50 border border-yellow-200'
                }`}
              >
                <div>
                  <span className="font-medium">{item.name}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    Stock: {item.stock} {item.unit} — Mínimo: {item.minimumStock}
                  </span>
                </div>
                <div className="text-right">
                  {item.daysUntilStockOut !== null ? (
                    <span className={`text-sm font-bold ${
                      item.urgency === 'critical' ? 'text-red-600' :
                      item.urgency === 'high' ? 'text-orange-600' :
                      'text-yellow-600'
                    }`}>
                      {item.daysUntilStockOut} días sin stock
                    </span>
                  ) : (
                    <span className="text-sm text-gray-500">Sin ventas recientes</span>
                  )}
                  <div className="text-xs text-gray-500">{item.dailyRate}/día</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-4">Todo está bien abastecido</p>
        )}
      </Card>

      {/* ANÁLISIS DE MÁRGENES */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-green-500" />
          Análisis de márgenes
        </h2>
        {margins.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Producto</th>
                  <th className="text-right py-2">Costo</th>
                  <th className="text-right py-2">Venta</th>
                  <th className="text-right py-2">Margen</th>
                  <th className="text-right py-2">Vendidos</th>
                  <th className="text-right py-2">Ganancia total</th>
                </tr>
              </thead>
              <tbody>
                {margins.slice(0, 10).map((item) => (
                  <tr key={item._id} className="border-b hover:bg-gray-50">
                    <td className="py-2 font-medium">{item.name}</td>
                    <td className="text-right py-2">{formatCurrency(item.purchasePrice)}</td>
                    <td className="text-right py-2">{formatCurrency(item.salePrice)}</td>
                    <td className="text-right py-2">
                      <Badge variant={item.marginPercent >= 30 ? 'success' : item.marginPercent >= 15 ? 'warning' : 'danger'}>
                        {item.marginPercent}%
                      </Badge>
                    </td>
                    <td className="text-right py-2">{item.totalSold}</td>
                    <td className="text-right py-2 font-bold text-green-600">{formatCurrency(item.totalProfit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-4">Cargá productos para ver el análisis</p>
        )}
      </Card>

      {/* SUGERENCIAS DE PRECIO */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-blue-500" />
          Sugerencias de precio
        </h2>
        {prices.length > 0 ? (
          <div className="space-y-3">
            {prices.map((item) => (
              <div
                key={item._id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  item.suggestion === 'subir' ? 'bg-green-50 border border-green-200' :
                  'bg-orange-50 border border-orange-200'
                }`}
              >
                <div className="flex-1">
                  <span className="font-medium">{item.name}</span>
                  <p className="text-xs text-gray-500 mt-1">{item.reason}</p>
                </div>
                <div className="text-right ml-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm line-through text-gray-400">{formatCurrency(item.currentPrice)}</span>
                    {item.suggestion === 'subir' ? (
                      <ArrowUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <ArrowDown className="w-4 h-4 text-orange-600" />
                    )}
                    <span className={`text-sm font-bold ${item.suggestion === 'subir' ? 'text-green-600' : 'text-orange-600'}`}>
                      {formatCurrency(item.suggestedPrice)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {item.totalSold} vendidos — {item.dailyRate}/día
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-4">No hay sugerencias de precio por ahora</p>
        )}
      </Card>

      {/* TENDENCIAS SEMANALES */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <TrendingUpIcon className="w-5 h-5 text-purple-500" />
          Tendencias semanales
        </h2>
        {trends ? (
          <div>
            <div className="grid gap-3 sm:grid-cols-7 mb-4">
              {trends.trends.map((day) => {
                const maxSales = Math.max(...trends.trends.map((d) => d.totalSales), 1);
                const height = (day.totalSales / maxSales) * 100;
                return (
                  <div key={day.dayIndex} className="flex flex-col items-center">
                    <div className="w-full h-24 bg-gray-100 rounded-lg flex items-end justify-center mb-1">
                      <div
                        className={`w-full rounded-t-lg transition-all ${
                          day.day === trends.bestDay ? 'bg-green-500' : 'bg-purple-400'
                        }`}
                        style={{ height: `${Math.max(height, 5)}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium">{day.day.slice(0, 3)}</span>
                    <span className="text-xs text-gray-500">{formatCurrency(day.totalSales)}</span>
                  </div>
                );
              })}
            </div>
            <div className="grid gap-4 sm:grid-cols-3 text-center">
              <div className="bg-green-50 rounded-lg p-3">
                <span className="text-xs text-green-600 block">Mejor día</span>
                <span className="font-bold text-green-700">{trends.bestDay}</span>
              </div>
              <div className="bg-red-50 rounded-lg p-3">
                <span className="text-xs text-red-600 block">Peor día</span>
                <span className="font-bold text-red-700">{trends.worstDay}</span>
              </div>
              <div className="bg-blue-50 rounded-lg p-3">
                <span className="text-xs text-blue-600 block">Facturación 90 días</span>
                <span className="font-bold text-blue-700">{formatCurrency(trends.totalRevenue)}</span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-4">Necesitás más ventas para ver tendencias</p>
        )}
      </Card>

      {/* COMBOS */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-purple-500" />
          Sugerencias de combos
        </h2>

        {suggestions.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {suggestions.map((s, idx) => (
              <div
                key={idx}
                className="border border-purple-200 bg-purple-50 rounded-lg p-4 flex flex-col"
              >
                <h3 className="font-semibold text-purple-900">{s.name}</h3>
                {s.description && (
                  <p className="text-sm text-purple-700 mt-1">{s.description}</p>
                )}
                {s.reason && (
                  <p className="text-xs text-purple-600 mt-1 italic">{s.reason}</p>
                )}
                <div className="mt-2 text-sm text-purple-800">
                  {s.items?.map((item, i) => (
                    <div key={i}>• {item.productName} x{item.quantity} — {formatCurrency(item.price)}</div>
                  ))}
                </div>
                <div className="flex gap-4 mt-2 text-sm text-purple-800">
                  {s.suggestedPrice != null && (
                    <span className="font-bold">{formatCurrency(s.suggestedPrice)}</span>
                  )}
                  {s.discount != null && (
                    <span className="text-success-600">Ahorrás {formatCurrency(s.discount)}</span>
                  )}
                </div>
                <div className="mt-auto pt-3">
                  <Button size="sm" onClick={() => handleCreateCombo(s)}>
                    <Package className="w-4 h-4 mr-1" />
                    Crear este combo
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-4">
            No hay sugerencias disponibles. Necesitás al menos some productos cargados.
          </p>
        )}
      </Card>
    </div>
  );
}
