'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Income, Expense, Budget, ExpenseCategory } from '@/lib/supabase'
import { EXPENSE_CATEGORIES, EXPENSE_CATEGORY_LABELS } from '@/lib/supabase'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog'
import { MetricCard } from '@/components/dashboard/metric-card'
import {
  TrendingDown,
  TrendingUp,
  Wallet,
  Plus,
  Pencil,
  Trash2,
  SlidersHorizontal,
} from 'lucide-react'

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

const INPUT =
  'w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-colors'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">{label}</label>
      {children}
    </div>
  )
}

type ExpenseForm = {
  category: ExpenseCategory
  amount: number
  month: string
  year: number
  description: string
}

const now = new Date()
const CURRENT_MONTH = MONTHS[now.getMonth()]
const CURRENT_YEAR = now.getFullYear()

const defaultExpenseForm = (): ExpenseForm => ({
  category: 'software',
  amount: 0,
  month: CURRENT_MONTH,
  year: CURRENT_YEAR,
  description: '',
})

export function FinancesView() {
  const [income, setIncome] = useState<Income[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)

  // Expense modal
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Expense | null>(null)
  const [form, setForm] = useState<ExpenseForm>(defaultExpenseForm())
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Budget modal
  const [budgetOpen, setBudgetOpen] = useState(false)
  const [budgetDraft, setBudgetDraft] = useState<Record<ExpenseCategory, number>>(
    {} as Record<ExpenseCategory, number>
  )
  const [savingBudget, setSavingBudget] = useState(false)

  useEffect(() => {
    Promise.all([
      supabase.from('income').select('*'),
      supabase.from('expenses').select('*').order('created_at', { ascending: false }),
      supabase.from('budgets').select('*'),
    ]).then(([incomeRes, expRes, budRes]) => {
      if (incomeRes.data) setIncome(incomeRes.data as Income[])
      if (expRes.data) setExpenses(expRes.data as Expense[])
      if (budRes.data) setBudgets(budRes.data as Budget[])
      setLoading(false)
    })
  }, [])

  // ── Cálculos del mes actual ──────────────────────────────────────────────
  const ingresosMes = income
    .filter((i) => i.month === CURRENT_MONTH && i.year === CURRENT_YEAR)
    .reduce((acc, i) => acc + i.amount, 0)

  const gastosMes = expenses
    .filter((e) => e.month === CURRENT_MONTH && e.year === CURRENT_YEAR)
    .reduce((acc, e) => acc + e.amount, 0)

  const neto = ingresosMes - gastosMes

  function spentInCategory(cat: ExpenseCategory): number {
    return expenses
      .filter((e) => e.category === cat && e.month === CURRENT_MONTH && e.year === CURRENT_YEAR)
      .reduce((acc, e) => acc + e.amount, 0)
  }

  // ── Gastos CRUD ──────────────────────────────────────────────────────────
  function openCreate() {
    setEditingItem(null)
    setForm(defaultExpenseForm())
    setModalOpen(true)
  }

  function openEdit(item: Expense) {
    setEditingItem(item)
    setForm({
      category: item.category,
      amount: item.amount,
      month: item.month,
      year: item.year,
      description: item.description ?? '',
    })
    setModalOpen(true)
  }

  const set = <K extends keyof ExpenseForm>(k: K, v: ExpenseForm[K]) =>
    setForm((p) => ({ ...p, [k]: v }))

  async function handleSave() {
    setSaving(true)
    const payload = { ...form, description: form.description || null }
    if (editingItem) {
      const { data, error } = await supabase
        .from('expenses')
        .update(payload)
        .eq('id', editingItem.id)
        .select()
        .single()
      if (!error && data) {
        setExpenses((prev) => prev.map((e) => (e.id === data.id ? (data as Expense) : e)))
      }
    } else {
      const { data, error } = await supabase.from('expenses').insert(payload).select().single()
      if (!error && data) setExpenses((prev) => [data as Expense, ...prev])
    }
    setSaving(false)
    setModalOpen(false)
    setEditingItem(null)
  }

  async function handleDelete() {
    if (!deletingId) return
    await supabase.from('expenses').delete().eq('id', deletingId)
    setExpenses((prev) => prev.filter((e) => e.id !== deletingId))
    setDeletingId(null)
  }

  // ── Presupuestos ─────────────────────────────────────────────────────────
  function openBudgets() {
    const draft = {} as Record<ExpenseCategory, number>
    for (const { value } of EXPENSE_CATEGORIES) {
      draft[value] = budgets.find((b) => b.category === value)?.monthly_limit ?? 0
    }
    setBudgetDraft(draft)
    setBudgetOpen(true)
  }

  async function handleSaveBudgets() {
    setSavingBudget(true)
    const next = [...budgets]
    for (const { value } of EXPENSE_CATEGORIES) {
      const limit = budgetDraft[value] ?? 0
      const existing = budgets.find((b) => b.category === value)
      if (existing) {
        if (existing.monthly_limit !== limit) {
          const { data } = await supabase
            .from('budgets')
            .update({ monthly_limit: limit })
            .eq('id', existing.id)
            .select()
            .single()
          if (data) {
            const idx = next.findIndex((b) => b.id === existing.id)
            next[idx] = data as Budget
          }
        }
      } else if (limit > 0) {
        const { data } = await supabase
          .from('budgets')
          .insert({ category: value, monthly_limit: limit })
          .select()
          .single()
        if (data) next.push(data as Budget)
      }
    }
    setBudgets(next)
    setSavingBudget(false)
    setBudgetOpen(false)
  }

  const budgetsConLimite = budgets.filter((b) => b.monthly_limit > 0)

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-64">
        <p className="text-zinc-500 text-sm">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Finanzas</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Gastos, presupuesto y ganancia neta · {CURRENT_MONTH} {CURRENT_YEAR}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Agregar gasto
        </button>
      </div>

      {/* ── Resumen del mes ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard icon={TrendingUp} label="Ingresos del mes" value={`$${ingresosMes.toLocaleString()}`} subtitle={CURRENT_MONTH} />
        <MetricCard icon={TrendingDown} label="Gastos del mes" value={`$${gastosMes.toLocaleString()}`} subtitle={CURRENT_MONTH} />
        <div className={`rounded-xl border p-5 ${neto >= 0 ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Wallet className={`w-4 h-4 ${neto >= 0 ? 'text-emerald-500' : 'text-red-500'}`} />
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Ganancia neta</span>
          </div>
          <p className={`text-2xl font-bold ${neto >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
            {neto < 0 ? '-' : ''}${Math.abs(neto).toLocaleString()}
          </p>
        </div>
      </div>

      {/* ── Presupuestos ─────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Presupuesto mensual</h2>
          <button
            onClick={openBudgets}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Editar presupuestos
          </button>
        </div>

        {budgetsConLimite.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-zinc-400 dark:text-zinc-500">
              Aún no defines presupuestos. Establece un límite por categoría para controlar tus gastos.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {budgetsConLimite.map((b) => {
              const spent = spentInCategory(b.category)
              const pct = Math.min(100, Math.round((spent / b.monthly_limit) * 100))
              const over = spent > b.monthly_limit
              return (
                <div key={b.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">{EXPENSE_CATEGORY_LABELS[b.category]}</span>
                    <span className={`text-xs font-medium ${over ? 'text-red-500' : 'text-zinc-500 dark:text-zinc-400'}`}>
                      ${spent.toLocaleString()} / ${b.monthly_limit.toLocaleString()}
                      {over && ' · excedido'}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${over ? 'bg-red-500' : pct >= 80 ? 'bg-amber-500' : 'bg-indigo-500'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Lista de gastos ──────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 px-6 pt-6 pb-4">Gastos registrados</h2>
        {expenses.length === 0 ? (
          <div className="text-center py-12 px-6">
            <p className="text-sm text-zinc-400 dark:text-zinc-500">Aún no registras gastos. Dale a “Agregar gasto”.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {expenses.map((e) => (
              <div key={e.id} className="flex items-center gap-4 px-6 py-3.5 group hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">
                    {e.description || EXPENSE_CATEGORY_LABELS[e.category]}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                      {EXPENSE_CATEGORY_LABELS[e.category]}
                    </span>
                    <span className="text-xs text-zinc-400">{e.month} {e.year}</span>
                  </div>
                </div>
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 shrink-0">
                  ${e.amount.toLocaleString()}
                </span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button onClick={() => openEdit(e)} className="p-1.5 text-zinc-400 hover:text-indigo-500 transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setDeletingId(e.id)} className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Modal: gasto ─────────────────────────────────────────────────── */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Editar gasto' : 'Nuevo gasto'}</DialogTitle>
            <DialogClose />
          </DialogHeader>
          <DialogBody>
            <Field label="Categoría">
              <select className={INPUT} value={form.category} onChange={(e) => set('category', e.target.value as ExpenseCategory)}>
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Monto ($)">
              <input type="number" className={INPUT} value={form.amount || ''} onChange={(e) => set('amount', Number(e.target.value))} placeholder="0" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Mes">
                <select className={INPUT} value={form.month} onChange={(e) => set('month', e.target.value)}>
                  {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </Field>
              <Field label="Año">
                <input type="number" className={INPUT} value={form.year} onChange={(e) => set('year', Number(e.target.value))} />
              </Field>
            </div>
            <Field label="Descripción (opcional)">
              <input className={INPUT} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Ej: Suscripción CapCut Pro" />
            </Field>
          </DialogBody>
          <DialogFooter>
            <DialogClose className="px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
              Cancelar
            </DialogClose>
            <button
              onClick={handleSave}
              disabled={saving || form.amount <= 0}
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Modal: presupuestos ──────────────────────────────────────────── */}
      <Dialog open={budgetOpen} onOpenChange={setBudgetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Presupuesto mensual por categoría</DialogTitle>
            <DialogClose />
          </DialogHeader>
          <DialogBody>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Define cuánto planeas gastar al mes en cada categoría. Deja en 0 las que no quieras controlar.</p>
            {EXPENSE_CATEGORIES.map((c) => (
              <Field key={c.value} label={c.label}>
                <input
                  type="number"
                  className={INPUT}
                  value={budgetDraft[c.value] || ''}
                  onChange={(e) => setBudgetDraft((p) => ({ ...p, [c.value]: Number(e.target.value) }))}
                  placeholder="0"
                />
              </Field>
            ))}
          </DialogBody>
          <DialogFooter>
            <DialogClose className="px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
              Cancelar
            </DialogClose>
            <button
              onClick={handleSaveBudgets}
              disabled={savingBudget}
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {savingBudget ? 'Guardando...' : 'Guardar presupuestos'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Modal: confirmar borrado ─────────────────────────────────────── */}
      <Dialog open={!!deletingId} onOpenChange={(o) => !o && setDeletingId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Eliminar gasto</DialogTitle>
            <DialogClose />
          </DialogHeader>
          <DialogBody>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">¿Seguro que quieres eliminar este gasto? No se puede deshacer.</p>
          </DialogBody>
          <DialogFooter>
            <DialogClose className="px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
              Cancelar
            </DialogClose>
            <button onClick={handleDelete} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors">
              Eliminar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
