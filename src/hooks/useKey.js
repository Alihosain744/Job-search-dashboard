import { useEffect } from "react";
//
export function useKey(key, action, ref = null) {
  if (ref) ref.focus();
  useEffect(
    function () {
      function callback(e) {
        if (e.code.toLowerCase() === key.toLowerCase()) {
          action();
        }
      }

      document.addEventListener("keydown", callback);

      return () => document.removeEventListener("keydown", callback);
    },
    [action, key]
  );
}
