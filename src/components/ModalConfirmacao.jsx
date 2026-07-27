// src/pages/admin/components/ModalConfirmacao.jsx
import React from 'react';

/**
 * ModalConfirmacao - Modal de confirmação para ações do admin
 * @param {boolean} isOpen - Controla se o modal está aberto
 * @param {function} onClose - Função para fechar o modal
 * @param {function} onConfirm - Função para confirmar a ação
 * @param {string} title - Título do modal
 * @param {string} message - Mensagem principal
 * @param {string} detail - Detalhe adicional (opcional)
 * @param {string} confirmText - Texto do botão de confirmar
 * @param {string} cancelText - Texto do botão de cancelar
 * @param {string} type - Tipo: 'danger' (vermelho), 'warning' (amarelo), 'info' (azul)
 * @param {boolean} isLoading - Estado de carregamento
 */
const ModalConfirmacao = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    detail = '',
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    type = 'danger',
    isLoading = false,
}) => {
    if (!isOpen) return null;

    // Classe do botão conforme o tipo
    const getButtonClass = () => {
        switch (type) {
            case 'danger':
                return 'modal-btn-danger';
            case 'warning':
                return 'modal-btn-warning';
            case 'info':
                return 'modal-btn-info';
            default:
                return 'modal-btn-danger';
        }
    };

    // Ícone conforme o tipo
    const getIcon = () => {
        switch (type) {
            case 'danger':
                return '⚠️';
            case 'warning':
                return '⚡';
            case 'info':
                return 'ℹ️';
            default:
                return '⚠️';
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-icon">{getIcon()}</div>
                
                <h3>{title}</h3>
                
                <p>{message}</p>
                
                {detail && (
                    <p className="modal-detail">{detail}</p>
                )}
                
                <div className="modal-buttons">
                    <button 
                        className="modal-btn-secondary"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        {cancelText}
                    </button>
                    <button 
                        className={`modal-btn ${getButtonClass()}`}
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Processando...' : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalConfirmacao;