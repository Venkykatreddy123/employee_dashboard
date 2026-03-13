import React from 'react';

const Charts = () => {
  return (
    <div className="glass-card mt-5" style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed' }}>
       <div className="text-center">
            <div className="text-muted mb-3" style={{letterSpacing: '0.1em', fontWeight: '600', fontSize: '0.8rem'}}>ANALYTICS ENGINE</div>
            <h4 style={{color: 'rgba(255,255,255,0.7)', fontWeight: '400'}}>Data Visualization Interface</h4>
            <small className="text-muted">Synchronizing real-time telemetry...</small>
       </div>
    </div>
  );
};

export default Charts;
