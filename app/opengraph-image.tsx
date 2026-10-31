import { ImageResponse } from "next/og";

export const alt = "GGStore — Prendas de segunda mano en Guatemala";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 55%, #a7f3d0 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          padding: "60px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            marginBottom: "36px",
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "28px",
              background: "#4ade80",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "40px",
            }}
          >
            🌿
          </div>
          <span
            style={{
              fontSize: "80px",
              fontWeight: 800,
              color: "#14532d",
              letterSpacing: "-3px",
            }}
          >
            GGStore
          </span>
        </div>

        <div
          style={{
            fontSize: "34px",
            color: "#166534",
            fontWeight: 600,
            marginBottom: "20px",
          }}
        >
          Prendas de segunda mano seleccionadas
        </div>

        <div
          style={{
            display: "flex",
            gap: "20px",
            fontSize: "24px",
            color: "#4b7a5e",
          }}
        >
          <span>Guatemala 🇬🇹</span>
          <span style={{ color: "#86efac" }}>·</span>
          <span>Pedidos por WhatsApp</span>
          <span style={{ color: "#86efac" }}>·</span>
          <span>Precios reales</span>
        </div>
      </div>
    ),
    size
  );
}
