import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { categoriesApi } from '../api/api';
import { Button, Input, Card, Loading, Alert } from '../components/ui';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [updating, setUpdating] = useState(false);

  const [deletingId, setDeletingId] = useState(null);

  const fetchCategories = async () => {
    try {
      const { data } = await categoriesApi.getAll();
      setCategories(data.categories || []);
    } catch {
      toast.error('Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }
    setCreating(true);
    try {
      await categoriesApi.create({ name: newName.trim(), description: newDescription.trim() });
      toast.success('Categoría creada');
      setNewName('');
      setNewDescription('');
      fetchCategories();
    } catch {
      toast.error('Error al crear categoría');
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (cat) => {
    setEditingId(cat._id);
    setEditName(cat.name);
    setEditDescription(cat.description || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditDescription('');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }
    setUpdating(true);
    try {
      await categoriesApi.update(editingId, {
        name: editName.trim(),
        description: editDescription.trim(),
      });
      toast.success('Categoría actualizada');
      cancelEdit();
      fetchCategories();
    } catch {
      toast.error('Error al actualizar categoría');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`¿Eliminar la categoría "${name}"?`)) return;
    setDeletingId(id);
    try {
      await categoriesApi.delete(id);
      toast.success('Categoría eliminada');
      fetchCategories();
    } catch {
      toast.error('Error al eliminar categoría');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Categorías</h1>

      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Nueva Categoría</h2>
        <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Nombre"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <Input
            placeholder="Descripción"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
          />
          <Button type="submit" disabled={creating}>
            <Plus className="w-4 h-4 mr-1" />
            {creating ? 'Creando...' : 'Crear'}
          </Button>
        </form>
      </Card>

      {categories.length === 0 ? (
        <Alert type="info">No hay categorías registradas.</Alert>
      ) : (
        <div className="space-y-3">
          {categories.map((cat) => (
            <Card key={cat._id} className="p-4">
              {editingId === cat._id ? (
                <form onSubmit={handleUpdate} className="flex flex-col sm:flex-row gap-3">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Nombre"
                  />
                  <Input
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Descripción"
                  />
                  <div className="flex gap-2">
                    <Button type="submit" size="sm" disabled={updating}>
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={cancelEdit}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{cat.name}</h3>
                    {cat.description && (
                      <p className="text-sm text-gray-500">{cat.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startEdit(cat)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(cat._id, cat.name)}
                      disabled={deletingId === cat._id}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
