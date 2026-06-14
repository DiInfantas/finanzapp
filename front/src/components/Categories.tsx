import { useState, useEffect } from 'react';
import { api } from '../api';
import { Plus, Trash2, Folder, FolderPlus } from 'lucide-react';

interface Subcategory {
  id: number;
  categoria: number;
  nombre: string;
}

interface Category {
  id: number;
  nombre: string;
  tipo: 'ingreso' | 'gasto' | 'ambos';
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  
  // Form states
  const [catName, setCatName] = useState('');
  const [catTipo, setCatTipo] = useState<'ingreso' | 'gasto' | 'ambos'>('gasto');
  const [subName, setSubName] = useState('');
  const [selectedCatId, setSelectedCatId] = useState<number | ''>('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catsRes, subsRes] = await Promise.all([
        api.get('categorias/'),
        api.get('subcategorias/'),
      ]);
      setCategories(catsRes.data);
      setSubcategories(subsRes.data);
      if (catsRes.data.length > 0) {
        setSelectedCatId(catsRes.data[0].id);
      }
    } catch (err) {
      setError('Error al cargar datos del servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    try {
      const response = await api.post('categorias/', {
        nombre: catName,
        tipo: catTipo,
      });
      setCategories((prev) => [...prev, response.data]);
      setCatName('');
      if (!selectedCatId) {
        setSelectedCatId(response.data.id);
      }
    } catch (err) {
      setError('Error al crear la categoría.');
    }
  };

  const handleCreateSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subName.trim() || !selectedCatId) return;

    try {
      const response = await api.post('subcategorias/', {
        categoria: Number(selectedCatId),
        nombre: subName,
      });
      setSubcategories((prev) => [...prev, response.data]);
      setSubName('');
    } catch (err) {
      setError('Error al crear la subcategoría.');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta categoría? Se eliminarán también sus subcategorías.')) return;
    try {
      await api.delete(`categorias/${id}/`);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setSubcategories((prev) => prev.filter((s) => s.categoria !== id));
      if (selectedCatId === id) {
        setSelectedCatId('');
      }
    } catch (err) {
      setError('No se pudo eliminar la categoría.');
    }
  };

  const handleDeleteSubcategory = async (id: number) => {
    try {
      await api.delete(`subcategorias/${id}/`);
      setSubcategories((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      setError('No se pudo eliminar la subcategoría.');
    }
  };

  return (
    <div className="space-y-8">
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        {/* Crear Categoría */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Folder className="w-5 h-5 text-indigo-600" />
            <h3 className="font-semibold text-lg text-slate-800">Nueva Categoría</h3>
          </div>
          <form onSubmit={handleCreateCategory} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Nombre</label>
              <input
                type="text"
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                placeholder="Ej. Alimentación, Sueldo, etc."
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Tipo</label>
              <select
                value={catTipo}
                onChange={(e: any) => setCatTipo(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none"
              >
                <option value="gasto">Gasto</option>
                <option value="ingreso">Ingreso</option>
                <option value="ambos">Ambos</option>
              </select>
            </div>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-all"
            >
              <Plus className="w-4 h-4" /> Crear Categoría
            </button>
          </form>
        </div>

        {/* Crear Subcategoría */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <FolderPlus className="w-5 h-5 text-indigo-600" />
            <h3 className="font-semibold text-lg text-slate-800">Nueva Subcategoría</h3>
          </div>
          <form onSubmit={handleCreateSubcategory} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Categoría Padre</label>
              <select
                value={selectedCatId}
                onChange={(e) => setSelectedCatId(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none"
              >
                <option value="">Selecciona una categoría...</option>
                {categories
                  .filter((c) => c.tipo !== 'ingreso')
                  .map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nombre} ({cat.tipo})
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Nombre</label>
              <input
                type="text"
                value={subName}
                onChange={(e) => setSubName(e.target.value)}
                placeholder="Ej. Supermercado, Restaurant, Bencina"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
            <button
              type="submit"
              disabled={!selectedCatId}
              className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
            >
              <Plus className="w-4 h-4" /> Crear Subcategoría
            </button>
          </form>
        </div>
      </div>

      {/* Lista de Categorías y Subcategorías */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="font-semibold text-lg text-slate-800 mb-4">Tus Categorías</h3>
        {loading ? (
          <p className="text-sm text-slate-500">Cargando...</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <div key={cat.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <div>
                      <h4 className="font-semibold text-slate-700">{cat.nombre}</h4>
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        cat.tipo === 'ingreso' 
                          ? 'bg-green-100 text-green-700' 
                          : cat.tipo === 'gasto'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-indigo-100 text-indigo-700'
                      }`}>
                        {cat.tipo.toUpperCase()}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Subcategorías de esta categoría */}
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-slate-400">SUBCATEGORÍAS</p>
                    <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                      {subcategories
                        .filter((sub) => sub.categoria === cat.id)
                        .map((sub) => (
                          <div key={sub.id} className="flex items-center justify-between text-xs py-1 px-2 bg-white rounded border border-slate-100">
                            <span className="text-slate-600">{sub.nombre}</span>
                            <button
                              onClick={() => handleDeleteSubcategory(sub.id)}
                              className="text-slate-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      {subcategories.filter((sub) => sub.categoria === cat.id).length === 0 && (
                        <p className="text-xs text-slate-400 italic">Sin subcategorías</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {categories.length === 0 && (
              <p className="text-sm text-slate-500 col-span-full py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                Aún no tienes categorías creadas.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
