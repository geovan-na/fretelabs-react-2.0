// src/components/dashboard/TableCard.jsx
import React from 'react';

export const TableCard = ({ title, columns, data, onRowClick }) => {
    return (
        <div className="table-container">
            <h4>{title}</h4>
            <table>
                <thead>
                    <tr>
                        {columns.map((col, index) => (
                            <th key={index}>{col.label}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data && data.length > 0 ? (
                        data.map((row, index) => (
                            <tr 
                                key={index} 
                                className={onRowClick ? 'clickable' : ''}
                                onClick={() => onRowClick && onRowClick(row)}
                            >
                                {columns.map((col, colIndex) => (
                                    <td key={colIndex}>
                                        {col.render ? col.render(row) : row[col.key]}
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={columns.length} className="table-empty">
                                Nenhum dado encontrado
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};