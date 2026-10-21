import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  staticFile,
  Audio,
  Easing,
} from "remotion";
import React from "react";

/* ============================================
   DESIGN TOKENS
   ============================================ */
const C = {
  bg: "#0A0E1A",
  bgCard: "#111827",
  white: "#FFFFFF",
  ink: "#0F172A",
  ink3: "#334155",
  ink4: "#64748B",
  ink5: "#94A3B8",
  ink7: "#E2E8F0",
  teal: "#0D9488",
  tealLight: "#14B8A6",
  tealGlow: "#5EEAD4",
  tealSoft: "rgba(13,148,136,0.15)",
  font: "'Inter', system-ui, sans-serif",
};

/* ============================================
   EASING HELPERS
   ============================================ */
const ease = (frame: number, start: number, end: number, from: number, to: number) =>
  interpolate(frame, [start, end], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

const easeIn = (frame: number, start: number, end: number, from: number, to: number) =>
  interpolate(frame, [start, end], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });

/* ============================================
   PARTICLE FIELD (Background)
   ============================================ */
const ParticleField: React.FC = () => {
  const frame = useCurrentFrame();
  const particles = React.useMemo(() => {
    const pts = [];
    for (let i = 0; i < 80; i++) {
      pts.push({
        x: Math.random() * 1920,
        y: Math.random() * 1080,
        size: Math.random() * 2.5 + 0.5,
        speed: Math.random() * 0.3 + 0.05,
        phase: Math.random() * Math.PI * 2,
        opacity: Math.random() * 0.4 + 0.1,
      });
    }
    return pts;
  }, []);

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {particles.map((p, i) => {
        const x = p.x + Math.sin(frame * 0.01 + p.phase) * 30;
        const y = p.y + Math.cos(frame * 0.008 + p.phase) * 20 - frame * p.speed;
        const pulse = 0.6 + 0.4 * Math.sin(frame * 0.05 + p.phase);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: ((y % 1080) + 1080) % 1080,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              background: C.tealGlow,
              opacity: p.opacity * pulse,
              boxShadow: `0 0 ${p.size * 4}px ${C.teal}`,
            }}
          />
        );
      })}
    </div>
  );
};

/* ============================================
   GLOWING ORB
   ============================================ */
