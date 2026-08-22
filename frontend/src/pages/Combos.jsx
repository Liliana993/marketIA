import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Megaphone, Sparkles, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { combosApi, productsApi } from '../api/api';
import { Button, Card, Badge, Loading } from '../components/ui';

export default function Combos() {
  const navigate = useNavigate();
  const [combos, setCombos] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  useEffect(() => {
    loadCombos();
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const { data } = await productsApi.getAll();
      setProducts(data.products || []);
    } catch {
      // ignore
    }
  };

  const loadCombos = async () => {
    try {
      const { data } = await combosApi.getAll();
      setCombos(data.combos);
    } catch {
      toast.error('Error al cargar combos');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`¿Eliminar el combo "${name}"?`)) return;
    try {
      await combosApi.delete(id);
      toast.success('Combo eliminado');
      setCombos((prev) => prev.filter((c) => c._id !== id));
    } catch {
      toast.error('Error al eliminar el combo');
    }
  };

  const handleSuggest = async () => {
    setLoadingSuggestions(true);
    try {
      const { data } = await combosApi.suggest();
      setSuggestions(data.suggestions);
      toast.success(`${data.suggestions.length} sugerencias generadas`);
    } catch {
      toast.error('Error al generar sugerencias');
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleCreateFromSuggestion = async (suggestion) => {
    try {
      const items = suggestion.items.map((item) => {
        const product = products.find(
          (p) => p.name.toLowerCase() === item.productName.toLowerCase()
        );
        if (!product) {
          throw new Error(`Producto "${item.productName}" no encontrado`);
        }
        return { product: product._id, quantity: item.quantity };
      });

      const { data } = await combosApi.create({
        name: suggestion.name,
        description: suggestion.description || '',
        items,
        comboPrice: suggestion.suggestedPrice || suggestion.comboPrice,
      });
      toast.success('Combo creado desde sugerencia');
      setSuggestions((prev) => prev.filter((s) => s !== suggestion));
      setCombos((prev) => [...prev, data.combo]);
    } catch (err) {
      toast.error(err.message || 'Error al crear el combo');
    }
  };

  if (loading) return <Loading text="Cargando combos..." />;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Combos</h1>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={handleSuggest} loading={loadingSuggestions}>
            <Sparkles className="w-4 h-4 mr-2" />
            Sugerir combos con IA
          </Button>
          <Button onClick={() => navigate('/combos/new')}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Combo
          </Button>
        </div>
      </div>

      {suggestions.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Sugerencias de IA
          </h2>
          {suggestions.map((s, idx) => (
            <Card key={idx} className="p-4 border-purple-200 bg-purple-50">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-purple-900">{s.name}</h3>
                  {s.description && (
                    <p className="text-sm text-purple-700 mt-1">{s.description}</p>
                  )}
                  {s.reasoning && (
                    <p className="text-xs text-purple-600 mt-1 italic">{s.reasoning}</p>
                  )}
                  <div className="flex gap-4 mt-2 text-sm text-purple-800">
                    {s.comboPrice != null && (
                      <span className="font-medium">${s.comboPrice.toFixed(2)}</span>
                    )}
                    {s.items && <span>{s.items.length} producto(s)</span>}
                  </div>
                </div>
                <Button size="sm" onClick={() => handleCreateFromSuggestion(s)}>
                  Crear este combo
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {combos.length === 0 ? (
        <Card className="p-12 text-center">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No hay combos creados</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {combos.map((combo) => (
            <Card key={combo._id} className="p-5 flex flex-col">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-lg">{combo.name}</h3>
                <Badge variant={combo.active ? 'success' : 'danger'}>
                  {combo.active ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>

              {combo.description && (
                <p className="text-sm text-gray-600 mb-3">{combo.description}</p>
              )}

              <div className="space-y-1 text-sm mb-4 flex-1">
                {combo.items?.map((item, i) => (
                  <div key={i} className="flex justify-between text-gray-700">
                    <span>{item.product?.name || 'Producto'}</span>
                    <span>x{item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4 text-sm mb-4">
                <div>
                  <span className="text-gray-500 line-through">
                    ${combo.regularPrice?.toFixed(2)}
                  </span>
                </div>
                <div className="font-bold text-brand-600">
                  ${combo.comboPrice?.toFixed(2)}
                </div>
                {combo.discount > 0 && (
                  <Badge variant="warning">-${combo.discount.toFixed(2)}</Badge>
                )}
              </div>

              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/combos/${combo._id}/edit`)}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Editar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/combos/${combo._id}`)}
                >
                  <Megaphone className="w-4 h-4 mr-1" />
                  Promocionar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-danger-600 hover:text-danger-700"
                  onClick={() => handleDelete(combo._id, combo.name)}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Eliminar
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
