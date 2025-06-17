export function validateUsername(username: string) {
  if (username.length < 3 || username.length > 20) {
    return 'Username must be between 3-20 characters';
  } else {
    return '';
  }
}
