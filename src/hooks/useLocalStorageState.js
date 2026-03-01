import { useState, useEffect } from "react";

export function useLocalStorageState(key, initialState) {
  const [value, setValue] = useState(function () {
    const storedData = localStorage.getItem(key);
    const parsed = storedData ? JSON.parse(storedData) : initialState;
    return Array.isArray(parsed) ? parsed : initialState;
  });

  useEffect(
    function () {
      localStorage.setItem(key, JSON.stringify(value));
    },
    [value, key]
  );
  return [value, setValue];
}
