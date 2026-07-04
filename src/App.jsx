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
                        <Route path="frota/candidaturas" element={<TransportadorCandidaturas />} />
                        
                        {/* AUTONOMO */}
                        <Route path="autonomo" element={<AutonomoDashboard />} />
                        <Route path="autonomo/candidaturas" element={<TransportadorCandidaturas />} />
                        
                        {/* VINCULADO */}
                        <Route path="vinculado" element={<VinculadoDashboard />} />
                        
                        {/* ADMIN */}
                        <Route path="admin" element={<AdminDashboard />} />
                    </Route>
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;