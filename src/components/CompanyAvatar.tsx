import { avatarColor } from "@/lib/format";

/** Round company logo, falling back to a coloured initial when no logo is set. */
export function CompanyAvatar({
  company,
  logo,
  size = 48,
}: {
  company: string;
  logo?: string | null;
  size?: number;
}) {
  const dimension = { width: size, height: size };
  if (logo) {
    return (
      // Logos come from arbitrary employer-supplied URLs, so next/image's
      // remotePatterns allow-list doesn't fit — a plain <img> is intentional.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logo}
        alt={`${company} logo`}
        style={dimension}
        className="rounded-lg border border-slate-200 object-contain bg-white"
      />
    );
  }
  return (
    <div
      style={dimension}
      className={`grid shrink-0 place-items-center rounded-lg font-bold ${avatarColor(
        company
      )}`}
    >
      <span style={{ fontSize: size * 0.4 }}>
        {company.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}
