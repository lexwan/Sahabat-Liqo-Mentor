import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const Badge = ({ 
  children, 
  variant = 'default', 
  size = 'md',
  className = '',
  ...props 
}) => {
  const { isDark } = useTheme();

  const getVariantClasses = () => {
    switch (variant) {
      case 'success':
        return isDark
          ? 'bg-green-900/30 text-green-400 border-green-700'
          : 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return isDark
          ? 'bg-yellow-900/30 text-yellow-400 border-yellow-700'
          : 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'danger':
        return isDark
          ? 'bg-red-900/30 text-red-400 border-red-700'
          : 'bg-red-100 text-red-800 border-red-200';
      case 'info':
        return isDark
          ? 'bg-blue-900/30 text-blue-400 border-blue-700'
          : 'bg-blue-100 text-blue-800 border-blue-200';
      case 'secondary':
        return isDark
          ? 'bg-gray-700 text-gray-300 border-gray-600'
          : 'bg-gray-100 text-gray-700 border-gray-200';
      case 'outline':
        return isDark
          ? 'bg-transparent text-gray-300 border-gray-600'
          : 'bg-transparent text-gray-700 border-gray-300';
      default:
        return isDark
          ? 'bg-gray-700 text-gray-300 border-gray-600'
          : 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-0.5 text-xs';
      case 'md':
        return 'px-2.5 py-1 text-xs';
      case 'lg':
        return 'px-3 py-1.5 text-sm';
      default:
        return 'px-2.5 py-1 text-xs';
    }
  };

  const baseClasses = `
    inline-flex items-center
    border rounded-full font-medium
    ${getVariantClasses()}
    ${getSizeClasses()}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <span className={baseClasses} {...props}>
      {children}
    </span>
  );
};

export default Badge;