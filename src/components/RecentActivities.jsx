// components/RecentActivities.jsx
import DataTable from './DataTable';

function RecentActivities({ activities, title = 'Atividades Recentes' }) {
    const columns = [
        { key: 'id', label: 'ID', sortable: true },
        { key: 'descricao', label: 'Descrição', sortable: true },
        { key: 'data', label: 'Data', sortable: true },
        { key: 'status', label: 'Status', type: 'status', sortable: true }
    ];

    return (
        <div className="dashboard-section">
            <h2>{title}</h2>
            <DataTable columns={columns} data={activities || []} />
        </div>
    );
}

export default RecentActivities;