import { useState } from 'react';

function Sidebar({ isOpen}) {
  const [companiesMenuOpen, setCompaniesMenuOpen] = useState(false);
  const [reconciliationMenuOpen, setReconciliationMenuOpen] = useState(false);

  const  onLogout  =async () => {

      try {
        const token =  localStorage.getItem('storage');
          
        await fetch('https://kutexa-api.onrender.com/api/v1/auth/logout',{
          method:"POST",
          headers:{
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
      } catch (error) {
        
        console.error('Erro ao fazer logout',error)
      } finally{
         localStorage.removeItem('token')
         localStorage.removeItem('user')
            window.location.href = '/login'

      }
  }

  

  const menuItems = [
    {
      id: 'home',
      icon: 'fas fa-home',
      text: 'Home',
      active: true,
      onClick: () => window.location.href = '/dashboard'
    },
    {
      id: 'companies',
      icon: 'fas fa-building',
      text: 'Empresas',
      hasSubmenu: true,
      submenu: [
        { text: 'Cadastrar Empresa', onClick: () => window.location.href = '/cadastroempresas' },
        { text: 'Ver Empresas', onClick: () => window.location.href = '/listarEmpresas' }
      ]
    },
    {
      id: 'reconciliation',
      icon: 'fas fa-sync-alt',
      text: 'Reconciliamento',
      hasSubmenu: true,
      submenu: [
        { text: 'Reconciliamento em Tempo Real', onClick: () => window.location.href = '/reconciliamento' },
        { text: 'Reconciliamento com ERP', onClick: () => window.location.href = '/reconciliamento-erp' }
      ]
    },
    // {
    //   id: 'reports',
    //   icon: 'fas fa-chart-bar',
    //   text: 'Relatórios',
    //   onClick: () => window.location.href = '/relatorios'
    // },
    // {
    //   id: 'analysis',
    //   icon: 'fas fa-chart-pie',
    //   text: 'Análise Financeira',
    //   onClick: () => window.location.href = '/analise-financeira'
    // },
    // {
    //   id: 'settings',
    //   icon: 'fas fa-cog',
    //   text: 'Configurações',
    //   onClick: () => window.location.href = '/configuracoes'
    // },
    {
      id: 'logout',
      icon: 'fas fa-sign-out-alt',
      text: 'Sair',
      onClick: () => onLogout() 
    }
  ];

  return (
    <div className={`sidebar ${isOpen ? 'active' : ''}`} id="sidebar">
      <div className="sidebar-header">
        <h2>Kutexa</h2>
      </div>
      <nav className="sidebar-menu">
        {menuItems.map((item) => (
          <div key={item.id}>
            <div 
              className={`menu-item ${item.active ? 'active' : ''}`}
              onClick={() => {
                if (item.hasSubmenu) {
                  if (item.id === 'companies') {
                    setCompaniesMenuOpen(!companiesMenuOpen);
                  } else if (item.id === 'reconciliation') {
                    setReconciliationMenuOpen(!reconciliationMenuOpen);
                  }
                } else {
                  item.onClick();
                }
              }}
            >
              <i className={item.icon}></i>
              <span className="menu-item-text">{item.text}</span>
              {item.hasSubmenu && (
                <i className={`fas fa-chevron-down menu-arrow ${
                  (item.id === 'companies' && companiesMenuOpen) || 
                  (item.id === 'reconciliation' && reconciliationMenuOpen) ? 'rotated' : ''
                }`}></i>
              )}
            </div>
            
            {item.id === 'companies' && item.hasSubmenu && (
              <div className={`submenu ${companiesMenuOpen ? 'show' : ''}`} id="companiesSubmenu">
                {item.submenu.map((subItem, index) => (
                  <div 
                    key={index}
                    className="submenu-item"
                    onClick={subItem.onClick}
                  >
                    {subItem.text}
                  </div>
                ))}
              </div>
            )}
            
            {item.id === 'reconciliation' && item.hasSubmenu && (
              <div className={`submenu ${reconciliationMenuOpen ? 'show' : ''}`} id="reconciliationSubmenu">
                {item.submenu.map((subItem, index) => (
                  <div 
                    key={index}
                    className="submenu-item"
                    onClick={subItem.onClick}
                  >
                    {subItem.text}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}

export default Sidebar;