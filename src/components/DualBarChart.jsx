// src/components/dashboard/DualBarChart.jsx
import React, { useEffect, useRef } from 'react';

export const DualBarChart = ({ data, title, xLabel = 'Mês' }) => {
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
        dataTable.addColumn('number', 'Fretes (Qtde)');
        dataTable.addColumn('number', 'Faturamento (R$)');

        const rows = data.map(item => [
            String(item.mes_label || item.mes || ''),
            parseInt(item.total_fretes ?? 0, 10) || 0,
            parseFloat(item.faturamento ?? 0) || 0
        ]);
        dataTable.addRows(rows);

        const options = {
            title: title,
            chartArea: { width: '80%', height: '70%' },
            seriesType: 'bars',
            series: {
                0: { targetAxisIndex: 0, color: '#FF8200' },
                1: { targetAxisIndex: 1, color: '#00D2D3', type: 'line' }
            },
            vAxes: {
                0: { 
                    title: 'Fretes',
                    textStyle: { fontSize: 11 },
                    format: 'short'
                },
                1: { 
                    title: 'Faturamento (R$)',
                    textStyle: { fontSize: 11 },
                    format: 'currency',
                    formatOptions: { prefix: 'R$ ' }
                }
            },
            hAxis: { 
                title: xLabel,
                textStyle: { fontSize: 11 }
            },
            backgroundColor: 'transparent',
            legend: { position: 'top', alignment: 'center' }
        };

        const chart = new window.google.visualization.ComboChart(chartRef.current);
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