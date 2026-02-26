import Link from "next/link";

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`gg-surface p-5 ${className}`}>{children}</div>;
}

export function PillLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="gg-chip hover:bg-[rgba(192,250,190,0.35)]">
      {children}
    </Link>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`gg-input ${props.className || ""}`} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`gg-select ${props.className || ""}`} />;
}

export function Button(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" }
) {
  const variant = props.variant || "ghost";
  const base = "gg-button disabled:opacity-50 disabled:cursor-not-allowed";
  const v = variant === "primary" ? "gg-button-primary" : "gg-button-ghost";
  return <button {...props} className={`${base} ${v} ${props.className || ""}`} />;
}
