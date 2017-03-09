export const secureManual = func => (req, token, database) =>
  func(token, database);
