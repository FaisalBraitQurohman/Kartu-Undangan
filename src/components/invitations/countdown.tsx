"use client";
import { useEffect, useState } from "react";
export function Countdown({ date }: { date: string }) {
  const [seconds, setSeconds] = useState<number | null>(null);
  useEffect(() => {
    const update = () =>
      setSeconds(
        Math.max(0, Math.floor((new Date(date).getTime() - Date.now()) / 1000)),
      );
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [date]);
  if (seconds === null) return <p>Menanti hari istimewa</p>;
  if (!seconds) return <p>Hari istimewa telah tiba.</p>;
  const values = [
    Math.floor(seconds / 86400),
    Math.floor((seconds % 86400) / 3600),
    Math.floor((seconds % 3600) / 60),
    seconds % 60,
  ];
  return (
    <div className="flex justify-center gap-6" aria-label="Hitung mundur">
      {values.map((v, i) => (
        <div key={i}>
          <p className="font-serif text-3xl">{v}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            {["Hari", "Jam", "Menit", "Detik"][i]}
          </p>
        </div>
      ))}
    </div>
  );
}
