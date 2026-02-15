
function Header({ userName, onMenuClick }) {
  return (
    <header className="header">
      <button className="mobile-menu-btn" id="mobileMenuBtn" onClick={onMenuClick}>
        <i className="fas fa-bars"></i>
      </button>
      <div className="user-greeting">
        <h1>Olá, {userName}</h1>
        <p>Bem-vindo ao seu dashboard</p>
      </div>
      <div className="user-actions">
        <div className="notification-btn">
          <i className="fas fa-bell"></i>
        </div>
        <a href="/perfil">
          <div className="user-profile">
            <i className="fas fa-user"></i>
          </div>
        </a>
      </div>
    </header>
  );
}

export default Header;