const GlowOrb: React.FC<{
  x: number; y: number; size: number; delay?: number; color?: string;
}> = ({ x, y, size, delay = 0, color = C.teal }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 30, mass: 1.5 } });
  const pulse = 0.7 + 0.3 * Math.sin(frame * 0.04);

  return (
    <div
      style={{
        position: "absolute",
        left: x - size / 2,
        top: y - size / 2,
        width: size * s,
        height: size * s,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${color}40 0%, transparent 70%)`,
        filter: `blur(${size * 0.3}px)`,
        opacity: pulse * s,
      }}
    />
  );
};

/* ============================================
   GRID LINES (Animated)
   ============================================ */
const GridLines: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  const frame = useCurrentFrame();
  const progress = ease(frame, delay, delay + 40, 0, 1);
  const opacity = ease(frame, delay, delay + 20, 0, 0.06);

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", opacity }}>
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={`h${i}`}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: i * 60,
            height: 1,
            background: C.tealGlow,
            transform: `scaleX(${progress})`,
            transformOrigin: "center",
          }}
        />
      ))}
      {Array.from({ length: 35 }).map((_, i) => (
        <div
          key={`v${i}`}
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: i * 60,
            width: 1,
            background: C.tealGlow,
            transform: `scaleY(${progress})`,
            transformOrigin: "center",
          }}
        />
      ))}
    </div>
  );
};

/* ============================================
   SCENE 1: CINEMATIC LOGO REVEAL (0–150)
   "nodes." logo with particle explosion
   ============================================ */
const Scene1_LogoReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Timings
  const lineScale = ease(frame, 20, 50, 0, 1);
  const logoSpring = spring({ frame: frame - 35, fps, config: { damping: 14, mass: 0.8, stiffness: 100 } });
  const dotSpring = spring({ frame: frame - 55, fps, config: { damping: 10, mass: 0.5, stiffness: 200 } });
  const subtitleOpacity = ease(frame, 70, 95, 0, 1);
  const subtitleY = ease(frame, 70, 95, 20, 0);
  const exitOpacity = ease(frame, 130, 150, 1, 0);
  const exitScale = ease(frame, 130, 150, 1, 1.1);

  // Flash effect
  const flashOpacity = frame >= 35 && frame <= 42
    ? interpolate(frame, [35, 38, 42], [0, 0.6, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 0;

  return (
    <AbsoluteFill
      style={{
        background: C.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: exitOpacity,
        transform: `scale(${exitScale})`,
      }}
    >
      <ParticleField />
      <GridLines delay={5} />
      <GlowOrb x={960} y={540} size={600} delay={30} />
      <GlowOrb x={700} y={400} size={300} delay={40} color={C.tealLight} />
      <GlowOrb x={1200} y={600} size={250} delay={50} color={C.tealLight} />

      {/* Horizontal lines */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${C.teal}, transparent)`,
          opacity: lineScale * 0.6,
          scaleX: lineScale,
        }}
      />

      {/* Logo */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div
          style={{
            fontFamily: C.font,
            fontSize: 140,
            fontWeight: 900,
            letterSpacing: -6,
            color: C.white,
            opacity: logoSpring,
            transform: `scale(${interpolate(logoSpring, [0, 1], [0.3, 1])})`,
            textShadow: `0 0 60px ${C.teal}40`,
          }}
        >
          nodes
          <span
            style={{
              color: C.teal,
              opacity: dotSpring,
              display: "inline-block",
              transform: `scale(${interpolate(dotSpring, [0, 1], [3, 1])})`,
              filter: `drop-shadow(0 0 20px ${C.teal})`,
            }}
          >
            .
          </span>
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontFamily: C.font,
            fontSize: 24,
            fontWeight: 400,
            color: C.ink5,
            letterSpacing: 8,
            textTransform: "uppercase",
            opacity: subtitleOpacity,
            transform: `translateY(${subtitleY}px)`,
          }}
        >
          Interactive Learning Platform
        </div>
      </div>

      {/* Flash overlay */}
      <AbsoluteFill
        style={{
          background: C.white,
          opacity: flashOpacity,
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};

/* ============================================
   SCENE 2: PROBLEM STATEMENT (150–330)
   Text reveals with counter
   ============================================ */
const Scene2_Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = ease(frame, 0, 25, 0, 1);
  const title1Y = ease(frame, 10, 35, 60, 0);
  const title1Op = ease(frame, 10, 35, 0, 1);
  const title2Y = ease(frame, 25, 50, 60, 0);
  const title2Op = ease(frame, 25, 50, 0, 1);

  // Counter animation
  const counterProgress = ease(frame, 60, 120, 0, 1);
  const counterVal = Math.round(counterProgress * 85);

  // Pain points
  const painPoints = [
    { icon: "📚", text: "Materi statis & membosankan", delay: 80 },
    { icon: "🔗", text: "Tools terfragmentasi", delay: 95 },
    { icon: "⏰", text: "Feedback yang terlambat", delay: 110 },
  ];

  const exitOp = ease(frame, 155, 180, 1, 0);
  const exitX = ease(frame, 155, 180, 0, -80);

  return (
    <AbsoluteFill
      style={{
        background: C.bg,
        opacity: exitOp,
        transform: `translateX(${exitX}px)`,
      }}
    >
      <ParticleField />
      <GridLines delay={0} />

      {/* Left side — Problem text */}
      <div
        style={{
          position: "absolute",
          left: 120,
          top: "50%",
          transform: "translateY(-50%)",
          width: 800,
          opacity: fadeIn,
        }}
      >
        <div
          style={{
            fontFamily: C.font,
            fontSize: 18,
            fontWeight: 700,
            color: C.teal,
            letterSpacing: 4,
            textTransform: "uppercase",
            marginBottom: 24,
            opacity: title1Op,
          }}
        >
          Masalah Nyata
        </div>

        <div
          style={{
            fontFamily: C.font,
            fontSize: 64,
            fontWeight: 800,
            color: C.white,
            lineHeight: 1.1,
            letterSpacing: -2,
            opacity: title1Op,
            transform: `translateY(${title1Y}px)`,
          }}
        >
          E-Learning lama
        </div>
        <div
          style={{
            fontFamily: C.font,
            fontSize: 64,
            fontWeight: 800,
            color: C.ink5,
            lineHeight: 1.1,
            letterSpacing: -2,
            opacity: title2Op,
            transform: `translateY(${title2Y}px)`,
          }}
        >
          tidak dirancang untuk{" "}
          <span style={{ color: C.teal }}>desainer.</span>
        </div>

        {/* Pain points */}
        <div style={{ marginTop: 48, display: "flex", flexDirection: "column", gap: 16 }}>
          {painPoints.map((p, i) => {
            const s = spring({ frame: frame - p.delay, fps, config: { damping: 15 } });
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  opacity: s,
                  transform: `translateX(${interpolate(s, [0, 1], [40, 0])}px)`,
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: C.tealSoft,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                  }}
                >
                  {p.icon}
                </div>
                <span
                  style={{
                    fontFamily: C.font,
                    fontSize: 22,
                    color: C.ink5,
                    fontWeight: 500,
                  }}
                >
                  {p.text}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right side — Counter stat */}
      <div
        style={{
          position: "absolute",
          right: 160,
          top: "50%",
          transform: "translateY(-50%)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: C.font,
            fontSize: 180,
            fontWeight: 900,
            color: C.teal,
            lineHeight: 1,
            filter: `drop-shadow(0 0 40px ${C.teal}60)`,
          }}
        >
          {counterVal}%
        </div>
        <div
          style={{
            fontFamily: C.font,
            fontSize: 20,
            color: C.ink5,
            fontWeight: 500,
            marginTop: 8,
          }}
        >
          mahasiswa butuh praktik langsung
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ============================================
   SCENE 3: SOLUTION — NODES FEATURES (330–540)
   Feature cards with glowing icons
   ============================================ */
const Scene3_Solution: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOp = ease(frame, 5, 30, 0, 1);
  const titleY = ease(frame, 5, 30, 40, 0);

  const features = [
    { icon: "📖", title: "16 Sesi Terstruktur", desc: "Sesuai kurikulum RPS", delay: 40 },
    { icon: "🎨", title: "Canvas Interaktif", desc: "Praktik langsung di browser", delay: 55 },
    { icon: "👥", title: "Kolaborasi Real-time", desc: "Review & feedback instan", delay: 70 },
    { icon: "📊", title: "Progress Tracking", desc: "Pantau perkembangan belajar", delay: 85 },
  ];

  const exitOp = ease(frame, 185, 210, 1, 0);
  const exitScale = ease(frame, 185, 210, 1, 0.9);

  return (
    <AbsoluteFill
      style={{
        background: C.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: exitOp,
        transform: `scale(${exitScale})`,
      }}
    >
      <ParticleField />
      <GridLines />

      {/* Tag */}
      <div
        style={{
          fontFamily: C.font,
          fontSize: 16,
          fontWeight: 700,
          color: C.teal,
          letterSpacing: 6,
          textTransform: "uppercase",
          marginBottom: 20,
          opacity: titleOp,
        }}
      >
        Solusi
      </div>

      {/* Title */}
      <div
        style={{
          fontFamily: C.font,
          fontSize: 60,
          fontWeight: 800,
          color: C.white,
          textAlign: "center",
          lineHeight: 1.15,
          letterSpacing: -2,
          marginBottom: 60,
          opacity: titleOp,
          transform: `translateY(${titleY}px)`,
        }}
      >
        Satu platform.{" "}
        <span style={{ color: C.teal }}>Semua kebutuhan.</span>
      </div>

      {/* Feature cards */}
      <div
        style={{
          display: "flex",
          gap: 28,
          position: "relative",
          zIndex: 10,
        }}
      >
        {features.map((f, i) => {
          const s = spring({ frame: frame - f.delay, fps, config: { damping: 14, mass: 0.8 } });
          return (
            <div
              key={i}
              style={{
                width: 280,
                padding: "40px 28px",
                borderRadius: 20,
                background: `linear-gradient(135deg, ${C.bgCard}, ${C.ink})`,
                border: `1px solid ${C.ink3}40`,
                opacity: s,
                transform: `translateY(${interpolate(s, [0, 1], [60, 0])}px) scale(${interpolate(s, [0, 1], [0.8, 1])})`,
                boxShadow: `0 0 40px ${C.teal}15`,
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  background: C.tealSoft,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 28,
                  marginBottom: 20,
                  boxShadow: `0 0 20px ${C.teal}30`,
                }}
              >
                {f.icon}
              </div>
              <div
                style={{
                  fontFamily: C.font,
                  fontSize: 22,
                  fontWeight: 700,
                  color: C.white,
                  marginBottom: 8,
                }}
              >
                {f.title}
              </div>
              <div
                style={{
                  fontFamily: C.font,
                  fontSize: 15,
                  color: C.ink5,
                  fontWeight: 400,
                  lineHeight: 1.5,
                }}
              >
                {f.desc}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* ============================================
   SCENE 4: COURSE MODULES (540–690)
   Scrolling module list
   ============================================ */
const Scene4_Modules: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const modules = [
    { num: "01", name: "Pengantar UX", status: "done" },
    { num: "02", name: "Analisis Pengguna", status: "done" },
    { num: "03", name: "Information Architecture", status: "done" },
    { num: "04", name: "Wireframing", status: "done" },
    { num: "05", name: "Color Theory & Accessibility", status: "done" },
    { num: "06", name: "Typography & Readability", status: "done" },
    { num: "07", name: "Visual Hierarchy & Layout", status: "done" },
    { num: "08", name: "UI Components", status: "done" },
    { num: "09", name: "Design System", status: "current" },
    { num: "10", name: "Prototyping", status: "locked" },
    { num: "11", name: "Interaction Design", status: "locked" },
    { num: "12", name: "Usability Testing", status: "locked" },
  ];

  const scrollY = ease(frame, 20, 130, 0, -400);
  const titleOp = ease(frame, 5, 25, 0, 1);
  const exitOp = ease(frame, 125, 150, 1, 0);

  return (
    <AbsoluteFill
      style={{
        background: C.bg,
        display: "flex",
        opacity: exitOp,
      }}
    >
      <ParticleField />

      {/* Left — Title */}
      <div
        style={{
          width: "45%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 80,
        }}
      >
        <div style={{ opacity: titleOp }}>
          <div
            style={{
              fontFamily: C.font,
              fontSize: 16,
              fontWeight: 700,
              color: C.teal,
              letterSpacing: 6,
              textTransform: "uppercase",
              marginBottom: 20,
            }}
          >
            Kurikulum
          </div>
          <div
            style={{
              fontFamily: C.font,
              fontSize: 56,
              fontWeight: 800,
              color: C.white,
              lineHeight: 1.15,
              letterSpacing: -2,
            }}
          >
            16 Sesi
            <br />
            <span style={{ color: C.teal }}>Terstruktur</span>
          </div>
          <div
            style={{
              fontFamily: C.font,
              fontSize: 18,
              color: C.ink5,
              marginTop: 20,
              lineHeight: 1.6,
            }}
          >
            Dari dasar UX hingga prototyping,
            <br />
            sesuai RPS mata kuliah.
          </div>
        </div>
      </div>

      {/* Right — Scrolling modules */}
      <div
        style={{
          width: "55%",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Gradient mask top/bottom */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 120,
            background: `linear-gradient(${C.bg}, transparent)`,
            zIndex: 10,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 120,
            background: `linear-gradient(transparent, ${C.bg})`,
            zIndex: 10,
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            padding: "120px 60px",
            transform: `translateY(${scrollY}px)`,
          }}
        >
          {modules.map((m, i) => {
            const s = spring({ frame: frame - 15 - i * 3, fps, config: { damping: 18 } });
            const isCurrent = m.status === "current";
            const isLocked = m.status === "locked";

            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                  padding: "18px 24px",
                  borderRadius: 14,
                  background: isCurrent
                    ? `linear-gradient(135deg, ${C.teal}20, ${C.teal}08)`
                    : `${C.bgCard}80`,
                  border: isCurrent ? `1px solid ${C.teal}60` : `1px solid ${C.ink3}30`,
                  opacity: interpolate(s, [0, 1], [0, isLocked ? 0.4 : 1]),
                  transform: `translateX(${interpolate(s, [0, 1], [60, 0])}px)`,
                }}
              >
                <div
                  style={{
                    fontFamily: C.font,
                    fontSize: 14,
                    fontWeight: 800,
                    color: isCurrent ? C.teal : C.ink5,
                    width: 36,
                  }}
                >
                  {m.num}
                </div>
                <div
                  style={{
                    fontFamily: C.font,
                    fontSize: 18,
                    fontWeight: isCurrent ? 700 : 500,
                    color: isCurrent ? C.tealGlow : isLocked ? C.ink4 : C.white,
                    flex: 1,
                  }}
                >
                  {m.name}
                </div>
                {isCurrent && (
                  <div
                    style={{
                      padding: "4px 12px",
                      borderRadius: 100,
                      background: C.teal,
                      fontFamily: C.font,
                      fontSize: 11,
                      fontWeight: 700,
                      color: C.white,
                    }}
                  >
                    AKTIF
                  </div>
                )}
                {m.status === "done" && (
                  <div style={{ color: C.teal, fontSize: 18 }}>✓</div>
                )}
                {isLocked && (
                  <div style={{ color: C.ink4, fontSize: 14 }}>🔒</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ============================================
   SCENE 5: FINAL CTA — CLOSING (690–900)
   Logo + tagline + university
   ============================================ */
const Scene5_Closing: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Timings
  const bgFlash = frame >= 0 && frame <= 8
    ? interpolate(frame, [0, 4, 8], [0.8, 0, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 0;

  const logoSpring = spring({ frame: frame - 10, fps, config: { damping: 12, mass: 0.8, stiffness: 100 } });
  const dotSpring = spring({ frame: frame - 25, fps, config: { damping: 8, mass: 0.4, stiffness: 200 } });
  const taglineOp = ease(frame, 40, 65, 0, 1);
  const taglineY = ease(frame, 40, 65, 30, 0);
  const dividerScale = ease(frame, 55, 80, 0, 1);
  const infoOp = ease(frame, 70, 95, 0, 1);
  const infoY = ease(frame, 70, 95, 20, 0);
  const creditsOp = ease(frame, 100, 125, 0, 1);

  // Pulsating glow
  const pulse = 0.6 + 0.4 * Math.sin(frame * 0.06);

  return (
    <AbsoluteFill
      style={{
        background: C.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <ParticleField />
      <GlowOrb x={960} y={540} size={800} delay={5} />

      {/* Central content */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
        }}
      >
        {/* Logo */}
        <div
          style={{
            fontFamily: C.font,
            fontSize: 120,
            fontWeight: 900,
            letterSpacing: -5,
            color: C.white,
            opacity: logoSpring,
            transform: `scale(${interpolate(logoSpring, [0, 1], [0.5, 1])})`,
            textShadow: `0 0 ${60 * pulse}px ${C.teal}50`,
          }}
        >
          nodes
          <span
            style={{
              color: C.teal,
              opacity: dotSpring,
              display: "inline-block",
              transform: `scale(${interpolate(dotSpring, [0, 1], [4, 1])})`,
              filter: `drop-shadow(0 0 ${30 * pulse}px ${C.teal})`,
            }}
          >
            .
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontFamily: C.font,
            fontSize: 28,
            fontWeight: 300,
            color: C.ink5,
            letterSpacing: 2,
            opacity: taglineOp,
            transform: `translateY(${taglineY}px)`,
            marginTop: -10,
          }}
        >
          Belajar desain bukan cuma{" "}
          <span style={{ color: C.white, fontWeight: 600 }}>membaca</span>
          , tapi{" "}
          <span style={{ color: C.teal, fontWeight: 600 }}>membangun</span>.
        </div>

        {/* Divider */}
        <div
          style={{
            width: 200 * dividerScale,
            height: 1,
            background: `linear-gradient(90deg, transparent, ${C.teal}, transparent)`,
            margin: "28px 0",
          }}
        />

        {/* University info */}
        <div
          style={{
            fontFamily: C.font,
            fontSize: 18,
            color: C.ink5,
            textAlign: "center",
            opacity: infoOp,
            transform: `translateY(${infoY}px)`,
            lineHeight: 1.6,
          }}
        >
          Mata Kuliah UI/UX Design
          <br />
          <span style={{ color: C.white, fontWeight: 600 }}>
            Teknik Informatika — Institut Teknologi Indonesia
          </span>
        </div>

        {/* Credits */}
        <div
          style={{
            fontFamily: C.font,
            fontSize: 14,
            color: C.ink4,
            marginTop: 40,
            opacity: creditsOp,
            letterSpacing: 3,
            textTransform: "uppercase",
          }}
        >
          Presentasi Proyek Akhir · 2026
        </div>
      </div>

      {/* Flash */}
      <AbsoluteFill
        style={{
          background: C.white,
          opacity: bgFlash,
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};

/* ============================================
   MAIN COMPOSITION
   ============================================ */
export const NodesIntro: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {/* SFX */}
      <Audio src={staticFile("whoosh.mp3")} startFrom={0} volume={0.4} />
      <Sequence from={35}>
        <Audio src={staticFile("pop.mp3")} volume={0.5} />
      </Sequence>
      <Sequence from={150}>
        <Audio src={staticFile("whoosh.mp3")} volume={0.3} />
      </Sequence>
      <Sequence from={330}>
        <Audio src={staticFile("whoosh.mp3")} volume={0.3} />
      </Sequence>
      <Sequence from={540}>
        <Audio src={staticFile("whoosh.mp3")} volume={0.3} />
      </Sequence>
      <Sequence from={690}>
        <Audio src={staticFile("pop.mp3")} volume={0.5} />
      </Sequence>

      {/* Scenes */}
      <Sequence from={0} durationInFrames={150}>
        <Scene1_LogoReveal />
      </Sequence>

      <Sequence from={150} durationInFrames={180}>
        <Scene2_Problem />
      </Sequence>

      <Sequence from={330} durationInFrames={210}>
        <Scene3_Solution />
      </Sequence>

      <Sequence from={540} durationInFrames={150}>
        <Scene4_Modules />
      </Sequence>

      <Sequence from={690} durationInFrames={210}>
        <Scene5_Closing />
      </Sequence>
    </AbsoluteFill>
  );
};
