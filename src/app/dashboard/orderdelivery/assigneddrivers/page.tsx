"use client"
import React, { useEffect, useMemo, useState } from 'react'
import { getWithMock } from '@/lib/api'

type Assignment = {
  id: number
  order_id: number
  driver_id: number
  driver_name?: string
  customer_name?: string
  customer_address?: string
  schedule_time: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
}

export default function AssignedDriversPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const dateFmt = useMemo(() => new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }), [])

  useEffect(() => {
    ;(async () => {
      const mock: Assignment[] = [
        { id: 1, order_id: 101, driver_id: 1, driver_name: 'Alex Kim', customer_name: 'John Doe', customer_address: '123 Main St', schedule_time: new Date().toISOString(), status: 'pending' },
      ]
      const data = await getWithMock<Assignment[]>('/api/assignments', mock)
      setAssignments(data)
      setLoading(false)
    })()
  }, [])

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Assigned Drivers</h1>
      {loading ? (
        <p className="text-sm text-gray-600">Loading assignments...</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-600">Assignment ID</th>
                <th className="px-4 py-3 font-medium text-gray-600">Order</th>
                <th className="px-4 py-3 font-medium text-gray-600">Driver</th>
                <th className="px-4 py-3 font-medium text-gray-600">Customer</th>
                <th className="px-4 py-3 font-medium text-gray-600">Address</th>
                <th className="px-4 py-3 font-medium text-gray-600">Schedule</th>
                <th className="px-4 py-3 font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((a) => (
                <tr key={a.id} className="border-t border-gray-100">
                  <td className="px-4 py-3">#{a.id}</td>
                  <td className="px-4 py-3">#{a.order_id}</td>
                  <td className="px-4 py-3">{a.driver_name || `ID ${a.driver_id}`}</td>
                  <td className="px-4 py-3">{a.customer_name}</td>
                  <td className="px-4 py-3">{a.customer_address}</td>
                  <td className="px-4 py-3">{dateFmt.format(new Date(a.schedule_time))}</td>
                  <td className="px-4 py-3 capitalize">{a.status.replace('_', ' ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
