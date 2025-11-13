import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const Input = ({ 
  label, 
  error, 
  className = '', 
  type = 'text',
  ...props 
}) => {
  const { isDark } = useTheme();

  const inputClasses = `
    w-full px-3 py-2 border rounded-lg
    focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    transition-colors duration-200
    ${isDark 
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
    }
    ${error 
      ? (isDark ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-red-300 focus:border-red-500 focus:ring-red-500')
      : ''
    }
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className="space-y-1">
      {label && (
        <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          {label}
        </label>
      )}
      <input 
        type={type}
        className={inputClasses}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};

// Textarea Component
const Textarea = ({ 
  label, 
  error, 
  className = '', 
  rows = 3,
  ...props 
}) => {
  const { isDark } = useTheme();

  const textareaClasses = `
    w-full px-3 py-2 border rounded-lg
    focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    transition-colors duration-200 resize-vertical
    ${isDark 
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
    }
    ${error 
      ? (isDark ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-red-300 focus:border-red-500 focus:ring-red-500')
      : ''
    }
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className="space-y-1">
      {label && (
        <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          {label}
        </label>
      )}
      <textarea 
        rows={rows}
        className={textareaClasses}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};

// Select Component
const Select = ({ 
  label, 
  error, 
  className = '', 
  children,
  ...props 
}) => {
  const { isDark } = useTheme();

  const selectClasses = `
    w-full px-3 py-2 border rounded-lg
    focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    transition-colors duration-200
    ${isDark 
      ? 'bg-gray-700 border-gray-600 text-white' 
      : 'bg-white border-gray-300 text-gray-900'
    }
    ${error 
      ? (isDark ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-red-300 focus:border-red-500 focus:ring-red-500')
      : ''
    }
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className="space-y-1">
      {label && (
        <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          {label}
        </label>
      )}
      <select 
        className={selectClasses}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};

// Export components
Input.Textarea = Textarea;
Input.Select = Select;

export default Input;