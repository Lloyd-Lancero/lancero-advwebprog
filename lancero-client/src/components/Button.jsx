import { Link } from 'react-router-dom';

// primary = yellow (main action), secondary = white (other actions)
// both stay readable on the blue background and on the light sections
const variantClasses = {
  primary: 'bg-yellow-400 text-zinc-900 hover:bg-yellow-300',
  secondary: 'bg-zinc-50 text-zinc-900 hover:bg-yellow-100',
};

const Button = ({
  children,
  to,
  type = 'button',
  variant = 'secondary',
  className = '',
  disabled = false,
  ...rest
}) => {
  const classes = [
    'inline-flex items-center justify-center rounded-full px-4 py-2 shadow-md hover:shadow-lg text-[10px] font-semibold uppercase tracking-[0.24em] transition',
    variantClasses[variant] ?? variantClasses.secondary,
    disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
    className,
  ]
    .join(' ')
    .trim();

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} disabled={disabled} {...rest}>
      {children}
    </button>
  );
};

export default Button;
