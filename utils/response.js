export const ok = (res, payload) => res.status(200).json(payload);
export const created = (res, payload) => res.status(201).json(payload);
export const bad = (res, payload) => res.status(400).json(payload);
export const unauth = (res, payload) => res.status(401).json(payload);
export const forbidden = (res, payload) => res.status(403).json(payload);
