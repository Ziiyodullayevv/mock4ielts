const LOGIN_PATH = '/login';

export const sanitizeReturnTo = (value?: string | null) => {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return null;
  }

  if (value === LOGIN_PATH || value.startsWith(`${LOGIN_PATH}?`) || value.startsWith(`${LOGIN_PATH}/`)) {
    return null;
  }

  return value;
};

export const buildLoginHref = (returnTo?: string | null) => {
  const safeReturnTo = sanitizeReturnTo(returnTo);

  if (!safeReturnTo) {
    return LOGIN_PATH;
  }

  return `${LOGIN_PATH}?returnTo=${encodeURIComponent(safeReturnTo)}`;
};

export const getCurrentReturnTo = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  const { hash, pathname, search } = window.location;

  return sanitizeReturnTo(`${pathname}${search}${hash}`);
};
