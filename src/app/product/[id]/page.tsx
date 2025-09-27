import React from 'react'

export default function ProductPage({ params }: { params: { id: string } }) {
	return (
		<main className="p-6">
			<h1 className="text-2xl font-semibold">Product {params.id}</h1>
			<p className="text-sm text-gray-600">Product details placeholder page.</p>
		</main>
	)
}
