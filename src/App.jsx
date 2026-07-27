// App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import Solucoes from './pages/Solucoes';
import Empresa from './pages/Empresa';
import Motorista from './pages/Motorista';
import { AuthProvider } from './contexts/AuthContext';
import LayoutDashboard from './components/LayoutDashboard';
import EmbarcadorDashboard from './pages/EmbarcadorDashboard';
import FrotaDashboard from './pages/FrotaDashboard';
import AutonomoDashboard from './pages/AutonomoDashboard';
import VinculadoDashboard from './pages/VinculadoDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PublicarFrete from './pages/PublicarFrete';
import MeusFretes from './pages/MeusFretes';
import DetalheFrete from './pages/DetalheFrete';
import EmbarcadorCandidaturas from './pages/EmbarcadorCandidaturas';
import TransportadorCandidaturas from './pages/TransportadorCandidaturas';
import Financeiro from './pages/Financeiro';
import Avaliacoes from './pages/Avaliacoes';
import Perfil from './pages/Perfil';
import BuscarFretes from './pages/BuscarFretes';
import FretesAceitos from './pages/FretesAceitos';
import Veiculos from './pages/Veiculos';
import Motoristas from './pages/Motoristas';  
import PropostasVinculado from './pages/PropostasVinculado'; 
import MeusFretesVinculado from './pages/MeusFretesVinculado';
import AtualizarStatusVinculado from './pages/AtualizarStatusVinculado';
import RastreamentoVinculado from './pages/RastreamentoVinculado';
import EntregasRealizadasVinculado from './pages/EntregasRealizadasVinculado';
import MinhaFrotaVinculado from './pages/MinhaFrotaVinculado';
import AdminUsuarios from './pages/AdminUsuarios';
import AdminDetalheUsuario from './pages/AdminDetalheUsuario';
import AdminFretes from './pages/AdminFretes';
import AdminDetalheFrete from './pages/AdminDetalheFrete';
import AdminBlacklist from './pages/AdminBlacklist';
import AdminRelatorios from './pages/AdminRelatorios';
import AdminConfiguracoes from './pages/AdminConfiguracoes';

import './styles/Global.css';
import './App.css';

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    {/* Rotas Publicas */}
                    <Route path="/" element={
                        <>
                            <Header />
                            <main className="main-content">
                                <Home />
                            </main>
                            <Footer />
                        </>
                    } />
                    <Route path="/login" element={
                        <>
                            <Header />
                            <main className="main-content">
                                <Login />
                            </main>
                            <Footer />
                        </>
                    } />
                    <Route path="/cadastro" element={
                        <>
                            <Header />
                            <main className="main-content">
                                <Cadastro />
                            </main>
                            <Footer />
                        </>
                    } />
                    <Route path="/solucoes" element={
                        <>
                            <Header />
                            <main className="main-content">
                                <Solucoes />
                            </main>
                            <Footer />
                        </>
                    } />
                    <Route path="/empresa" element={
                        <>
                            <Header />
                            <main className="main-content">
                                <Empresa />
                            </main>
                            <Footer />
                        </>
                    } />
                    <Route path="/motorista" element={
                        <>
                            <Header />
                            <main className="main-content">
                                <Motorista />
                            </main>
                            <Footer />
                        </>
                    } />
                    
                    {/* Rotas do Dashboard */}
                    <Route path="/dashboard" element={<LayoutDashboard />}>
                        <Route index element={<EmbarcadorDashboard />} />
                        
                        {/* ROTA UNIFICADA PARA DETALHES DO FRETE */}
                        <Route path="fretes/:id" element={<DetalheFrete />} />
                        
                        {/* EMBARCADOR */}
                        <Route path="embarcador" element={<EmbarcadorDashboard />} />
                        <Route path="embarcador/publicar-frete" element={<PublicarFrete />} />
                        <Route path="embarcador/fretes" element={<MeusFretes />} />
                        <Route path="embarcador/fretes/:id" element={<DetalheFrete />} />
                        <Route path="embarcador/candidaturas" element={<EmbarcadorCandidaturas />} />
                        <Route path="embarcador/candidaturas/:freteId" element={<EmbarcadorCandidaturas />} />
                        <Route path="embarcador/financeiro" element={<Financeiro />} />
                        <Route path="embarcador/avaliacoes" element={<Avaliacoes />} />
                        <Route path="embarcador/perfil" element={<Perfil />} />
                        
                        {/* FROTA */}
                        <Route path="frota" element={<FrotaDashboard />} />
                        <Route path="frota/veiculos" element={<Veiculos />} />
                         <Route path="frota/motoristas" element={<Motoristas />} />
                        <Route path="frota/buscar-fretes" element={<BuscarFretes />} />
                        <Route path="frota/fretes-aceitos" element={<FretesAceitos />} />
                        <Route path="frota/candidaturas" element={<TransportadorCandidaturas />} />
                        <Route path="frota/financeiro" element={<Financeiro />} />
                        <Route path="frota/avaliacoes" element={<Avaliacoes />} />
                        <Route path="frota/perfil" element={<Perfil />} />
                        
                        {/* AUTONOMO */}
                        <Route path="autonomo" element={<AutonomoDashboard />} />
                        <Route path="autonomo/veiculo" element={<Veiculos />} />
                        <Route path="autonomo/buscar-fretes" element={<BuscarFretes />} />
                        <Route path="autonomo/fretes-aceitos" element={<FretesAceitos />} />
                        <Route path="autonomo/candidaturas" element={<TransportadorCandidaturas />} />
                        <Route path="autonomo/financeiro" element={<Financeiro />} />
                        <Route path="autonomo/avaliacoes" element={<Avaliacoes />} />
                        <Route path="autonomo/perfil" element={<Perfil />} />
                        
                        {/* VINCULADO */}
                        <Route path="vinculado" element={<VinculadoDashboard />} />
                        <Route path="vinculado/propostas" element={<PropostasVinculado />} />
                        <Route path="vinculado/fretes" element={<MeusFretesVinculado />} />
                        <Route path="vinculado/status" element={<AtualizarStatusVinculado />} />
                        <Route path="vinculado/rastreamento" element={<RastreamentoVinculado />} />
                        <Route path="vinculado/entregas" element={<EntregasRealizadasVinculado />} />
                        <Route path="vinculado/fretes/:id" element={<DetalheFrete />} />
                        <Route path="vinculado/financeiro" element={<Financeiro />} />
                        <Route path="vinculado/frota" element={<MinhaFrotaVinculado />} />  
                        <Route path="vinculado/avaliacoes" element={<Avaliacoes />} />
                        <Route path="vinculado/perfil" element={<Perfil />} />
                        
                        {/* ADMIN */}
                        <Route path="admin" element={<AdminDashboard />} />
<Route path="admin/usuarios" element={<AdminUsuarios />} />
<Route path="admin/usuarios/:id" element={<AdminDetalheUsuario />} />
<Route path="admin/fretes" element={<AdminFretes />} />
<Route path="admin/fretes/:id" element={<AdminDetalheFrete />} />
<Route path="admin/blacklist" element={<AdminBlacklist />} />
<Route path="admin/relatorios" element={<AdminRelatorios />} />
<Route path="admin/configuracoes" element={<AdminConfiguracoes />} />

                    </Route>
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;