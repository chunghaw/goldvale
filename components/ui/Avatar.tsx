/**
 * Pet avatar — the photo when there is one, otherwise a calm monogram (the pet's
 * initial). Avoids every pet falling back to the demo pet's photo.
 */
import Image from "next/image";

export function Avatar({ src, name, size }: { src?: string | null; name: string; size: number }) {
  if (src) {
    return (
      <Image
        src={src}
        alt={name}
        width={size}
        height={size}
        style={{ width: size, height: size, borderRadius: 999, objectFit: "cover", display: "block" }}
      />
    );
  }
  const initial = name.trim().charAt(0).toUpperCase() || "·";
  return (
    <div
      aria-label={name}
      style={{
        width: size, height: size, borderRadius: 999,
        background: "linear-gradient(150deg, #cfe0db, #b6cecb)",
        color: "#3a6b60", display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "var(--serif)", fontWeight: 600, fontSize: Math.round(size * 0.44), lineHeight: 1,
      }}
    >
      {initial}
    </div>
  );
}
