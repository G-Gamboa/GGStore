import Link from "next/link";

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`gg-surface p-5 ${className}`}>{children}</div>;
}

export function PillLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className="gg-chip hover:bg-[rgba(192,250,190,0.4)] transition-colors">
      {children}
    </Link>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className = "", ...rest } = props;
  return <input {...rest} className={`gg-input ${className}`} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const { className = "", ...rest } = props;
  return <select {...rest} className={`gg-select ${className}`} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className = "", ...rest } = props;
  return <textarea {...rest} className={`gg-input resize-none ${className}`} />;
}

export function Button(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "ghost";
  }
) {
  const { variant = "ghost", className = "", ...rest } = props;
  const v = variant === "primary" ? "gg-button-primary" : "gg-button-ghost";
  return (
    <button
      {...rest}
      className={`gg-button disabled:opacity-50 disabled:cursor-not-allowed ${v} ${className}`}
    />
  );
}
