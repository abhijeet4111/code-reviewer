import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Shield, FileSearch, Settings, Users, Activity, Code } from 'lucide-react';

const menuItems = [
  { icon: Home, label: 'Dashboard', path: '/' },
  { icon: Shield, label: 'Security Scans', path: '/scans' },
  { icon: FileSearch, label: 'Reports', path: '/reports' },
  { icon: Code, label: 'Rules Editor', path: '/rules' },
  { icon: Activity, label: 'Analytics', path: '/analytics' },
  { icon: Users, label: 'Team', path: '/team' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

const Sidebar = ({ isOpen }) => {
  const location = useLocation();

  return (
    <aside
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-16'
      }`}
    >
      <div className="flex flex-col p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span
                className={`${
                  !isOpen && 'hidden'
                } transition-opacity duration-300`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;
