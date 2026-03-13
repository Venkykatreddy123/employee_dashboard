import React from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

const Navbar = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('role') || 'User';
  const name = localStorage.getItem('name') || 'Admin';

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
        <div className="top-navbar">
            <div className="nav-left">
                {/* Search or breadcrumbs could go here */}
            </div>
            <div className="nav-right d-flex align-items-center">
                <div className="d-flex align-items-center me-4 pe-4 border-end border-light">
                    <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center me-3" 
                         style={{width: '40px', height: '40px', background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)'}}>
                        <span className="text-white fw-bold">{name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="d-none d-md-block text-end">
                        <div className="fw-bold mb-0" style={{color: '#1e293b', fontSize: '0.9rem'}}>{name}</div>
                        <div className="text-muted x-small text-uppercase" style={{fontSize: '0.7rem', letterSpacing: '0.05em'}}>{role}</div>
                    </div>
                </div>
                <button className="btn btn-sm btn-outline-danger px-3" style={{borderRadius: '10px', fontWeight: '600'}} onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Navbar;
