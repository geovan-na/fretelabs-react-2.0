import React from 'react';
import SidebarDashboard from '../components/SidebarDashboard';

export default function AutonomoDashboard() {
  // Lista de links específica do Motorista Autônomo
  const menuAutonomo = [
    { label: 'Dashboard', path: '/dashboard/autonomo', icon: '📊' },
    { label: 'Meus Veículos', path: '/dashboard/autonomo/veiculos', icon: '🚚' },
    { label: 'Buscar Fretes', path: '/dashboard/autonomo/buscar', icon: '🔍' },
    { label: 'Minhas Candidaturas', path: '/dashboard/autonomo/candidaturas', icon: '📝' },
    { label: 'Financeiro', path: '/dashboard/autonomo/financeiro', icon: '💰' },
  ];

  // Dados mockados ou vindos da sua API / AuthContext
  const dadosMotorista = {
    nome: "João Silva",
    cargo: "Motorista Autônomo",
    foto_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100"
  };

  return (
    <div style={{ display: 'flex' }}>
      <SidebarDashboard menuItems={menuAutonomo} usuario={dadosMotorista} />
      
      <main style={{ marginLeft: '260px', padding: '24px', width: '100%' }}>
        {/* Aqui entra o resto do conteúdo do Painel do Autônomo (Cards, Gráficos, etc) */}
        <h1>Olá, João Silva — Motorista Autônomo</h1>
      </main>
    </div>
  );
}