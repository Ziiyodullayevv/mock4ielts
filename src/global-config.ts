import packageJson from '../package.json';

// ----------------------------------------

export type ConfigValue = {
  appName: string;
  appVersion: string;
  serverUrl: string;
  assetsDir: string;
  googleClientId: string;
};

export const CONFIG: ConfigValue = {
  appName: 'Mock4IELTS',
  appVersion: packageJson.version,
  serverUrl: process.env.NEXT_PUBLIC_SERVER_URL ?? '',
  assetsDir: process.env.NEXT_PUBLIC_ASSETS_DIR ?? '',
  googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '',
};

export const getAssetUrl = (assetPath: string) => {
  const normalizedAssetPath = assetPath.startsWith('/') ? assetPath : `/${assetPath}`;
  const normalizedAssetsDir = CONFIG.assetsDir.replace(/\/+$/, '');

  return normalizedAssetsDir ? `${normalizedAssetsDir}${normalizedAssetPath}` : normalizedAssetPath;
};
