import { useState, useEffect } from 'react'
import { Plus, Trash2, Folder, FolderPlus, Loader2 } from 'lucide-react'
import { api } from '../api'

interface Subcategory {
  id: number
  categoria: number
  nombre: string
}

interface Category {
  id: number
  nombre: string
  tipo: 'ingreso' | 'gasto' | 'ambos'
}

export function CategoriesView() {
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  
  // Form states
  const [catName, setCatName] = useState('')
  const [catTipo, setCatTipo] = useState<'ingreso' | 'gasto' | 'ambos'>('gasto')
  const [subName, setSubName] = useState('')
  const [selectedCatId, setSelectedCatId] = useState<number | ''>('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const [catsRes, subsRes] = await Promise.all([
        api.get('categorias/'),
        api.get('subcategorias/'),
      ])
      setCategories(catsRes.data)
      setSubcategories(subsRes.data)
      if (catsRes.data.length > 0) {
        setSelectedCatId(catsRes.data[0].id)
      }
    } catch (err) {
      console.error(err)
      setError('Error al cargar datos de categorías.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!catName.trim()) return

    try {
      const response = await api.post('categorias/', {
        nombre: catName,
        tipo: catTipo,
      })
      setCategories((prev) => [...prev, response.data])
      setCatName('')
      if (!selectedCatId) {
        setSelectedCatId(response.data.id)
      }
    } catch (err) {
      setError('Error al crear la categoría.')
    }
  }

  const handleCreateSubcategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subName.trim() || !selectedCatId) return

    try {
      const response = await api.post('subcategorias/', {
        categoria: Number(selectedCatId),
        nombre: subName,
      })
      setSubcategories((prev) => [...prev, response.data])
      setSubName('')
    } catch (err) {
      setError('Error al crear la subcategoría.')
    }
  }

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta categoría? Se eliminarán también sus subcategorías.')) return
    try {
      await api.delete(`categorias/${id}/`)
      setCategories((prev) => prev.filter((c) => c.id !== id))
      setSubcategories((prev) => prev.filter((s) => s.categoria !== id))
      if (selectedCatId === id) {
        setSelectedCatId('')
      }
    } catch (err) {
      setError('No se pudo eliminar la categoría.')
    }
  }

  const handleDeleteSubcategory = async (id: number) => {
    try {
      await api.delete(`subcategorias/${id}/`)
      setSubcategories((prev) => prev.filter((s) => s.id !== id))
    } catch (err) {
      setError('No se pudo eliminar la subcategoría.')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Categorías</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Organiza tus ingresos y gastos creando categorías personalizadas.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-destructive/15 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Nueva Categoría */}
            <div className="glass rounded-3xl border border-border/60 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Folder className="size-5 text-primary" />
                <h2 className="text-base font-semibold">Nueva Categoría</h2>
              </div>
              <form onSubmit={handleCreateCategory} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Nombre</label>
                  <input
                    type="text"
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    placeholder="Ej. Alimentación, Sueldo, etc."
                    required
                    className="w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Tipo de movimiento</label>
                  <select
                    value={catTipo}
                    onChange={(e: any) => setCatTipo(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30"
                  >
                    <option value="gasto">Gasto</option>
                    <option value="ingreso">Ingreso</option>
                    <option value="ambos">Ambos</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 active:scale-[0.98]"
                >
                  <Plus className="size-4" /> Crear Categoría
                </button>
              </form>
            </div>

            {/* Nueva Subcategoría */}
            <div className="glass rounded-3xl border border-border/60 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <FolderPlus className="size-5 text-primary" />
                <h2 className="text-base font-semibold">Nueva Subcategoría</h2>
              </div>
              <form onSubmit={handleCreateSubcategory} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Categoría Principal</label>
                  <select
                    value={selectedCatId}
                    onChange={(e) => setSelectedCatId(e.target.value ? Number(e.target.value) : '')}
                    className="w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30"
                  >
                    <option value="">Selecciona una categoría...</option>
                    {categories
                      .filter((c) => c.tipo !== 'ingreso')
                      .map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.nombre}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Nombre</label>
                  <input
                    type="text"
                    value={subName}
                    onChange={(e) => setSubName(e.target.value)}
                    placeholder="Ej. Supermercado, Restaurant, Bencina"
                    required
                    disabled={!selectedCatId}
                    className="w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30 disabled:opacity-50"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!selectedCatId}
                  className="flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50"
                >
                  <Plus className="size-4" /> Crear Subcategoría
                </button>
              </form>
            </div>
          </div>

          {/* Listado de Categorías */}
          <section className="rounded-2xl border border-border bg-card shadow-sm p-6">
            <h2 className="text-base font-semibold mb-4">Tus Categorías</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((cat) => (
                <div key={cat.id} className="p-4 rounded-xl border border-border bg-muted/40 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-3">
                      <div>
                        <h4 className="font-semibold text-foreground text-sm">{cat.nombre}</h4>
                        <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full mt-1 uppercase ${
                          cat.tipo === 'ingreso' 
                            ? 'bg-success/15 text-success' 
                            : cat.tipo === 'gasto'
                            ? 'bg-destructive/15 text-destructive'
                            : 'bg-primary/15 text-primary'
                        }`}>
                          {cat.tipo}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="p-1 text-muted-foreground transition-colors hover:text-destructive hover:bg-destructive/10 rounded-lg"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>

                    <div className="space-y-1.5 mt-2">
                      <p className="text-[10px] font-bold text-muted-foreground tracking-wider">SUBCATEGORÍAS</p>
                      <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                        {subcategories
                          .filter((sub) => sub.categoria === cat.id)
                          .map((sub) => (
                            <div key={sub.id} className="flex items-center justify-between text-xs py-1 px-2 bg-card rounded border border-border">
                              <span className="text-foreground">{sub.nombre}</span>
                              <button
                                onClick={() => handleDeleteSubcategory(sub.id)}
                                className="text-muted-foreground hover:text-destructive transition-colors"
                              >
                                <Trash2 className="size-3" />
                              </button>
                            </div>
                          ))}
                        {subcategories.filter((sub) => sub.categoria === cat.id).length === 0 && (
                          <p className="text-xs text-muted-foreground italic">Sin subcategorías</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {categories.length === 0 && (
                <p className="text-sm text-muted-foreground col-span-full py-8 text-center bg-muted/20 rounded-xl border border-dashed border-border">
                  Aún no tienes categorías creadas.
                </p>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
