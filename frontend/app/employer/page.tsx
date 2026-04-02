"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EmployerIndex() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/employer/login");
  }, []);
  return null;
}
