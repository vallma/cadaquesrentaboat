import { siInstagram, siWhatsapp } from "simple-icons";

const icons = { whatsapp: siWhatsapp, instagram: siInstagram };

export function BrandIcon({
  name,
  className,
}: {
  name: keyof typeof icons;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d={icons[name].path} />
    </svg>
  );
}
