import * as React from 'react';

const Logo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <defs>
      <linearGradient id="logoGradient" x1="0.5" y1="1" x2="0.5" y2="0">
        <stop offset="0%" stopColor="#78c850" />
        <stop offset="100%" stopColor="#f89848" />
      </linearGradient>
    </defs>
    <rect width="100" height="100" rx="20" ry="20" fill="url(#logoGradient)" />
    <path
      fill="#FFF"
      d="M78.5,30 C77.2,21.3,70,15,61,15 C55.5,15,50.7,17.4,47.5,21.2 C45.6,18.4,42.5,16.5,39,16.5 C32.9,16.5,28,21.4,28,27.5 C28,28.2,28.1,28.8,28.2,29.5 C22.8,31.4,19,36.4,19,42.5 C19,49.4,24.6,55,31.5,55 L68.5,55 C75.4,55,81,49.4,81,42.5 C81,36.5,78.5,30,78.5,30 Z"
    />
    <path
      fill="#FFF"
      d="M25,58 H75 C77,58,78,60,78,62 V70 H22 V62 C22,60,23,58,25,58 Z"
    />
    <circle cx="35" cy="40" r="7" fill="#e53935" />
    <path d="M35 33 L33 30 L37 30 Z" fill="#4caf50" />
    <path
      d="M48 35 C 52 35, 53 45, 48 45 C 46 45, 46 35, 48 35 Z"
      fill="#4caf50"
    />
    <path
      d="M58 35 C 56 32, 63 38, 61 45 C 62 42, 59 34, 58 35 Z"
      fill="#fbc02d"
    />
    <g fill="#FFF" transform="translate(29, 78)">
        <circle cx="0" cy="0" r="1.5" />
        <rect x="5" y="-4" width="2" height="8" rx="1" />
        <rect x="10" y="-6" width="2" height="12" rx="1" />
        <rect x="15" y="-8" width="2" height="16" rx="1" />
        <rect x="20" y="-6" width="2" height="12" rx="1" />
        <rect x="25" y="-4" width="2" height="8" rx="1" />
        <circle cx="30" cy="0" r="1.5" />
    </g>
  </svg>
);

export default Logo;
