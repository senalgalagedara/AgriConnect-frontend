import Sidebar from "../components/sidebar";
import Navbar from "../components/navbar";
import ProvinceCard from "../components/provincecard";

export default function Home() {
  return (
    <div className="dashboard">
      <Sidebar />

      <div className="main">
        <Navbar />
        <div className="content">
          <h1>Inventory Dashboard</h1>
          <div className="card-grid">
            <ProvinceCard name="Western Province" href="/inventory" />
            <ProvinceCard name="Central Province" href="" />
            <ProvinceCard name="Southern Province" href="" />
            <ProvinceCard name="Northern Province" href="" />
            <ProvinceCard name="Eastern Province" href="" />
            <ProvinceCard name="Uva Province" href="" />
            <ProvinceCard name="North Western Province" href="" />
            <ProvinceCard name="North Central Province" href="" />
            <ProvinceCard name="Sabaragamuwa Province" href="" />
          </div>
        </div>
      </div>
    </div>
  );
}
