'use client';

import { useEffect, useState } from "react";
import Loading from "@/app/loading";

export default function ClientOnly({ 
  children, 
  showLoading = true 
}: { 
  children: React.ReactNode;
  showLoading?: boolean;
}) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return showLoading ? <Loading /> : null;
  }

  return <>{children}</>;
} 