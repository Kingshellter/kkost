export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-rose text-lg font-extrabold text-white">
        K
      </span>
      <span className="text-xl font-extrabold tracking-tight text-ink">
        Koscek
      </span>
    </span>
  );
}
