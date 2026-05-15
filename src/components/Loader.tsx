import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="flex-center" style={{ padding: '3rem', width: '100%' }}>
      <div className="ldr-spin" style={{ 
        width: '32px', 
        height: '32px', 
        border: '3px solid var(--g2)', 
        borderTopColor: 'var(--pr)', 
        borderRadius: '50%', 
        animation: 'spin 1s linear infinite' 
      }}></div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .flex-center {
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </div>
  );
};

export default Loader;
