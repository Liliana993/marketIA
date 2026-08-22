import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Pencil, Trash2, PackageMinus, PackagePlus, X, Download } from "lucide-react";
import { productsApi, exportApi } from "../api/api";
import toast from "react-hot-toast";
import Card, { CardBody } from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Input from "../components/ui/Input";
import Loading from "../components/ui/Loading";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stockModal, setStockModal] = useState(null);
  const [stockQty, setStockQty] = useState("");
  const [exporting, setExporting] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await productsApi.getAll({ search });
      setProducts(data.products || data);
    } catch (err) {
      toast.error("Error al cargar productos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`¿Eliminar "${name}"?`)) return;
    try {
      await productsApi.delete(id);
      toast.success("Producto eliminado");
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || "Error al eliminar");
    }
  };

  const handleExport = async (format) => {
    setExporting(format);
    try {
      const { data } = await exportApi.products(format);
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `productos.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success(`Productos exportados en ${format.toUpperCase()}`);
    } catch {
      toast.error('Error al exportar');
    } finally {
      setExporting(null);
    }
  };

  const handleUpdateStock = async (id, quantity) => {
    const qty = parseInt(stockQty, 10);
    if (isNaN(qty) || qty === 0) {
      toast.error("Ingresá una cantidad válida");
      return;
    }
    try {
      const { data } = await productsApi.updateStock(id, qty);
      setProducts((prev) =>
        prev.map((p) => (p._id === id ? { ...p, stock: data.stock || data.product?.stock || qty } : p))
      );
      toast.success("Stock actualizado");
      setStockModal(null);
      setStockQty("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error al actualizar stock");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => handleExport('pdf')} loading={exporting === 'pdf'}>
            <Download className="w-4 h-4 mr-1" /> Exportar PDF
          </Button>
          <Link to="/products/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Producto
            </Button>
          </Link>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar productos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
        />
      </div>

      {loading ? (
        <Loading text="Cargando productos..." />
      ) : products.length === 0 ? (
        <p className="text-center text-gray-400 py-16">No se encontraron productos.</p>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="px-6 py-3 font-medium text-gray-500">Nombre</th>
                  <th className="px-6 py-3 font-medium text-gray-500">SKU</th>
                  <th className="px-6 py-3 font-medium text-gray-500">Categoría</th>
                  <th className="px-6 py-3 font-medium text-gray-500">P. Compra</th>
                  <th className="px-6 py-3 font-medium text-gray-500">P. Venta</th>
                  <th className="px-6 py-3 font-medium text-gray-500">Stock</th>
                  <th className="px-6 py-3 font-medium text-gray-500 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
                    <td className="px-6 py-4 text-gray-600 font-mono text-xs">{product.sku || "-"}</td>
                    <td className="px-6 py-4 text-gray-600">{product.category?.name || "-"}</td>
                    <td className="px-6 py-4 text-gray-600">${product.purchasePrice}</td>
                    <td className="px-6 py-4 text-gray-600">${product.salePrice}</td>
                    <td className="px-6 py-4">
                      <Badge variant={product.stock > product.minimumStock ? "success" : "warning"}>
                        {product.stock}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/products/edit/${product._id}`}>
                          <Button variant="ghost" size="sm">
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="sm" onClick={() => { setStockModal(product._id); setStockQty(""); }}>
                          <PackagePlus className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(product._id, product.name)}>
                          <Trash2 className="w-4 h-4 text-danger-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {stockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Actualizar stock</h3>
              <button onClick={() => setStockModal(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Usá valores negativos para restar y positivos para sumar.
            </p>
            <Input
              label="Cantidad"
              type="number"
              value={stockQty}
              onChange={(e) => setStockQty(e.target.value)}
              placeholder="Ej: -5 o 10"
            />
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="secondary" onClick={() => setStockModal(null)}>
                Cancelar
              </Button>
              <Button onClick={() => handleUpdateStock(stockModal, stockQty)}>
                Confirmar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
