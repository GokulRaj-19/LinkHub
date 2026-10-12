import React from 'react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  type = 'button',
  icon: Icon,
  className = '',
  style = {},
  ...props
}) {
  const getVariantClass = () => {
    switch (variant) {
      case 'outline': return 'btn-outline';
      case 'dashed': return 'btn-dashed';
      case 'icon': return 'btn-icon';
      default: return 'btn-primary';
    }
  };

  const getSizeClass = () => {
    return size === 'sm' ? 'btn-sm' : '';
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn ${getVariantClass()} ${getSizeClass()} ${className}`}
      style={style}
      {...props}
    >
      {Icon && <Icon size={size === 'sm' ? 16 : 18} />}
      {children}
    </button>
  );
}
