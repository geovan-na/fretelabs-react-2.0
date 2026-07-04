// components/dashboard/MapContainer.jsx
import { useEffect, useRef, useState } from 'react';

const MapContainer = ({ 
    origin, 
    destination, 
    currentLocation, 
    onLocationUpdate,
    height = '400px',
    showRoute = true 
}) => {
    const mapRef = useRef(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [routeInfo, setRouteInfo] = useState(null);

    // Simula o carregamento do mapa (aqui você integraria com Google Maps, Leaflet, ou outra API)
    useEffect(() => {
        // Simulação de carregamento do mapa
        const timer = setTimeout(() => {
            setMapLoaded(true);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    // Simula a atualização da localização
    useEffect(() => {
        if (currentLocation && onLocationUpdate) {
            // Simula envio de localização a cada 30 segundos
            const interval = setInterval(() => {
                const mockLocation = {
                    lat: currentLocation.lat + (Math.random() - 0.5) * 0.01,
                    lng: currentLocation.lng + (Math.random() - 0.5) * 0.01,
                    timestamp: new Date().toISOString()
                };
                onLocationUpdate(mockLocation);
            }, 30000);

            return () => clearInterval(interval);
        }
    }, [currentLocation, onLocationUpdate]);

    // Calcula informações da rota
    useEffect(() => {
        if (origin && destination && showRoute) {
            // Simula cálculo de rota
            setRouteInfo({
                distance: '450 km',
                duration: '5h 30min',
                estimatedArrival: new Date(Date.now() + 5.5 * 60 * 60 * 1000).toLocaleTimeString('pt-BR')
            });
        }
    }, [origin, destination, showRoute]);

    if (!mapLoaded) {
        return (
            <div className="map-loading" style={{ height }}>
                <div className="map-loading-spinner"></div>
                <p>Carregando mapa...</p>
            </div>
        );
    }

    return (
        <div className="map-container" style={{ height }}>
            <div className="map-placeholder">
                <div className="map-info">
                    <h4>Rastreamento em Tempo Real</h4>
                    
                    {origin && destination && (
                        <div className="map-route-info">
                            <div className="route-point">
                                <span className="route-label">Origem:</span>
                                <span className="route-value">{origin}</span>
                            </div>
                            <div className="route-line"></div>
                            <div className="route-point">
                                <span className="route-label">Destino:</span>
                                <span className="route-value">{destination}</span>
                            </div>
                        </div>
                    )}
                    
                    {routeInfo && (
                        <div className="map-route-details">
                            <div className="route-detail">
                                <span className="detail-label">Distancia:</span>
                                <span className="detail-value">{routeInfo.distance}</span>
                            </div>
                            <div className="route-detail">
                                <span className="detail-label">Duracao estimada:</span>
                                <span className="detail-value">{routeInfo.duration}</span>
                            </div>
                            <div className="route-detail">
                                <span className="detail-label">Previsao de chegada:</span>
                                <span className="detail-value">{routeInfo.estimatedArrival}</span>
                            </div>
                        </div>
                    )}
                    
                    {currentLocation && (
                        <div className="map-current-location">
                            <span className="location-label">Localizacao atual:</span>
                            <span className="location-value">
                                Lat: {currentLocation.lat.toFixed(6)} | Lng: {currentLocation.lng.toFixed(6)}
                            </span>
                            <span className="location-time">
                                Ultima atualizacao: {new Date(currentLocation.timestamp).toLocaleTimeString('pt-BR')}
                            </span>
                        </div>
                    )}
                    
                    <div className="map-visualization">
                        <svg width="100%" height="200" viewBox="0 0 800 200" className="map-svg">
                            <defs>
                                <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#00D2D3" />
                                    <stop offset="100%" stopColor="#FF8200" />
                                </linearGradient>
                            </defs>
                            
                            {/* Fundo do mapa */}
                            <rect x="0" y="0" width="800" height="200" fill="#1A1A1A" rx="8" />
                            
                            {/* Grade do mapa */}
                            <line x1="0" y1="50" x2="800" y2="50" stroke="#2A2A2A" strokeWidth="1" />
                            <line x1="0" y1="100" x2="800" y2="100" stroke="#2A2A2A" strokeWidth="1" />
                            <line x1="0" y1="150" x2="800" y2="150" stroke="#2A2A2A" strokeWidth="1" />
                            <line x1="200" y1="0" x2="200" y2="200" stroke="#2A2A2A" strokeWidth="1" />
                            <line x1="400" y1="0" x2="400" y2="200" stroke="#2A2A2A" strokeWidth="1" />
                            <line x1="600" y1="0" x2="600" y2="200" stroke="#2A2A2A" strokeWidth="1" />
                            
                            {/* Rota */}
                            {showRoute && (
                                <path
                                    d="M 50 100 C 200 80, 300 120, 450 100 C 550 80, 650 110, 750 90"
                                    fill="none"
                                    stroke="url(#routeGradient)"
                                    strokeWidth="3"
                                    strokeDasharray="8 4"
                                />
                            )}
                            
                            {/* Ponto de origem */}
                            <circle cx="50" cy="100" r="8" fill="#00D2D3" />
                            <text x="30" y="85" fill="#00D2D3" fontSize="12" fontFamily="Arial">Origem</text>
                            
                            {/* Ponto de destino */}
                            <circle cx="750" cy="90" r="8" fill="#FF8200" />
                            <text x="730" y="75" fill="#FF8200" fontSize="12" fontFamily="Arial">Destino</text>
                            
                            {/* Veiculo atual */}
                            {currentLocation && (
                                <>
                                    <circle 
                                        cx={50 + (currentLocation.progress || 0) * 700} 
                                        cy={100 + Math.sin((currentLocation.progress || 0) * Math.PI * 2) * 20} 
                                        r="10" 
                                        fill="#FFFFFF"
                                        stroke="#FF8200"
                                        strokeWidth="2"
                                    />
                                    <text 
                                        x={50 + (currentLocation.progress || 0) * 700 - 15} 
                                        y={100 + Math.sin((currentLocation.progress || 0) * Math.PI * 2) * 20 - 10} 
                                        fill="#FFFFFF" 
                                        fontSize="10" 
                                        fontFamily="Arial"
                                    >
                                        Veiculo
                                    </text>
                                </>
                            )}
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MapContainer;