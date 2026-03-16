import type { PropsWithChildren } from 'react';

type ButtonProps = PropsWithChildren<{
  onClick?: () => void;
}>;

export function Button({ children, onClick }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center rounded-xl bg-(--brand) px-4 py-2 text-sm font-semibold text-(--brand-foreground)"
      type="button"
    >
      {children}
    </button>
  );
}

export function Card({ title, description }: { title: string; description: string }) {
  return (
    <article className="rounded-2xl border border-(--surface-border) bg-(--surface) p-5 shadow-sm">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
    </article>
  );
}