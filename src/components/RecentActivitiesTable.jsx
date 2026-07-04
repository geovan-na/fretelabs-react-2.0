// components/RecentActivitiesTable.jsx
function RecentActivitiesTable({ activities }) {
    const getStatusClass = (status) => {
        const classes = {
            'AGUARDANDO': 'status-aguardando',
            'TRANSITO': 'status-transito',
            'CONCLUIDO': 'status-concluido',
            'CANCELADO': 'status-cancelado'
        };
        return classes[status] || '';
    };

    return (
        <div className="recent-activities-table">
            <h4>Atividades Recentes</h4>
            <div className="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>ID do Frete</th>
                            <th>Origem</th>
                            <th>Destino</th>
                            <th>Data</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activities.map((item, index) => (
                            <tr key={index}>
                                <td>{item.id}</td>
                                <td>{item.origem}</td>
                                <td>{item.destino}</td>
                                <td>{item.data}</td>
                                <td>
                                    <span className={`status-badge ${getStatusClass(item.status)}`}>
                                        {item.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default RecentActivitiesTable;