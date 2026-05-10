import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Role } from '@prisma/client';
import { Nav } from 'react-bootstrap';

interface SidebarProps {
  role: Role;
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: 'bi-grid-fill',
      roles: ['SUPERADMIN', 'MANAGER_HRD', 'ADMIN_HRD'],
    },
    {
      title: 'Kelola User',
      path: '/users',
      icon: 'bi-people-fill',
      roles: ['SUPERADMIN', 'MANAGER_HRD', 'ADMIN_HRD'],
    },
    {
      title: 'Data Pegawai',
      path: '/pegawai',
      icon: 'bi-person-badge-fill',
      roles: ['MANAGER_HRD', 'ADMIN_HRD'],
    },
    {
      title: 'Presensi',
      path: '/presensi',
      icon: 'bi-calendar-check-fill',
      roles: ['MANAGER_HRD', 'ADMIN_HRD'],
    },
    {
      title: 'Tunjangan',
      path: '/tunjangan',
      icon: 'bi-cash-stack',
      roles: ['MANAGER_HRD', 'ADMIN_HRD'],
    },
    {
      title: 'Log Aktivitas',
      path: '/log',
      icon: 'bi-journal-text',
      roles: ['SUPERADMIN'],
    },
  ];

  const filteredMenu = menuItems.filter((item) => item.roles.includes(role));

  return (
    <div className="sidebar d-flex flex-column p-3">
      <div className="mb-4 text-center">
        <h4 className="fw-bold">HRMS</h4>
        <hr className="bg-white" />
      </div>
      <Nav variant="pills" className="flex-column mb-auto">
        {filteredMenu.map((item) => (
          <Nav.Item key={item.path}>
            <Nav.Link
              as={Link as any}
              href={item.path}
              active={pathname === item.path || pathname.startsWith(item.path + '/')}
              className="d-flex align-items-center gap-2"
            >
              <i className={`bi ${item.icon}`}></i>
              {item.title}
            </Nav.Link>
          </Nav.Item>
        ))}
      </Nav>
    </div>
  );
}
