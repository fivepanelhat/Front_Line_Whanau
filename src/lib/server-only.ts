import 'server-only';

export const requireServer = () => {
  // Utility function that just imports server-only
  // Any file importing this will throw an error if included in client bundle
};
