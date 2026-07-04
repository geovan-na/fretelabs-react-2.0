// src/components/DashboardRedirect.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DashboardRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const armazenado = localStorage.getItem('usuario');
      const user = armazenado ? JSON.parse(armazenado) : null;
      
      // Força o tipo a ficar em letras minúsculas para evitar erros de digitação (ex: 'Admin')
      const tipoDefinido = user?.tipo?.toLowerCase()?.trim();

      switch (tipoDefinido) {
        case 'admin':
          navigate('/dashboard/admin', { replace: true });
          break;
        case 'embarcador':
          navigate('/dashboard/embarcador', { replace: true });
          break;
        case 'frota':
          navigate('/dashboard/frota', { replace: true });
          break;
        case 'vinculado':
          navigate('/dashboard/vinculado', { replace: true });
          break;
        case 'autonomo':
          navigate('/dashboard/autonomo', { replace: true });
          break;
        default:
          // Se não houver login ou o tipo for inválido, manda para o login do FreteLabs
          navigate('/login', { replace: true });
          break;
      }
    } catch (e) {
      console.error("Erro Crítico no Redirecionamento:", e);
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  // Retorna nulo para não renderizar nada na árvore do React e evitar conflito de nós
  return null;
}