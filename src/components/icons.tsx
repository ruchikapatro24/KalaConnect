import type { SVGProps } from 'react';

export function KalaConnectLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      {...props}
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      >
        <path d="M6 20.701a2 2 0 0 0 1.999 1.299h8.002A2 2 0 0 0 18 20.701V15" />
        <path d="M6 9V3.299a2 2 0 0 1 2-1.299h8a2 2 0 0 1 2 1.3V9" />
        <path d="M12 2v20m-3-7.5l-1-1a2.828 2.828 0 0 1 0-4l6-6a2.828 2.828 0 0 1 4 0l1 1" />
        <path d="m15 14.5l1 1a2.828 2.828 0 0 1 0 4l-6 6a2.828 2.828 0 0 1-4 0l-1-1" />
      </g>
    </svg>
  );
}
