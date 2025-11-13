import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const Card = ({ 
  children, 
  className = '', 
  hover = false, 
  clickable = false, 
  onClick,
  padding = 'p-6',
  ...props 
}) => {
  const { isDark } = useTheme();

  const baseClasses = `
    rounded-lg border transition-all
    ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
    ${hover ? (isDark ? 'hover:shadow-lg hover:border-blue-600' : 'hover:shadow-lg hover:border-blue-300') : ''}
    ${clickable ? 'cursor-pointer' : ''}
    ${padding}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div 
      className={baseClasses}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

// Card Header Component
const CardHeader = ({ children, className = '' }) => {
  const { isDark } = useTheme();
  
  return (
    <div className={`border-b pb-4 mb-4 ${isDark ? 'border-gray-700' : 'border-gray-200'} ${className}`}>
      {children}
    </div>
  );
};

// Card Title Component
const CardTitle = ({ children, className = '' }) => {
  const { isDark } = useTheme();
  
  return (
    <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} ${className}`}>
      {children}
    </h3>
  );
};

// Card Content Component
const CardContent = ({ children, className = '' }) => {
  return (
    <div className={className}>
      {children}
    </div>
  );
};

// Card Footer Component
const CardFooter = ({ children, className = '' }) => {
  const { isDark } = useTheme();
  
  return (
    <div className={`border-t pt-4 mt-4 ${isDark ? 'border-gray-700' : 'border-gray-200'} ${className}`}>
      {children}
    </div>
  );
};

// Export all components
Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;