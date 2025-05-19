import React from 'react';

const ModalFeature = ({ isOpen, message, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        backgroundColor: '#ffffff',
        padding: '16px 24px',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        zIndex: '9999',
        color: '#333',
        fontSize: '1rem',
        maxWidth: '300px',
        transition: 'transform 0.3s ease, opacity 0.3s ease',
        transform: 'translateY(0)',
        opacity: 1,
        animation: 'slideUp 0.5s ease'
      }}
    >
      <div style={{ marginBottom: '10px' }}>{message}</div>
      <button
        onClick={onClose}
        style={{
          backgroundColor: '#e6f7ff', 
          color: '#333',
          padding: '8px 16px',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '0.9rem',
          fontWeight: 'bold',
          transition: 'background-color 0.3s ease',
        }}
        onMouseEnter={(e) => (e.target.style.backgroundColor = '#cceeff')}
        onMouseLeave={(e) => (e.target.style.backgroundColor = '#e6f7ff')}
      >
        Close
      </button>
    </div>
  );
};

const styles = `
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
`;

const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default ModalFeature;