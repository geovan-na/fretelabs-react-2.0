// components/Chart.jsx
function Chart({ data, type = 'bar', title, height = 300 }) {
    if (!data || data.length === 0) {
        return (
            <div className="chart-container">
                <h4 className="chart-title">{title}</h4>
                <p style={{ color: '#6B7280', textAlign: 'center', padding: '2rem' }}>
                    Nenhum dado disponível
                </p>
            </div>
        );
    }

    return (
        <div className="chart-container">
            {title && <h4 className="chart-title">{title}</h4>}
            <div className="chart-wrapper" style={{ height: `${height}px` }}>
                <div className="chart-bars">
                    {data.map((item, index) => {
                        const maxValue = Math.max(...data.map(d => d.value || 0), 1);
                        const percentage = ((item.value || 0) / maxValue) * 100;
                        
                        return (
                            <div key={index} className="chart-bar-wrapper">
                                <div 
                                    className="chart-bar" 
                                    style={{ height: `${Math.max(percentage, 5)}%` }}
                                >
                                    <span className="chart-bar-value">{item.value || 0}</span>
                                </div>
                                <span className="chart-bar-label">{item.label}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default Chart;