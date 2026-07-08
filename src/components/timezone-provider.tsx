"use client";

import { useEffect } from "react";

export function TimezoneProvider() {
  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    document.cookie = `__tz=${tz};path=/;max-age=86400;samesite=lax`;
  }, []);
  return null;
}
