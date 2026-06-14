import { useState, useEffect } from 'react';
import { api } from '../api';
import { Plus, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface Category {
  id: number;
  nombre: string;
  tipo: 'ingreso' | 'gasto' | 'ambos';
}

interface Subcategory {
  id: number;
  categoria: number;
  nombre: string;
}

interface Transaction {
  id: number;
  tipo: 'ingreso' | 'gasto';
  monto: string;
  categoria_nombre: string;
  subcategoria_nombre?: string;
  descripcion: string;
  fecha: string;
}

export default function Transactions() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Form states
  const [tipo, setTipo] = useState<'ingreso' | 'gasto'>('gasto');
  const [monto, setMonto] = useState('');
  const [categoria, setCategoria] = useState<number | ''>('');
  const [subcategoria, setSubcategoria] = useState<number | ''>('');
  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catsRes, subsRes, IncomesRes, ExpensesRes] = await Promise.all([
        api.get('categorias/'),
        api.get('subcategorias/'),
        api.get('ingresos/'),
        api.get('gastos/'),
      ]);

      setCategories(catsRes.data);
      setSubcategories(subsRes.data);

      // Map backend records to common Transaction interface
      const mappedIncomes = IncomesRes.data.map((item: any) => {
        const cat = catsRes.data.find((c: any) => c.id === item.categoria);
        return {
          id: item.id,
          tipo: 'ingreso',
          monto: item.monto,
          categoria_nombre: cat ? cat.nombre : 'Sin Categoría',
          descripcion: item.descripcion,
          fecha: item.fecha,
        };
      });

      const mappedExpenses = ExpensesRes.data.map((item: any) => {
        const cat = catsRes.data.find((c: any) => c.id === item.categoria);
        const sub = subsRes.data.find((s: any) => s.id === item.subcategoria);
        return {
          id: item.id,
          tipo: 'gasto',
          monto: item.monto,
          categoria_nombre: cat ? cat.nombre : 'Sin Categoría',
          subcategoria_nombre: sub ? sub.nombre : undefined,
          descripcion: item.descripcion,
          fecha: item.fecha,
        };
      });

      // Sort combined list by date descending
      const combined = [...mappedIncomes, ...mappedExpenses].sort(
        (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      );
      setTransactions(combined);
    } catch (err) {
      setError('Error al obtener los datos de la API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter categories depending on type
  const filteredCats = categories.filter((c) => {
    if (tipo === 'ingreso') return c.tipo === 'ingreso' || c.tipo === 'ambos';
    return c.tipo === 'gasto' || c.tipo === 'ambos';
  });

  // Automatically reset category when type changes
  useEffect(() => {
    setCategoria('');
    setSubcategoria('');
  }, [tipo]);

  // Handle transaction creation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!monto || !categoria) return;
    setError('');

    const payload: any = {
      monto: parseFloat(monto),
      categoria: Number(categoria),
      descripcion,
      fecha,
    };

    if (tipo === 'gasto' && subcategoria) {
      payload.subcategoria = Number(subcategoria);
    }

    try {
      const endpoint = tipo === 'ingreso' ? 'ingresos/' : 'gastos/';
      await api.post(endpoint, payload);
      
      // Reset forms & reload lists
      setMonto('');
      setDescripcion('');
      setCategoria('');
      setSubcategoria('');
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.non_field_errors?.[0] || 'Error al guardar la transacción.');
    }
  };

  // Handle delete
  const handleDelete = async (id: number, txTipo: 'ingreso' | 'gasto') => {
    if (!confirm('¿Seguro que deseas eliminar esta transacción?')) return;
    try {
      const endpoint = txTipo === 'ingreso' ? 'ingresos' : 'gastos';
      await api.delete(`${endpoint}/${id}/`);
      setTransactions((prev) => prev.filter((t) => !(t.id === id && t.tipo === txTipo)));
    } catch (err) {
      setError('Error al intentar eliminar la transacción.');
    }
  };

  return (
    <div className="space-y-8">
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Formulario de Transacción */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-2xl">
        <h3 className="font-semibold text-lg text-slate-800 mb-4">Nueva Transacción</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setTipo('gasto')}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all border ${
                tipo === 'gasto'
                  ? 'bg-rose-50 border-rose-200 text-rose-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Gasto
            </button>
            <button
              type="button"
              onClick={() => setTipo('ingreso')}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all border ${
                tipo === 'ingreso'
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Ingreso
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Monto ($)</label>
              <input
                type="number"
                step="0.01"
                required
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Fecha</label>
              <input
                type="date"
                required
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Categoría</label>
              <select
                required
                value={categoria}
                onChange={(e) => setCategoria(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="">Selecciona una...</option>
                {filteredCats.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
            </div>
            {tipo === 'gasto' && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Subcategoría (Opcional)</label>
                <select
                  value={subcategoria}
                  onChange={(e) => setSubcategoria(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  disabled={!categoria}
                >
                  <option value="">Ninguna</option>
                  {subcategories
                    .filter((s) => s.categoria === Number(categoria))
                    .map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.nombre}
                      </option>
                    ))}
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Descripción</label>
            <input
              type="text"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ej. Almuerzo familiar, sueldo, etc."
              className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <button
            type="submit"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-all shadow-md"
          >
            <Plus className="w-4 h-4" /> Agregar Transacción
          </button>
        </form>
      </div>

      {/* Historial de Transacciones */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-lg text-slate-800">Historial de Movimientos</h3>
          <span className="text-xs text-slate-400">Total: {transactions.length} registros</span>
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm">Cargando transacciones...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  <th className="py-3.5 px-6">Tipo</th>
                  <th className="py-3.5 px-6">Fecha</th>
                  <th className="py-3.5 px-6">Categoría</th>
                  <th className="py-3.5 px-6">Descripción</th>
                  <th className="py-3.5 px-6 text-right">Monto</th>
                  <th className="py-3.5 px-6 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {transactions.map((tx) => (
                  <tr key={`${tx.tipo}-${tx.id}`} className="hover:bg-slate-50/30 transition-colors">
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        tx.tipo === 'ingreso'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}>
                        {tx.tipo === 'ingreso' ? (
                          <>
                            <ArrowUpRight className="w-3.5 h-3.5" /> Ingreso
                          </>
                        ) : (
                          <>
                            <ArrowDownRight className="w-3.5 h-3.5" /> Gasto
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-600">{tx.fecha}</td>
                    <td className="py-4 px-6">
                      <span className="font-medium text-slate-800">{tx.categoria_nombre}</span>
                      {tx.subcategoria_nombre && (
                        <span className="text-xs text-slate-400 block">{tx.subcategoria_nombre}</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-slate-500">{tx.descripcion || <span className="italic text-slate-300">Sin descripción</span>}</td>
                    <td className={`py-4 px-6 text-right font-semibold ${
                      tx.tipo === 'ingreso' ? 'text-green-600' : 'text-slate-800'
                    }`}>
                      {tx.tipo === 'ingreso' ? '+' : '-'}${parseFloat(tx.monto).toLocaleString('es-CL', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleDelete(tx.id, tx.tipo)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                      Aún no has registrado ningún ingreso ni gasto.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
