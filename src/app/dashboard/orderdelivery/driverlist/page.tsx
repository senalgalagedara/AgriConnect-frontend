// app/(whatever)/drivers/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../../../../components/sidebar";
import Navbar from "../../../../components/navbar";

type Driver = {
  id: string;
  name: string;
  phone_number: string;
  vehicle_type: string | null;
  availability_status: "available" | "busy" | "offline";
  location?: string | null;
  capacity?: number | null;
};

type ApiResponse<T> = { success: boolean; message?: string; data: T };

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api";

const statusColors: Record<Driver["availability_status"], string> = {
  available:
    "bg-green-100 text-green-700 ring-1 ring-inset ring-green-200 dark:bg-green-900/30 dark:text-green-300 dark:ring-green-800",
  busy:
    "bg-yellow-100 text-yellow-700 ring-1 ring-inset ring-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:ring-yellow-800",
  offline:
    "bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-200 dark:bg-gray-800/60 dark:text-gray-300 dark:ring-gray-700",
};

const sorters = {
  newest: (a: Driver, b: Driver) => (a.id > b.id ? -1 : 1), // fallback (no created_at on UI type)
  name_asc: (a: Driver, b: Driver) => a.name.localeCompare(b.name),
  name_desc: (a: Driver, b: Driver) => b.name.localeCompare(a.name),
  capacity_desc: (a: Driver, b: Driver) => (b.capacity ?? 0) - (a.capacity ?? 0),
  capacity_asc: (a: Driver, b: Driver) => (a.capacity ?? 0) - (b.capacity ?? 0),
};

