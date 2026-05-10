'use client';

import { useState } from 'react';
import { Navbar as RBNavbar, Container, Nav, NavDropdown, Image } from 'react-bootstrap';

interface NavbarProps {
  user: any;
  onLogout: () => void;
}

export default function Navbar({ user, onLogout }: NavbarProps) {
  const [imgError, setImgError] = useState(false);
  
  const displayName = user?.nama || 'User';
  const displayRole = user?.role || 'Guest';
  const avatarUrl = user?.fotoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=f8f9fa&color=6c757d&bold=true`;

  return (
    <RBNavbar bg="white" expand="lg" className="border-bottom px-4 py-2">
      <Container fluid>
        <RBNavbar.Brand className="mb-0 h1 fs-6 text-muted fw-normal">
          HR Management System
        </RBNavbar.Brand>
        
        <Nav className="ms-auto align-items-center">
          <div className="me-3 text-end d-none d-sm-block">
            <div className="fw-bold small text-dark" style={{ lineHeight: '1.2' }}>{displayName}</div>
            <div className="text-muted text-uppercase fw-medium" style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}>
              {displayRole}
            </div>
          </div>
          
          <NavDropdown
            align="end"
            title={
              <div className="d-flex align-items-center">
                <div className="position-relative rounded-circle p-0 overflow-hidden border" style={{ width: 38, height: 38 }}>
                  <Image
                    src={imgError ? `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=f8f9fa&color=6c757d&bold=true` : avatarUrl}
                    width={38}
                    height={38}
                    className="object-fit-cover"
                    alt="profile"
                    onError={() => setImgError(true)}
                  />
                </div>
                <i className="bi bi-chevron-down ms-2 text-muted" style={{ fontSize: '0.8rem' }}></i>
              </div>
            }
            id="user-nav-dropdown"
            className="no-caret"
          >
            <div className="px-3 py-2 d-sm-none border-bottom mb-2">
              <div className="fw-bold small text-dark">{displayName}</div>
              <div className="text-muted small">{displayRole}</div>
            </div>
            <NavDropdown.Header className="small text-muted text-uppercase pb-1">Account</NavDropdown.Header>
            <NavDropdown.Item href="#profile" className="py-2 small">
              <i className="bi bi-person me-2"></i>My Profile
            </NavDropdown.Item>
            <NavDropdown.Divider />
            <NavDropdown.Item onClick={onLogout} className="text-danger py-2 small">
              <i className="bi bi-box-arrow-right me-2"></i>Logout
            </NavDropdown.Item>
          </NavDropdown>
        </Nav>
      </Container>
    </RBNavbar>
  );
}

