"use client"
import React, { useEffect, useMemo, useState } from 'react'
import { apiRequest, getWithMock, postWithMock } from '@/lib/api'

type Order = {
  id: number
  contact: { firstName?: string; lastName?: string }
  shipping: { address?: string }
  total: number
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  created_at: string
}

type AssignmentResponse = { success: boolean }

export default function OrderListPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [assigningOrder, setAssigningOrder] = useState<Order | null>(null)
  const [driverId, setDriverId] = useState('')
  const [scheduleTime, setScheduleTime] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const currency = useMemo(() => new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }), [])

  useEffect(() => {
    ;(async () => {
      const mockOrders: Order[] = [
        { id: 101, contact: { firstName: 'John', lastName: 'Doe' }, shipping: { address: '123 Main St' }, total: 59.99, status: 'pending', created_at: new Date().toISOString() },
        { id: 102, contact: { firstName: 'Jane', lastName: 'Smith' }, shipping: { address: '456 Oak Ave' }, total: 24.5, status: 'paid', created_at: new Date().toISOString() },
      ]
      // Backend exposes GET /api/orders/paid for listing
      const data = await getWithMock<Order[]>('/api/orders/paid', mockOrders)
      setOrders(data)
      setLoading(false)
    })()
  }, [])

  async function submitAssignment(e: React.FormEvent) {
    e.preventDefault()
    if (!assigningOrder) return
    setSubmitting(true)
    const body = { orderId: assigningOrder.id, driverId: Number(driverId), scheduleTime }
    // Backend returns ApiResponse; apiRequest unwraps .data
    await apiRequest('/api/assignments', { method: 'POST', body })
    setSubmitting(false)
    setAssigningOrder(null)
    setDriverId('')
    setScheduleTime('')
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Order List</h1>
      {loading ? (
        <p className="text-sm text-gray-600">Loading orders...</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-600">Order ID</th>
                <th className="px-4 py-3 font-medium text-gray-600">Customer</th>
                <th className="px-4 py-3 font-medium text-gray-600">Address</th>
                <th className="px-4 py-3 font-medium text-gray-600">Amount</th>
                <th className="px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 font-medium text-gray-600">Created</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t border-gray-100">
                  <td className="px-4 py-3">#{o.id}</td>
                  <td className="px-4 py-3">{[o.contact?.firstName, o.contact?.lastName].filter(Boolean).join(' ')}</td>
                  <td className="px-4 py-3">{o.shipping?.address}</td>
                  <td className="px-4 py-3">{currency.format(o.total)}</td>
                  <td className="px-4 py-3 capitalize">{String(o.status).replaceAll('_', ' ')}</td>
                  <td className="px-4 py-3">{new Date(o.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setAssigningOrder(o)} className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-1.5 text-white hover:bg-indigo-700">
                      Assign Driver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {assigningOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h2 className="text-lg font-semibold">Assign Driver</h2>
              <button onClick={() => setAssigningOrder(null)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <form onSubmit={submitAssignment} className="px-5 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600">Order ID</label>
                  <input value={assigningOrder.id} readOnly className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-gray-600">Customer</label>
                  <input value={[assigningOrder.contact?.firstName, assigningOrder.contact?.lastName].filter(Boolean).join(' ')} readOnly className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 px-3 py-2 text-sm" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-gray-600">Address</label>
                  <input value={assigningOrder.shipping?.address ?? ''} readOnly className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-gray-600">Driver ID</label>
                  <input value={driverId} onChange={(e) => setDriverId(e.target.value)} placeholder="Enter driver id" required className="mt-1 w-full rounded-md border-gray-300 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-gray-600">Schedule Time</label>
                  <input type="datetime-local" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} required className="mt-1 w-full rounded-md border-gray-300 px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setAssigningOrder(null)} className="rounded-md border border-gray-300 px-3 py-1.5 text-sm">Cancel</button>
                <button disabled={submitting} className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-700 disabled:opacity-60">
                  {submitting ? 'Assigning...' : 'Assign Driver'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
