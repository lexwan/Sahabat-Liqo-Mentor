import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  disabled = false,
  loading = false,
  ...props 
}) => {
  const { isDark } = useTheme();

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-600 hover:bg-blue-700 text-white border-transparent';
      case 'secondary':
        return isDark 
          ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 border-gray-600' 
          : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300';
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white border-transparent';
      case 'success':
        return 'bg-green-600 hover:bg-green-700 text-white border-transparent';
      case 'outline':
        return isDark
          ? 'bg-transparent hover:bg-gray-700 text-gray-300 border-gray-600'
          : 'bg-transparent hover:bg-gray-50 text-gray-700 border-gray-300';
      case 'ghost':
        return isDark
          ? 'bg-transparent hover:bg-gray-700 text-gray-300 border-transparent'
          : 'bg-transparent hover:bg-gray-100 text-gray-700 border-transparent';
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white border-transparent';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'md':
        return 'px-4 py-2 text-sm';
      case 'lg':
        return 'px-6 py-3 text-base';
      default:
        return 'px-4 py-2 text-sm';
    }
  };

  const baseClasses = `
    inline-flex items-center justify-center
    border rounded-lg font-medium
    transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
    ${isDark ? 'focus:ring-offset-gray-800' : 'focus:ring-offset-white'}
    ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${getVariantClasses()}
    ${getSizeClasses()}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <button 
      className={baseClasses}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;