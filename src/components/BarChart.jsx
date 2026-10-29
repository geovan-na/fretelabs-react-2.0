// src/components/dashboard/BarChart.jsx
import React, { useEffect, useRef } from 'react';

export const BarChart = ({ data, title, xLabel = 'Mês', yLabel = 'Total', color = '#FF8200' }) => {
    const chartRef = useRef(null);
    const [loaded, setLoaded] = React.useState(false);

    useEffect(() => {
        const loadGoogleCharts = () => {
            if (window.google) {
                window.google.charts.load('current', { packages: ['corechart'] });
                window.google.charts.setOnLoadCallback(() => {
                    setLoaded(true);
                });
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://www.gstatic.com/charts/loader.js';
            script.onload = () => {
                window.google.charts.load('current', { packages: ['corechart'] });
                window.google.charts.setOnLoadCallback(() => {
                    setLoaded(true);
                });
            };
            document.body.appendChild(script);
        };

        loadGoogleCharts();
    }, []);

    useEffect(() => {
        if (!loaded || !data || data.length === 0) return;
        drawChart();
    }, [loaded, data]);

    const drawChart = () => {
        if (!chartRef.current || !window.google || !window.google.visualization) return;

        const dataTable = new window.google.visualization.DataTable();
        dataTable.addColumn('string', xLabel);
        dataTable.addColumn('number', yLabel);

        const rows = data.map(item => [
            String(item.mes_label || item.mes || ''),
            parseFloat(item.total != null ? item.total : (item.receita || 0)) || 0
        ]);
        dataTable.addRows(rows);

        const options = {
            title: title,
            chartArea: { width: '80%', height: '70%' },
            colors: [color],
            legend: { position: 'none' },
            hAxis: { 
                title: xLabel,
                textStyle: { fontSize: 11 }
            },
            vAxis: { 
                title: yLabel,
                textStyle: { fontSize: 11 },
                format: 'short'
            },
            bar: { groupWidth: '60%' },
            backgroundColor: 'transparent'
        };

        const chart = new window.google.visualization.ColumnChart(chartRef.current);
        chart.draw(dataTable, options);
    };

    if (!data || data.length === 0) {
        return (
            <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}>
                Sem dados para exibir
            </div>
        );
    }

    return <div ref={chartRef} style={{ width: '100%', height: '300px' }} />;
};