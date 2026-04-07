import React from 'react';

interface CruziLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const CruziLogo: React.FC<CruziLogoProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <span 
        className={`font-black font-outfit tracking-tight neural-gradient-text ${sizeClasses[size]}`}
        style={{ animation: 'text-glow 3s ease-in-out infinite' }}
      >
        Cruzi
      </span>
    </div>
  );
};

export default CruziLogo;
