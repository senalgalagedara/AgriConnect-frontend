import Link from "next/link";

export default function Sidebar() {
  return (
    <div className="sidebar">
      <h2 className="logo">AgriConnect</h2>
      <nav>
        <Link href="/" className="nav-link">
          Inventory
        </Link>
        <Link href="/" className="nav-link">
          Inventory
        </Link>
        <Link href="/" className="nav-link">
          Inventory
        </Link>
        <Link href="/" className="nav-link">
          Inventory
        </Link>
      </nav>
    </div>
  );
}
