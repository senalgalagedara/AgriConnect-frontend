import Link from "next/link";

interface ProvinceCardProps {
  name: string;
  href: string;
}

export default function ProvinceCard({ name, href }: ProvinceCardProps) {
  return (
    <Link href={href} className="province-card">
      {name}
    </Link>
  );
}
