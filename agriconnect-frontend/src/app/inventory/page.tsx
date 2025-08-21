import Sidebar from "../../components/sidebar";
import Navbar from "../../components/navbar";
import ItemCard from "../../components/itemcard";

const items = [
  "Eggplant",
  "Tomato",
  "Carrot",
  "Cabbage",
  "Mango",
  "Banana",
  "Papaya",
  "Pumpkin",
  "Onion",
  "Potato",
  "Beans",
  "Apple",
  "Orange",
  "Guava",
  "Lime",
  "Pineapple",
  "Watermelon",
  "Spinach",
];

export default function Inventory() {
  return (
    <div className="dashboard">
      <Sidebar />

      <div className="main">
        <Navbar />
        <div className="content">
          <h1>Western Province Inventory</h1>
          <div className="card-grid">
            {items.map((item) => (
              <ItemCard key={item} name={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
