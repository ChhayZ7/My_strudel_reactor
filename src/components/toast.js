import React, { useEffect } from 'react';

// Toast Component
// Displays Boostrap alerts that auto-dismiss after a timeout
// Supports multiple alert type: success, danger, warning, info

function Toast({ message, type = 'info', onClose, duration = 5000, autoClose = true}){
    useEffect(() => {
        if (autoClose && duration > 0){
            const timer = setTimeout(() => {
                onClose();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [autoClose, duration, onClose]);

    const getIcon = () => {
        switch (type){
            case 'success': return '✅';
            case 'danger': return '❌';
            case 'warning': return '⚠️';
            case 'info': return 'ℹ️'
            default: return 'ℹ️'
        }
    };

    return (
        <div
            className={`alert alert-${type} alert-dismissible fade show toast-notification`}
            role="alert"
        >
            <span className='toast-icon'>{getIcon()}</span>
            <span className='toast-message'>{message}</span>
            <button
                type="button"
                className="btn-close btn-close-white"
                onClick={onClose}
                aria-label='Close'
            ></button>
        </div>
    );
}

// ToastContainer Component
// Container for multiple toast notifications
function ToastContainer({ toasts, onDismiss}){
    if (!toasts || toasts.length === 0) return null;

    return (
        <div className="toast-container">
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    duration={toast.duration}
                    autoClose={toast.autoClose}
                    onClose={() => onDismiss(toast.id)}
                />
            ))}
        </div>
    );
}

export { Toast, ToastContainer};