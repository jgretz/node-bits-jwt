export const secureManual = func => (req, token, database) =>
  func(req, token, database);
