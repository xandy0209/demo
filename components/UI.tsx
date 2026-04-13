import React, { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

// Common base styles for inputs to look like the dashboard - reduced opacity to /30
// Removed w-full to allow better control in horizontal layouts
// Updated border color to #0085D0 with 50% opacity and height to 25px
const inputBaseClasses = "bg-[#0f172a]/30 border border-[#0085D0]/50 text-blue-100 text-sm px-2 py-0 focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue transition-colors placeholder-blue-300/30 rounded-none h-[25px] leading-[23px]";

export const StyledInput: React.FC<InputHTMLAttributes<HTMLInputElement>> = (props) => {
  const handleClick = (e: React.MouseEvent<HTMLInputElement>) => {
    // Auto-open picker for date inputs
    if (props.type === 'date' || props.type === 'datetime-local') {
      try {
        // Use currentTarget to ensure we are calling showPicker on the input element itself
        if ('showPicker' in HTMLInputElement.prototype) {
          e.currentTarget.showPicker();
        }
      } catch (error) {
        // Ignore errors (e.g. if already open or not supported)
        console.debug('Date picker open failed', error);
      }
    }
    
    if (props.onClick) {
      props.onClick(e);
    }
  };

  // Add cursor-pointer for date inputs to indicate clickability
  const cursorClass = (props.type === 'date' || props.type === 'datetime-local') ? 'cursor-pointer' : '';

  return <input {...props} onClick={handleClick} className={`${inputBaseClasses} ${cursorClass} ${props.className || ''}`} />;
};

export const StyledTextarea: React.FC<TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => {
  return <textarea {...props} className={`bg-[#0f172a]/30 border border-[#0085D0]/50 text-blue-100 text-sm px-2 py-1 focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue transition-colors placeholder-blue-300/30 rounded-none leading-[23px] resize-y min-h-[60px] ${props.className || ''}`} />;
};

// Custom chevron SVG for select arrow (white/blue tint)
const chevronSvg = encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='#0085D0' stroke-width='2'><path stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/></svg>`
);

const selectBaseClasses = `bg-[#0f172a]/30 border border-[#0085D0]/50 text-blue-100 text-sm px-2 py-0 focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue transition-colors rounded-none h-[25px] leading-[23px] appearance-none pr-8 bg-no-repeat bg-[right_0.25rem_center] bg-[length:14px_14px]`;

export const StyledSelect: React.FC<SelectHTMLAttributes<HTMLSelectElement>> = (props) => {
  return (
    <select 
      {...props} 
      className={`${selectBaseClasses} ${props.className || ''}`}
      style={{ backgroundImage: `url("data:image/svg+xml,${chevronSvg}")` }}
    >
      {props.children}
    </select>
  );
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'toolbar' | 'danger';
  icon?: React.ReactNode;
}

export const StyledButton: React.FC<ButtonProps> = ({ variant = 'primary', icon, children, className, ...props }) => {
  // Added disabled styles
  const baseStyle = "flex items-center justify-center gap-2 px-3 py-0 text-sm font-medium transition-all duration-200 border rounded-none h-[25px] disabled:opacity-40 disabled:cursor-not-allowed disabled:grayscale-[0.5]";
  
  let variantStyle = "";
  if (variant === 'primary') {
    // Updated to #07596C with 80% opacity
    variantStyle = "bg-[#07596C]/80 hover:bg-[#07596C] border-blue-500 text-white shadow-[0_0_10px_rgba(7,89,108,0.3)]";
  } else if (variant === 'secondary') {
    // Reduced opacity to /30
    variantStyle = "bg-slate-700/30 hover:bg-slate-600 border-slate-500 text-slate-200";
  } else if (variant === 'outline') {
    variantStyle = "bg-transparent border-blue-500/50 text-blue-300 hover:border-neon-blue hover:text-neon-blue";
  } else if (variant === 'toolbar') {
    // New variant for Query/Export buttons: bg #224D63, border #5FBADD
    variantStyle = "bg-[#224D63] border-[#5FBADD] text-white hover:brightness-110 shadow-sm";
  } else if (variant === 'danger') {
    variantStyle = "bg-red-500/20 border-red-500/50 text-red-400 hover:bg-red-500/30 hover:text-red-300 rounded-sm !text-sm !gap-1";
  }

  return (
    <button className={`${baseStyle} ${variantStyle} ${className || ''}`} {...props}>
      {icon && <span className="flex items-center">{icon}</span>}
      {children}
    </button>
  );
};