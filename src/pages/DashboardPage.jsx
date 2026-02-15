import { Chart } from 'chart.js/auto';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardCard from '../components/dashboard/DashboardCard';
import HistoryTable from '../components/dashboard/HistoryTable';
import DashboardLayout from './DashboardLayout';

function DashboardPage({ onLogout }) {
  const [chartPeriod, setChartPeriod] = useState('7');
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

 
  const chartColors = { primary: '#14532D', accent: '#C8A951', light: '#F4F1EC' };
  const dashboardCards = [
    { id: 1, icon: 'fas fa-sync-alt', title: 'Reconciliações Hoje', value: '24', description: '+5 desde ontem' },
    { id: 2, icon: 'fas fa-check-circle', title: 'Taxa de Sucesso', value: '98.7%', description: 'Precisão nas reconciliações' },
    { id: 3, icon: 'fas fa-clock', title: 'Tempo Economizado', value: '15h', description: 'Este mês' },
    { id: 4, icon: 'fas fa-building', title: 'Empresas Ativas', value: '12', description: 'Clientes ativos' }
  ];
  const historyData = [
    { id: 1, empresa: 'Empresa A Ltda', data: '15/12/2024', transacoes: 247, status: 'completed' },
    { id: 2, empresa: 'Comércio B SA', data: '14/12/2024', transacoes: 189, status: 'completed' }
  ];

 
  useEffect(() => {
    const ctx = chartRef.current?.getContext('2d');
    if (!ctx) return;
    if (chartInstanceRef.current) chartInstanceRef.current.destroy();

    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
        datasets: [
          { label: 'Reconciliações Concluídas', data: [18, 22, 24, 20, 26, 15, 12], borderColor: chartColors.primary, backgroundColor: chartColors.primary + '20', fill: true, tension: 0.4 }
        ]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }, [chartPeriod]);


  // get  user localStorage 


  const  user = JSON.parse(localStorage.getItem('user'));

  const userName = user?.name || 'Usuário';
  

  return (
    <DashboardLayout onLogout={onLogout} userName={userName}>
      <div className="welcome-banner">
        <div className="welcome-text">
          <h2>Bem-vindo de volta!</h2>
          <p>Seu dashboard foi atualizado com as últimas reconciliações.</p>
        </div>
        <Link to="/reconciliation"><button className="novareconciliacaobtn"><i className="fas fa-plus"></i> Nova Reconciliação</button></Link>
      </div>

      <div className="cards-grid">
        {dashboardCards.map(card => <DashboardCard key={card.id} {...card} />)}
      </div>
      <div className="dashboard-content">
        <div className="dashboard-column">
          <section className="history-section">
            <div className="section-header">
              <h2>Histórico de Reconciliações</h2>
            </div>
            <HistoryTable data={historyData} />
          </section>
        </div>
        <div className="dashboard-column">
          <section className="chart-section">
            <div className="section-header">
              <h2>Últimas Reconciliações</h2>
              <select value={chartPeriod} onChange={e => setChartPeriod(e.target.value)}>
                <option value="7">Últimos 7 dias</option>
                <option value="30">Últimos 30 dias</option>
                <option value="90">Últimos 3 meses</option>
              </select>
            </div>
            <div className="chart-container">
              <canvas ref={chartRef}></canvas>
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default DashboardPage;
