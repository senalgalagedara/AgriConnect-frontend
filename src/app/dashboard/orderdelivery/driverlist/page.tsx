"use client"
import React, { useEffect, useState } from 'react'
import { getWithMock } from '@/lib/api'

type Driver = {
  id: number
  name: string
  phone_number: string
  vehicle_type: string
  availability_status: 'available' | 'busy' | 'offline'
}

const statusColors: Record<Driver['availability_status'], string> = {
  available: 'bg-green-100 text-green-800',
  busy: 'bg-yellow-100 text-yellow-800',
  offline: 'bg-gray-100 text-gray-800',
}

export default function DriverListPage() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      const mockDrivers: Driver[] = [
        { id: 1, name: 'Alex Kim', phone_number: '+1 555-0101', vehicle_type: 'Bike', availability_status: 'available' },
        { id: 2, name: 'Priya Singh', phone_number: '+1 555-0102', vehicle_type: 'Van', availability_status: 'busy' },
        { id: 3, name: 'Sam Lee', phone_number: '+1 555-0103', vehicle_type: 'Car', availability_status: 'offline' },
        { id: 4, name: 'Fatima Noor', phone_number: '+1 555-0104', vehicle_type: 'Bike', availability_status: 'available' },
      ]
      const data = await getWithMock<Driver[]>('/api/drivers', mockDrivers)
      setDrivers(data)
      setLoading(false)
    })()
  }, [])

  return (
    <main className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Driver List</h1>
        <span className="text-sm text-gray-500">{drivers.length} total</span>
      </div>

      {loading ? (
        <p className="text-sm text-gray-600">Loading drivers...</p>
      ) : (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {drivers.map((d) => (
            <article key={d.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-medium">{d.name}</h3>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[d.availability_status]}`}>{d.availability_status.replace('_', ' ')}</span>
              </div>
              <div className="mt-2 text-sm text-gray-600 space-y-1">
                <p>Phone: {d.phone_number}</p>
                <p>Vehicle: {d.vehicle_type}</p>
                <p>ID: {d.id}</p>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  )
}
