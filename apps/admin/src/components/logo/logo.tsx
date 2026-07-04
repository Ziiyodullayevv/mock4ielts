'use client';

import type { LinkProps } from '@mui/material/Link';

import { useId } from 'react';
import { mergeClasses } from 'minimal-shared/utils';

import Link from '@mui/material/Link';
import { styled, useTheme } from '@mui/material/styles';

import { RouterLink } from 'src/routes/components';

import { logoClasses } from './classes';

// ----------------------------------------------------------------------

export type LogoProps = LinkProps & {
  isSingle?: boolean;
  disabled?: boolean;
};

export function Logo({
  sx,
  disabled,
  className,
  href = '/',
  isSingle = true,
  ...other
}: LogoProps) {
  const theme = useTheme();

  const uniqueId = useId();

  const TEXT_PRIMARY = theme.vars.palette.text.primary;
  const PRIMARY_LIGHTER = theme.vars.palette.primary.lighter;
  const PRIMARY_LIGHT = theme.vars.palette.primary.light;
  const PRIMARY_MAIN = theme.vars.palette.primary.main;
  const PRIMARY_DARKER = theme.vars.palette.primary.dark;

  /*
    * OR using local (public folder)
    *
    const singleLogo = (
      <img
        alt="Single logo"
        src={`${CONFIG.assetsDir}/logo/logo-single.svg`}
        width="100%"
        height="100%"
      />
    );

    const fullLogo = (
      <img
        alt="Full logo"
        src={`${CONFIG.assetsDir}/logo/logo-full.svg`}
        width="100%"
        height="100%"
      />
    );
    *
    */

  const singleLogo = (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 142 130"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id={`${uniqueId}-1`}
          x1="0"
          y1="0"
          x2="142"
          y2="130"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={PRIMARY_LIGHTER} />
          <stop offset="1" stopColor={PRIMARY_MAIN} />
        </linearGradient>
        <linearGradient
          id={`${uniqueId}-2`}
          x1="36"
          y1="50"
          x2="142"
          y2="130"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={PRIMARY_MAIN} />
          <stop offset="1" stopColor={PRIMARY_DARKER} />
        </linearGradient>
        <linearGradient
          id={`${uniqueId}-3`}
          x1="107"
          y1="61"
          x2="142"
          y2="130"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={PRIMARY_LIGHT} />
          <stop offset="1" stopColor={PRIMARY_MAIN} />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${`${uniqueId}-1`})`}
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 64.988V129.976L32 97.988C49.6 80.394 64 65.544 64 64.988C64 64.432 49.6 49.582 32 31.988L0 0V64.988Z"
      />
      <path
        fill={`url(#${`${uniqueId}-2`})`}
        d="M89.086 53.217L36.988 105.946L48.728 117.717C55.186 124.191 60.926 129.504 61.484 129.523C62.043 129.542 80.387 111.437 102.25 89.288L142 49.019V24.753C142 11.407 141.817 0.488 141.592 0.488C141.368 0.488 117.741 24.216 89.086 53.217Z"
      />
      <path
        fill={`url(#${`${uniqueId}-3`})`}
        d="M124.496 78.492L107.515 95.495L124.757 112.738L142 129.981V95.734C142 76.899 141.883 61.488 141.739 61.488C141.595 61.488 133.836 69.14 124.496 78.492Z"
      />
    </svg>
  );

  const fullLogo = (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 360 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id={`${uniqueId}-f1`}
          x1="0"
          y1="0"
          x2="142"
          y2="130"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={PRIMARY_LIGHTER} />
          <stop offset="1" stopColor={PRIMARY_MAIN} />
        </linearGradient>
        <linearGradient
          id={`${uniqueId}-f2`}
          x1="36"
          y1="50"
          x2="142"
          y2="130"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={PRIMARY_MAIN} />
          <stop offset="1" stopColor={PRIMARY_DARKER} />
        </linearGradient>
        <linearGradient
          id={`${uniqueId}-f3`}
          x1="107"
          y1="61"
          x2="142"
          y2="130"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={PRIMARY_LIGHT} />
          <stop offset="1" stopColor={PRIMARY_MAIN} />
        </linearGradient>
      </defs>
      {/* Icon scaled to fit */}
      <g transform="translate(2, 22) scale(0.28)">
        <path
          fill={`url(#${`${uniqueId}-f1`})`}
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0 64.988V129.976L32 97.988C49.6 80.394 64 65.544 64 64.988C64 64.432 49.6 49.582 32 31.988L0 0V64.988Z"
        />
        <path
          fill={`url(#${`${uniqueId}-f2`})`}
          d="M89.086 53.217L36.988 105.946L48.728 117.717C55.186 124.191 60.926 129.504 61.484 129.523C62.043 129.542 80.387 111.437 102.25 89.288L142 49.019V24.753C142 11.407 141.817 0.488 141.592 0.488C141.368 0.488 117.741 24.216 89.086 53.217Z"
        />
        <path
          fill={`url(#${`${uniqueId}-f3`})`}
          d="M124.496 78.492L107.515 95.495L124.757 112.738L142 129.981V95.734C142 76.899 141.883 61.488 141.739 61.488C141.595 61.488 133.836 69.14 124.496 78.492Z"
        />
      </g>
      {/* Text: mock4ielts */}
      <text
        x="46"
        y="60"
        fontFamily="'Public Sans Variable', 'Public Sans', sans-serif"
        fontWeight="700"
        fontSize="24"
        fill={TEXT_PRIMARY}
      >
        mock
      </text>
      <text
        x="130"
        y="60"
        fontFamily="'Public Sans Variable', 'Public Sans', sans-serif"
        fontWeight="800"
        fontSize="24"
        fill={PRIMARY_MAIN}
      >
        4
      </text>
      <text
        x="143"
        y="60"
        fontFamily="'Public Sans Variable', 'Public Sans', sans-serif"
        fontWeight="700"
        fontSize="24"
        fill={TEXT_PRIMARY}
      >
        ielts
      </text>
    </svg>
  );

  return (
    <LogoRoot
      component={RouterLink}
      href={href}
      aria-label="Logo"
      underline="none"
      className={mergeClasses([logoClasses.root, className])}
      sx={[
        {
          width: 32,
          height: 32,
          ...(!isSingle && { width: 82, height: 28 }),
          ...(disabled && { pointerEvents: 'none' }),
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {isSingle ? singleLogo : fullLogo}
    </LogoRoot>
  );
}

// ----------------------------------------------------------------------

const LogoRoot = styled(Link)(() => ({
  flexShrink: 0,
  color: 'transparent',
  display: 'inline-flex',
  verticalAlign: 'middle',
}));
