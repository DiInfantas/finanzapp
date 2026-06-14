import { useEffect, useState } from 'react';
import { api } from '../api';
import { TrendingUp, TrendingDown, DollarSign, Wallet, Calendar } from 'lucide-react';

interface Summary {
  incomes: number;
  expenses: number;
  balance: number;
  topExpenseCategory: string;
}

interface Transaction {
  id: number;
  tipo: 'ingreso' | 'gasto';
  monto: number;
  categoria_nombre: string;
  descripcion: string;
  fecha: string;
}

export default function Dashboard() {
  const [summary, setSummary] = useState<Summary>({ incomes: 0, expenses: 0, balance: 0, topExpenseCategory: 'N/A' });
  const [recentTx, setRecentTx] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [catsRes, incomesRes, expensesRes] = await Promise.all([
          api.get('categorias/'),
          api.get('ingresos/'),
          api.get('gastos/'),
        ]);

        const totalIncomes = incomesRes.data.reduce((sum: number, item: any) => sum + parseFloat(item.monto), 0);
        const totalExpenses = expensesRes.data.reduce((sum: number, item: any) => sum + parseFloat(item.monto), 0);
        
        // Find category with largest total expenses
        const expenseByCat: { [key: number]: number } = {};
        expensesRes.data.forEach((exp: any) => {
          expenseByCat[exp.categoria] = (expenseByCat[exp.categoria] || 0) + parseFloat(exp.monto);
        });

        let maxExpenseVal = 0;
        let maxExpenseCatId = 0;
        Object.entries(expenseByCat).forEach(([catId, val]) => {
          if (val > maxExpenseVal) {
            maxExpenseVal = val;
            maxExpenseCatId = Number(catId);
          }
        });

        const topCat = catsRes.data.find((c: any) => c.id === maxExpenseCatId);

        setSummary({
          incomes: totalIncomes,
          expenses: totalExpenses,
          balance: totalIncomes - totalExpenses,
          topExpenseCategory: topCat ? topCat.nombre : 'Ninguna',
        });

        // Combined recent transactions
        const mappedIncomes = incomesRes.data.map((i: any) => ({
          id: i.id,
          tipo: 'ingreso',
          monto: parseFloat(i.monto),
          categoria_nombre: catsRes.data.find((c: any) => c.id === i.categoria)?.nombre || 'Ingreso',
          descripcion: i.descripcion,
          fecha: i.fecha,
        }));

        const mappedExpenses = expensesRes.data.map((e: any) => ({
          id: e.id,
          tipo: 'gasto',
          monto: parseFloat(e.monto),
          categoria_nombre: catsRes.data.find((c: any) => c.id === e.categoria)?.nombre || 'Gasto',
          descripcion: e.descripcion,
          fecha: e.fecha,
        }));

        const sorted = [...mappedIncomes, ...mappedExpenses]
          .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
          .slice(0, 5); // top 5 recent

        setRecentTx(sorted);
      } catch (err) {
        console.error('Error al cargar datos del dashboard', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <p className="text-slate-500 text-sm">Cargando resumen financiero...</p>;
  }

  const formatCurrency = (val: number) => {
    return val.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' });
  };

  return (
    <div className="space-y-8">
      {/* Metric Cards Grid */}
      <div className="grid sm:grid-cols-3 gap-6">
        {/* Incomes Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ingresos Totales</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{formatCurrency(summary.incomes)}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600 border border-green-100">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Expenses Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Gastos Totales</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{formatCurrency(summary.expenses)}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-100">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>

        {/* Balance Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Balance Neto</p>
            <h3 className={`text-2xl font-bold mt-1 ${summary.balance >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
              {formatCurrency(summary.balance)}
            </h3>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
            summary.balance >= 0 
              ? 'bg-indigo-50 text-indigo-600 border-indigo-100' 
              : 'bg-rose-50 text-rose-600 border-rose-100'
          }`}>
            <Wallet className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Grid for extra stats & recent activities */}
      <div className="grid md:grid-cols-3 gap-8">
        {/* Recent Transactions list */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm md:col-span-2 space-y-4">
          <h3 className="font-semibold text-lg text-slate-800">Actividad Reciente</h3>
          <div className="divide-y divide-slate-100">
            {recentTx.map((tx) => (
              <div key={`${tx.tipo}-${tx.id}`} className="py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${
                    tx.tipo === 'ingreso'
                      ? 'bg-green-50 text-green-600 border-green-100'
                      : 'bg-slate-50 text-slate-500 border-slate-100'
                  }`}>
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{tx.categoria_nombre}</p>
                    <p className="text-xs text-slate-400">{tx.descripcion || 'Sin descripción'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${tx.tipo === 'ingreso' ? 'text-green-600' : 'text-slate-800'}`}>
                    {tx.tipo === 'ingreso' ? '+' : '-'}{formatCurrency(tx.monto)}
                  </p>
                  <p className="text-[10px] text-slate-400 flex items-center justify-end gap-1 mt-0.5">
                    <Calendar className="w-3 h-3" /> {tx.fecha}
                  </p>
                </div>
              </div>
            ))}
            {recentTx.length === 0 && (
              <p className="text-sm text-slate-400 italic py-6 text-center">Sin transacciones recientes.</p>
            )}
          </div>
        </div>

        {/* Stats card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="font-semibold text-lg text-slate-800">Estadísticas Rápidas</h3>
          
          <div className="space-y-4">
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase">Mayor Categoría de Gasto</p>
              <p className="text-lg font-bold text-slate-700 mt-0.5">{summary.topExpenseCategory}</p>
            </div>
            
            <div className="pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-400 font-medium uppercase">Tasa de Ahorro</p>
              <div className="mt-2 w-full bg-slate-100 rounded-full h-2.5">
                <div 
                  className="bg-indigo-600 h-2.5 rounded-full" 
                  style={{ 
                    width: `${summary.incomes > 0 ? Math.max(0, Math.min(100, ((summary.incomes - summary.expenses) / summary.incomes) * 100)) : 0}%` 
                  }}
                ></div>
              </div>
              <p className="text-xs text-slate-500 font-semibold mt-1 text-right">
                {summary.incomes > 0 
                  ? `${Math.max(0, Math.round(((summary.incomes - summary.expenses) / summary.incomes) * 100))}%` 
                  : '0%'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
