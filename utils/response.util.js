// utils/response.util.js
export const ok = (res, data = {}, message = "success", code = 200) => {
    return res.status(code).json({ message, ...data });
  };
  
  export const created = (res, data = {}, message = "created") => {
    return res.status(201).json({ message, ...data });
  };
  
  export const error = (res, message = "error", code = 500) => {
    return res.status(code).json({ message });
  };
  