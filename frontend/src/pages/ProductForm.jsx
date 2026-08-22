import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { productsApi, categoriesApi } from '../api/api';
import { Button, Input, Select, Card, Loading } from '../components/ui';

const UNIT_OPTIONS = [
  { value: 'unit', label: 'Unidad' },
  { value: 'kg', label: 'Kilogramo' },
  { value: 'g', label: 'Gramo' },
  { value: 'l', label: 'Litro' },
  { value: 'ml', label: 'Mililitro' },
  { value: 'package', label: 'Paquete' },
];

const INITIAL_STATE = {
  name: '',
  description: '',
  category: '',
  purchasePrice: '',
  salePrice: '',
  stock: '',
  minimumStock: '',
  unit: 'unit',
  sku: '',
  image: '',
};

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(INITIAL_STATE);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const { data } = await categoriesApi.getAll();
        setCategories(data.categories || []);
      } catch {
        toast.error('Error al cargar categorías');
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    const loadProduct = async () => {
      try {
        const { data } = await productsApi.getAll();
        const product = (data.products || []).find((p) => String(p._id) === String(id));
        if (!product) {
          toast.error('Producto no encontrado');
          navigate('/products');
          return;
        }
        setForm({
          name: product.name || '',
          description: product.description || '',
          category: product.category?._id || product.category || '',
          purchasePrice: product.purchasePrice ?? '',
          salePrice: product.salePrice ?? '',
          stock: product.stock ?? '',
          minimumStock: product.minimumStock ?? '',
          unit: product.unit || 'unit',
          sku: product.sku || '',
          image: product.image || '',
        });
      } catch {
        toast.error('Error al cargar el producto');
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [id, isEdit, navigate]);

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
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        purchasePrice: parseFloat(form.purchasePrice) || 0,
        salePrice: parseFloat(form.salePrice) || 0,
        stock: parseFloat(form.stock) || 0,
        minimumStock: parseFloat(form.minimumStock) || 0,
      };
      if (isEdit) {
        await productsApi.update(id, payload);
        toast.success('Producto actualizado');
      } else {
        await productsApi.create(payload);
        toast.success('Producto creado');
      }
      navigate('/products');
    } catch (err) {
      toast.error(err.response?.data?.message || (isEdit ? 'Error al actualizar' : 'Error al crear el producto'));
    } finally {
      setSubmitting(false);
    }
  };

  const categoryOptions = categories.map((c) => ({
    value: c._id,
    label: c.name,
  }));

  if (loading) return <Loading />;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold">
          {isEdit ? 'Editar Producto' : 'Nuevo Producto'}
        </h1>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Nombre del producto"
            required
          />

          <Input
            label="Descripción"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Descripción del producto"
          />

          <Select
            label="Categoría"
            name="category"
            value={form.category}
            onChange={handleChange}
            options={categoryOptions}
            placeholder="Seleccionar categoría"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Precio de compra"
              name="purchasePrice"
              type="number"
              step="0.01"
              value={form.purchasePrice}
              onChange={handleChange}
              placeholder="0.00"
            />
            <Input
              label="Precio de venta"
              name="salePrice"
              type="number"
              step="0.01"
              value={form.salePrice}
              onChange={handleChange}
              placeholder="0.00"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Stock actual"
              name="stock"
              type="number"
              value={form.stock}
              onChange={handleChange}
              placeholder="0"
            />
            <Input
              label="Stock mínimo"
              name="minimumStock"
              type="number"
              value={form.minimumStock}
              onChange={handleChange}
              placeholder="0"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Unidad"
              name="unit"
              value={form.unit}
              onChange={handleChange}
              options={UNIT_OPTIONS}
            />
            <Input
              label="SKU"
              name="sku"
              value={form.sku}
              onChange={handleChange}
              placeholder="Código SKU"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Imagen del producto</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (!file) return;
                if (file.size > 500000) {
                  toast.error('La imagen debe ser menor a 500KB');
                  return;
                }
                const reader = new FileReader();
                reader.onload = (ev) => {
                  setForm((prev) => ({ ...prev, image: ev.target.result }));
                };
                reader.readAsDataURL(file);
              }}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
            />
            {form.image && (
              <div className="mt-2 flex items-center gap-3">
                <img src={form.image} alt="Preview" className="h-20 w-20 object-cover rounded-lg border" />
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, image: '' }))}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  Quitar imagen
                </button>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              <Save className="w-4 h-4 mr-2" />
              {submitting
                ? 'Guardando...'
                : isEdit
                  ? 'Actualizar'
                  : 'Crear Producto'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
