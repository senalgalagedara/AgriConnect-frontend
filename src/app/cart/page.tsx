'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

export type CartItem = {
  id: string;
  name: string;
  price: number; // per item
  qty: number;
  image?: string;
};

export type ContactDetails = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

export type ShippingDetails = {
  house: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  landmark?: string;
  sameAsBilling: boolean;
};

export type CheckoutData = {
  cart: CartItem[];
  contact: ContactDetails;
  shipping: ShippingDetails;
  totals: {
    subtotal: number;
    tax: number;
    shippingFee: number;
    total: number;
  };
};

const TAX_RATE = 0.065;
const SHIPPING_FEE = 0; // FREE

const demoCart: CartItem[] = [
  { id: 'corn', name: 'Corn', price: 65, qty: 1, image: '/corn.png' },
  { id: 'red-chili', name: 'Red chili', price: 95, qty: 2, image: '/redchili.png' },
];

export default function CartPage() {
  const router = useRouter();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [contact, setContact] = useState<ContactDetails>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '+91 ',
  });
  const [shipping, setShipping] = useState<ShippingDetails>({
    house: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    landmark: '',
    sameAsBilling: true,
  });

  useEffect(() => {
    const stored = localStorage.getItem('cart');
    setCart(stored ? JSON.parse(stored) : demoCart);
    const savedContact = localStorage.getItem('contact');
    const savedShipping = localStorage.getItem('shipping');
    if (savedContact) setContact(JSON.parse(savedContact));
    if (savedShipping) setShipping(JSON.parse(savedShipping));
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const totals = useMemo(() => {
    const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const tax = +(subtotal * TAX_RATE).toFixed(2);
    const total = +(subtotal + tax + SHIPPING_FEE).toFixed(2);
    return { subtotal, tax, shippingFee: SHIPPING_FEE, total };
  }, [cart]);

  const updateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((it) => (it.id === id ? { ...it, qty: Math.max(1, it.qty + delta) } : it))
        .filter((it) => it.qty > 0)
    );
  };

  const removeItem = (id: string) => setCart((p) => p.filter((i) => i.id !== id));

  const onContinue = () => {
    // Save details and calculated totals, then go to payment
    localStorage.setItem('contact', JSON.stringify(contact));
    localStorage.setItem('shipping', JSON.stringify(shipping));
    const payload: CheckoutData = { cart, contact, shipping, totals };
    localStorage.setItem('checkout', JSON.stringify(payload));
    router.push('/checkout');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Order Summary */}
        <div>
          <h1 className="text-2xl font-semibold text-green-700 mb-6">AgriConnect</h1>

          <h2 className="text-lg font-medium mb-4">Order Summary</h2>
          <div className="space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  {/* placeholder images; keep your current style if already present */}
                  <div className="h-12 w-12 rounded-lg bg-green-50 flex items-center justify-center text-sm">
                    🥬
                  </div>
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-gray-500 text-sm">${item.price.toFixed(2)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      aria-label="decrease"
                      onClick={() => updateQty(item.id, -1)}
                      className="h-8 w-8 rounded-lg border hover:bg-gray-100"
                    >
                      –
                    </button>
                    <span className="min-w-6 text-center">{item.qty}</span>
                    <button
                      aria-label="increase"
                      onClick={() => updateQty(item.id, +1)}
                      className="h-8 w-8 rounded-lg border hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                  <button
                    aria-label="remove"
                    onClick={() => removeItem(item.id)}
                    className="text-gray-400 hover:text-red-600"
                    title="Remove"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-6 rounded-xl bg-white p-4 shadow-sm divide-y">
            <Row label="Subtotal" value={`$${totals.subtotal.toFixed(2)}`} />
            <Row label={`Sales tax (${(TAX_RATE * 100).toFixed(1)}%)`} value={`$${totals.tax.toFixed(2)}`} />
            <div className="flex items-center justify-between pt-3">
              <span className="font-medium">Total due</span>
              <span className="font-semibold text-green-700">${totals.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Forms */}
        <div className="space-y-8">
          {/* Step indicator */}
          <div className="flex items-center gap-3 text-sm">
            <span className="text-green-700 font-medium">Shipping</span>
            <span className="text-gray-400">—</span>
            <span className="text-gray-400">Payment</span>
          </div>

          {/* Contact Details */}
          <section className="rounded-xl bg-white p-6 shadow-sm">
            <h3 className="font-medium mb-4">Contact Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="First Name" value={contact.firstName} onChange={(v) => setContact({ ...contact, firstName: v })} />
              <Input label="Last Name" value={contact.lastName} onChange={(v) => setContact({ ...contact, lastName: v })} />
              <Input label="Email" type="email" value={contact.email} onChange={(v) => setContact({ ...contact, email: v })} className="md:col-span-2" />
              <Input label="Phone Number" value={contact.phone} onChange={(v) => setContact({ ...contact, phone: v })} className="md:col-span-2" />
            </div>
          </section>

          {/* Shipping Details */}
          <section className="rounded-xl bg-white p-6 shadow-sm">
            <h3 className="font-medium mb-4">Shipping Details</h3>
            <div className="grid grid-cols-1 gap-4">
              <Input label="Flat/House no." value={shipping.house} onChange={(v) => setShipping({ ...shipping, house: v })} />
              <Input label="Address" value={shipping.address} onChange={(v) => setShipping({ ...shipping, address: v })} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="City" value={shipping.city} onChange={(v) => setShipping({ ...shipping, city: v })} />
                <Input label="State" value={shipping.state} onChange={(v) => setShipping({ ...shipping, state: v })} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Postal Code" value={shipping.postalCode} onChange={(v) => setShipping({ ...shipping, postalCode: v })} />
                <Input label="Famous Landmark" value={shipping.landmark ?? ''} onChange={(v) => setShipping({ ...shipping, landmark: v })} />
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300"
                  checked={shipping.sameAsBilling}
                  onChange={(e) => setShipping({ ...shipping, sameAsBilling: e.target.checked })}
                />
                My shipping and Billing address are the same
              </label>
            </div>

            <div className="pt-6 flex justify-end">
              <button
                onClick={onContinue}
                className="rounded-lg bg-green-700 px-6 py-2 text-white hover:bg-green-800"
              >
                Continue
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-gray-600">{label}</span>
      <span className="text-gray-700">{value}</span>
    </div>
  );
}

function Input(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  className?: string;
}) {
  const { label, value, onChange, type = 'text', className = '' } = props;
  return (
    <label className={`text-sm ${className}`}>
      <div className="mb-1 text-gray-600">{label}</div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-green-600"
      />
    </label>
  );
}
