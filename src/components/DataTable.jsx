// components/dashboard/DataTable.jsx
import { useState } from 'react';
import StatusBadge from './StatusBadge';

const DataTable = ({ columns, data, onRowClick, itemsPerPage = 10 }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');

    const filteredData = data.filter(item => {
        if (!searchTerm) return true;
        return Object.values(item).some(value =>
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    const sortedData = [...filteredData].sort((a, b) => {
        if (!sortColumn) return 0;
        const aVal = a[sortColumn];
        const bVal = b[sortColumn];
        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    const totalPages = Math.ceil(sortedData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);

    const handleSort = (column) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    const renderCell = (item, column) => {
        if (column.type === 'status') {
            return <StatusBadge status={item[column.key]} />;
        }
        if (column.type === 'currency') {
            return `R$ ${item[column.key]}`;
        }
        if (column.type === 'date') {
            return new Date(item[column.key]).toLocaleDateString('pt-BR');
        }
        return item[column.key];
    };

    return (
        <div className="data-table-container">
            <div className="data-table-header">
                <input
                    type="text"
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="data-table-search"
                />
            </div>

            <div className="data-table-wrapper">
                <table className="data-table">
                    <thead>
                        <tr>
                            {columns.map((column, index) => (
                                <th
                                    key={index}
                                    onClick={() => column.sortable !== false && handleSort(column.key)}
                                    className={column.sortable !== false ? 'sortable' : ''}
                                >
                                    {column.label}
                                    {sortColumn === column.key && (
                                        <span className="sort-indicator">
                                            {sortDirection === 'asc' ? ' ↑' : ' ↓'}
                                        </span>
                                    )}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map((item, index) => (
                            <tr
                                key={index}
                                onClick={() => onRowClick && onRowClick(item)}
                                className={onRowClick ? 'clickable' : ''}
                            >
                                {columns.map((column, colIndex) => (
                                    <td key={colIndex}>
                                        {renderCell(item, column)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                        {paginatedData.length === 0 && (
                            <tr>
                                <td colSpan={columns.length} className="data-table-empty">
                                    Nenhum dado encontrado
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="data-table-pagination">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                    >
                        Anterior
                    </button>
                    <span>Página {currentPage} de {totalPages}</span>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                    >
                        Próxima
                    </button>
                </div>
            )}
        </div>
    );
};

export default DataTable;