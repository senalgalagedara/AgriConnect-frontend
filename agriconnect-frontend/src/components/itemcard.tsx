import Link from "next/link";

interface ItemCardProps {
  name: string;
}

export default function ItemCard({ name }: ItemCardProps) {
  return (
    <Link href={`/inventory/${encodeURIComponent(name)}`} className="item-card">
      {name}
    </Link>
  );
}
