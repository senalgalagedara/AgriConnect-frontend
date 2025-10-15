import NotificationDropdown from './NotificationDropdown';

export default function Navbar() {
  return (
    <div className="navbar">
      <h1>Dashboard Summary</h1>
      <div className="nav-right">
        <NotificationDropdown />
        <div className="profile">
          <div className="avatar">A</div>
          <span>Admin</span>
        </div>
      </div>
    </div>
  );
}
