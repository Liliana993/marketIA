import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Save, ArrowLeft, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { combosApi, productsApi } from '../api/api';
import { Button, Input, Card, Loading } from '../components/ui';

const INITIAL_STATE = {
  name: '',
  description: '',
  items: [],
  comboPrice: '',
};

export default function ComboForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(INITIAL_STATE);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedQty, setSelectedQty] = useState(1);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const { data } = await productsApi.getAll();
        setProducts(data.products || data);
      } catch {
        toast.error('Error al cargar productos');
      }
    };
    loadProducts();
  }, []);

  useEffect(() => {
    if (isEdit) return;
    const suggestion = location.state?.suggestion;
    if (!suggestion || products.length === 0) return;

    const matchedItems = (suggestion.items || [])
      .map((sItem) => {
        const product = products.find(
          (p) => p.name.toLowerCase() === (sItem.productName || '').toLowerCase()
        );
        if (!product) return null;
        return { product: product._id, quantity: sItem.quantity || 1 };
      })
      .filter(Boolean);

    if (matchedItems.length > 0) {
      setForm({
        name: suggestion.name || '',
        description: suggestion.reason || '',
        items: matchedItems,
        comboPrice: suggestion.suggestedPrice ?? '',
      });
      toast.success('Sugerencia aplicada. Verificá los productos y guardá.');
    }
  }, [products, isEdit, location.state]);

  useEffect(() => {
    if (!isEdit) return;
    const loadCombo = async () => {
      try {
        const { data } = await combosApi.getById(id);
        const combo = data.combo;
        setForm({
          name: combo.name || '',
          description: combo.description || '',
          items: combo.items || [],
          comboPrice: combo.comboPrice ?? '',
        });
      } catch {
        toast.error('Error al cargar el combo');
        navigate('/combos');
      } finally {
        setLoading(false);
      }
    };
    loadCombo();
  }, [id, isEdit, navigate]);

  const regularPrice = form.items.reduce((sum, item) => {
    const product = products.find((p) => p._id === item.product);
    return sum + (product?.salePrice || 0) * item.quantity;
  }, 0);

  const discount = regularPrice - (parseFloat(form.comboPrice) || 0);

  const addItem = () => {
    if (!selectedProduct) {
      toast.error('Seleccioná un producto');
      return;
    }
    const exists = form.items.find((item) => item.product === selectedProduct);
    if (exists) {
      toast.error('Este producto ya está en el combo');
      return;
    }
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { product: selectedProduct, quantity: selectedQty }],
    }));
    setSelectedProduct('');
    setSelectedQty(1);
  };

  const removeItem = (index) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const updateItemQty = (index, qty) => {
    const parsed = parseInt(qty) || 1;
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, quantity: parsed } : item
      ),
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }
    if (form.items.length === 0) {
      toast.error('Agregá al menos un producto al combo');
      return;
    }
    if (!form.comboPrice || parseFloat(form.comboPrice) <= 0) {
      toast.error('Ingresá un precio válido para el combo');
      return;
    }
    if (discount < 0) {
      toast.error('El precio del combo no puede superar el precio regular');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        items: form.items,
        comboPrice: parseFloat(form.comboPrice),
      };
      if (isEdit) {
        await combosApi.update(id, payload);
        toast.success('Combo actualizado');
      } else {
        await combosApi.create(payload);
        toast.success('Combo creado');
      }
      navigate('/combos');
    } catch {
      toast.error(isEdit ? 'Error al actualizar' : 'Error al crear el combo');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading text="Cargando combo..." />;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold">
          {isEdit ? 'Editar Combo' : 'Nuevo Combo'}
        </h1>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Nombre del combo"
            required
          />

          <Input
            label="Descripción"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Descripción del combo"
          />

          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Productos del combo
            </label>

            <div className="flex gap-2 mb-3">
              <select
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
              >
                <option value="">Seleccionar producto</option>
                {products.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} - ${p.salePrice?.toFixed(2)}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                value={selectedQty}
                onChange={(e) => setSelectedQty(parseInt(e.target.value) || 1)}
              />
              <Button type="button" variant="secondary" onClick={addItem}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {form.items.length > 0 ? (
              <div className="space-y-2">
                {form.items.map((item, index) => {
                  const product = products.find((p) => p._id === item.product);
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2"
                    >
                      <span className="flex-1 text-sm font-medium">
                        {product?.name || 'Producto'}
                      </span>
                      <span className="text-sm text-gray-500">
                        ${product?.salePrice?.toFixed(2)} c/u
                      </span>
                      <input
                        type="number"
                        min="1"
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center focus:ring-2 focus:ring-brand-500 outline-none"
                        value={item.quantity}
                        onChange={(e) => updateItemQty(index, e.target.value)}
                      />
                      <span className="text-sm font-medium w-20 text-right">
                        ${((product?.salePrice || 0) * item.quantity).toFixed(2)}
                      </span>
                      <button
                        type="button"
                        className="text-gray-400 hover:text-danger-600"
                        onClick={() => removeItem(index)}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">
                Agregá productos al combo
              </p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4 bg-gray-50 rounded-lg p-4">
            <div>
              <span className="text-xs text-gray-500 block">Precio regular</span>
              <span className="text-lg font-semibold">${regularPrice.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-xs text-gray-500 block">Ahorro</span>
              <span className="text-lg font-semibold text-success-600">
                {discount > 0 ? `$${discount.toFixed(2)}` : '$0.00'}
              </span>
            </div>
            <div>
              <span className="text-xs text-gray-500 block">Descuento %</span>
              <span className="text-lg font-semibold text-warning-600">
                {regularPrice > 0 ? `${((discount / regularPrice) * 100).toFixed(1)}%` : '0%'}
              </span>
            </div>
          </div>

          <Input
            label="Precio del combo"
            name="comboPrice"
            type="number"
            step="0.01"
            min="0"
            value={form.comboPrice}
            onChange={handleChange}
            placeholder="0.00"
            required
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(-1)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={submitting}>
              <Save className="w-4 h-4 mr-2" />
              {isEdit ? 'Actualizar' : 'Crear Combo'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
