import React from 'react';
import SidebarDashboard from '../components/SidebarDashboard';

export default function AdminDashboard() {
  // Lista de links completamente diferente para o Administrador
  const menuAdmin = [
    { label: 'Dashboard', path: '/dashboard/admin', icon: '🏠' },
    { label: 'Gestão de Usuários', path: '/dashboard/admin/usuarios', icon: '👥' },
    { label: 'Gestão de Fretes', path: '/dashboard/admin/fretes', icon: '📦' },
    { label: 'Documentos', path: '/dashboard/admin/documentos', icon: '📄' },
    { label: 'Blacklist', path: '/dashboard/admin/blacklist', icon: '🚫' },
  ];

  const dadosAdmin = {
    nome: "Admin Master",
    cargo: "Administrador",
    foto_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100"
  };

  return (
    <div style={{ display: 'flex' }}>
      <SidebarDashboard menuItems={menuAdmin} usuario={dadosAdmin} />
      
      <main style={{ marginLeft: '260px', padding: '24px', width: '100%' }}>
        {/* Conteúdo do Painel Administrativo */}
        <h1>Painel Administrativo — FreteLabs</h1>
      </main>
    </div>
  );
}