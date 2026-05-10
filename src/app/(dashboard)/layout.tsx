'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Sidebar from '@/components/common/sidebar';
import Navbar from '@/components/common/navbar';
import { Spinner, Container } from 'react-bootstrap';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="d-flex">
      <Sidebar role={user.role} />
      <div className="flex-grow-1">
        <Navbar user={user} onLogout={logout} />
        <main className="p-4 bg-light min-vh-100">
          <Container fluid>
            {children}
          </Container>
        </main>
      </div>
    </div>
  );
}
