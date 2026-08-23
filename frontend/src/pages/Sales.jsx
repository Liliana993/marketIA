import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ChevronDown, ChevronUp, Search, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { salesApi, exportApi } from '../api/api';
import { Button, Input, Card, Badge, Loading, Alert } from '../components/ui';

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatCurrency(amount) {
  return `$${Number(amount).toLocaleString('es-AR', { minimumFractionDigits: 0 })}`;
}

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filtering, setFiltering] = useState(false);
  const [exporting, setExporting] = useState(null);

  const fetchSales = async (start, end) => {
    setLoading(true);
    try {
      const params = {};
      if (start) params.startDate = start;
      if (end) params.endDate = end;
      const { data } = await salesApi.getAll(params);
      setSales(data.sales || []);
    } catch {
      toast.error('Error al cargar ventas');
    } finally {
      setLoading(false);
      setFiltering(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    setFiltering(true);
    fetchSales(startDate, endDate);
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const totalFiltered = sales.reduce((sum, s) => sum + (s.total || 0), 0);

  const handleExport = async (format) => {
    setExporting(format);
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const response = await exportApi.sales(format, params);
      const blob = new Blob([response.data], {
        type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ventas.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success(`Ventas exportadas en ${format.toUpperCase()}`);
    } catch {
      toast.error('Error al exportar');
    } finally {
      setExporting(null);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Ventas</h1>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => handleExport('pdf')} loading={exporting === 'pdf'}>
            <Download className="w-4 h-4 mr-1" /> Exportar PDF
          </Button>
          <Link to="/sales/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Registrar Venta
            </Button>
          </Link>
        </div>
      </div>

      <Card className="p-4 mb-6">
        <form onSubmit={handleFilter} className="flex flex-col sm:flex-row gap-3 items-end">
          <Input
            label="Fecha inicio"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            label="Fecha fin"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <Button type="submit" disabled={filtering}>
            <Search className="w-4 h-4 mr-1" />
            {filtering ? 'Buscando...' : 'Buscar'}
          </Button>
        </form>
      </Card>

      {(startDate || endDate) && (
        <div className="mb-4">
          <Badge variant="secondary" className="text-base px-4 py-2">
            Total del período: {formatCurrency(totalFiltered)}
          </Badge>
        </div>
      )}

      {sales.length === 0 ? (
        <Alert type="info">No se encontraron ventas.</Alert>
      ) : (
        <div className="space-y-3">
          {sales.map((sale) => (
            <Card key={sale._id} className="overflow-hidden">
              <button
                onClick={() => toggleExpand(sale._id)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">{formatDate(sale.createdAt)}</span>
                  <Badge>{sale.items?.length || 0} productos</Badge>
                  <span className="font-semibold">{formatCurrency(sale.total)}</span>
                </div>
                {expandedId === sale._id ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {expandedId === sale._id && sale.items && (
                <div className="border-t px-4 pb-4">
                  <table className="w-full text-sm mt-3">
                    <thead>
                      <tr className="text-left text-gray-500">
                        <th className="pb-2">Producto</th>
                        <th className="pb-2 text-right">Cantidad</th>
                        <th className="pb-2 text-right">Precio unitario</th>
                        <th className="pb-2 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sale.items.map((item, idx) => (
                        <tr key={idx} className="border-t border-gray-100">
                          <td className="py-2">{item.productName || item.product?.name || '—'}</td>
                          <td className="py-2 text-right">{item.quantity}</td>
                          <td className="py-2 text-right">{formatCurrency(item.unitPrice)}</td>
                          <td className="py-2 text-right font-medium">
                            {formatCurrency(item.subtotal || item.quantity * item.unitPrice)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
