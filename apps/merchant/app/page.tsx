"use client";

import { useBalance } from "@repo/store/balance";

export default function () {
  const balance = useBalance();
  return (
    <div>
      <p>hi there {balance}</p>
    </div>
  );
}