export default function DriverListPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // UI state
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"" | Driver["availability_status"]>("");
  const [vehicle, setVehicle] = useState<string>("");
  const [sort, setSort] = useState<keyof typeof sorters>("newest");
  const [page, setPage] = useState(1);
  const pageSize = 12;

  // fetch
  useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await fetch(`${API_BASE_URL}/drivers`, { cache: "no-store" });
        const json: ApiResponse<Driver[]> = await res.json();
        if (!json.success) throw new Error(json.message || "Failed to load drivers");
        if (isMounted) setDrivers(json.data);
      } catch (e: any) {
        if (isMounted) setErr(e?.message ?? "Something went wrong");
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  // derive filters
  const vehicleOptions = useMemo(() => {
    const set = new Set(
      drivers
        .map((d) => d.vehicle_type?.trim())
        .filter((v): v is string => Boolean(v && v.length > 0))
    );
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [drivers]);

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return drivers
      .filter((d) => {
        const matchesQ =
          !ql ||
          d.name.toLowerCase().includes(ql) ||
          d.phone_number.toLowerCase().includes(ql) ||
          (d.location ?? "").toLowerCase().includes(ql) ||
          (d.vehicle_type ?? "").toLowerCase().includes(ql) ||
          d.id.toLowerCase().includes(ql);
        const matchesStatus = !status || d.availability_status === status;
        const matchesVehicle = !vehicle || (d.vehicle_type ?? "") === vehicle;
        return matchesQ && matchesStatus && matchesVehicle;
      })
      .sort(sorters[sort]);
  }, [drivers, q, status, vehicle, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // reset to page 1 on filter/sort changes
  useEffect(() => {
    setPage(1);
  }, [q, status, vehicle, sort]);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <div className="flex">
        <aside className="hidden lg:block w-72 shrink-0 border-r border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/40 backdrop-blur">
          <Sidebar />
        </aside>

        <div className="flex-1 flex min-h-screen flex-col">
          <div className="sticky top-0 z-30 border-b border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60 backdrop-blur">
            <Navbar />
          </div>

          <main className="px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            {/* header */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                  Drivers
                </h1>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Manage and monitor your fleet in real time.
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 ring-1 ring-inset ring-neutral-200 dark:ring-neutral-700">
                  <span className="font-medium">{filtered.length}</span> visible
                </span>
                <span className="text-neutral-400">/</span>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 ring-1 ring-inset ring-neutral-200 dark:ring-neutral-700">
                  <span className="font-medium">{drivers.length}</span> total
                </span>
              </div>
            </div>

            {/* toolbar */}
            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
              <div className="col-span-1 xl:col-span-2">
                <div className="relative">
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search by name, phone, vehicle, location, or ID…"
                    className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 pr-10 shadow-sm outline-none transition focus:ring-4 ring-neutral-200/60 dark:border-neutral-800 dark:bg-neutral-900 dark:focus:ring-neutral-800"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
                    ⌘K
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 shadow-sm outline-none focus:ring-4 ring-neutral-200/60 dark:border-neutral-800 dark:bg-neutral-900 dark:focus:ring-neutral-800"
                >
                  <option value="">All statuses</option>
                  <option value="available">Available</option>
                  <option value="busy">Busy</option>
                  <option value="offline">Offline</option>
                </select>

                <select
                  value={vehicle}
                  onChange={(e) => setVehicle(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 shadow-sm outline-none focus:ring-4 ring-neutral-200/60 dark:border-neutral-800 dark:bg-neutral-900 dark:focus:ring-neutral-800"
                >
                  <option value="">All vehicles</option>
                  {vehicleOptions.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as keyof typeof sorters)}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 shadow-sm outline-none focus:ring-4 ring-neutral-200/60 dark:border-neutral-800 dark:bg-neutral-900 dark:focus:ring-neutral-800"
                >
                  <option value="newest">Sort: Newest</option>
                  <option value="name_asc">Sort: Name A → Z</option>
                  <option value="name_desc">Sort: Name Z → A</option>
                  <option value="capacity_desc">Sort: Capacity High → Low</option>
                  <option value="capacity_asc">Sort: Capacity Low → High</option>
                </select>
              </div>
            </section>

            {/* content */}
            {loading ? (
              <SkeletonGrid />
            ) : err ? (
              <ErrorState message={err} onRetry={() => location.reload()} />
            ) : filtered.length === 0 ? (
              <EmptyState reset={() => {
                setQ(""); setStatus(""); setVehicle(""); setSort("newest");
              }} />
            ) : (
              <>
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
                  {pageItems.map((d) => (
                    <DriverCard key={d.id} d={d} />
                  ))}
                </section>

                {/* pagination */}
                <div className="flex items-center justify-center gap-2 pt-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="rounded-lg border border-neutral-200 dark:border-neutral-800 px-3 py-2 text-sm disabled:opacity-40 bg-white dark:bg-neutral-900"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="rounded-lg border border-neutral-200 dark:border-neutral-800 px-3 py-2 text-sm disabled:opacity-40 bg-white dark:bg-neutral-900"
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function DriverCard({ d }: { d: Driver }) {
  return (
    <article className="group rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold leading-6">
            {d.name}
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {d.vehicle_type ?? "—"} {d.capacity ? `• ${d.capacity} cap.` : ""}
          </p>
        </div>
        <span
          className={
            "px-2 py-0.5 rounded-md text-xs font-medium whitespace-nowrap " +
            statusColors[d.availability_status]
          }
          title={`Status: ${d.availability_status}`}
        >
          {d.availability_status}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 text-sm">
        <InfoRow label="Phone" value={d.phone_number} />
        {d.location && <InfoRow label="Address" value={d.location} />}
        <div className="text-[11px] text-neutral-400 dark:text-neutral-500">
          ID: <span className="font-mono break-all">{d.id}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <a
          href={`tel:${d.phone_number}`}
          className="inline-flex items-center justify-center rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-3 py-1.5 text-sm font-medium shadow-sm hover:opacity-90 transition"
        >
          Call
        </a>
        {d.location && (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              d.location
            )}`}
            target="_blank"
            className="inline-flex items-center justify-center rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-1.5 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 transition"
          >
            Map
          </a>
        )}
      </div>
    </article>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-neutral-500 dark:text-neutral-400">{label}</span>
      <span className="truncate font-medium">{value ?? "—"}</span>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4"
        >
          <div className="h-5 w-36 bg-neutral-200 dark:bg-neutral-800 rounded" />
          <div className="mt-2 h-4 w-20 bg-neutral-200 dark:bg-neutral-800 rounded" />
          <div className="mt-4 space-y-2">
            <div className="h-4 w-full bg-neutral-200 dark:bg-neutral-800 rounded" />
            <div className="h-4 w-2/3 bg-neutral-200 dark:bg-neutral-800 rounded" />
            <div className="h-3 w-1/2 bg-neutral-200 dark:bg-neutral-800 rounded" />
          </div>
          <div className="mt-4 h-8 w-24 bg-neutral-200 dark:bg-neutral-800 rounded" />
        </div>
      ))}
    </section>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-2xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950 p-6 text-red-700 dark:text-red-300">
      <div className="text-sm">
        <p className="font-semibold">Couldn’t load drivers</p>
        <p className="mt-1 opacity-90">{message}</p>
      </div>
      <button
        onClick={onRetry}
        className="mt-4 inline-flex items-center rounded-lg bg-red-600 text-white px-3 py-2 text-sm hover:bg-red-700 transition"
      >
        Try again
      </button>
    </div>
  );
}

function EmptyState({ reset }: { reset: () => void }) {
  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-10 text-center">
      <div className="mx-auto h-12 w-12 rounded-full bg-neutral-100 dark:bg-neutral-800 grid place-items-center text-xl">
        🚚
      </div>
      <h3 className="mt-4 text-lg font-semibold">No drivers match your filters</h3>
      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
        Try adjusting the search, status, or vehicle filters.
      </p>
      <button
        onClick={reset}
        className="mt-4 inline-flex items-center rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 transition"
      >
        Reset filters
      </button>
    </div>
  );
}
