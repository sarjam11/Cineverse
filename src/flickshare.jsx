import { useState, useEffect, useRef, useCallback } from "react";

const GENRE_GRADIENT = {
  Action: ["#E50914", "#FF4D4D"], Drama: ["#7C3AED", "#A78BFA"],
  "Science Fiction": ["#0369A1", "#38BDF8"], "Sci-Fi": ["#0369A1", "#38BDF8"],
  Comedy: ["#D97706", "#FCD34D"], Horror: ["#581C87", "#9333EA"],
  Thriller: ["#B91C1C", "#EF4444"], Romance: ["#BE185D", "#F472B6"],
  Animation: ["#047857", "#34D399"], Crime: ["#374151", "#9CA3AF"],
  Fantasy: ["#7E22CE", "#C084FC"], Adventure: ["#B45309", "#FB923C"],
  Mystery: ["#1E3A5F", "#60A5FA"], Documentary: ["#065F46", "#6EE7B7"],
  War: ["#78350F", "#D97706"], Western: ["#92400E", "#F59E0B"],
  Music: ["#DB2777", "#F9A8D4"], History: ["#7C2D12", "#EA580C"],
  Family: ["#059669", "#34D399"], Biography: ["#4338CA", "#818CF8"],
};

const LANGUAGES = [
  { name: "English", flag: "\uD83C\uDDFA\uD83C\uDDF8" },
  { name: "Hindi", flag: "\uD83C\uDDEE\uD83C\uDDF3" },
  { name: "Korean", flag: "\uD83C\uDDF0\uD83C\uDDF7" },
  { name: "Japanese", flag: "\uD83C\uDDEF\uD83C\uDDF5" },
  { name: "French", flag: "\uD83C\uDDEB\uD83C\uDDF7" },
  { name: "Spanish", flag: "\uD83C\uDDEA\uD83C\uDDF8" },
  { name: "Tamil", flag: "\uD83C\uDDEE\uD83C\uDDF3" },
  { name: "Telugu", flag: "\uD83C\uDDEE\uD83C\uDDF3" },
  { name: "German", flag: "\uD83C\uDDE9\uD83C\uDDEA" },
  { name: "Italian", flag: "\uD83C\uDDEE\uD83C\uDDF9" },
  { name: "Chinese", flag: "\uD83C\uDDE8\uD83C\uDDF3" },
  { name: "Portuguese", flag: "\uD83C\uDDE7\uD83C\uDDF7" },
  { name: "Turkish", flag: "\uD83C\uDDF9\uD83C\uDDF7" },
  { name: "Thai", flag: "\uD83C\uDDF9\uD83C\uDDED" },
  { name: "Arabic", flag: "\uD83C\uDDF8\uD83C\uDDE6" },
  { name: "Malayalam", flag: "\uD83C\uDDEE\uD83C\uDDF3" },
  { name: "Kannada", flag: "\uD83C\uDDEE\uD83C\uDDF3" },
  { name: "Bengali", flag: "\uD83C\uDDEE\uD83C\uDDF3" },
  { name: "Russian", flag: "\uD83C\uDDF7\uD83C\uDDFA" },
  { name: "Swedish", flag: "\uD83C\uDDF8\uD83C\uDDEA" },
];

const MORE_LANGUAGES = [
  { name: "Marathi", flag: "\uD83C\uDDEE\uD83C\uDDF3" },
  { name: "Punjabi", flag: "\uD83C\uDDEE\uD83C\uDDF3" },
  { name: "Gujarati", flag: "\uD83C\uDDEE\uD83C\uDDF3" },
  { name: "Urdu", flag: "\uD83C\uDDF5\uD83C\uDDF0" },
  { name: "Polish", flag: "\uD83C\uDDF5\uD83C\uDDF1" },
  { name: "Dutch", flag: "\uD83C\uDDF3\uD83C\uDDF1" },
  { name: "Danish", flag: "\uD83C\uDDE9\uD83C\uDDF0" },
  { name: "Norwegian", flag: "\uD83C\uDDF3\uD83C\uDDF4" },
  { name: "Finnish", flag: "\uD83C\uDDEB\uD83C\uDDEE" },
  { name: "Greek", flag: "\uD83C\uDDEC\uD83C\uDDF7" },
  { name: "Czech", flag: "\uD83C\uDDE8\uD83C\uDDFF" },
  { name: "Romanian", flag: "\uD83C\uDDF7\uD83C\uDDF4" },
  { name: "Hungarian", flag: "\uD83C\uDDED\uD83C\uDDFA" },
  { name: "Vietnamese", flag: "\uD83C\uDDFB\uD83C\uDDF3" },
  { name: "Indonesian", flag: "\uD83C\uDDEE\uD83C\uDDE9" },
  { name: "Malay", flag: "\uD83C\uDDF2\uD83C\uDDFE" },
  { name: "Filipino", flag: "\uD83C\uDDF5\uD83C\uDDED" },
  { name: "Hebrew", flag: "\uD83C\uDDEE\uD83C\uDDF1" },
  { name: "Persian", flag: "\uD83C\uDDEE\uD83C\uDDF7" },
  { name: "Ukrainian", flag: "\uD83C\uDDFA\uD83C\uDDE6" },
  { name: "Serbian", flag: "\uD83C\uDDF7\uD83C\uDDF8" },
  { name: "Croatian", flag: "\uD83C\uDDED\uD83C\uDDF7" },
  { name: "Swahili", flag: "\uD83C\uDDF0\uD83C\uDDEA" },
  { name: "Nepali", flag: "\uD83C\uDDF3\uD83C\uDDF5" },
  { name: "Sinhala", flag: "\uD83C\uDDF1\uD83C\uDDF0" },
  { name: "Icelandic", flag: "\uD83C\uDDEE\uD83C\uDDF8" },
  { name: "Georgian", flag: "\uD83C\uDDEC\uD83C\uDDEA" },
  { name: "Catalan", flag: "\uD83C\uDDEA\uD83C\uDDF8" },
  { name: "Amharic", flag: "\uD83C\uDDEA\uD83C\uDDF9" },
  { name: "Yoruba", flag: "\uD83C\uDDF3\uD83C\uDDEC" },
];

const REACTION_EMOJIS = ["\u{1F525}", "\u{1F37F}", "\u{2764}\u{FE0F}", "\u{1F602}", "\u{1F440}", "\u{1F4AF}"];
const genId = () => Math.random().toString(36).slice(2, 10);
const timeAgo = (ts) => {
  const d = Date.now() - ts;
  if (d < 60000) return "now";
  if (d < 3600000) return Math.floor(d / 60000) + "m";
  if (d < 86400000) return Math.floor(d / 3600000) + "h";
  return Math.floor(d / 86400000) + "d";
};

const S = {
  bg: "#0B0B12", bgPanel: "#111119", bgCard: "#1A1A26", bgHover: "#22222F",
  bgActive: "#2A2A3A", accent: "#E50914", accentSoft: "#FF4D5A",
  purple: "#B388FF", green: "#4ADE80", blue: "#60A5FA", amber: "#FBBF24",
  text: "#EEEEF2", textSec: "#8888A0", textMuted: "#555568",
  border: "#252535", radius: 12, radiusSm: 8,
};

const Icon = ({ name, size = 20, color = S.textSec }) => {
  const p = { stroke: color, strokeWidth: "2", fill: "none", strokeLinecap: "round", strokeLinejoin: "round" };
  const icons = {
    search: <><circle cx="11" cy="11" r="8" {...p}/><path d="M21 21l-4.35-4.35" {...p}/></>,
    film: <><rect x="2" y="2" width="20" height="20" rx="2" ry="2" {...p}/><path d="M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 17h5M17 7h5" stroke={color} strokeWidth="1.5" fill="none"/></>,
    back: <path d="M19 12H5M12 19l-7-7 7-7" {...p}/>,
    x: <path d="M18 6L6 18M6 6l12 12" {...p}/>,
    star: <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill={color} stroke="none"/>,
    logout: <><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" {...p}/><path d="M16 17l5-5-5-5M21 12H9" {...p}/></>,
    group: <><circle cx="9" cy="7" r="3" {...p}/><circle cx="17" cy="7" r="3" {...p}/><path d="M2 21v-1a5 5 0 015-5h4a5 5 0 015 5v1" {...p}/></>,
    chat: <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" {...p}/>,
    menu: <path d="M3 12h18M3 6h18M3 18h18" {...p}/>,
    bookmark: <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" {...p}/>,
    bookmarkFill: <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" fill={color} stroke={color} strokeWidth="2"/>,
    globe: <><circle cx="12" cy="12" r="10" {...p}/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" {...p}/></>,
    zap: <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill={color} stroke={color} strokeWidth="1"/>,
    check: <path d="M20 6L9 17l-5-5" {...p}/>,
    smile: <><circle cx="12" cy="12" r="10" {...p}/><path d="M8 14s1.5 2 4 2 4-2 4-2" {...p}/><line x1="9" y1="9" x2="9.01" y2="9" {...p}/><line x1="15" y1="9" x2="15.01" y2="9" {...p}/></>,
    compass: <><circle cx="12" cy="12" r="10" {...p}/><path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" {...p}/></>,
    send: <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" {...p}/>,
    user: <><circle cx="12" cy="8" r="4" {...p}/><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" {...p}/></>,
    grid: <><rect x="3" y="3" width="7" height="7" {...p}/><rect x="14" y="3" width="7" height="7" {...p}/><rect x="3" y="14" width="7" height="7" {...p}/><rect x="14" y="14" width="7" height="7" {...p}/></>,
    settings: <><circle cx="12" cy="12" r="3" {...p}/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" {...p}/></>,
    heart: <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" {...p}/>,
    eye: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" {...p}/><circle cx="12" cy="12" r="3" {...p}/></>,
    bell: <><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" {...p}/><path d="M13.73 21a2 2 0 01-3.46 0" {...p}/></>,
    list: <><line x1="8" y1="6" x2="21" y2="6" {...p}/><line x1="8" y1="12" x2="21" y2="12" {...p}/><line x1="8" y1="18" x2="21" y2="18" {...p}/><line x1="3" y1="6" x2="3.01" y2="6" {...p}/><line x1="3" y1="12" x2="3.01" y2="12" {...p}/><line x1="3" y1="18" x2="3.01" y2="18" {...p}/></>,
    signal: <><path d="M22 12h-4l-3 9L9 3l-3 9H2" {...p}/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>{icons[name]}</svg>;
};

function Avatar({ user, size = 40 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%",
      background: `linear-gradient(135deg, ${user.color || S.accent}, ${user.color || S.accent}aa)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontWeight: 700, fontSize: size * 0.35, flexShrink: 0, textTransform: "uppercase",
    }}>{user.avatar || user.displayName?.slice(0, 2) || "?"}</div>
  );
}

function MoviePoster({ movie, size = "normal" }) {
  const w = size === "compact" ? 48 : 64;
  const h = size === "compact" ? 72 : 96;
  const g1 = "#7C3AED", g2 = "#A78BFA";
  const [imgErr, setImgErr] = useState(false);

  if (movie.poster && !imgErr) {
    return <img src={movie.poster} alt="" onError={() => setImgErr(true)}
      style={{ width: w, height: h, borderRadius: 6, objectFit: "cover", flexShrink: 0, background: g1 + "33" }} />;
  }

  const hash = (movie.title || "").split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const angle = (hash % 60) + 130;
  const isC = size === "compact";
  return (
    <div style={{
      width: w, height: h, borderRadius: 6, flexShrink: 0,
      background: `linear-gradient(${angle}deg, ${g1}, ${g2})`,
      position: "relative", overflow: "hidden",
      boxShadow: `0 2px 10px ${g1}40`,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.1,
        backgroundImage: `radial-gradient(circle at 30% 20%, rgba(255,255,255,0.4) 0%, transparent 50%)` }} />
      <span style={{ fontSize: isC ? 24 : 32, fontWeight: 900, color: "#fff", zIndex: 1,
        textShadow: "0 2px 8px rgba(0,0,0,0.4)", fontFamily: "Georgia, 'Times New Roman', serif",
      }}>{movie.title?.charAt(0) || "?"}</span>
      {movie.year && <span style={{ fontSize: isC ? 8 : 10, fontWeight: 700,
        color: "rgba(255,255,255,0.7)", marginTop: 2, zIndex: 1, letterSpacing: 1 }}>{movie.year}</span>}
    </div>
  );
}

function MovieCard({ movie, compact, onShare, onDetail, shared, reactions, onReact, currentUser, onToggleWatchlist, inWatchlist, ratings, onRate, reviews, onReview, watchedBy, onWatched }) {
  const [showReactions, setShowReactions] = useState(false);
  const [watchlistExpanded, setWatchlistExpanded] = useState(false);
  const g1 = "#7C3AED";
  const reactionCounts = {};
  if (reactions) Object.entries(reactions).forEach(([e, u]) => { if (u.length > 0) reactionCounts[e] = u; });

  // Detect if this is a shared watchlist
  let watchlistMovies = null;
  if (shared?.note && typeof shared.note === "string" && shared.note.startsWith("[")) {
    try {
      const parsed = JSON.parse(shared.note);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].title) watchlistMovies = parsed;
    } catch {}
  }

  const clickHandler = onShare || (onDetail && !watchlistMovies ? () => onDetail(movie) : null);

  return (
    <div style={{
      background: compact ? S.bgCard : `linear-gradient(135deg, #7C3AED12, transparent)`,
      border: `1px solid ${compact ? S.border : "#7C3AED25"}`,
      borderRadius: S.radius, padding: compact ? 12 : 16,
      display: "flex", flexDirection: "column", maxWidth: 440,
      transition: "transform 0.15s, border-color 0.15s", cursor: clickHandler ? "pointer" : "default",
    }}
      onClick={clickHandler}
      onMouseEnter={e => { if (clickHandler) { e.currentTarget.style.transform = "scale(1.02)"; e.currentTarget.style.borderColor = "#7C3AED55"; } if (onReact) setShowReactions(true); }}
      onMouseLeave={e => { if (clickHandler) { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.borderColor = compact ? S.border : "#7C3AED25"; } setShowReactions(false); }}
    >
      <div style={{ display: "flex", gap: compact ? 10 : 14, alignItems: "flex-start" }}>
        <MoviePoster movie={movie} size={compact ? "compact" : "normal"} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
            <div style={{ flex: 1, color: S.text, fontWeight: 600, fontSize: compact ? 13 : 15, lineHeight: 1.3,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: compact ? "nowrap" : "normal" }}>
              {movie.title}
            </div>
            {onToggleWatchlist && (
              <button onClick={(e) => { e.stopPropagation(); onToggleWatchlist(movie); }}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 2, flexShrink: 0 }}>
                <Icon name={inWatchlist ? "bookmarkFill" : "bookmark"} size={16} color={inWatchlist ? S.amber : S.textMuted} />
              </button>
            )}
          </div>
          <div style={{ color: S.textSec, fontSize: compact ? 11 : 12, marginTop: 3 }}>
            {movie.year}{movie.genre ? ` \u00B7 ${movie.genre}` : ""}{movie.director ? ` \u00B7 ${movie.director}` : ""}
            {movie.media_type === "tv" && <span style={{ marginLeft: 4, color: S.blue, fontSize: 10, fontWeight: 700, background: S.blue + "18", padding: "1px 5px", borderRadius: 3 }}>TV</span>}
          </div>
          {movie.rating && (
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
              <Icon name="star" size={compact ? 12 : 14} color={S.amber} />
              <span style={{ color: S.amber, fontSize: compact ? 11 : 13, fontWeight: 700 }}>{movie.rating}</span>
              
            </div>
          )}
          {movie.overview && !compact && (
            <div style={{ color: S.textMuted, fontSize: 11, marginTop: 6, lineHeight: 1.4,
              display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {movie.overview}
            </div>
          )}
          {shared?.note && !watchlistMovies && (
            <div style={{ color: S.textSec, fontSize: 12, marginTop: 8, fontStyle: "italic",
              borderLeft: `2px solid ${g1}66`, paddingLeft: 8 }}>"{shared.note}"</div>
          )}
        </div>
        {onShare && <div style={{ color: S.accent, fontSize: 11, fontWeight: 600, flexShrink: 0, marginTop: 2 }}>Share {"\u2192"}</div>}
        {onDetail && !onShare && !watchlistMovies && <div style={{ color: S.purple, fontSize: 11, fontWeight: 600, flexShrink: 0, marginTop: 2 }}>View {"\u2192"}</div>}
      </div>
      {/* Shared watchlist - click to open full modal */}
      {watchlistMovies && (
        <div style={{ marginTop: 10 }}>
          <button onClick={(e) => { e.stopPropagation(); setWatchlistExpanded(!watchlistExpanded); }}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 18px", width: "100%",
              background: `linear-gradient(135deg, ${S.purple}22, ${S.accent}15)`,
              border: `1px solid ${S.purple}44`, borderRadius: S.radiusSm, cursor: "pointer",
              transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = S.purple; e.currentTarget.style.transform = "scale(1.01)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = S.purple + "44"; e.currentTarget.style.transform = "scale(1)"; }}>
            <span style={{ fontSize: 20 }}>{"\uD83C\uDFAC"}</span>
            <span style={{ color: S.text, fontSize: 15, fontWeight: 700, flex: 1, textAlign: "left" }}>
              View {watchlistMovies.length} movies
            </span>
            <span style={{ color: S.purple, fontSize: 13, fontWeight: 600 }}>Open {"\u2192"}</span>
          </button>
        </div>
      )}
      {/* Full-screen watchlist modal */}
      {watchlistMovies && watchlistExpanded && (
        <div style={{ position: "fixed", inset: 0, zIndex: 120, display: "flex", alignItems: "center",
          justifyContent: "center", background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)", padding: 16 }}
          onClick={e => e.target === e.currentTarget && setWatchlistExpanded(false)}>
          <div style={{ background: S.bgPanel, borderRadius: S.radius + 4, width: "100%", maxWidth: 620,
            maxHeight: "90vh", display: "flex", flexDirection: "column", border: `1px solid ${S.border}`, overflow: "hidden" }}>
            {/* Header */}
            <div style={{ padding: "20px 24px", borderBottom: `1px solid ${S.border}`,
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: `linear-gradient(135deg, ${S.purple}15, transparent)` }}>
              <div>
                <div style={{ color: S.textMuted, fontSize: 11, fontWeight: 600, textTransform: "uppercase",
                  letterSpacing: 1, marginBottom: 4 }}>{movie.title?.includes("Watchlist") ? "Shared Watchlist" : "Shared List"}</div>
                <h2 style={{ color: S.text, margin: 0, fontWeight: 800, fontSize: 20 }}>
                  {movie.title}
                </h2>
                <div style={{ color: S.textSec, fontSize: 13, marginTop: 4 }}>
                  {watchlistMovies.length} movies
                </div>
              </div>
              <button onClick={() => setWatchlistExpanded(false)}
                style={{ background: "rgba(0,0,0,0.3)", border: "none", cursor: "pointer", padding: 8, borderRadius: 8 }}>
                <Icon name="x" size={20} color="#fff" /></button>
            </div>
            {/* Movie list */}
            <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 10 }}>
                {watchlistMovies.map((m, i) => (
                  <div key={m.id || i} onClick={() => { setWatchlistExpanded(false); if (onDetail) onDetail(m); }}
                    style={{ display: "flex", gap: 14, alignItems: "center", padding: 14,
                      background: S.bgCard, borderRadius: S.radius, border: `1px solid ${S.border}`,
                      cursor: onDetail ? "pointer" : "default", transition: "all 0.15s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = S.purple; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 4px 16px ${S.purple}22`; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = S.border; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                    {m.poster ? (
                      <img src={m.poster} alt="" style={{ width: 60, height: 90, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
                    ) : (
                      <MoviePoster movie={m} size="normal" />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: S.text, fontWeight: 700, fontSize: 15, overflow: "hidden",
                        textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.title}</div>
                      <div style={{ color: S.textSec, fontSize: 12, marginTop: 4 }}>
                        {m.year}{m.genre ? ` \u00B7 ${m.genre}` : ""}</div>
                      {m.director && <div style={{ color: S.textMuted, fontSize: 11, marginTop: 2 }}>{m.director}</div>}
                      {m.rating && (
                        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 5 }}>
                          <Icon name="star" size={13} color={S.amber} />
                          <span style={{ color: S.amber, fontSize: 14, fontWeight: 800 }}>{m.rating}</span>
                          <span style={{ color: S.textMuted, fontSize: 11 }}>/10</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {Object.keys(reactionCounts).length > 0 && (
        <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap", paddingLeft: compact ? 62 : 86 }}>
          {Object.entries(reactionCounts).map(([emoji, users]) => {
            const mine = users.includes(currentUser);
            return (
              <button key={emoji} onClick={(e) => { e.stopPropagation(); onReact?.(emoji); }}
                style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 8px",
                  borderRadius: 20, border: `1px solid ${mine ? S.accent + "66" : S.border}`,
                  background: mine ? S.accent + "18" : S.bgCard, cursor: onReact ? "pointer" : "default",
                  fontSize: 13, transition: "all 0.15s" }}
                title={users.join(", ")}>
                <span>{emoji}</span>
                <span style={{ color: mine ? S.accent : S.textSec, fontSize: 11, fontWeight: 600 }}>{users.length}</span>
              </button>
            );
          })}
        </div>
      )}
      {onReact && showReactions && (
        <div style={{ display: "flex", gap: 2, marginTop: 8, paddingLeft: compact ? 62 : 86 }}>
          {REACTION_EMOJIS.map(emoji => (
            <button key={emoji} onClick={(e) => { e.stopPropagation(); onReact(emoji); }}
              style={{ background: S.bgCard, border: `1px solid ${S.border}`, borderRadius: 8,
                padding: "4px 7px", cursor: "pointer", fontSize: 15, transition: "all 0.12s", lineHeight: 1 }}
              onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.25)"; e.currentTarget.style.background = S.bgHover; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.background = S.bgCard; }}>
              {emoji}
            </button>
          ))}
        </div>
      )}
      {/* Rating section */}
      {onRate && (
        <div style={{ marginTop: 10, paddingLeft: compact ? 62 : 86 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: S.textMuted, fontSize: 11, fontWeight: 600 }}>Rate:</span>
            <input type="range" min="1" max="10" step="0.5"
              value={ratings?.[currentUser] || 5}
              onChange={(e) => { e.stopPropagation(); onRate(parseFloat(e.target.value)); }}
              onClick={(e) => e.stopPropagation()}
              style={{ flex: 1, maxWidth: 180, height: 4, appearance: "none", WebkitAppearance: "none",
                background: `linear-gradient(to right, ${S.amber} ${((ratings?.[currentUser] || 5) - 1) / 9 * 100}%, ${S.border} ${((ratings?.[currentUser] || 5) - 1) / 9 * 100}%)`,
                borderRadius: 4, outline: "none", cursor: "pointer" }} />
            <span style={{ color: S.amber, fontSize: 16, fontWeight: 800, minWidth: 28, textAlign: "center" }}>
              {ratings?.[currentUser] || "-"}
            </span>
            <span style={{ color: S.textMuted, fontSize: 11 }}>/10</span>
          </div>
          {ratings && Object.keys(ratings).length > 0 && (
            <div style={{ display: "flex", gap: 12, marginTop: 6, flexWrap: "wrap" }}>
              {Object.entries(ratings).map(([username, rating]) => (
                <div key={username} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ color: S.textSec, fontSize: 11 }}>
                    {username === currentUser ? "You" : username}:
                  </span>
                  <span style={{ color: S.amber, fontSize: 12, fontWeight: 800 }}>{rating}</span>
                  <span style={{ color: S.textMuted, fontSize: 10 }}>/10</span>
                </div>
              ))}
            </div>
          )}
          <style>{`
            input[type="range"]::-webkit-slider-thumb {
              -webkit-appearance: none; appearance: none;
              width: 16px; height: 16px; border-radius: 50%;
              background: ${S.amber}; cursor: pointer;
              box-shadow: 0 0 8px ${S.amber}66;
              transition: transform 0.15s;
            }
            input[type="range"]::-webkit-slider-thumb:hover {
              transform: scale(1.3);
              box-shadow: 0 0 14px ${S.amber}88;
            }
            input[type="range"]::-moz-range-thumb {
              width: 16px; height: 16px; border-radius: 50%; border: none;
              background: ${S.amber}; cursor: pointer;
              box-shadow: 0 0 8px ${S.amber}66;
            }
          `}</style>
        </div>
      )}
      {/* Review section */}
      {onReview && (
        <div style={{ marginTop: 8, paddingLeft: compact ? 62 : 86 }}>
          {reviews && Object.keys(reviews).length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 8 }}>
              {Object.entries(reviews).map(([username, text]) => (
                <div key={username} style={{ background: S.bgCard, borderRadius: 8, padding: "8px 12px",
                  border: `1px solid ${S.border}` }}>
                  <span style={{ color: S.purple, fontSize: 11, fontWeight: 700 }}>
                    {username === currentUser ? "You" : username}
                  </span>
                  <p style={{ color: S.text, fontSize: 12, margin: "4px 0 0", lineHeight: 1.5 }}>{text}</p>
                </div>
              ))}
            </div>
          )}
          {!reviews?.[currentUser] && (
            <div style={{ display: "flex", gap: 6 }} onClick={e => e.stopPropagation()}>
              <input placeholder="Write a short review..."
                id={`review-${shared?.id}`}
                style={{ flex: 1, padding: "7px 10px", borderRadius: 6, border: `1px solid ${S.border}`,
                  background: S.bgCard, color: S.text, fontSize: 12, outline: "none" }}
                onKeyDown={e => { if (e.key === "Enter" && e.target.value.trim()) { onReview(e.target.value.trim()); e.target.value = ""; }}} />
              <button onClick={() => {
                  const input = document.getElementById(`review-${shared?.id}`);
                  if (input?.value.trim()) { onReview(input.value.trim()); input.value = ""; }
                }}
                style={{ padding: "7px 12px", borderRadius: 6, border: "none", cursor: "pointer",
                  background: S.purple, color: "#fff", fontSize: 11, fontWeight: 600 }}>Post</button>
            </div>
          )}
        </div>
      )}
      {/* Watched together */}
      {onWatched && (
        <div style={{ marginTop: 8, paddingLeft: compact ? 62 : 86, display: "flex", alignItems: "center", gap: 8 }}
          onClick={e => e.stopPropagation()}>
          <button onClick={() => onWatched()}
            style={{ padding: "5px 12px", borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 600,
              border: `1px solid ${watchedBy?.includes(currentUser) ? S.green : S.border}`,
              background: watchedBy?.includes(currentUser) ? S.green + "15" : "transparent",
              color: watchedBy?.includes(currentUser) ? S.green : S.textSec,
              display: "flex", alignItems: "center", gap: 5, transition: "all 0.15s" }}>
            {watchedBy?.includes(currentUser) ? "\u2713" : "\u25B6"} Watched Together
          </button>
          {watchedBy?.length > 0 && (
            <span style={{ color: S.textMuted, fontSize: 11 }}>
              {watchedBy.map(u => u === currentUser ? "you" : u).join(" & ")}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/* ======================== MOVIE API FUNCTIONS ======================== */

function mapMovie(m, i, prefix = "imdb") {
  return {
    id: m.tmdb_id || m.id || `${prefix}-${i}-${Date.now()}`,
    title: m.title || "Unknown",
    year: m.year ?? "",
    rating: m.rating != null ? parseFloat(m.rating) || null : null,
    genre: m.genre || "",
    director: m.director || "",
    imdb_id: m.imdb_id || null,
    overview: m.overview || "",
    poster: m.poster || null,
    tmdb_id: m.tmdb_id || m.id || null,
    media_type: m.media_type || "movie",
  };
}

async function searchIMDB(query, type = "all") {
  const res = await fetch("/api/movies/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, type }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Search failed (${res.status})`);
  }
  const movies = await res.json();
  return Array.isArray(movies) ? movies.map((m, i) => mapMovie(m, i, "imdb")) : [];
}

async function searchGenreIMDB(selection, round = 0, type = "movie", filters = {}) {
  const { genres, language } = typeof selection === "object" && !Array.isArray(selection)
    ? selection
    : { genres: Array.isArray(selection) ? selection : [selection], language: null };
  const body = { page: round * 3 + 1, type };
  if (genres && genres.length > 0) body.genre = genres.join(",");
  if (language) body.language = language;
  if (filters.yearFrom) body.yearFrom = parseInt(filters.yearFrom);
  if (filters.yearTo) body.yearTo = parseInt(filters.yearTo);
  if (filters.minRating) body.minRating = parseFloat(filters.minRating);
  if (filters.sortBy && filters.sortBy !== "popularity") body.sortBy = filters.sortBy;

  const res = await fetch("/api/movies/browse", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) return [];
  const movies = await res.json();
  return Array.isArray(movies) ? movies.map((m, i) => mapMovie(m, i, "genre")) : [];
}

async function searchIMDBLarge(query) {
  return searchIMDB(query);
}

async function fetchMovieDetails(title, year, tmdbId, mediaType = "movie") {
  const res = await fetch("/api/movies/details", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, year, tmdb_id: tmdbId, media_type: mediaType }),
  });
  if (!res.ok) throw new Error("Failed to fetch details");
  return await res.json();
}

async function fetchTrending(type = "all") {
  const res = await fetch(`/api/movies/trending?type=${type}`);
  if (!res.ok) return [];
  const movies = await res.json();
  return Array.isArray(movies) ? movies.map((m, i) => mapMovie(m, i, "trend")) : [];
}

async function fetchActorMovies(name, role = "starring") {
  const res = await fetch("/api/movies/person", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, role }),
  });
  if (!res.ok) return [];
  const movies = await res.json();
  return Array.isArray(movies) ? movies.map((m, i) => mapMovie(m, i, "person")) : [];
}

/* ======================== AUTH SCREEN ======================== */

function UsernameCheck({ username }) {
  const [status, setStatus] = useState(null);
  useEffect(() => {
    setStatus(null);
    if (username.length < 3) return;
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/check-username/${username.toLowerCase()}`);
        const data = await res.json();
        setStatus(data.available ? "available" : "taken");
      } catch { setStatus(null); }
    }, 300);
    return () => clearTimeout(t);
  }, [username]);
  if (!status) return null;
  return (
    <div style={{ position: "absolute", right: 12, top: 12 }}>
      {status === "taken"
        ? <span style={{ color: S.accent, fontSize: 11, fontWeight: 600 }}>{"\u2717"} Taken</span>
        : <span style={{ color: S.green, fontSize: 11, fontWeight: 600 }}>{"\u2713"} Available</span>}
    </div>
  );
}

function AuthScreen({ onAuth, allUsers }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [securityQ, setSecurityQ] = useState("");
  const [securityA, setSecurityA] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  // Recovery state
  const [recoverStep, setRecoverStep] = useState(1);
  const [recoverQuestion, setRecoverQuestion] = useState("");
  const [recoverAnswer, setRecoverAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [recoverSuccess, setRecoverSuccess] = useState(false);

  const securityQuestions = [
    "What was the first movie you saw in a theatre?",
    "Who is your all-time favourite actor?",
    "What movie can you watch over and over?",
    "What's your favourite movie soundtrack?",
    "What was your childhood favourite cartoon?",
  ];

  const handleSubmit = async () => {
    if (!username.trim() || !password.trim()) { setError("Fill in all fields"); return; }
    setSubmitting(true);
    setError("");
    try {
      if (mode === "register") {
        if (!displayName.trim()) { setError("Enter a display name"); setSubmitting(false); return; }
        if (!securityQ || !securityA.trim()) { setError("Set a security question for account recovery"); setSubmitting(false); return; }
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: username.trim(), displayName: displayName.trim(), password, securityQuestion: securityQ, securityAnswer: securityA.trim() }),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error || "Registration failed"); setSubmitting(false); return; }
        onAuth({
          username: data.user.username, displayName: data.user.displayName,
          avatar: data.user.avatar, color: data.user.color,
        }, true, data.token);
      } else {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: username.trim(), password }),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error || "Login failed"); setSubmitting(false); return; }
        onAuth({
          username: data.user.username, displayName: data.user.displayName,
          avatar: data.user.avatar, color: data.user.color,
        }, false, data.token);
      }
    } catch (err) {
      setError("Could not connect to server");
    }
    setSubmitting(false);
  };

  const handleRecover = async () => {
    setError("");
    setSubmitting(true);
    try {
      if (recoverStep === 1) {
        if (!username.trim()) { setError("Enter your username"); setSubmitting(false); return; }
        const res = await fetch("/api/auth/recover/question", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: username.trim() }),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error || "Could not find account"); setSubmitting(false); return; }
        setRecoverQuestion(data.question);
        setRecoverStep(2);
      } else {
        if (!recoverAnswer.trim() || !newPassword.trim()) { setError("Fill in all fields"); setSubmitting(false); return; }
        const res = await fetch("/api/auth/recover/reset", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: username.trim(), answer: recoverAnswer.trim(), newPassword: newPassword }),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error || "Reset failed"); setSubmitting(false); return; }
        setRecoverSuccess(true);
      }
    } catch { setError("Could not connect to server"); }
    setSubmitting(false);
  };

  const inp = { width: "100%", padding: "12px 14px", marginBottom: 12, borderRadius: S.radiusSm,
    background: S.bg, border: `1px solid ${S.border}`, color: S.text, fontSize: 14, outline: "none", boxSizing: "border-box" };
  return (
    <div style={{ minHeight: "100vh", background: S.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 12 }}>
            <Icon name="film" size={32} color={S.accent} />
            <span style={{ fontSize: 28, fontWeight: 800, color: S.text, letterSpacing: "-0.5px" }}>CineVerse</span>
          </div>
          <p style={{ color: S.textSec, fontSize: 14, margin: 0 }}>Watch solo. Vibe together.</p>
        </div>
        <div style={{ background: S.bgPanel, borderRadius: S.radius + 4, padding: 28, border: `1px solid ${S.border}` }}>
          {mode === "recover" ? (
            <>
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ color: S.text, fontSize: 17, fontWeight: 700, margin: "0 0 4px" }}>Account Recovery</h3>
                <p style={{ color: S.textMuted, fontSize: 12, margin: 0 }}>{recoverSuccess ? "Password reset successfully!" : recoverStep === 1 ? "Enter your username to get started" : "Answer your security question"}</p>
              </div>
              {recoverSuccess ? (
                <button onClick={() => { setMode("login"); setRecoverStep(1); setRecoverSuccess(false); setRecoverAnswer(""); setNewPassword(""); setError(""); }}
                  style={{ width: "100%", padding: "13px 0", border: "none", borderRadius: S.radiusSm,
                    background: S.green, color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
                  Back to Sign In</button>
              ) : recoverStep === 1 ? (
                <>
                  <input placeholder="Username" value={username} onChange={e => { setUsername(e.target.value); setError(""); }} style={inp} />
                  {error && <div style={{ color: S.accent, fontSize: 12, marginBottom: 12, textAlign: "center" }}>{error}</div>}
                  <button onClick={handleRecover} disabled={submitting}
                    style={{ width: "100%", padding: "13px 0", border: "none", borderRadius: S.radiusSm,
                      background: S.purple, color: "#fff", fontWeight: 700, fontSize: 15, cursor: submitting ? "default" : "pointer", opacity: submitting ? 0.7 : 1 }}>
                    {submitting ? "Looking up..." : "Find My Account"}</button>
                </>
              ) : (
                <>
                  <div style={{ padding: "12px 14px", marginBottom: 12, borderRadius: S.radiusSm,
                    background: S.purple + "12", border: `1px solid ${S.purple}33`, color: S.text, fontSize: 13 }}>
                    {recoverQuestion}</div>
                  <input placeholder="Your answer" value={recoverAnswer} onChange={e => { setRecoverAnswer(e.target.value); setError(""); }} style={inp} />
                  <input placeholder="New password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={inp} />
                  {error && <div style={{ color: S.accent, fontSize: 12, marginBottom: 12, textAlign: "center" }}>{error}</div>}
                  <button onClick={handleRecover} disabled={submitting}
                    style={{ width: "100%", padding: "13px 0", border: "none", borderRadius: S.radiusSm,
                      background: S.purple, color: "#fff", fontWeight: 700, fontSize: 15, cursor: submitting ? "default" : "pointer", opacity: submitting ? 0.7 : 1 }}>
                    {submitting ? "Resetting..." : "Reset Password"}</button>
                </>
              )}
              {!recoverSuccess && (
                <button onClick={() => { setMode("login"); setRecoverStep(1); setError(""); }}
                  style={{ width: "100%", marginTop: 12, padding: 8, border: "none", background: "transparent",
                    color: S.textSec, fontSize: 12, cursor: "pointer" }}>Back to Sign In</button>
              )}
            </>
          ) : (
            <>
              <div style={{ display: "flex", marginBottom: 24, background: S.bg, borderRadius: S.radiusSm, padding: 3 }}>
                {["login", "register"].map(m => (
                  <button key={m} onClick={() => { setMode(m); setError(""); }}
                    style={{ flex: 1, padding: "10px 0", border: "none", borderRadius: 6, cursor: "pointer",
                      background: mode === m ? S.accent : "transparent", color: mode === m ? "#fff" : S.textSec,
                      fontWeight: 600, fontSize: 13, transition: "all 0.2s" }}>
                    {m === "login" ? "Sign In" : "Create Account"}</button>
                ))}
              </div>
              {mode === "register" && <input placeholder="Display Name" value={displayName} onChange={e => setDisplayName(e.target.value)} style={inp} />}
              <div style={{ position: "relative" }}>
                <input placeholder="Username" value={username} onChange={e => { setUsername(e.target.value); setError(""); }} style={inp} />
                {mode === "register" && username.trim().length >= 3 && (
                  <UsernameCheck username={username.trim()} />
                )}
              </div>
              <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && mode === "login" && handleSubmit()} style={{ ...inp, marginBottom: mode === "register" ? 12 : (error ? 8 : 12) }} />
              {mode === "register" && (
                <>
                  <select value={securityQ} onChange={e => setSecurityQ(e.target.value)}
                    style={{ ...inp, color: securityQ ? S.text : S.textMuted, cursor: "pointer", appearance: "auto" }}>
                    <option value="" disabled>Security question...</option>
                    {securityQuestions.map(q => <option key={q} value={q}>{q}</option>)}
                  </select>
                  {securityQ && <input placeholder="Your answer" value={securityA} onChange={e => setSecurityA(e.target.value)} style={inp} />}
                </>
              )}
              {mode === "login" && (
                <button onClick={() => { setMode("recover"); setRecoverStep(1); setError(""); setRecoverSuccess(false); }}
                  style={{ display: "block", width: "100%", padding: 4, marginBottom: 12, border: "none",
                    background: "transparent", color: S.purple, fontSize: 12, cursor: "pointer", textAlign: "right" }}>
                  Forgot password?</button>
              )}
              {error && <div style={{ color: S.accent, fontSize: 12, marginBottom: 12, textAlign: "center" }}>{error}</div>}
              <button onClick={handleSubmit} disabled={submitting}
                style={{ width: "100%", padding: "13px 0", border: "none", borderRadius: S.radiusSm,
                  background: `linear-gradient(135deg, ${S.accent}, ${S.accentSoft})`, color: "#fff",
                  fontWeight: 700, fontSize: 15, cursor: submitting ? "default" : "pointer",
                  opacity: submitting ? 0.7 : 1 }}>
                {submitting ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}</button>
            </>
          )}
        </div>
        <p style={{ color: S.textMuted, fontSize: 12, textAlign: "center", marginTop: 16, fontStyle: "italic" }}>add them to your cineverse.</p>
      </div>
    </div>
  );
}

/* ======================== MOVIE SEARCH MODAL ======================== */

function MovieSearchModal({ onClose, onShare }) {
  const [query, setQuery] = useState("");
  const [note, setNote] = useState("");
  const [selected, setSelected] = useState(null);
  const [imdbResults, setImdbResults] = useState([]);
  const [trending, setTrending] = useState([]);
  const [searching, setSearching] = useState(false);
  const [loadingTrending, setLoadingTrending] = useState(false);
  const [searchError, setSearchError] = useState("");
  const inputRef = useRef(null);
  const debounceRef = useRef(null);
  const abortRef = useRef(null);
  useEffect(() => { inputRef.current?.focus(); }, []);

  // Load trending on first open
  useEffect(() => {
    if (trending.length === 0 && !loadingTrending) {
      setLoadingTrending(true);
      fetchTrending().then(r => {
        setTrending(r);
        setLoadingTrending(false);
      }).catch(err => { console.error("Trending error:", err); setLoadingTrending(false); });
    }
  }, []);

  const doSearch = useCallback(async (q) => {
    if (!q.trim()) { setImdbResults([]); return; }
    setSearching(true); setSearchError("");
    try {
      const results = await searchIMDB(q);
      setImdbResults(results);
      if (results.length === 0) setSearchError("No results found. Try different keywords.");
    } catch (err) {
      console.error("Search error:", err);
      setSearchError(err.message || "Search failed. Please try again.");
      setImdbResults([]);
    }
    setSearching(false);
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (!query.trim()) { setImdbResults([]); return; }
    debounceRef.current = setTimeout(() => doSearch(query), 700);
    return () => clearTimeout(debounceRef.current);
  }, [query, doSearch]);

  const displayMovies = query.trim() ? imdbResults : trending;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center",
      justifyContent: "center", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", padding: 16 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }
        @keyframes pulse { 0%,100% { opacity: 0.4 } 50% { opacity: 1 } }`}</style>
      <div style={{ background: S.bgPanel, borderRadius: S.radius + 4, width: "100%", maxWidth: 560,
        maxHeight: "85vh", display: "flex", flexDirection: "column", border: `1px solid ${S.border}`, overflow: "hidden" }}>
        <div style={{ padding: "18px 20px", borderBottom: `1px solid ${S.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ color: S.text, fontWeight: 700, fontSize: 17 }}>
            {selected ? "Add a note" : "Find a Movie"}</span>
          <button onClick={selected ? () => setSelected(null) : onClose}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
            <Icon name={selected ? "back" : "x"} size={20} color={S.textSec} /></button>
        </div>
        {selected ? (
          <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16, overflowY: "auto" }}>
            <MovieCard movie={selected} />
            <textarea placeholder="Add a note... e.g. 'You'll love the twist!'" value={note}
              onChange={e => setNote(e.target.value)}
              style={{ width: "100%", padding: 14, borderRadius: S.radiusSm, background: S.bg,
                border: `1px solid ${S.border}`, color: S.text, fontSize: 14, resize: "vertical",
                minHeight: 80, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
            <button onClick={() => { onShare(selected, note); onClose(); }}
              style={{ padding: "13px 0", border: "none", borderRadius: S.radiusSm,
                background: `linear-gradient(135deg, ${S.accent}, ${S.accentSoft})`, color: "#fff",
                fontWeight: 700, fontSize: 15, cursor: "pointer" }}>Share Movie</button>
          </div>
        ) : (
          <>
            <div style={{ padding: "14px 20px", borderBottom: `1px solid ${S.border}` }}>
              {/* Search input */}
              <div style={{ display: "flex", gap: 8, alignItems: "center", background: S.bg,
                borderRadius: S.radiusSm, padding: "0 12px", border: `1px solid ${S.border}` }}>
                <Icon name="search" size={16} />
                <input ref={inputRef}
                  placeholder="Search any movie or TV show..."
                  value={query} onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && query.trim()) { clearTimeout(debounceRef.current); doSearch(query); }}}
                  style={{ flex: 1, padding: "11px 0", background: "none", border: "none",
                    color: S.text, fontSize: 14, outline: "none" }} />
                {searching && <div style={{ width: 16, height: 16, border: `2px solid ${S.accent}`,
                  borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />}
              </div>
            </div>
            {/* Results */}
            <div style={{ flex: 1, overflowY: "auto", padding: "10px 20px 20px" }}>
              {searching && (
                <div style={{ textAlign: "center", padding: 30 }}>
                  <div style={{ width: 32, height: 32, border: `3px solid ${S.accent}`,
                    borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite",
                    margin: "0 auto 16px" }} />
                  <div style={{ color: S.textSec, fontSize: 13 }}>Searching...</div>
                </div>
              )}
              {!searching && searchError && (
                <div style={{ textAlign: "center", padding: 30 }}>
                  <div style={{ color: S.accent, fontSize: 13, marginBottom: 12 }}>{searchError}</div>
                  <button onClick={() => doSearch(query)}
                    style={{ padding: "8px 20px", borderRadius: S.radiusSm, border: `1px solid ${S.accent}`,
                      background: "transparent", color: S.accent, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                    Retry Search</button>
                </div>
              )}
              {!searching && !query.trim() && loadingTrending && (
                <div style={{ textAlign: "center", padding: 30 }}>
                  <div style={{ width: 32, height: 32, border: `3px solid ${S.purple}`,
                    borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite",
                    margin: "0 auto 16px" }} />
                  <div style={{ color: S.textSec, fontSize: 13 }}>Loading trending movies...</div>
                </div>
              )}
              {!searching && !query.trim() && !loadingTrending && trending.length > 0 && (
                <div>
                  <div style={{ color: S.textSec, fontSize: 12, fontWeight: 600, marginBottom: 10,
                    display: "flex", alignItems: "center", gap: 6 }}>
                    <Icon name="zap" size={13} color={S.amber} /> Trending Now
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {trending.map(m => <MovieCard key={m.id} movie={m} compact onShare={() => setSelected(m)} />)}
                  </div>
                </div>
              )}
              {!searching && !query.trim() && !loadingTrending && trending.length === 0 && (
                <div style={{ textAlign: "center", padding: 40, color: S.textMuted }}>
                  <div style={{ fontSize: 13, marginBottom: 12 }}>Type a movie name to search</div>
                  <div style={{ fontSize: 11 }}>e.g. "Inception", "Miyazaki films", "best 2024 horror"</div>
                </div>
              )}
              {/* Search results */}
              {!searching && query.trim() && imdbResults.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {imdbResults.map(m => <MovieCard key={m.id} movie={m} compact onShare={() => setSelected(m)} />)}
                </div>
              )}
              {/* Local results */}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ======================== OTHER MODALS ======================== */

function NewChatModal({ onClose, onStart, users, currentUser, existingConvos }) {
  const [search, setSearch] = useState("");
  const available = users.filter(u =>
    u.username !== currentUser.username &&
    (u.displayName.toLowerCase().includes(search.toLowerCase()) || u.username.includes(search.toLowerCase()))
  );
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center",
      justifyContent: "center", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", padding: 16 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: S.bgPanel, borderRadius: S.radius + 4, width: "100%", maxWidth: 400,
        maxHeight: "70vh", display: "flex", flexDirection: "column", border: `1px solid ${S.border}`, overflow: "hidden" }}>
        <div style={{ padding: "18px 20px", borderBottom: `1px solid ${S.border}`,
          display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: S.text, fontWeight: 700, fontSize: 17 }}>New Conversation</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <Icon name="x" size={20} color={S.textSec} /></button>
        </div>
        <div style={{ padding: "12px 20px", borderBottom: `1px solid ${S.border}` }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", background: S.bg,
            borderRadius: S.radiusSm, padding: "0 12px", border: `1px solid ${S.border}` }}>
            <Icon name="search" size={16} />
            <input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, padding: "11px 0", background: "none", border: "none", color: S.text, fontSize: 14, outline: "none" }} />
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 10 }}>
          {available.map(u => {
            const existing = existingConvos.find(c => c.type === "private" && c.participants.includes(u.username));
            return (
              <button key={u.username} onClick={() => onStart(u, existing?.id)}
                style={{ width: "100%", display: "flex", gap: 12, alignItems: "center", padding: "10px 12px",
                  border: "none", borderRadius: S.radiusSm, cursor: "pointer", textAlign: "left",
                  background: "transparent", transition: "background 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.background = S.bgHover}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <Avatar user={u} size={38} />
                <div style={{ flex: 1 }}>
                  <div style={{ color: S.text, fontWeight: 600, fontSize: 14 }}>{u.displayName}</div>
                  <div style={{ color: S.textMuted, fontSize: 12 }}>@{u.username}</div>
                </div>
                {existing && <span style={{ marginLeft: "auto", color: S.textMuted, fontSize: 11 }}>Existing</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ======================== ADD FRIEND MODAL ======================== */

function AddFriendModal({ onClose, allUsers, currentUser, friends, friendRequests, onSendRequest, onAccept, onReject }) {
  const [search, setSearch] = useState("");
  const friendIds = new Set(friends.map(f => f.id));
  const outgoingIds = new Set(friendRequests.outgoing.map(r => r.user.id));
  const incomingIds = new Set(friendRequests.incoming.map(r => r.user.id));

  const searchResults = search.trim().length >= 2
    ? allUsers.filter(u => u.username !== currentUser.username &&
        (u.username.toLowerCase().includes(search.toLowerCase()) || u.displayName.toLowerCase().includes(search.toLowerCase())))
    : [];

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center",
      justifyContent: "center", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", padding: 16 }}
      onClick={e => { e.stopPropagation(); if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: S.bgPanel, borderRadius: S.radius + 4, width: "100%", maxWidth: 420,
        maxHeight: "80vh", display: "flex", flexDirection: "column", border: `1px solid ${S.border}`, overflow: "hidden" }}
        onClick={e => e.stopPropagation()}>
        <div style={{ padding: "18px 20px", borderBottom: `1px solid ${S.border}`,
          display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: S.text, fontWeight: 700, fontSize: 17 }}>My Crew</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <Icon name="x" size={20} color={S.textSec} /></button>
        </div>
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${S.border}` }}>
          <input placeholder="Find your co-stars..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: "100%", padding: "10px 14px", borderRadius: S.radiusSm, background: S.bg,
              border: `1px solid ${S.border}`, color: S.text, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {search.trim().length >= 2 && (
            <div style={{ padding: "8px 10px" }}>
              <div style={{ color: S.textMuted, fontSize: 11, fontWeight: 600, padding: "4px 10px", textTransform: "uppercase", letterSpacing: 1 }}>Auditions</div>
              {searchResults.length === 0 ? (
                <div style={{ padding: "12px 10px", color: S.textMuted, fontSize: 12 }}>No users found</div>
              ) : searchResults.map(u => (
                <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: S.radiusSm }}>
                  <Avatar user={u} size={36} />
                  <div style={{ flex: 1 }}>
                    <div style={{ color: S.text, fontWeight: 600, fontSize: 14 }}>{u.displayName}</div>
                    <div style={{ color: S.textMuted, fontSize: 12 }}>@{u.username}</div>
                  </div>
                  {friendIds.has(u.id) ? (
                    <span style={{ color: S.green, fontSize: 11, fontWeight: 600 }}>{"\u2713"} Co-Star</span>
                  ) : outgoingIds.has(u.id) ? (
                    <span style={{ color: S.amber, fontSize: 11, fontWeight: 600 }}>Casting...</span>
                  ) : incomingIds.has(u.id) ? (
                    <button onClick={() => { const req = friendRequests.incoming.find(r => r.user.id === u.id); if (req) onAccept(req.requestId); }}
                      style={{ padding: "5px 12px", borderRadius: 6, border: "none", background: S.green, color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Accept</button>
                  ) : (
                    <button onClick={() => onSendRequest(u.id)}
                      style={{ padding: "5px 12px", borderRadius: 6, border: "none", background: S.purple, color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Cast</button>
                  )}
                </div>
              ))}
            </div>
          )}
          {friendRequests.incoming.length > 0 && (
            <div style={{ padding: "8px 10px" }}>
              <div style={{ color: S.textMuted, fontSize: 11, fontWeight: 600, padding: "4px 10px", textTransform: "uppercase", letterSpacing: 1 }}>
                Casting Calls ({friendRequests.incoming.length})</div>
              {friendRequests.incoming.map(r => (
                <div key={r.requestId} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: S.radiusSm }}>
                  <Avatar user={r.user} size={36} />
                  <div style={{ flex: 1 }}>
                    <div style={{ color: S.text, fontWeight: 600, fontSize: 14 }}>{r.user.displayName}</div>
                    <div style={{ color: S.textMuted, fontSize: 12 }}>@{r.user.username}</div>
                  </div>
                  <button onClick={() => onAccept(r.requestId)}
                    style={{ padding: "5px 10px", borderRadius: 6, border: "none", background: S.green, color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Accept</button>
                  <button onClick={() => onReject(r.requestId)}
                    style={{ padding: "5px 10px", borderRadius: 6, border: `1px solid ${S.border}`, background: "transparent", color: S.textMuted, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Pass</button>
                </div>
              ))}
            </div>
          )}
          {friends.length > 0 && (
            <div style={{ padding: "8px 10px" }}>
              <div style={{ color: S.textMuted, fontSize: 11, fontWeight: 600, padding: "4px 10px", textTransform: "uppercase", letterSpacing: 1 }}>
                Your Crew ({friends.length})</div>
              {friends.map(f => (
                <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: S.radiusSm }}>
                  <Avatar user={f} size={36} />
                  <div style={{ flex: 1 }}>
                    <div style={{ color: S.text, fontWeight: 600, fontSize: 14 }}>{f.displayName}</div>
                    <div style={{ color: S.textMuted, fontSize: 12 }}>@{f.username}</div>
                  </div>
                  <span style={{ color: S.green, fontSize: 11, fontWeight: 600 }}>{"\u2713"} Co-Star</span>
                </div>
              ))}
            </div>
          )}
          {friends.length === 0 && friendRequests.incoming.length === 0 && search.trim().length < 2 && (
            <div style={{ textAlign: "center", padding: 40, color: S.textMuted }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{"\uD83D\uDC64"}</div>
              <p style={{ fontSize: 13, margin: 0 }}>No crew members yet</p>
              <p style={{ fontSize: 11, margin: "6px 0 0" }}>Search to cast your crew</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CreateGroupModal({ onClose, onCreate, users, currentUser }) {
  const [name, setName] = useState("");
  const [selected, setSelected] = useState([]);
  const available = users.filter(u => u.username !== currentUser.username);
  const toggle = (un) => setSelected(p => p.includes(un) ? p.filter(u => u !== un) : [...p, un]);
  const valid = selected.length > 0;
  const finalName = name.trim() || selected.map(un => users.find(u => u.username === un)?.displayName || un).join(", ");
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center",
      justifyContent: "center", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", padding: 16 }}
      onClick={e => { e.stopPropagation(); if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: S.bgPanel, borderRadius: S.radius + 4, width: "100%", maxWidth: 420,
        maxHeight: "75vh", display: "flex", flexDirection: "column", border: `1px solid ${S.border}`, overflow: "hidden" }}
        onClick={e => e.stopPropagation()}>
        <div style={{ padding: "18px 20px", borderBottom: `1px solid ${S.border}`,
          display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: S.text, fontWeight: 700, fontSize: 17 }}>Create Group</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <Icon name="x" size={20} color={S.textSec} /></button>
        </div>
        <div style={{ padding: 20, borderBottom: `1px solid ${S.border}` }}>
          <input placeholder={selected.length > 0 ? selected.map(un => users.find(u => u.username === un)?.displayName || un).join(", ") : "Group name (optional)..."} value={name} onChange={e => setName(e.target.value)}
            style={{ width: "100%", padding: "12px 14px", borderRadius: S.radiusSm, background: S.bg,
              border: `1px solid ${S.border}`, color: S.text, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
        </div>
        <div style={{ padding: "10px 20px", color: S.textSec, fontSize: 12, fontWeight: 600 }}>
          Cast Members ({selected.length})</div>
        <div style={{ flex: 1, overflowY: "auto", padding: "0 10px 10px" }}>
          {available.length === 0 ? (
            <div style={{ textAlign: "center", padding: 30, color: S.textMuted }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{"\uD83D\uDC64"}</div>
              <p style={{ fontSize: 13, margin: 0 }}>No actors on set yet</p>
              <p style={{ fontSize: 11, margin: "6px 0 0" }}>Get your crew to sign up</p>
            </div>
          ) : available.map(u => (
            <button key={u.username} onClick={() => toggle(u.username)}
              style={{ width: "100%", display: "flex", gap: 12, alignItems: "center", padding: "10px 12px",
                border: "none", borderRadius: S.radiusSm, cursor: "pointer", textAlign: "left",
                background: selected.includes(u.username) ? S.accent + "15" : "transparent" }}>
              <Avatar user={u} size={36} />
              <div style={{ flex: 1 }}>
                <div style={{ color: S.text, fontWeight: 600, fontSize: 14 }}>{u.displayName}</div>
                <div style={{ color: S.textMuted, fontSize: 12 }}>@{u.username}</div>
              </div>
              <div style={{ width: 22, height: 22, borderRadius: 6,
                border: `2px solid ${selected.includes(u.username) ? S.accent : S.border}`,
                background: selected.includes(u.username) ? S.accent : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center" }}>
                {selected.includes(u.username) && <span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>{"\u2713"}</span>}
              </div>
            </button>
          ))}
        </div>
        <div style={{ padding: 16, borderTop: `1px solid ${S.border}` }}>
          <button onClick={() => { if (valid) { onCreate(finalName, selected); onClose(); } }} disabled={!valid}
            style={{ width: "100%", padding: "13px 0", border: "none", borderRadius: S.radiusSm,
              background: valid ? `linear-gradient(135deg, ${S.accent}, ${S.accentSoft})` : S.bgCard,
              color: valid ? "#fff" : S.textMuted, fontWeight: 700, fontSize: 15, cursor: valid ? "pointer" : "default" }}>
            Create Group</button>
        </div>
      </div>
    </div>
  );
}

/* ======================== WATCHLIST PANEL ======================== */

function WatchlistPanel({ watchlist, onRemove, onSelect, onShareToChat }) {
  if (watchlist.length === 0) return (
    <div style={{ textAlign: "center", padding: 50, color: S.textMuted }}>
      <Icon name="bookmark" size={40} color={S.border} />
      <p style={{ marginTop: 14, fontSize: 14 }}>Your watchlist is empty</p>
      <p style={{ fontSize: 12 }}>Bookmark movies to save them here</p>
    </div>
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <span style={{ color: S.textSec, fontSize: 12, fontWeight: 600 }}>
          {watchlist.length} movie{watchlist.length !== 1 ? "s" : ""} saved</span>
        <button onClick={() => onShareToChat && onShareToChat(watchlist)}
          style={{ padding: "4px 10px", borderRadius: 4, border: `1px solid ${S.border}`,
            background: "none", color: S.textSec, fontSize: 10, fontWeight: 600, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 4 }}>
          <Icon name="send" size={11} color={S.textSec} /> Share to Chat</button>
      </div>
      {watchlist.map((m, i) => (
        <button key={m.id + "-" + i} onClick={() => onSelect && onSelect(m)}
          style={{ display: "flex", gap: 10, alignItems: "center", padding: 10,
            background: S.bgCard, borderRadius: S.radiusSm, border: `1px solid ${S.border}`,
            cursor: "pointer", textAlign: "left", width: "100%", transition: "border-color 0.15s" }}
          onMouseEnter={e => e.currentTarget.style.borderColor = S.purple}
          onMouseLeave={e => e.currentTarget.style.borderColor = S.border}>
          <MoviePoster movie={m} size="compact" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: S.text, fontWeight: 600, fontSize: 13, overflow: "hidden",
              textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.title}</div>
            <div style={{ color: S.textSec, fontSize: 11, marginTop: 2 }}>{m.year} {"\u00B7"} {m.genre}</div>
            {m.rating && <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 3 }}>
              <Icon name="star" size={11} color={S.amber} />
              <span style={{ color: S.amber, fontSize: 11, fontWeight: 700 }}>{m.rating}</span>
            </div>}
          </div>
          <button onClick={(e) => { e.stopPropagation(); onRemove(m); }}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
            <Icon name="x" size={16} color={S.textMuted} /></button>
        </button>
      ))}
    </div>
  );
}


/* ======================== MOVIE DETAIL MODAL ======================== */

function MovieDetailModal({ movie: initialMovie, onClose, onBack, onShare, onToggleWatchlist, inWatchlist: initialInWatchlist, watchlist, onViewPerson, onToggleWatched, watched: watchedList }) {
  const [currentMovie, setCurrentMovie] = useState(initialMovie);
  const [history, setHistory] = useState([]);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [navigating, setNavigating] = useState(false);
  const [g1, g2] = GENRE_GRADIENT[currentMovie.genre] || ["#7C3AED", "#A78BFA"];
  const isInWatchlist = watchlist ? watchlist.some(w => w.id === currentMovie.id) : initialInWatchlist;
  const isWatched = watchedList ? watchedList.some(w => w.title === currentMovie.title && w.year === currentMovie.year) : false;

  useEffect(() => {
    setLoading(true);
    setDetails(null);
    fetchMovieDetails(currentMovie.title, currentMovie.year, currentMovie.tmdb_id, currentMovie.media_type)
      .then(d => { setDetails(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [currentMovie.title, currentMovie.year]);

  const navigateToMovie = async (title) => {
    setNavigating(true);
    try {
      const results = await searchIMDB(title);
      if (results.length > 0) {
        setHistory(prev => [...prev, currentMovie]);
        setCurrentMovie(results[0]);
      }
    } catch {}
    setNavigating(false);
  };

  const goBack = () => {
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setHistory(h => h.slice(0, -1));
      setCurrentMovie(prev);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center",
      justifyContent: "center", background: "rgba(0,0,0,0.75)", backdropFilter: "blur(10px)", padding: 16 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <div style={{ background: S.bgPanel, borderRadius: S.radius + 4, width: "100%", maxWidth: 520,
        maxHeight: "88vh", display: "flex", flexDirection: "column", border: `1px solid ${S.border}`,
        overflow: "hidden" }}>
        {/* Header banner */}
        <div style={{ padding: "20px 24px", position: "relative", overflow: "hidden",
          background: `linear-gradient(135deg, ${g1}33, ${g2}22)`,
          borderBottom: `1px solid ${S.border}` }}>
          <div style={{ position: "absolute", inset: 0, opacity: 0.05,
            backgroundImage: `repeating-linear-gradient(45deg, transparent 0px, transparent 3px, rgba(255,255,255,0.1) 3px, rgba(255,255,255,0.1) 6px)` }} />
          <div style={{ position: "absolute", top: 12, right: 12, display: "flex", gap: 6 }}>
            {(onBack || history.length > 0) && (
              <button onClick={history.length > 0 ? goBack : onBack}
                style={{ background: "rgba(0,0,0,0.4)", border: "none", cursor: "pointer", padding: 6, borderRadius: 6,
                  display: "flex", alignItems: "center", gap: 4 }}>
                <Icon name="back" size={16} color="#fff" />
                <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 11, fontWeight: 600 }}>Back</span>
              </button>
            )}
            <button onClick={onClose}
              style={{ background: "rgba(0,0,0,0.4)", border: "none", cursor: "pointer", padding: 6, borderRadius: 6 }}>
              <Icon name="x" size={18} color="#fff" /></button>
          </div>
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start", zIndex: 1, position: "relative" }}>
            <MoviePoster movie={currentMovie} size="normal" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{ color: S.text, margin: "0 0 4px", fontWeight: 800, fontSize: 20, lineHeight: 1.2 }}>
                {currentMovie.title}</h2>
              <div style={{ color: S.textSec, fontSize: 13, marginBottom: 8 }}>
                {currentMovie.year}{currentMovie.genre ? ` \u00B7 ${currentMovie.genre}` : ""}{details?.runtime ? ` \u00B7 ${details.runtime}` : ""}
              </div>
              {(details?.director || currentMovie.director) && (
                <div style={{ color: S.textMuted, fontSize: 12, marginBottom: 6 }}>
                  Directed by <button onClick={() => onViewPerson && onViewPerson(details?.director || currentMovie.director, "directed by")}
                    style={{ background: "none", border: "none", cursor: "pointer", color: S.blue,
                      fontSize: 12, fontWeight: 600, padding: 0, textDecoration: "underline",
                      textDecorationColor: S.blue + "44", transition: "all 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.textDecorationColor = S.blue}
                    onMouseLeave={e => e.currentTarget.style.textDecorationColor = S.blue + "44"}>
                    {details?.director || currentMovie.director}</button></div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {(details?.imdb_rating || currentMovie.rating) && (
                  <div style={{ display: "flex", alignItems: "center", gap: 4,
                    background: "rgba(0,0,0,0.4)", borderRadius: 6, padding: "4px 10px" }}>
                    <Icon name="star" size={14} color={S.amber} />
                    <span style={{ color: S.amber, fontSize: 14, fontWeight: 800 }}>{details?.imdb_rating || currentMovie.rating}</span>
                    <span style={{ color: S.textMuted, fontSize: 10 }}></span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: 30 }}>
              <div style={{ width: 28, height: 28, border: `3px solid ${g1}`,
                borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite",
                margin: "0 auto 12px" }} />
              <div style={{ color: S.textSec, fontSize: 13 }}>Fetching movie details...</div>
            </div>
          ) : (
            <>
              {(details?.summary || currentMovie.overview) && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ color: S.textSec, fontSize: 11, fontWeight: 700, textTransform: "uppercase",
                    letterSpacing: 1, marginBottom: 8 }}>Summary</div>
                  <p style={{ color: S.text, fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                    {details?.summary || currentMovie.overview}</p>
                </div>
              )}

              {details?.cast && details.cast.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ color: S.textSec, fontSize: 11, fontWeight: 700, textTransform: "uppercase",
                    letterSpacing: 1, marginBottom: 8 }}>Cast</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {(Array.isArray(details.cast) ? details.cast : [details.cast]).map((actor, i) => (
                      <button key={i} onClick={() => onViewPerson && onViewPerson(actor, "starring")}
                        style={{ padding: "4px 12px", borderRadius: 20, fontSize: 12,
                          background: S.bgCard, border: `1px solid ${S.border}`, color: S.text,
                          cursor: "pointer", transition: "all 0.15s" }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = S.purple; e.currentTarget.style.color = S.purple; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = S.border; e.currentTarget.style.color = S.text; }}>
                        {actor}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
                {details?.language && (
                  <div style={{ padding: 12, borderRadius: S.radiusSm, background: S.bgCard, border: `1px solid ${S.border}` }}>
                    <div style={{ color: S.textMuted, fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Language</div>
                    <div style={{ color: S.text, fontSize: 13, fontWeight: 600, marginTop: 2 }}>{details.language}</div>
                  </div>
                )}
                {details?.country && (
                  <div style={{ padding: 12, borderRadius: S.radiusSm, background: S.bgCard, border: `1px solid ${S.border}` }}>
                    <div style={{ color: S.textMuted, fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Country</div>
                    <div style={{ color: S.text, fontSize: 13, fontWeight: 600, marginTop: 2 }}>{details.country}</div>
                  </div>
                )}
                {details?.box_office && (
                  <div style={{ padding: 12, borderRadius: S.radiusSm, background: S.bgCard, border: `1px solid ${S.border}` }}>
                    <div style={{ color: S.textMuted, fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Box Office</div>
                    <div style={{ color: S.text, fontSize: 13, fontWeight: 600, marginTop: 2 }}>{details.box_office}</div>
                  </div>
                )}
                {details?.runtime && (
                  <div style={{ padding: 12, borderRadius: S.radiusSm, background: S.bgCard, border: `1px solid ${S.border}` }}>
                    <div style={{ color: S.textMuted, fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Runtime</div>
                    <div style={{ color: S.text, fontSize: 13, fontWeight: 600, marginTop: 2 }}>{details.runtime}</div>
                  </div>
                )}
              </div>

              {details?.awards && (
                <div style={{ marginBottom: 20, padding: 14, borderRadius: S.radiusSm,
                  background: `linear-gradient(135deg, ${S.amber}10, transparent)`,
                  border: `1px solid ${S.amber}22` }}>
                  <div style={{ color: S.amber, fontSize: 11, fontWeight: 700, textTransform: "uppercase",
                    letterSpacing: 1, marginBottom: 4 }}>Awards</div>
                  <div style={{ color: S.text, fontSize: 13, lineHeight: 1.5 }}>{details.awards}</div>
                </div>
              )}

              {details?.similar && details.similar.length > 0 && (
                <div>
                  <div style={{ color: S.textSec, fontSize: 11, fontWeight: 700, textTransform: "uppercase",
                    letterSpacing: 1, marginBottom: 8 }}>You might also like</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {(Array.isArray(details.similar) ? details.similar : [details.similar]).map((t, i) => (
                      <button key={i} onClick={() => navigateToMovie(t)}
                        disabled={navigating}
                        style={{ padding: "6px 16px", borderRadius: 20, fontSize: 12,
                          background: g1 + "15", border: `1px solid ${g1}33`, color: g1,
                          cursor: navigating ? "default" : "pointer", transition: "all 0.15s",
                          opacity: navigating ? 0.5 : 1 }}
                        onMouseEnter={e => !navigating && (e.currentTarget.style.background = g1 + "30")}
                        onMouseLeave={e => (e.currentTarget.style.background = g1 + "15")}>
                        {t}
                      </button>
                    ))}
                  </div>
                  {navigating && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
                      <div style={{ width: 14, height: 14, border: `2px solid ${g1}`,
                        borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
                      <span style={{ color: S.textSec, fontSize: 12 }}>Loading movie...</span>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Action buttons */}
        <div style={{ padding: "14px 24px", borderTop: `1px solid ${S.border}`,
          display: "flex", gap: 10 }}>
          <button onClick={() => onToggleWatchlist(currentMovie)}
            style={{ flex: 1, padding: "12px 0", borderRadius: S.radiusSm,
              border: `1px solid ${isInWatchlist ? S.amber : S.border}`,
              background: isInWatchlist ? S.amber + "15" : "transparent",
              color: isInWatchlist ? S.amber : S.textSec,
              fontWeight: 600, fontSize: 13, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              transition: "all 0.25s ease" }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-2px) scale(1.02)";
              e.currentTarget.style.boxShadow = isInWatchlist ? `0 6px 20px ${S.amber}33` : `0 6px 20px rgba(255,255,255,0.08)`;
              e.currentTarget.style.borderColor = isInWatchlist ? S.amber : S.textSec;
              e.currentTarget.style.background = isInWatchlist ? S.amber + "25" : "rgba(255,255,255,0.05)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.borderColor = isInWatchlist ? S.amber : S.border;
              e.currentTarget.style.background = isInWatchlist ? S.amber + "15" : "transparent";
            }}>
            <Icon name={isInWatchlist ? "bookmarkFill" : "bookmark"} size={15} color={isInWatchlist ? S.amber : S.textSec} />
            {isInWatchlist ? "In Watchlist" : "Add to Watchlist"}
          </button>
          <button onClick={() => onToggleWatched && onToggleWatched(currentMovie)}
            style={{ padding: "12px 16px", borderRadius: S.radiusSm,
              border: `1px solid ${isWatched ? S.green : S.border}`,
              background: isWatched ? S.green + "15" : "transparent",
              color: isWatched ? S.green : S.textSec,
              fontWeight: 600, fontSize: 13, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              transition: "all 0.25s ease" }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-2px) scale(1.02)";
              e.currentTarget.style.boxShadow = isWatched ? `0 6px 20px ${S.green}33` : "0 6px 20px rgba(255,255,255,0.08)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow = "none";
            }}>
            {isWatched ? "\u2713 Watched" : "\u25B6 Watched"}
          </button>
          <button onClick={() => { onClose(); onShare(currentMovie); }}
            style={{ flex: 1, padding: "12px 0", borderRadius: S.radiusSm, border: "none",
              background: `linear-gradient(135deg, ${S.accent}, ${S.accentSoft})`, color: "#fff",
              fontWeight: 600, fontSize: 13, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              transition: "all 0.25s ease" }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-2px) scale(1.02)";
              e.currentTarget.style.boxShadow = `0 6px 20px ${S.accent}44`;
              e.currentTarget.style.background = `linear-gradient(135deg, ${S.accentSoft}, ${S.accent})`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.background = `linear-gradient(135deg, ${S.accent}, ${S.accentSoft})`;
            }}>
            <Icon name="send" size={15} color="#fff" /> Share with Friend
          </button>
        </div>
      </div>
    </div>
  );
}

/* ======================== LANGUAGE PICKER MODAL ======================== */

const ALL_LANGS = [...LANGUAGES, ...MORE_LANGUAGES];

function LanguagePickerModal({ onSave, currentSelection }) {
  const [selected, setSelected] = useState(currentSelection || []);
  const toggle = (name) => setSelected(prev =>
    prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
  );
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center",
      justifyContent: "center", background: "rgba(0,0,0,0.75)", backdropFilter: "blur(10px)", padding: 16 }}>
      <div style={{ background: S.bgPanel, borderRadius: S.radius + 4, width: "100%", maxWidth: 500,
        maxHeight: "85vh", display: "flex", flexDirection: "column", border: `1px solid ${S.border}`, overflow: "hidden" }}>
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${S.border}` }}>
          <h2 style={{ color: S.text, margin: "0 0 4px", fontWeight: 800, fontSize: 20 }}>Choose Your Languages</h2>
          <p style={{ color: S.textMuted, fontSize: 13, margin: 0 }}>
            Select the languages you watch movies in. These will appear in your Browse section.</p>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {ALL_LANGS.map(l => {
              const active = selected.includes(l.name);
              return (
                <button key={l.name} onClick={() => toggle(l.name)}
                  style={{ padding: "8px 16px", borderRadius: 20, cursor: "pointer",
                    fontSize: 13, fontWeight: 600, transition: "all 0.15s",
                    background: active ? S.blue + "25" : S.bgCard,
                    color: active ? S.blue : S.textSec,
                    border: `1px solid ${active ? S.blue + "55" : S.border}`,
                    display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 16 }}>{l.flag}</span> {l.name}
                  {active && <span style={{ color: S.blue, fontWeight: 700 }}>{"\u2713"}</span>}
                </button>
              );
            })}
          </div>
        </div>
        <div style={{ padding: "16px 24px", borderTop: `1px solid ${S.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ color: S.textSec, fontSize: 13 }}>
            {selected.length} language{selected.length !== 1 ? "s" : ""} selected</span>
          <button onClick={() => { if (selected.length > 0) onSave(selected); }}
            disabled={selected.length === 0}
            style={{ padding: "11px 28px", borderRadius: S.radiusSm, border: "none",
              background: selected.length > 0 ? `linear-gradient(135deg, ${S.accent}, ${S.accentSoft})` : S.bgCard,
              color: selected.length > 0 ? "#fff" : S.textMuted,
              fontWeight: 700, fontSize: 14, cursor: selected.length > 0 ? "pointer" : "default" }}>
            Save Preferences</button>
        </div>
      </div>
    </div>
  );
}



/* ======================== YEAR IN REVIEW MODAL ======================== */

/* ======================== USER PROFILE MODAL ======================== */

function UserProfileModal({ username, onClose, currentUser }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showYearReview, setShowYearReview] = useState(false);
  useEffect(() => {
    setLoading(true);
    fetch(`/api/users/${username}/stats`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("fs:token")}` }
    }).then(r => r.json()).then(d => { setStats(d); setLoading(false); }).catch(() => setLoading(false));
  }, [username]);

  const genreColors = ["#E50914","#7C3AED","#0EA5E9","#10B981","#F59E0B","#EC4899","#6366F1","#14B8A6","#F97316","#8B5CF6"];

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 120, display: "flex", alignItems: "center",
      justifyContent: "center", background: "rgba(0,0,0,0.8)", backdropFilter: "blur(12px)", padding: 16 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: S.bgPanel, borderRadius: S.radius + 4, width: "100%", maxWidth: 520,
        maxHeight: "90vh", overflowY: "auto", border: `1px solid ${S.border}` }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 60 }}>
            <div style={{ width: 32, height: 32, border: `3px solid ${S.purple}`,
              borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite",
              margin: "0 auto 14px" }} />
          </div>
        ) : stats ? (
          <>
            {/* Header */}
            <div style={{ padding: "24px 24px 16px", display: "flex", alignItems: "center", gap: 16,
              borderBottom: `1px solid ${S.border}` }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: stats.color,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22, fontWeight: 800, color: "#fff" }}>{stats.avatar}</div>
              <div style={{ flex: 1 }}>
                <h2 style={{ color: S.text, margin: 0, fontSize: 20, fontWeight: 800 }}>{stats.displayName}</h2>
                <div style={{ color: S.textMuted, fontSize: 12 }}>@{stats.username}</div>
              </div>
              {stats.tasteMatch !== null && (
                <div style={{ textAlign: "center", padding: "8px 16px", borderRadius: S.radiusSm,
                  background: `linear-gradient(135deg, ${S.purple}22, ${S.accent}22)`,
                  border: `1px solid ${S.purple}44` }}>
                  <div style={{ color: S.purple, fontSize: 24, fontWeight: 900 }}>{stats.tasteMatch}%</div>
                  <div style={{ color: S.textMuted, fontSize: 10, fontWeight: 600 }}>Taste Match</div>
                </div>
              )}
              <button onClick={() => setShowYearReview(true)} title="Year in Review"
                style={{ background: S.purple + "22", border: `1px solid ${S.purple}44`, cursor: "pointer",
                  padding: "6px 12px", borderRadius: 8, color: S.purple, fontSize: 11, fontWeight: 700,
                  display: "flex", alignItems: "center", gap: 4 }}>
                <Icon name="star" size={14} color={S.purple} /> Year in Review
              </button>
              <button onClick={onClose}
                style={{ background: "rgba(0,0,0,0.3)", border: "none", cursor: "pointer", padding: 8, borderRadius: 8 }}>
                <Icon name="x" size={18} color="#fff" /></button>
            </div>

            {/* Stats grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, padding: "16px 24px" }}>
              {[
                { label: "Shared", value: stats.totalShared, color: S.purple },
                { label: "Ratings", value: stats.totalRatings, color: S.amber },
                { label: "Avg Rating", value: stats.avgRating || "-", color: S.amber },
                { label: "Watchlist", value: stats.totalWatchlist, color: S.accent },
                { label: "Watched", value: stats.totalWatchedList || 0, color: S.green },
                { label: "Reviews", value: stats.totalReviews, color: S.blue },
              ].map(s => (
                <div key={s.label} style={{ textAlign: "center", padding: 12, borderRadius: S.radiusSm,
                  background: S.bgCard, border: `1px solid ${S.border}` }}>
                  <div style={{ color: s.color, fontSize: 22, fontWeight: 900 }}>{s.value}</div>
                  <div style={{ color: S.textMuted, fontSize: 10, fontWeight: 600, marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Achievements */}
            {stats.badges?.length > 0 && (
              <div style={{ padding: "0 24px 16px" }}>
                <h3 style={{ color: S.text, fontSize: 14, fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 16 }}>{"\uD83C\uDFC6"}</span> Achievements
                  <span style={{ color: S.textMuted, fontSize: 11, fontWeight: 500, marginLeft: 4 }}>{stats.badges.length} unlocked</span>
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                  {stats.badges.map((b, i) => (
                    <div key={i}
                      style={{ padding: "14px 8px 10px", borderRadius: 12, background: S.bgCard,
                        border: `1px solid ${S.border}`, display: "flex", flexDirection: "column",
                        alignItems: "center", gap: 4, cursor: "default", transition: "all 0.2s",
                        textAlign: "center", position: "relative", overflow: "hidden" }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = S.amber;
                        e.currentTarget.style.transform = "translateY(-3px)";
                        e.currentTarget.style.boxShadow = `0 8px 24px ${S.amber}22`;
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = S.border;
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "none";
                      }}>
                      <div style={{ width: 40, height: 40, borderRadius: "50%",
                        background: `linear-gradient(135deg, ${S.amber}18, ${S.purple}18)`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 22 }}>{b.emoji}</div>
                      <div style={{ color: S.text, fontSize: 11, fontWeight: 700, lineHeight: 1.2 }}>{b.name}</div>
                      <div style={{ color: S.textMuted, fontSize: 9, lineHeight: 1.3 }}>{b.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Similar Taste */}
            {stats.similarUsers?.length > 0 && (
              <div style={{ padding: "0 24px 16px" }}>
                <h3 style={{ color: S.text, fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Similar Taste</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {stats.similarUsers.map((u, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px",
                      background: S.bgCard, borderRadius: S.radiusSm, border: `1px solid ${S.border}` }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: u.color,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 12, fontWeight: 800, color: "#fff" }}>{u.avatar}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: S.text, fontSize: 13, fontWeight: 600 }}>{u.displayName}</div>
                        <div style={{ color: S.textMuted, fontSize: 11 }}>{u.commonCount} movies in common</div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ color: u.match >= 70 ? S.green : u.match >= 40 ? S.amber : S.accent,
                          fontSize: 18, fontWeight: 900 }}>{u.match}%</div>
                        <div style={{ color: S.textMuted, fontSize: 9 }}>match</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Genre pie chart */}
            {(stats.genreRatings?.length > 0 || stats.topGenres?.length > 0) && (
              <div style={{ padding: "0 24px 16px" }}>
                <h3 style={{ color: S.text, fontSize: 14, fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>{"\uD83C\uDFAD"} Genre Breakdown</h3>
                {(() => {
                  const chartData = stats.topGenres?.length > 0 ? stats.topGenres.map(g => ({ genre: g.genre, count: g.count })) : stats.genreRatings?.map(g => ({ genre: g.genre, count: g.count })) || [];
                  if (chartData.length === 0) return null;
                  const total = chartData.reduce((s, g) => s + g.count, 0);
                  if (total === 0) return null;
                  return (
                    <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
                      <svg viewBox="0 0 100 100" width={140} height={140} style={{ flexShrink: 0 }}>
                        {chartData.length === 1 ? (
                          <circle cx="50" cy="50" r="45" fill={genreColors[0]} />
                        ) : (() => {
                          let cumAngle = 0;
                          return chartData.map((g, i) => {
                            const angle = Math.max(0.5, (g.count / total) * 360);
                            const startAngle = cumAngle;
                            cumAngle += angle;
                            if (angle >= 359.5) return <circle key={i} cx="50" cy="50" r="45" fill={genreColors[i % genreColors.length]} />;
                            const startRad = (startAngle - 90) * Math.PI / 180;
                            const endRad = (startAngle + angle - 90) * Math.PI / 180;
                            const largeArc = angle > 180 ? 1 : 0;
                            const x1 = 50 + 45 * Math.cos(startRad);
                            const y1 = 50 + 45 * Math.sin(startRad);
                            const x2 = 50 + 45 * Math.cos(endRad);
                            const y2 = 50 + 45 * Math.sin(endRad);
                            return <path key={i} d={`M50,50 L${x1},${y1} A45,45 0 ${largeArc},1 ${x2},${y2} Z`}
                              fill={genreColors[i % genreColors.length]} stroke={S.bgPanel} strokeWidth="0.5" />;
                          });
                        })()}
                      </svg>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {chartData.map((g, i) => (
                          <div key={g.genre} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 12, height: 12, borderRadius: 3,
                              background: genreColors[i % genreColors.length], flexShrink: 0 }} />
                            <span style={{ color: S.text, fontSize: 13, fontWeight: 600, minWidth: 80 }}>{g.genre}</span>
                            <span style={{ color: S.textMuted, fontSize: 12 }}>{g.count}</span>
                            <span style={{ color: S.textMuted, fontSize: 12 }}>({Math.round(g.count / total * 100)}%)</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}


            {/* Recent shares */}
            {stats.recentShared?.length > 0 && (
              <div style={{ padding: "0 24px 16px" }}>
                <h3 style={{ color: S.text, fontSize: 14, fontWeight: 700, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>{"\uD83C\uDFAC"} Recently Shared</h3>
                <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
                  {stats.recentShared.map((m, i) => (
                    <div key={i} style={{ flexShrink: 0 }}>
                      <MoviePoster movie={m} size="compact" />
                      <div style={{ color: S.textSec, fontSize: 10, marginTop: 4, maxWidth: 48,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.title}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Watched movies - stats only, shown in grid above */}

            {/* Watched genre breakdown */}
            {stats.watchedGenres?.length > 0 && (
              <div style={{ padding: "0 24px 16px" }}>
                <h3 style={{ color: S.text, fontSize: 14, fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  <Icon name="eye" size={16} color={S.green} /> Watched by Genre
                </h3>
                {(() => {
                  const chartData = stats.watchedGenres;
                  const total = chartData.reduce((s, g) => s + g.count, 0);
                  const watchedColors = ["#10B981","#0EA5E9","#F59E0B","#EC4899","#7C3AED","#14B8A6","#E50914","#6366F1","#F97316","#8B5CF6"];
                  return (
                    <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
                      <svg viewBox="0 0 100 100" width={140} height={140} style={{ flexShrink: 0 }}>
                        {chartData.length === 1 ? (
                          <circle cx="50" cy="50" r="45" fill={watchedColors[0]} />
                        ) : chartData.map((g, i) => {
                          const angle = (g.count / total) * 360;
                          const startAngle = chartData.slice(0, i).reduce((s, x) => s + (x.count / total) * 360, 0);
                          const endAngle = startAngle + angle;
                          const startRad = (startAngle - 90) * Math.PI / 180;
                          const endRad = (endAngle - 90) * Math.PI / 180;
                          const largeArc = angle > 180 ? 1 : 0;
                          const x1 = 50 + 45 * Math.cos(startRad);
                          const y1 = 50 + 45 * Math.sin(startRad);
                          const x2 = 50 + 45 * Math.cos(endRad);
                          const y2 = 50 + 45 * Math.sin(endRad);
                          return <path key={i} d={`M50,50 L${x1},${y1} A45,45 0 ${largeArc},1 ${x2},${y2} Z`}
                            fill={watchedColors[i % watchedColors.length]} stroke={S.bgPanel} strokeWidth="0.5" />;
                        })}
                      </svg>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {chartData.map((g, i) => (
                          <div key={g.genre} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 12, height: 12, borderRadius: 3,
                              background: watchedColors[i % watchedColors.length], flexShrink: 0 }} />
                            <span style={{ color: S.text, fontSize: 13, fontWeight: 600, minWidth: 80 }}>{g.genre}</span>
                            <span style={{ color: S.textMuted, fontSize: 12 }}>{g.count} watched</span>
                            <span style={{ color: S.textMuted, fontSize: 12 }}>({Math.round(g.count / total * 100)}%)</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Recently Watched */}
            {stats.watchedMovies?.length > 0 && (
              <div style={{ padding: "0 24px 16px" }}>
                <h3 style={{ color: S.text, fontSize: 14, fontWeight: 700, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                  <Icon name="eye" size={16} color={S.green} /> Recently Watched
                </h3>
                <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
                  {stats.watchedMovies.slice(0, 10).map((m, i) => (
                    <div key={i} style={{ flexShrink: 0 }}>
                      {m.poster ? (
                        <img src={m.poster} alt="" style={{ width: 48, height: 72, borderRadius: 6, objectFit: "cover" }} />
                      ) : <MoviePoster movie={m} size="compact" />}
                      <div style={{ color: S.textSec, fontSize: 10, marginTop: 4, maxWidth: 48,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.title}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: "center", padding: 40, color: S.textMuted }}>Could not load profile</div>
        )}
        {showYearReview && <YearReviewModal username={username} onClose={() => setShowYearReview(false)} />}
      </div>
    </div>
  );
}

/* ======================== MOVIE COMPARE MODAL ======================== */

function MovieCompareModal({ onClose }) {
  const [movieA, setMovieA] = useState(null);
  const [movieB, setMovieB] = useState(null);
  const [searchA, setSearchA] = useState("");
  const [searchB, setSearchB] = useState("");
  const [resultsA, setResultsA] = useState([]);
  const [resultsB, setResultsB] = useState([]);
  const [detailsA, setDetailsA] = useState(null);
  const [detailsB, setDetailsB] = useState(null);
  const debA = useRef(null);
  const debB = useRef(null);

  const doSearch = async (q, setResults) => {
    if (!q.trim()) return;
    try {
      const res = await fetch("/api/movies/search", { method: "POST",
        headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: q }) });
      const data = await res.json();
      setResults(Array.isArray(data) ? data.slice(0, 5) : []);
    } catch { setResults([]); }
  };

  const selectMovie = async (movie, side) => {
    const setter = side === "A" ? setMovieA : setMovieB;
    const detailSetter = side === "A" ? setDetailsA : setDetailsB;
    setter(movie);
    (side === "A" ? setResultsA : setResultsB)([]);
    (side === "A" ? setSearchA : setSearchB)("");
    try {
      const res = await fetch("/api/movies/details", { method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: movie.title, year: movie.year, tmdb_id: movie.tmdb_id || movie.id }) });
      detailSetter(await res.json());
    } catch {}
  };

  const renderSide = (movie, details, search, setSearch, results, setResults, deb, side) => (
    <div style={{ flex: 1, minWidth: 0 }}>
      {!movie ? (
        <div>
          <input placeholder={`Search movie ${side === "A" ? "1" : "2"}...`} value={search}
            onChange={e => { setSearch(e.target.value); clearTimeout(deb.current);
              deb.current = setTimeout(() => doSearch(e.target.value, setResults), 400); }}
            style={{ width: "100%", padding: "10px 12px", borderRadius: 6, border: `1px solid ${S.border}`,
              background: S.bgCard, color: S.text, fontSize: 13, outline: "none", marginBottom: 8 }} />
          {results.map(m => (
            <button key={m.id} onClick={() => selectMovie(m, side)}
              style={{ display: "flex", gap: 8, alignItems: "center", padding: 8, width: "100%",
                background: S.bgCard, border: `1px solid ${S.border}`, borderRadius: 6, cursor: "pointer",
                marginBottom: 4, textAlign: "left" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = S.purple}
              onMouseLeave={e => e.currentTarget.style.borderColor = S.border}>
              <MoviePoster movie={m} size="compact" />
              <div>
                <div style={{ color: S.text, fontSize: 12, fontWeight: 600 }}>{m.title}</div>
                <div style={{ color: S.textSec, fontSize: 11 }}>{m.year}</div>
              </div>
            </button>
          ))}
          {!search && <div style={{ textAlign: "center", padding: 30, color: S.textMuted, fontSize: 13 }}>Search for a movie</div>}
        </div>
      ) : (
        <div>
          <div style={{ textAlign: "center", marginBottom: 12 }}>
            {movie.poster && <img src={movie.poster} alt="" style={{ width: 100, height: 150, borderRadius: 8, objectFit: "cover" }} />}
            <h3 style={{ color: S.text, fontSize: 15, fontWeight: 700, marginTop: 8 }}>{movie.title}</h3>
            <div style={{ color: S.textSec, fontSize: 12 }}>{movie.year} \u00B7 {movie.genre}</div>
          </div>
          {[
            { label: "Rating", value: movie.rating ? `\u2605 ${movie.rating}/10` : "-" },
            { label: "Director", value: details?.director || "-" },
            { label: "Runtime", value: details?.runtime || "-" },
            { label: "Box Office", value: details?.box_office || "-" },
            { label: "Language", value: details?.language || "-" },
            { label: "Country", value: details?.country || "-" },
          ].map(row => (
            <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0",
              borderBottom: `1px solid ${S.border}15` }}>
              <span style={{ color: S.textMuted, fontSize: 11 }}>{row.label}</span>
              <span style={{ color: S.text, fontSize: 12, fontWeight: 600 }}>{row.value}</span>
            </div>
          ))}
          {details?.cast && (
            <div style={{ marginTop: 8 }}>
              <span style={{ color: S.textMuted, fontSize: 11 }}>Cast: </span>
              <span style={{ color: S.textSec, fontSize: 11 }}>{details.cast.slice(0, 4).join(", ")}</span>
            </div>
          )}
          <button onClick={() => { (side === "A" ? setMovieA : setMovieB)(null); (side === "A" ? setDetailsA : setDetailsB)(null); }}
            style={{ marginTop: 10, padding: "5px 12px", borderRadius: 6, border: `1px solid ${S.border}`,
              background: "none", color: S.textSec, fontSize: 11, cursor: "pointer", width: "100%" }}>Change</button>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 120, display: "flex", alignItems: "center",
      justifyContent: "center", background: "rgba(0,0,0,0.8)", backdropFilter: "blur(12px)", padding: 16 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: S.bgPanel, borderRadius: S.radius + 4, width: "100%", maxWidth: 700,
        maxHeight: "90vh", overflowY: "auto", border: `1px solid ${S.border}` }}>
        <div style={{ padding: "16px 24px", borderBottom: `1px solid ${S.border}`,
          display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ color: S.text, fontSize: 18, fontWeight: 800, margin: 0 }}>Compare Movies</h2>
          <button onClick={onClose} style={{ background: "rgba(0,0,0,0.3)", border: "none", cursor: "pointer", padding: 8, borderRadius: 8 }}>
            <Icon name="x" size={18} color="#fff" /></button>
        </div>
        <div style={{ display: "flex", gap: 16, padding: 24 }}>
          {renderSide(movieA, detailsA, searchA, setSearchA, resultsA, setResultsA, debA, "A")}
          <div style={{ width: 1, background: S.border, alignSelf: "stretch" }} />
          {renderSide(movieB, detailsB, searchB, setSearchB, resultsB, setResultsB, debB, "B")}
        </div>
      </div>
    </div>
  );
}

/* ======================== WATCHLIST SHARE PICKER ======================== */

function WatchlistSharePicker({ convos, onSelect, onClose, user }) {
  const userConvos = convos.filter(c => c.participants?.includes(user?.username));
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 130, display: "flex", alignItems: "center",
      justifyContent: "center", background: "rgba(0,0,0,0.8)", backdropFilter: "blur(12px)", padding: 16 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: S.bgPanel, borderRadius: S.radius + 4, width: "100%", maxWidth: 400,
        maxHeight: "70vh", display: "flex", flexDirection: "column", border: `1px solid ${S.border}`, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${S.border}`,
          display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ color: S.text, fontSize: 16, fontWeight: 800, margin: 0 }}>Share Watchlist To</h3>
          <button onClick={onClose} style={{ background: "rgba(0,0,0,0.3)", border: "none",
            cursor: "pointer", padding: 6, borderRadius: 6 }}>
            <Icon name="x" size={16} color="#fff" /></button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
          {userConvos.length === 0 ? (
            <div style={{ textAlign: "center", padding: 30, color: S.textMuted, fontSize: 13 }}>
              No conversations yet. Start a chat first.</div>
          ) : userConvos.map(c => {
            const other = c.participants?.find(p => p !== user?.username);
            return (
              <button key={c.id} onClick={() => onSelect(c.id)}
                style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 12px", width: "100%",
                  background: "transparent", border: "none", borderRadius: S.radiusSm, cursor: "pointer",
                  textAlign: "left", transition: "background 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.background = S.bgCard}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: S.purple,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 700, color: "#fff" }}>
                  {c.type === "group" ? c.name?.charAt(0) : (other?.charAt(0) || "?").toUpperCase()}
                </div>
                <div>
                  <div style={{ color: S.text, fontWeight: 600, fontSize: 13 }}>
                    {c.type === "group" ? c.name : other}</div>
                  <div style={{ color: S.textMuted, fontSize: 11 }}>
                    {c.type === "group" ? `${c.participants.length} members` : "Private chat"}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}


/* ======================== YEAR IN REVIEW MODAL ======================== */

function YearReviewModal({ username, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setLoading(true);
    fetch(`/api/users/${username}/year-review/${year}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("fs:token")}` }
    }).then(r => r.json()).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, [username, year]);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 130, display: "flex", alignItems: "center",
      justifyContent: "center", background: "rgba(0,0,0,0.85)", backdropFilter: "blur(16px)", padding: 16 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: `linear-gradient(135deg, #0B0B12, #1a1a2e)`, borderRadius: 16, width: "100%", maxWidth: 440,
        maxHeight: "90vh", overflowY: "auto", border: `1px solid ${S.purple}44`, position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 12, right: 12, background: "rgba(0,0,0,0.4)",
          border: "none", cursor: "pointer", padding: 6, borderRadius: 8, zIndex: 1 }}>
          <Icon name="x" size={18} color="#fff" /></button>

        {loading ? (
          <div style={{ textAlign: "center", padding: 80 }}>
            <div style={{ width: 32, height: 32, border: `3px solid ${S.purple}`,
              borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite",
              margin: "0 auto" }} />
          </div>
        ) : data ? (
          <div style={{ padding: "32px 28px", textAlign: "center" }}>
            {/* Year selector */}
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 20 }}>
              {[2024, 2025, 2026].map(y => (
                <button key={y} onClick={() => setYear(y)}
                  style={{ padding: "4px 14px", borderRadius: 20, border: "none", cursor: "pointer",
                    fontSize: 12, fontWeight: 700,
                    background: year === y ? S.purple : S.bgCard, color: year === y ? "#fff" : S.textSec }}>{y}</button>
              ))}
            </div>

            <div style={{ fontSize: 48, fontWeight: 900, color: S.text, letterSpacing: -2 }}>{data.year}</div>
            <div style={{ fontSize: 14, color: S.purple, fontWeight: 700, marginBottom: 24 }}>Year in Review</div>

            {/* Avatar */}
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: data.color,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 24, fontWeight: 800, color: "#fff", margin: "0 auto 8px" }}>{data.avatar}</div>
            <div style={{ color: S.text, fontSize: 16, fontWeight: 700 }}>{data.displayName}</div>
            <div style={{ color: S.textMuted, fontSize: 12, marginBottom: 24 }}>@{data.username}</div>

            {/* Big stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
              {[
                { value: data.totalShared, label: "Shared", color: S.purple },
                { value: data.totalWatched, label: "Movies Watched", color: S.green },
                { value: data.totalTVWatched || 0, label: "TV Shows Watched", color: S.blue },
                { value: data.totalRatings, label: "Ratings", color: S.accent },
                { value: data.avgRating || "-", label: "Avg Rating", color: S.green },
                { value: data.totalReviews || 0, label: "Reviews", color: S.amber },
              ].map(s => (
                <div key={s.label} style={{ padding: 16, borderRadius: 12,
                  background: s.color + "12", border: `1px solid ${s.color}33` }}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: S.textMuted, marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Highlights */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, textAlign: "left", marginBottom: 24 }}>
              {data.topGenre && (
                <div style={{ padding: "12px 16px", borderRadius: 10, background: S.bgCard, border: `1px solid ${S.border}`,
                  display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: S.textSec, fontSize: 12 }}>Top Genre</span>
                  <span style={{ color: S.text, fontSize: 14, fontWeight: 700 }}>{data.topGenre} ({data.topGenreCount})</span>
                </div>
              )}
              {data.topDirector && (
                <div style={{ padding: "12px 16px", borderRadius: 10, background: S.bgCard, border: `1px solid ${S.border}`,
                  display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: S.textSec, fontSize: 12 }}>Fav Director</span>
                  <span style={{ color: S.text, fontSize: 14, fontWeight: 700 }}>{data.topDirector}</span>
                </div>
              )}
              {data.mostActiveMonth && (
                <div style={{ padding: "12px 16px", borderRadius: 10, background: S.bgCard, border: `1px solid ${S.border}`,
                  display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: S.textSec, fontSize: 12 }}>Most Active</span>
                  <span style={{ color: S.text, fontSize: 14, fontWeight: 700 }}>{data.mostActiveMonth} ({data.mostActiveMonthCount} movies)</span>
                </div>
              )}
            </div>

            {/* Shares per Month */}
            {data.monthlyActivity?.length > 0 && (() => {
              const shortToFull = { Jan: "January", Feb: "February", Mar: "March", Apr: "April", May: "May", Jun: "June",
                Jul: "July", Aug: "August", Sep: "September", Oct: "October", Nov: "November", Dec: "December" };
              const sorted = [...data.monthlyActivity].sort((a, b) => {
                const order = Object.keys(shortToFull);
                return order.indexOf(a.month) - order.indexOf(b.month);
              });
              const max = Math.max(...sorted.map(x => x.count));
              return (
                <div style={{ marginBottom: 24, textAlign: "left" }}>
                  <div style={{ color: S.textMuted, fontSize: 11, fontWeight: 600, textTransform: "uppercase",
                    letterSpacing: 1, marginBottom: 12, textAlign: "center" }}>Shares per Month</div>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80 }}>
                    {sorted.map((m, i) => {
                      const h = Math.max(10, (m.count / max) * 65);
                      return (
                        <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, flex: 1 }}>
                          <span style={{ color: S.textSec, fontSize: 10, fontWeight: 700 }}>{m.count}</span>
                          <div style={{ width: "100%", maxWidth: 44, height: h, borderRadius: 5,
                            background: S.purple }} />
                          <span style={{ color: S.textMuted, fontSize: 9, fontWeight: 600 }}>{shortToFull[m.month] || m.month}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Top rated */}
            {data.highestRated?.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ color: S.textMuted, fontSize: 11, fontWeight: 600, textTransform: "uppercase",
                  letterSpacing: 1, marginBottom: 10 }}>Highest Rated</div>
                <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
                  {data.highestRated.map((m, i) => (
                    <div key={i} style={{ textAlign: "center" }}>
                      {m.poster ? <img src={m.poster} alt="" style={{ width: 60, height: 90, borderRadius: 8, objectFit: "cover" }} />
                        : <MoviePoster movie={m} size="compact" />}
                      <div style={{ color: S.amber, fontSize: 11, fontWeight: 700, marginTop: 4 }}>\u2605 {m.rating}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ color: S.textMuted, fontSize: 10, marginTop: 16 }}>CineVerse Year in Review</div>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: 60, color: S.textMuted }}>No data for this year</div>
        )}
      </div>
    </div>
  );
}

/* ======================== PERSON FILMOGRAPHY MODAL ======================== */

function PersonFilmographyModal({ name, role, onClose, onBack, onSelectMovie, onToggleWatchlist, watchlist }) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchActorMovies(name, role)
      .then(r => { setMovies(r); setLoading(false); })
      .catch(() => setLoading(false));
  }, [name, role]);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 110, display: "flex", alignItems: "center",
      justifyContent: "center", background: "rgba(0,0,0,0.8)", backdropFilter: "blur(12px)", padding: 16 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <div style={{ background: S.bgPanel, borderRadius: S.radius + 4, width: "100%", maxWidth: 600,
        maxHeight: "90vh", display: "flex", flexDirection: "column", border: `1px solid ${S.border}`, overflow: "hidden" }}>
        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${S.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: `linear-gradient(135deg, ${S.purple}22, transparent)` }}>
          <div>
            <div style={{ color: S.textMuted, fontSize: 11, fontWeight: 600, textTransform: "uppercase",
              letterSpacing: 1, marginBottom: 4 }}>
              {role === "directed by" ? "Films Directed By" : "Movies Starring"}
            </div>
            <h2 style={{ color: S.text, margin: 0, fontWeight: 800, fontSize: 22 }}>{name}</h2>
            {!loading && <div style={{ color: S.textSec, fontSize: 12, marginTop: 4 }}>{movies.length} movies found</div>}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {onBack && (
              <button onClick={onBack}
                style={{ background: "rgba(0,0,0,0.3)", border: "none", cursor: "pointer", padding: 8, borderRadius: 8,
                  display: "flex", alignItems: "center", gap: 4 }}>
                <Icon name="back" size={18} color="#fff" />
                <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 11, fontWeight: 600 }}>Back</span>
              </button>
            )}
            <button onClick={onClose}
              style={{ background: "rgba(0,0,0,0.3)", border: "none", cursor: "pointer", padding: 8, borderRadius: 8 }}>
              <Icon name="x" size={20} color="#fff" /></button>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: 40 }}>
              <div style={{ width: 32, height: 32, border: `3px solid ${S.purple}`,
                borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite",
                margin: "0 auto 14px" }} />
              <div style={{ color: S.textSec, fontSize: 14 }}>Loading filmography...</div>
            </div>
          ) : movies.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10 }}>
              {movies.map(m => (
                <button key={m.id} onClick={() => onSelectMovie(m)}
                  style={{ display: "flex", gap: 12, alignItems: "center", padding: 12,
                    background: S.bgCard, borderRadius: S.radiusSm, border: `1px solid ${S.border}`,
                    cursor: "pointer", textAlign: "left", width: "100%", transition: "all 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = S.purple; e.currentTarget.style.transform = "scale(1.01)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = S.border; e.currentTarget.style.transform = "scale(1)"; }}>
                  <MoviePoster movie={m} size="compact" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: S.text, fontWeight: 600, fontSize: 14, overflow: "hidden",
                      textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.title}</div>
                    <div style={{ color: S.textSec, fontSize: 12, marginTop: 3 }}>
                      {m.year}{m.genre ? ` \u00B7 ${m.genre}` : ""}</div>
                    {m.rating && (
                      <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                        <Icon name="star" size={12} color={S.amber} />
                        <span style={{ color: S.amber, fontSize: 12, fontWeight: 700 }}>{m.rating}</span>
                      </div>
                    )}
                    {m.overview && (
                      <div style={{ color: S.textMuted, fontSize: 11, marginTop: 4, lineHeight: 1.4,
                        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {m.overview}</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: 40, color: S.textMuted, fontSize: 14 }}>
              No movies found for {name}</div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ======================== EXPLORE VIEW ======================== */

function ExploreView({ onToggleWatchlist, watchlist, onShareTo, showMenu, onMenuClick, preferredLangs, onEditLangs, onToggleWatched, watched }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [trending, setTrending] = useState([]);
  const [searching, setSearching] = useState(false);
  const [loadingTrending, setLoadingTrending] = useState(false);
  const [activeGenre, setActiveGenre] = useState([]);
  const [genreResults, setGenreResults] = useState([]);
  const [loadingGenre, setLoadingGenre] = useState(false);
  const [genreRound, setGenreRound] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [viewStack, setViewStack] = useState([]); // { type: "movie"|"person", movie?, name?, role? }
  const [showMoreLangs, setShowMoreLangs] = useState(false);
  const [contentType, setContentType] = useState("all"); // "all" | "movie" | "tv"
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ yearFrom: "", yearTo: "", minRating: "", sortBy: "popularity" });
  const [friendsTrending, setFriendsTrending] = useState([]);
  const [dailyMovie, setDailyMovie] = useState(null);
  const [exploreMode, setExploreMode] = useState("discover"); // "discover" | "calendar"
  const [calMonth, setCalMonth] = useState(() => { const d = new Date(); return { year: d.getFullYear(), month: d.getMonth() + 1 }; });
  const [calMovies, setCalMovies] = useState([]);
  const [loadingCal, setLoadingCal] = useState(false);
  const debounceRef = useRef(null);

  const currentView = viewStack.length > 0 ? viewStack[viewStack.length - 1] : null;
  const canGoBack = viewStack.length > 0;
  const pushView = (view) => setViewStack(prev => [...prev, view]);
  const goBack = () => setViewStack(prev => prev.slice(0, -1));
  const closeAll = () => setViewStack([]);

  useEffect(() => {
    setLoadingTrending(true);
    fetchTrending(contentType).then(r => { setTrending(r); setLoadingTrending(false); })
      .catch(() => setLoadingTrending(false));
    // Fetch trending among friends
    fetch("/api/trending/friends", {
      headers: { Authorization: `Bearer ${localStorage.getItem("fs:token")}` }
    }).then(r => r.json()).then(d => { if (Array.isArray(d)) setFriendsTrending(d); }).catch(() => {});
    // Fetch movie of the day
    fetch("/api/movies/daily").then(r => { if (r.ok) return r.json(); throw new Error(r.status); })
      .then(d => { if (d?.title) setDailyMovie(d); })
      .catch(e => console.error("Daily fetch error:", e));
  }, [contentType]);

  // Fetch calendar movies when month changes
  useEffect(() => {
    setLoadingCal(true);
    fetch(`/api/movies/calendar/${calMonth.year}/${calMonth.month}`)
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setCalMovies(d); setLoadingCal(false); })
      .catch(() => setLoadingCal(false));
  }, [calMonth]);

  const doSearch = useCallback(async (q) => {
    if (!q.trim()) { setResults([]); return; }
    setSearching(true); setError("");
    try {
      const r = await searchIMDB(q, contentType);
      setResults(r);
      if (r.length === 0) setError("No results found.");
    } catch (err) { setError(err.message || "Search failed."); setResults([]); }
    setSearching(false);
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (!query.trim()) { setResults([]); return; }
    debounceRef.current = setTimeout(() => doSearch(query), 700);
    return () => clearTimeout(debounceRef.current);
  }, [query, doSearch]);

  const isLanguage = useCallback((name) =>
    [...LANGUAGES, ...MORE_LANGUAGES].some(l => l.name === name), []);

  const getSelection = useCallback((sel) => {
    const genres = sel.filter(g => !isLanguage(g));
    const lang = sel.find(g => isLanguage(g)) || null;
    return { genres, language: lang };
  }, [isLanguage]);

  const handleGenreClick = useCallback(async (item) => {
    let newSelection;
    if (isLanguage(item)) {
      const currentGenres = activeGenre.filter(g => !isLanguage(g));
      const currentLang = activeGenre.find(g => isLanguage(g));
      newSelection = currentLang === item ? currentGenres : [...currentGenres, item];
    } else {
      newSelection = activeGenre.includes(item)
        ? activeGenre.filter(g => g !== item)
        : [...activeGenre, item];
    }
    setActiveGenre(newSelection);
    setGenreResults([]);
    setGenreRound(0);
    if (newSelection.length === 0) return;
    setLoadingGenre(true);
    try {
      const r = await searchGenreIMDB(getSelection(newSelection), 0, contentType, filters);
      setGenreResults(r);
      setGenreRound(1);
    } catch { setGenreResults([]); }
    setLoadingGenre(false);
  }, [activeGenre, isLanguage, getSelection]);

  const loadMoreGenre = useCallback(async () => {
    if (activeGenre.length === 0 || loadingMore) return;
    setLoadingMore(true);
    try {
      const r = await searchGenreIMDB(getSelection(activeGenre), genreRound, contentType, filters);
      const seen = new Set(genreResults.map(m => m.id));
      const fresh = r.filter(m => !seen.has(m.id));
      setGenreResults(prev => [...prev, ...fresh]);
      setGenreRound(prev => prev + 1);
    } catch {}
    setLoadingMore(false);
  }, [activeGenre, genreRound, genreResults, loadingMore, getSelection]);

  const genres = ["Action", "Animation", "Comedy", "Crime", "Drama", "Fantasy", "Horror", "Romance", "Sci-Fi", "Thriller", "Adventure", "Mystery", "Documentary", "Biography", "War", "Western", "Music", "Family"];

  return (
    <div style={{ flex: 1, overflowY: "auto", background: S.bg }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      {/* Header */}
      <div style={{ padding: "14px 24px", borderBottom: `1px solid ${S.border}`, background: S.bgPanel,
        display: "flex", alignItems: "center", gap: 12 }}>
        {showMenu && onMenuClick && (
          <button onClick={e => { e.stopPropagation(); onMenuClick(); }}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
            <Icon name="menu" size={20} color={S.textSec} /></button>
        )}
        <div>
          <h2 style={{ color: S.text, margin: 0, fontWeight: 800, fontSize: 20 }}>Explore</h2>
          <p style={{ color: S.textMuted, fontSize: 11, margin: 0 }}>Discover movies & TV shows</p>
        </div>
        {exploreMode === "discover" && (
          <div style={{ display: "flex", gap: 4, background: S.bg, borderRadius: S.radiusSm, padding: 3 }}>
            {[{ id: "all", label: "Both" }, { id: "movie", label: "Movies" }, { id: "tv", label: "TV Shows" }].map(t => (
              <button key={t.id} onClick={() => { setContentType(t.id); setResults([]); setTrending([]); setGenreResults([]); setActiveGenre([]); }}
                style={{ padding: "5px 12px", borderRadius: 6, border: "none", cursor: "pointer",
                  fontSize: 11, fontWeight: 600, transition: "all 0.15s",
                  background: contentType === t.id ? S.accent : "transparent",
                  color: contentType === t.id ? "#fff" : S.textSec }}>
                {t.label}
              </button>
            ))}
          </div>
        )}
        {/* Mode toggle */}
        <div style={{ display: "flex", gap: 4, background: S.bg, borderRadius: S.radiusSm, padding: 3, marginLeft: "auto" }}>
          <button onClick={() => setExploreMode("discover")}
            style={{ padding: "6px 14px", borderRadius: 6, border: "none", cursor: "pointer",
              fontSize: 12, fontWeight: 600, transition: "all 0.15s",
              background: exploreMode === "discover" ? S.purple : "transparent",
              color: exploreMode === "discover" ? "#fff" : S.textSec }}>
            Discover
          </button>
          <button onClick={() => setExploreMode("calendar")}
            style={{ padding: "6px 14px", borderRadius: 6, border: "none", cursor: "pointer",
              fontSize: 12, fontWeight: 600, transition: "all 0.15s",
              background: exploreMode === "calendar" ? S.green : "transparent",
              color: exploreMode === "calendar" ? "#fff" : S.textSec }}>
            Calendar
          </button>
        </div>
      </div>

      {exploreMode === "discover" && (
      <div style={{ padding: "16px 24px 0" }}>
        {/* Search */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", background: S.bgPanel,
          borderRadius: S.radiusSm, padding: "0 14px", border: `1px solid ${S.border}`, marginBottom: 20 }}>
          <Icon name="search" size={16} />
          <input placeholder="Search any movie..." value={query}
            onChange={e => { setQuery(e.target.value); setActiveGenre([]); setGenreResults([]); }}
            onKeyDown={e => { if (e.key === "Enter" && query.trim()) { clearTimeout(debounceRef.current); doSearch(query); }}}
            style={{ flex: 1, padding: "13px 0", background: "none", border: "none",
              color: S.text, fontSize: 14, outline: "none" }} />
          {searching && <div style={{ width: 16, height: 16, border: `2px solid ${S.accent}`,
            borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />}
          {query.trim() && !searching && (
            <button onClick={() => { setQuery(""); setResults([]); setError(""); }}
              style={{ background: S.bgCard, border: `1px solid ${S.border}`, borderRadius: 6,
                cursor: "pointer", padding: "5px 12px", display: "flex", alignItems: "center", gap: 5,
                transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = S.accent; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = S.border; }}>
              <Icon name="x" size={14} color={S.textSec} />
              <span style={{ color: S.textSec, fontSize: 11, fontWeight: 600 }}>Clear</span>
            </button>
          )}
        </div>
        {/* Filters */}
        <div style={{ marginBottom: 12 }}>
          <button onClick={() => setShowFilters(!showFilters)}
            style={{ background: "none", border: `1px solid ${showFilters ? S.accent : S.border}`, borderRadius: 6,
              padding: "5px 12px", cursor: "pointer", fontSize: 11, fontWeight: 600,
              color: showFilters ? S.accent : S.textSec, display: "flex", alignItems: "center", gap: 5 }}>
            <Icon name="settings" size={13} color={showFilters ? S.accent : S.textSec} /> Filters
          </button>
          {showFilters && (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8, padding: 12,
              background: S.bgCard, borderRadius: S.radiusSm, border: `1px solid ${S.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: S.textMuted, fontSize: 11 }}>Year:</span>
                <input type="number" placeholder="From" value={filters.yearFrom}
                  onChange={e => setFilters(p => ({ ...p, yearFrom: e.target.value }))}
                  style={{ width: 70, padding: "5px 8px", borderRadius: 4, border: `1px solid ${S.border}`,
                    background: S.bgPanel, color: S.text, fontSize: 12, outline: "none" }} />
                <span style={{ color: S.textMuted }}>-</span>
                <input type="number" placeholder="To" value={filters.yearTo}
                  onChange={e => setFilters(p => ({ ...p, yearTo: e.target.value }))}
                  style={{ width: 70, padding: "5px 8px", borderRadius: 4, border: `1px solid ${S.border}`,
                    background: S.bgPanel, color: S.text, fontSize: 12, outline: "none" }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: S.textMuted, fontSize: 11 }}>Min Rating:</span>
                <input type="number" placeholder="0" min="0" max="10" step="0.5" value={filters.minRating}
                  onChange={e => setFilters(p => ({ ...p, minRating: e.target.value }))}
                  style={{ width: 55, padding: "5px 8px", borderRadius: 4, border: `1px solid ${S.border}`,
                    background: S.bgPanel, color: S.text, fontSize: 12, outline: "none" }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: S.textMuted, fontSize: 11 }}>Sort:</span>
                <select value={filters.sortBy} onChange={e => setFilters(p => ({ ...p, sortBy: e.target.value }))}
                  style={{ padding: "5px 8px", borderRadius: 4, border: `1px solid ${S.border}`,
                    background: S.bgPanel, color: S.text, fontSize: 12, outline: "none" }}>
                  <option value="popularity">Popularity</option>
                  <option value="rating">Rating</option>
                  <option value="date">Release Date</option>
                </select>
              </div>
            </div>
          )}
        </div>
        {/* Search results */}
        {query.trim() && !searching && results.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <div style={{ color: S.textSec, fontSize: 12, fontWeight: 600, marginBottom: 10,
              textTransform: "uppercase", letterSpacing: 1 }}>Auditions</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 10 }}>
              {results.map(m => (
                <MovieCard key={m.id} movie={m} compact
                  onToggleWatchlist={onToggleWatchlist}
                  inWatchlist={watchlist.some(w => w.id === m.id)}
                  onShare={() => pushView({ type: "movie", movie: m })} />
              ))}
            </div>
          </div>
        )}
        {query.trim() && !searching && error && (
          <div style={{ textAlign: "center", padding: 20, color: S.textMuted, fontSize: 13, marginBottom: 20 }}>{error}</div>
        )}
        {query.trim() && searching && (
          <div style={{ textAlign: "center", padding: 30, marginBottom: 20 }}>
            <div style={{ width: 28, height: 28, border: `3px solid ${S.accent}`,
              borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite",
              margin: "0 auto 12px" }} />
            <div style={{ color: S.textSec, fontSize: 13 }}>Searching...</div>
          </div>
        )}

        {/* Trending */}
        {!query.trim() && (
          <>
            {/* Movie of the Day */}
            {dailyMovie && (
              <div style={{ marginBottom: 28 }}>
                <div style={{ color: S.text, fontSize: 16, fontWeight: 700, marginBottom: 12,
                  display: "flex", alignItems: "center", gap: 8 }}>
                  <Icon name="star" size={18} color={S.amber} /> Movie of the Day
                </div>
                <div onClick={() => pushView({ type: "movie", movie: dailyMovie })}
                  style={{ display: "flex", gap: 16, padding: 18, borderRadius: S.radius,
                    background: `linear-gradient(135deg, ${S.amber}12, ${S.purple}10)`,
                    border: `1px solid ${S.amber}33`, cursor: "pointer", transition: "all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = S.amber; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = S.amber + "33"; e.currentTarget.style.transform = "translateY(0)"; }}>
                  {dailyMovie.poster ? (
                    <img src={dailyMovie.poster} alt="" style={{ width: 80, height: 120, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
                  ) : <MoviePoster movie={dailyMovie} size="normal" />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ color: S.text, fontSize: 20, fontWeight: 800, margin: "0 0 4px" }}>{dailyMovie.title}</h3>
                    <div style={{ color: S.textSec, fontSize: 13 }}>{dailyMovie.year} {"\u00B7"} {dailyMovie.genre}</div>
                    {dailyMovie.director && <div style={{ color: S.textMuted, fontSize: 12, marginTop: 2 }}>Directed by {dailyMovie.director}</div>}
                    {dailyMovie.tagline && <div style={{ color: S.purple, fontSize: 12, fontStyle: "italic", marginTop: 6 }}>"{dailyMovie.tagline}"</div>}
                    <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                      {dailyMovie.imdb_rating && (
                        <span style={{ color: S.amber, fontSize: 13, fontWeight: 700 }}>{"\u2605"} {dailyMovie.imdb_rating} IMDb</span>
                      )}
                      {dailyMovie.rating && !dailyMovie.imdb_rating && (
                        <span style={{ color: S.amber, fontSize: 13, fontWeight: 700 }}>{"\u2605"} {dailyMovie.rating}</span>
                      )}
                    </div>
                    {dailyMovie.overview && (
                      <div style={{ color: S.textSec, fontSize: 12, marginTop: 6, lineHeight: 1.5,
                        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {dailyMovie.overview}</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div style={{ marginBottom: 28 }}>
              <div style={{ color: S.text, fontSize: 16, fontWeight: 700, marginBottom: 12,
                display: "flex", alignItems: "center", gap: 8 }}>
                <Icon name="zap" size={18} color={S.amber} /> Trending Now
              </div>
              {loadingTrending ? (
                <div style={{ textAlign: "center", padding: 30 }}>
                  <div style={{ width: 28, height: 28, border: `3px solid ${S.purple}`,
                    borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite",
                    margin: "0 auto 12px" }} />
                  <div style={{ color: S.textSec, fontSize: 13 }}>Loading trending movies...</div>
                </div>
              ) : trending.length > 0 ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 10 }}>
                  {trending.map(m => (
                    <MovieCard key={m.id} movie={m} compact
                      onToggleWatchlist={onToggleWatchlist}
                      inWatchlist={watchlist.some(w => w.id === m.id)}
                      onShare={() => pushView({ type: "movie", movie: m })} />
                  ))}
                </div>
              ) : (
                <div style={{ color: S.textMuted, fontSize: 13, padding: 20, textAlign: "center" }}>
                  Could not load trending movies</div>
              )}
            </div>

            {/* Trending Among Friends */}
            {friendsTrending.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <div style={{ color: S.text, fontSize: 16, fontWeight: 700, marginBottom: 12,
                  display: "flex", alignItems: "center", gap: 8 }}>
                  <Icon name="heart" size={18} color={S.accent} /> Trending Among Friends
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 10 }}>
                  {friendsTrending.map((m, i) => (
                    <div key={m.title + i} onClick={() => pushView({ type: "movie", movie: { ...m, id: m.imdb_id || `ft-${i}` } })}
                      style={{ display: "flex", gap: 12, alignItems: "center", padding: 12,
                        background: S.bgCard, borderRadius: S.radiusSm, border: `1px solid ${S.border}`,
                        cursor: "pointer", transition: "border-color 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = S.accent}
                      onMouseLeave={e => e.currentTarget.style.borderColor = S.border}>
                      <MoviePoster movie={m} size="compact" />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: S.text, fontWeight: 600, fontSize: 13, overflow: "hidden",
                          textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.title}</div>
                        <div style={{ color: S.textSec, fontSize: 11, marginTop: 2 }}>
                          {m.year}{m.genre ? ` \u00B7 ${m.genre}` : ""}</div>
                        <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                          <span style={{ color: S.purple, fontSize: 10, fontWeight: 700 }}>
                            {m.shareCount}x shared
                          </span>
                          {m.avgRating && (
                            <span style={{ color: S.amber, fontSize: 10, fontWeight: 700 }}>
                              {"\u2605"} {m.avgRating} avg
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Browse by Genre */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ color: S.text, fontSize: 16, fontWeight: 700, marginBottom: 12,
                display: "flex", alignItems: "center", gap: 8 }}>
                <Icon name="film" size={18} color={S.accent} /> Browse by Genre
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {genres.map(g => {
                  const active = activeGenre.includes(g);
                  return (
                    <button key={g} onClick={() => handleGenreClick(g)}
                      style={{ padding: "7px 16px", borderRadius: 20, cursor: "pointer",
                        fontSize: 12, fontWeight: 600, transition: "all 0.15s",
                        background: active ? S.accent + "25" : S.bgPanel,
                        color: active ? S.accent : S.textSec,
                        border: `1px solid ${active ? S.accent + "55" : S.border}` }}>
                      {g}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Browse by Language */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ color: S.text, fontSize: 16, fontWeight: 700, marginBottom: 12,
                display: "flex", alignItems: "center", gap: 8 }}>
                <Icon name="globe" size={18} color={S.blue} /> Browse by Language
                <button onClick={onEditLangs}
                  style={{ marginLeft: "auto", background: "none", border: `1px solid ${S.border}`,
                    borderRadius: 6, padding: "4px 10px", cursor: "pointer",
                    color: S.textMuted, fontSize: 11, fontWeight: 600, transition: "all 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = S.blue; e.currentTarget.style.color = S.blue; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = S.border; e.currentTarget.style.color = S.textMuted; }}>
                  Edit
                </button>
              </div>
              {(() => {
                const mainLangs = ALL_LANGS.filter(l => preferredLangs.includes(l.name));
                const otherLangs = ALL_LANGS.filter(l => !preferredLangs.includes(l.name));
                return (
                  <>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {mainLangs.map(l => {
                        const active = activeGenre.includes(l.name);
                        return (
                          <button key={l.name} onClick={() => handleGenreClick(l.name)}
                            style={{ padding: "7px 16px", borderRadius: 20, cursor: "pointer",
                              fontSize: 12, fontWeight: 600, transition: "all 0.15s",
                              background: active ? S.blue + "25" : S.bgPanel,
                              color: active ? S.blue : S.textSec,
                              border: `1px solid ${active ? S.blue + "55" : S.border}`,
                              display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: 15 }}>{l.flag}</span> {l.name}
                          </button>
                        );
                      })}
                      {otherLangs.length > 0 && (
                        <button onClick={() => setShowMoreLangs(!showMoreLangs)}
                          style={{ padding: "7px 16px", borderRadius: 20, cursor: "pointer",
                            fontSize: 12, fontWeight: 600, transition: "all 0.15s",
                            background: showMoreLangs ? S.purple + "25" : S.bgPanel,
                            color: showMoreLangs ? S.purple : S.textSec,
                            border: `1px solid ${showMoreLangs ? S.purple + "55" : S.border}`,
                            display: "flex", alignItems: "center", gap: 4 }}>
                          {showMoreLangs ? "Less \u25B2" : `More (${otherLangs.length}) \u25BC`}
                        </button>
                      )}
                    </div>
                    {showMoreLangs && otherLangs.length > 0 && (
                      <div style={{ marginTop: 10, padding: 14, borderRadius: S.radius,
                        background: S.bgCard, border: `1px solid ${S.border}` }}>
                        <div style={{ color: S.textMuted, fontSize: 11, fontWeight: 600, marginBottom: 10,
                          textTransform: "uppercase", letterSpacing: 1 }}>Other Languages</div>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {otherLangs.map(l => {
                            const active = activeGenre.includes(l.name);
                            return (
                              <button key={l.name} onClick={() => handleGenreClick(l.name)}
                                style={{ padding: "6px 14px", borderRadius: 20, cursor: "pointer",
                                  fontSize: 11, fontWeight: 600, transition: "all 0.15s",
                                  background: active ? S.blue + "25" : S.bgPanel,
                                  color: active ? S.blue : S.textSec,
                                  border: `1px solid ${active ? S.blue + "55" : S.border}`,
                                  display: "flex", alignItems: "center", gap: 5 }}>
                                <span style={{ fontSize: 14 }}>{l.flag}</span> {l.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

            {/* Shared results area */}
            {activeGenre.length > 0 && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <div style={{ color: S.text, fontSize: 16, fontWeight: 700 }}>
                    {(() => {
                      const g = activeGenre.filter(x => !isLanguage(x));
                      const l = activeGenre.find(x => isLanguage(x));
                      const parts = [];
                      if (l) parts.push(l);
                      if (g.length > 0) parts.push(g.join(" + "));
                      return parts.join(" · ");
                    })()} Movies
                  </div>
                  <button onClick={() => { setActiveGenre([]); setGenreResults([]); setGenreRound(0); }}
                    style={{ background: S.bgCard, border: `1px solid ${S.border}`, borderRadius: 6,
                      cursor: "pointer", padding: "3px 10px", display: "flex", alignItems: "center", gap: 4 }}>
                    <Icon name="x" size={14} color={S.textMuted} />
                    <span style={{ color: S.textMuted, fontSize: 11, fontWeight: 600 }}>Clear</span>
                  </button>
                </div>
                {loadingGenre ? (
                  <div style={{ textAlign: "center", padding: 30 }}>
                    <div style={{ width: 28, height: 28, border: `3px solid ${S.purple}`,
                      borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite",
                      margin: "0 auto 12px" }} />
                    <div style={{ color: S.textSec, fontSize: 13 }}>Finding {activeGenre.join(" · ")} movies...</div>
                  </div>
                ) : genreResults.length > 0 ? (
                  <>
                    <div style={{ color: S.textSec, fontSize: 12, marginBottom: 10 }}>
                      {genreResults.length} movies found</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 10 }}>
                      {genreResults.map(m => (
                        <MovieCard key={m.id} movie={m} compact
                          onToggleWatchlist={onToggleWatchlist}
                          inWatchlist={watchlist.some(w => w.id === m.id)}
                          onShare={() => pushView({ type: "movie", movie: m })} />
                      ))}
                    </div>
                    <div style={{ textAlign: "center", marginTop: 20 }}>
                      <button onClick={loadMoreGenre} disabled={loadingMore}
                        style={{ padding: "12px 32px", borderRadius: S.radiusSm, border: `1px solid ${S.accent}`,
                          background: loadingMore ? S.bgCard : "transparent",
                          color: S.accent, fontWeight: 600, fontSize: 14, cursor: loadingMore ? "default" : "pointer",
                          display: "inline-flex", alignItems: "center", gap: 8, transition: "all 0.15s" }}>
                        {loadingMore ? (
                          <>
                            <div style={{ width: 14, height: 14, border: `2px solid ${S.accent}`,
                              borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
                            Loading more...
                          </>
                        ) : "Load More Movies"}
                      </button>
                    </div>
                  </>
                ) : (
                  <div style={{ color: S.textMuted, fontSize: 13, textAlign: "center", padding: 20 }}>
                    No results found for {activeGenre.join(" · ")}</div>
                )}
              </div>
            )}

          </>
        )}
      </div>
      )}

      {/* Calendar View */}
      {exploreMode === "calendar" && (
        <div style={{ padding: "20px 24px", flex: 1, overflowY: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <div style={{ color: S.text, fontSize: 22, fontWeight: 800, display: "flex", alignItems: "center", gap: 10 }}>
              <Icon name="grid" size={22} color={S.green} /> Upcoming Releases
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button onClick={() => setCalMonth(p => {
                const d = new Date(p.year, p.month - 2, 1);
                return { year: d.getFullYear(), month: d.getMonth() + 1 };
              })} style={{ background: S.bgCard, border: `1px solid ${S.border}`, borderRadius: 8,
                cursor: "pointer", padding: "6px 14px", color: S.text, fontSize: 14, fontWeight: 600,
                transition: "all 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = S.green}
                onMouseLeave={e => e.currentTarget.style.borderColor = S.border}>{"\u2190"}</button>
              <span style={{ color: S.text, fontSize: 18, fontWeight: 800, minWidth: 180, textAlign: "center" }}>
                {new Date(calMonth.year, calMonth.month - 1).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </span>
              <button onClick={() => setCalMonth(p => {
                const d = new Date(p.year, p.month, 1);
                return { year: d.getFullYear(), month: d.getMonth() + 1 };
              })} style={{ background: S.bgCard, border: `1px solid ${S.border}`, borderRadius: 8,
                cursor: "pointer", padding: "6px 14px", color: S.text, fontSize: 14, fontWeight: 600,
                transition: "all 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = S.green}
                onMouseLeave={e => e.currentTarget.style.borderColor = S.border}>{"\u2192"}</button>
            </div>
          </div>
          {loadingCal ? (
            <div style={{ textAlign: "center", padding: 60 }}>
              <div style={{ width: 32, height: 32, border: `3px solid ${S.green}`,
                borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite",
                margin: "0 auto 14px" }} />
              <div style={{ color: S.textSec, fontSize: 14 }}>Loading releases...</div>
            </div>
          ) : calMovies.length > 0 ? (
            <div>
              {(() => {
                const grouped = {};
                calMovies.forEach(m => {
                  const date = m.release_date || "Unknown";
                  if (!grouped[date]) grouped[date] = [];
                  grouped[date].push(m);
                });
                return Object.entries(grouped).map(([date, movies]) => (
                  <div key={date} style={{ marginBottom: 24 }}>
                    <div style={{ color: S.green, fontSize: 13, fontWeight: 700, marginBottom: 10,
                      padding: "6px 14px", background: S.green + "15", borderRadius: 6, display: "inline-block" }}>
                      {new Date(date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 10 }}>
                      {movies.map(m => (
                        <div key={m.id} onClick={() => pushView({ type: "movie", movie: m })}
                          style={{ display: "flex", gap: 14, alignItems: "center", padding: 14,
                            background: S.bgCard, borderRadius: S.radius, border: `1px solid ${S.border}`,
                            cursor: "pointer", transition: "all 0.2s" }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = S.green; e.currentTarget.style.transform = "translateY(-2px)"; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = S.border; e.currentTarget.style.transform = "translateY(0)"; }}>
                          {m.poster ? (
                            <img src={m.poster} alt="" style={{ width: 50, height: 75, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
                          ) : <MoviePoster movie={m} size="compact" />}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ color: S.text, fontWeight: 700, fontSize: 15, overflow: "hidden",
                              textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.title}</div>
                            <div style={{ color: S.textSec, fontSize: 12, marginTop: 3 }}>{m.genre}</div>
                            {m.overview && (
                              <div style={{ color: S.textMuted, fontSize: 11, marginTop: 4, lineHeight: 1.4,
                                display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                {m.overview}</div>
                            )}
                            {m.rating > 0 && (
                              <div style={{ color: S.amber, fontSize: 12, fontWeight: 700, marginTop: 4 }}>{"\u2605"} {m.rating}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ));
              })()}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: 60, color: S.textMuted, fontSize: 14 }}>
              No releases found for this month</div>
          )}
        </div>
      )}
      {currentView?.type === "movie" && (
        <MovieDetailModal movie={currentView.movie}
          onClose={closeAll}
          onBack={canGoBack ? goBack : null}
          onShare={(m) => { closeAll(); onShareTo(m); }}
          onToggleWatchlist={onToggleWatchlist}
          watchlist={watchlist}
          onViewPerson={(name, role) => pushView({ type: "person", name, role })}
          onToggleWatched={onToggleWatched} watched={watched} />
      )}
      {currentView?.type === "person" && (
        <PersonFilmographyModal
          name={currentView.name} role={currentView.role}
          onClose={closeAll}
          onBack={canGoBack ? goBack : null}
          onSelectMovie={(m) => pushView({ type: "movie", movie: m })}
          onToggleWatchlist={onToggleWatchlist}
          watchlist={watchlist} />
      )}
    </div>
  );
}

function ShareToModal({ movie, onClose, convos, allUsers, currentUser, onShare, onNewChat }) {
  const myConvos = convos.filter(c => c.participants.includes(currentUser.username));
  const [note, setNote] = useState("");
  const [selectedConvo, setSelectedConvo] = useState(null);

  const getConvoName = (c) => {
    if (c.type === "group") return c.name;
    const other = c.participants.find(p => p !== currentUser.username);
    return allUsers.find(u => u.username === other)?.displayName || other;
  };
  const getConvoUser = (c) => {
    if (c.type === "group") return { displayName: c.name, avatar: c.name.slice(0, 2).toUpperCase(), color: "#7C3AED" };
    const other = c.participants.find(p => p !== currentUser.username);
    return allUsers.find(u => u.username === other) || { displayName: other, avatar: "?", color: "#666" };
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center",
      justifyContent: "center", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", padding: 16 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: S.bgPanel, borderRadius: S.radius + 4, width: "100%", maxWidth: 440,
        maxHeight: "80vh", display: "flex", flexDirection: "column", border: `1px solid ${S.border}`, overflow: "hidden" }}>
        <div style={{ padding: "18px 20px", borderBottom: `1px solid ${S.border}`,
          display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: S.text, fontWeight: 700, fontSize: 17 }}>
            {selectedConvo ? "Add a note" : "Share to..."}</span>
          <button onClick={selectedConvo ? () => setSelectedConvo(null) : onClose}
            style={{ background: "none", border: "none", cursor: "pointer" }}>
            <Icon name={selectedConvo ? "back" : "x"} size={20} color={S.textSec} /></button>
        </div>

        {selectedConvo ? (
          <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
            <MovieCard movie={movie} compact />
            <textarea placeholder="Add a note (optional)..." value={note} onChange={e => setNote(e.target.value)}
              style={{ width: "100%", padding: 12, borderRadius: S.radiusSm, background: S.bg,
                border: `1px solid ${S.border}`, color: S.text, fontSize: 14, resize: "vertical",
                minHeight: 60, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
            <button onClick={() => { onShare(selectedConvo, movie, note); onClose(); }}
              style={{ padding: "12px 0", border: "none", borderRadius: S.radiusSm,
                background: `linear-gradient(135deg, ${S.accent}, ${S.accentSoft})`, color: "#fff",
                fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Send</button>
          </div>
        ) : (
          <div style={{ flex: 1, overflowY: "auto" }}>
            <div style={{ padding: "12px 20px 8px", color: S.textSec, fontSize: 11, fontWeight: 600,
              textTransform: "uppercase", letterSpacing: 1 }}>Your conversations</div>
            {myConvos.length === 0 ? (
              <div style={{ padding: 30, textAlign: "center" }}>
                <div style={{ color: S.textMuted, fontSize: 13, marginBottom: 12 }}>No conversations yet</div>
                <button onClick={() => { onClose(); onNewChat(); }}
                  style={{ padding: "8px 16px", borderRadius: S.radiusSm, border: `1px solid ${S.accent}`,
                    background: "transparent", color: S.accent, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                  Start a Chat</button>
              </div>
            ) : myConvos.map(c => {
              const cu = getConvoUser(c);
              return (
                <button key={c.id} onClick={() => setSelectedConvo(c.id)}
                  style={{ width: "100%", display: "flex", gap: 12, alignItems: "center", padding: "10px 20px",
                    border: "none", cursor: "pointer", textAlign: "left",
                    background: "transparent", transition: "background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = S.bgHover}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <Avatar user={cu} size={36} />
                  <div>
                    <div style={{ color: S.text, fontWeight: 600, fontSize: 14 }}>{getConvoName(c)}</div>
                    <div style={{ color: S.textMuted, fontSize: 11 }}>
                      {c.type === "group" ? `${c.participants.length} members` : "Private"}</div>
                  </div>
                  <Icon name="send" size={16} color={S.textMuted} />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ======================== NOTIFICATION PANEL ======================== */

function NotificationPanel({ onClose, api, onAcceptFriend, onRejectFriend }) {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [handled, setHandled] = useState({});
  useEffect(() => {
    api("/notifications").then(d => { if (Array.isArray(d)) setNotifs(d); setLoading(false); });
    api("/notifications/read", { method: "POST" });
  }, [api]);
  const timeAgoFull = (ts) => {
    const d = Date.now() - new Date(ts).getTime();
    if (d < 60000) return "just now"; if (d < 3600000) return Math.floor(d / 60000) + "m ago";
    if (d < 86400000) return Math.floor(d / 3600000) + "h ago"; return Math.floor(d / 86400000) + "d ago";
  };
  const typeIcon = { share: "\uD83C\uDFAC", reaction: "\uD83D\uDC4D", rating: "\u2B50", review: "\u270D\uFE0F", poll: "\uD83D\uDCCA", poll_vote: "\u2705", friend_request: "\uD83C\uDFAC", friend_accepted: "\uD83C\uDF89" };
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", justifyContent: "flex-start" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ width: 360, maxWidth: "90vw", height: "100%", background: S.bgPanel,
        borderRight: `1px solid ${S.border}`, display: "flex", flexDirection: "column", boxShadow: "4px 0 24px rgba(0,0,0,0.5)" }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${S.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ color: S.text, fontSize: 18, fontWeight: 800, margin: 0 }}>{"\uD83D\uDD14"} Notifications</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
            <Icon name="x" size={18} color={S.textSec} /></button>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {loading ? <div style={{ textAlign: "center", padding: 40, color: S.textMuted }}>Loading...</div>
          : notifs.length === 0 ? <div style={{ textAlign: "center", padding: 40, color: S.textMuted }}>No notifications yet</div>
          : notifs.map(n => (
            <div key={n.id} style={{ padding: "12px 20px", borderBottom: `1px solid ${S.border}06`,
              background: n.isRead ? "transparent" : S.purple + "08", display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: n.from?.color || S.bgCard,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800,
                color: "#fff", flexShrink: 0 }}>{n.from?.avatar || "?"}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: S.text, fontSize: 13, fontWeight: 600 }}>
                  <span>{n.from?.displayName || "Someone"}</span>
                  <span style={{ color: S.textSec, fontWeight: 400 }}> {n.title?.toLowerCase()}</span>
                </div>
                <div style={{ color: S.textMuted, fontSize: 12, marginTop: 2, overflow: "hidden",
                  textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{typeIcon[n.type] || ""} {n.body}</div>
                {n.type === "friend_request" && !handled[n.id] && (
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <button onClick={async () => {
                      if (onAcceptFriend && n.from?.id) { await onAcceptFriend(n.from.id); setHandled(prev => ({ ...prev, [n.id]: "accepted" })); }
                    }} style={{ padding: "4px 14px", borderRadius: 6, border: "none", background: S.green, color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Accept</button>
                    <button onClick={async () => {
                      if (onRejectFriend && n.from?.id) { await onRejectFriend(n.from.id); setHandled(prev => ({ ...prev, [n.id]: "rejected" })); }
                    }} style={{ padding: "4px 14px", borderRadius: 6, border: `1px solid ${S.border}`, background: "transparent", color: S.textMuted, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Pass</button>
                  </div>
                )}
                {n.type === "friend_request" && handled[n.id] === "accepted" && (
                  <div style={{ marginTop: 8, padding: "6px 12px", borderRadius: 6, background: S.green + "15",
                    border: `1px solid ${S.green}33`, display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <span style={{ color: S.green, fontSize: 12, fontWeight: 700 }}>{"\u2713"} You're now co-stars! {"\uD83C\uDFAC"}</span>
                  </div>
                )}
                {n.type === "friend_request" && handled[n.id] === "rejected" && (
                  <div style={{ marginTop: 8, color: S.textMuted, fontSize: 11, fontStyle: "italic" }}>Didn't make the cut</div>
                )}
                <div style={{ color: S.textMuted, fontSize: 10, marginTop: 3 }}>{timeAgoFull(n.createdAt)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ======================== LIST MOVIE SEARCH ======================== */

function ListMovieSearch({ listId, onAdd }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [added, setAdded] = useState(new Set());
  const timeoutRef = useRef(null);

  const search = (q) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (!q.trim()) { setResults([]); return; }
    timeoutRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const token = localStorage.getItem("fs:token");
        const res = await fetch("/api/movies/search", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ query: q.trim() }),
        });
        const data = await res.json();
        if (Array.isArray(data)) setResults(data.slice(0, 6));
      } catch {}
      setSearching(false);
    }, 300);
  };

  const addMovie = async (movie) => {
    try {
      const token = localStorage.getItem("fs:token");
      await fetch(`/api/lists/${listId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ movie: { title: movie.title, year: movie.year, genre: movie.genre, rating: movie.rating, poster: movie.poster, media_type: movie.media_type } }),
      });
      setAdded(prev => new Set([...prev, movie.title]));
      onAdd({ title: movie.title, year: movie.year, genre: movie.genre, rating: movie.rating, poster: movie.poster });
    } catch {}
  };

  return (
    <div>
      <div style={{ position: "relative" }}>
        <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
          <Icon name="search" size={14} color={S.textMuted} />
        </div>
        <input value={query} onChange={e => { setQuery(e.target.value); search(e.target.value); }}
          placeholder="Search movies to add..."
          style={{ width: "100%", padding: "10px 12px 10px 34px", borderRadius: S.radiusSm, background: S.bg,
            border: `1px solid ${S.border}`, color: S.text, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
      </div>
      {results.length > 0 && (
        <div style={{ marginTop: 8, maxHeight: 280, overflowY: "auto", borderRadius: S.radiusSm,
          border: `1px solid ${S.border}`, background: S.bgCard }}>
          {results.map((m, i) => {
            const isAdded = added.has(m.title);
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px",
                borderBottom: i < results.length - 1 ? `1px solid ${S.border}` : "none" }}>
                {m.poster ? (
                  <img src={m.poster} alt="" style={{ width: 32, height: 48, borderRadius: 4, objectFit: "cover", flexShrink: 0 }} />
                ) : <div style={{ width: 32, height: 48, borderRadius: 4, background: S.bg, flexShrink: 0 }} />}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: S.text, fontSize: 13, fontWeight: 600, overflow: "hidden",
                    textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.title}</div>
                  <div style={{ color: S.textMuted, fontSize: 11 }}>{m.year} {m.genre && `· ${m.genre}`}</div>
                </div>
                <button onClick={() => !isAdded && addMovie(m)} disabled={isAdded}
                  style={{ padding: "5px 14px", borderRadius: 6, border: "none", flexShrink: 0,
                    background: isAdded ? S.green + "20" : S.purple, color: isAdded ? S.green : "#fff",
                    fontSize: 11, fontWeight: 700, cursor: isAdded ? "default" : "pointer" }}>
                  {isAdded ? "\u2713 Added" : "+ Add"}
                </button>
              </div>
            );
          })}
        </div>
      )}
      {searching && <div style={{ textAlign: "center", padding: 12, color: S.textMuted, fontSize: 11 }}>Searching...</div>}
    </div>
  );
}

/* ======================== CREATE LIST MODAL ======================== */

function CreateListModal({ onClose, onSave }) {
  const [name, setName] = useState(""); const [desc, setDesc] = useState("");
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 140, display: "flex", alignItems: "center",
      justifyContent: "center", background: "rgba(0,0,0,0.7)" }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: S.bgPanel, borderRadius: S.radius, width: "100%", maxWidth: 380,
        padding: 24, border: `1px solid ${S.border}` }}>
        <h3 style={{ color: S.text, fontSize: 18, fontWeight: 800, margin: "0 0 16px" }}>Create List</h3>
        <input placeholder="List name (e.g. Best Horror)" value={name} onChange={e => setName(e.target.value)}
          style={{ width: "100%", padding: 12, borderRadius: S.radiusSm, border: `1px solid ${S.border}`,
            background: S.bgCard, color: S.text, fontSize: 14, outline: "none", marginBottom: 10, boxSizing: "border-box" }} />
        <input placeholder="Description (optional)" value={desc} onChange={e => setDesc(e.target.value)}
          style={{ width: "100%", padding: 12, borderRadius: S.radiusSm, border: `1px solid ${S.border}`,
            background: S.bgCard, color: S.text, fontSize: 13, outline: "none", marginBottom: 16, boxSizing: "border-box" }} />
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "10px 20px", borderRadius: S.radiusSm, border: `1px solid ${S.border}`,
            background: "transparent", color: S.textSec, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
          <button onClick={() => { if (name.trim()) onSave(name.trim(), desc.trim()); }}
            style={{ padding: "10px 20px", borderRadius: S.radiusSm, border: "none",
              background: S.purple, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer",
              opacity: name.trim() ? 1 : 0.5 }}>Create</button>
        </div>
      </div>
    </div>
  );
}

/* ======================== CREATE POLL MODAL ======================== */

function CreatePollModal({ onClose, onSave }) {
  const [question, setQuestion] = useState("What should we watch?");
  const [options, setOptions] = useState([{ title: "", year: "", poster: null, genre: "" }, { title: "", year: "", poster: null, genre: "" }]);
  const [searchIdx, setSearchIdx] = useState(null);
  const [searchQ, setSearchQ] = useState("");
  const [results, setResults] = useState([]);
  const debRef = useRef(null);
  useEffect(() => {
    if (!searchQ.trim()) { setResults([]); return; }
    clearTimeout(debRef.current);
    debRef.current = setTimeout(async () => {
      try {
        const res = await fetch("/api/movies/search", { method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("fs:token")}` },
          body: JSON.stringify({ query: searchQ }) });
        const data = await res.json();
        setResults(Array.isArray(data) ? data.slice(0, 5) : []);
      } catch { setResults([]); }
    }, 300);
  }, [searchQ]);
  const selectMovie = (movie, idx) => {
    const newOpts = [...options];
    newOpts[idx] = { title: movie.title, year: movie.year, poster: movie.poster, genre: movie.genre };
    setOptions(newOpts); setSearchIdx(null); setSearchQ(""); setResults([]);
  };
  const addOption = () => { if (options.length < 6) setOptions([...options, { title: "", year: "", poster: null, genre: "" }]); };
  const removeOption = (i) => { if (options.length > 2) setOptions(options.filter((_, j) => j !== i)); };
  const valid = question.trim() && options.filter(o => o.title).length >= 2;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 140, display: "flex", alignItems: "center",
      justifyContent: "center", background: "rgba(0,0,0,0.7)", padding: 16 }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: S.bgPanel, borderRadius: S.radius, width: "100%", maxWidth: 440,
        maxHeight: "85vh", overflowY: "auto", padding: 24, border: `1px solid ${S.border}` }}>
        <h3 style={{ color: S.text, fontSize: 18, fontWeight: 800, margin: "0 0 16px" }}>{"\uD83D\uDCCA"} Create Poll</h3>
        <input placeholder="Question" value={question} onChange={e => setQuestion(e.target.value)}
          style={{ width: "100%", padding: 12, borderRadius: S.radiusSm, border: `1px solid ${S.border}`,
            background: S.bgCard, color: S.text, fontSize: 14, outline: "none", marginBottom: 16, boxSizing: "border-box" }} />
        <div style={{ color: S.textMuted, fontSize: 11, fontWeight: 600, marginBottom: 8 }}>OPTIONS (pick movies)</div>
        {options.map((o, i) => (
          <div key={i} style={{ marginBottom: 8, position: "relative" }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {o.poster && <img src={o.poster} alt="" style={{ width: 32, height: 48, borderRadius: 4, objectFit: "cover" }} />}
              <div onClick={() => { setSearchIdx(i); setSearchQ(o.title || ""); }}
                style={{ flex: 1, padding: 10, borderRadius: S.radiusSm, border: `1px solid ${S.border}`,
                  background: S.bgCard, color: o.title ? S.text : S.textMuted, fontSize: 13, cursor: "pointer",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {o.title ? `${o.title} (${o.year})` : `Option ${i + 1} — click to search`}
              </div>
              {options.length > 2 && <button onClick={() => removeOption(i)}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                <Icon name="x" size={14} color={S.textMuted} /></button>}
            </div>
            {searchIdx === i && (
              <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 10, background: S.bgPanel,
                border: `1px solid ${S.border}`, borderRadius: S.radiusSm, marginTop: 4, maxHeight: 220, overflowY: "auto" }}>
                <input autoFocus placeholder="Search movie..." value={searchQ} onChange={e => setSearchQ(e.target.value)}
                  style={{ width: "100%", padding: 10, border: "none", borderBottom: `1px solid ${S.border}`,
                    background: "transparent", color: S.text, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                {results.map(m => (
                  <div key={m.id} onClick={() => selectMovie(m, i)}
                    style={{ display: "flex", gap: 8, padding: "8px 10px", cursor: "pointer", alignItems: "center" }}
                    onMouseEnter={e => e.currentTarget.style.background = S.bgHover}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    {m.poster && <img src={m.poster} alt="" style={{ width: 24, height: 36, borderRadius: 3, objectFit: "cover" }} />}
                    <div><div style={{ color: S.text, fontSize: 12, fontWeight: 600 }}>{m.title}</div>
                      <div style={{ color: S.textMuted, fontSize: 10 }}>{m.year} {m.genre && `· ${m.genre}`}</div></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        <button onClick={addOption} style={{ width: "100%", padding: 8, borderRadius: S.radiusSm,
          border: `1px dashed ${S.border}`, background: "transparent", color: S.textSec, fontSize: 12,
          fontWeight: 600, cursor: "pointer", marginBottom: 16 }}>+ Add option</button>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "10px 20px", borderRadius: S.radiusSm, border: `1px solid ${S.border}`,
            background: "transparent", color: S.textSec, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
          <button onClick={() => { if (valid) onSave(question.trim(), options.filter(o => o.title)); }}
            style={{ padding: "10px 20px", borderRadius: S.radiusSm, border: "none",
              background: S.accent, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer",
              opacity: valid ? 1 : 0.5 }}>Create Poll</button>
        </div>
      </div>
    </div>
  );
}

/* ======================== MAIN APP ======================== */

export default function CineVerse() {
  const [user, setUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState({ incoming: [], outgoing: [] });
  const [convos, setConvos] = useState([]);
  const [messages, setMessages] = useState({});
  const [activeConvo, setActiveConvo] = useState(null);
  const [showMovieSearch, setShowMovieSearch] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQ, setSearchQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [sidebarTab, setSidebarTab] = useState("chats");
  const [watchlist, setWatchlist] = useState([]);
  const [watched, setWatched] = useState([]);
  const [readAt, setReadAt] = useState({});
  const [mainView, setMainView] = useState("chat");
  const [shareToMovie, setShareToMovie] = useState(null);
  const [preferredLangs, setPreferredLangs] = useState([]);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [authToken, setAuthToken] = useState(() => localStorage.getItem("fs:token"));
  const [watchlistMovie, setWatchlistMovie] = useState(null);
  const [chatMovie, setChatMovie] = useState(null);
  const [chatSearch, setChatSearch] = useState("");
  const [chatPersonView, setChatPersonView] = useState(null);
  const [showProfile, setShowProfile] = useState(null);
  const [showCompare, setShowCompare] = useState(false);
  const [showWatchlistShare, setShowWatchlistShare] = useState(false);
  const [showListShare, setShowListShare] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [customLists, setCustomLists] = useState([]);
  const [showCreateList, setShowCreateList] = useState(false);
  const [activeList, setActiveList] = useState(null);
  const [listItems, setListItems] = useState([]);
  const [polls, setPolls] = useState({});
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [activityFeed, setActivityFeed] = useState([]);
  const msgEndRef = useRef(null);

  // Authenticated API helper
  const api = useCallback(async (path, options = {}) => {
    try {
      const token = authToken || localStorage.getItem("fs:token");
      const res = await fetch(`/api${path}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...options.headers,
        },
      });
      if (res.status === 401) {
        setUser(null); setAuthToken(null);
        localStorage.removeItem("fs:token"); localStorage.removeItem("fs:user");
        return null;
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("API error:", path, res.status, err);
        return null;
      }
      return await res.json();
    } catch (err) {
      console.error("API fetch error:", path, err);
      return null;
    }
  }, [authToken]);

  // Fetch all user data from backend
  const loadUserData = useCallback(async (token) => {
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    try {
      const [convosData, watchlistData, watchedData, meData, usersData, listsData, notifCount, activityData] = await Promise.all([
        fetch("/api/conversations", { headers }).then(r => r.json()).catch(() => []),
        fetch("/api/watchlist", { headers }).then(r => r.json()).catch(() => []),
        fetch("/api/watched", { headers }).then(r => r.json()).catch(() => []),
        fetch("/api/auth/me", { headers }).then(r => r.json()).catch(() => null),
        fetch("/api/users", { headers }).then(r => r.json()).catch(() => []),
        fetch("/api/lists", { headers }).then(r => r.json()).catch(() => []),
        fetch("/api/notifications/count", { headers }).then(r => r.json()).catch(() => ({ count: 0 })),
        fetch("/api/activity", { headers }).then(r => r.json()).catch(() => []),
        fetch("/api/friends", { headers }).then(r => r.json()).catch(() => []),
        fetch("/api/friends/requests", { headers }).then(r => r.json()).catch(() => ({ incoming: [], outgoing: [] })),
      ]);
      if (Array.isArray(convosData)) {
        setConvos(convosData.map(c => ({
          id: c.id, type: c.type, name: c.name,
          participants: (c.members || []).map(m => m.username),
          lastMovie: c.lastMovie, lastSender: c.lastSender,
          updatedAt: new Date(c.updatedAt).getTime(),
          unread: c.unread || 0,
        })));
      }
      if (Array.isArray(watchlistData)) {
        setWatchlist(watchlistData.map(w => ({ ...w.movie, watchlistId: w.id })));
      }
      if (Array.isArray(watchedData)) {
        setWatched(watchedData.map(w => ({ ...w.movie, watchedId: w.id })));
      }
      if (meData?.preferredLangs) setPreferredLangs(meData.preferredLangs);
      if (Array.isArray(usersData)) {
        setAllUsers(usersData.map(u => ({
          id: u.id, username: u.username, displayName: u.displayName, avatar: u.avatar, color: u.color,
        })));
      }
      if (Array.isArray(friendsData)) setFriends(friendsData);
      if (friendReqData) setFriendRequests(friendReqData);
      if (Array.isArray(listsData)) setCustomLists(listsData);
      if (notifCount) setUnreadNotifs(notifCount.count || 0);
      if (Array.isArray(activityData)) setActivityFeed(activityData);
    } catch (e) { console.error("Load data error:", e); }
  }, []);

  // Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem("fs:token");
    const savedUser = localStorage.getItem("fs:user");
    if (token && savedUser) {
      try {
        const u = JSON.parse(savedUser);
        setAuthToken(token);
        setUser(u);
        loadUserData(token);
      } catch {}
    }
    setLoading(false);
  }, [loadUserData]);

  // Load messages when opening a conversation
  useEffect(() => {
    if (!activeConvo || !authToken) return;
    (async () => {
      try {
        const msgs = await api(`/conversations/${activeConvo}/messages`);
        if (Array.isArray(msgs)) {
          setMessages(prev => ({
            ...prev,
            [activeConvo]: msgs.map(m => ({
              id: m.id, sender: m.sender?.username || "unknown",
              senderData: m.sender,
              movie: m.movie, note: m.note,
              timestamp: new Date(m.createdAt).getTime(),
              reactions: m.reactions || {},
              ratings: m.ratings || {},
              reviews: m.reviews || {},
              watchedBy: m.watchedBy || [],
            })),
          }));
        }
        // Mark as read
        api(`/conversations/${activeConvo}/read`, { method: "POST" });
        // Load polls
        const pollData = await api(`/conversations/${activeConvo}/polls`);
        if (Array.isArray(pollData)) setPolls(prev => ({ ...prev, [activeConvo]: pollData }));
      } catch {}
    })();
  }, [activeConvo, authToken, api]);

  // Refresh conversation list periodically
  useEffect(() => {
    if (!authToken) return;
    const interval = setInterval(async () => {
      try {
        const convosData = await api("/conversations");
        if (Array.isArray(convosData)) {
          setConvos(convosData.map(c => ({
            id: c.id, type: c.type, name: c.name,
            participants: (c.members || []).map(m => m.username),
            lastMovie: c.lastMovie, lastSender: c.lastSender,
            updatedAt: new Date(c.updatedAt).getTime(),
            unread: c.unread || 0,
          })));
        }
        const nc = await api("/notifications/count");
        if (nc) setUnreadNotifs(nc.count);
      } catch {}
    }, 10000); // every 10 seconds
    return () => clearInterval(interval);
  }, [authToken, api]);

  useEffect(() => { msgEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [activeConvo, messages]);

  const getUnreadCount = useCallback((cid) => {
    const c = convos.find(conv => conv.id === cid);
    return c?.unread || 0;
  }, [convos]);

  const totalUnread = convos.reduce((s, c) => s + (c.unread || 0), 0);

  const handleAuth = async (u, isNew, token) => {
    setUser(u);
    if (token) {
      setAuthToken(token);
      localStorage.setItem("fs:token", token);
    }
    localStorage.setItem("fs:user", JSON.stringify(u));
    // Load all data from backend
    if (token) await loadUserData(token);
  };

  const handleStartChat = async (target, existingId) => {
    setShowNewChat(false);
    if (existingId) { setActiveConvo(existingId); setSidebarOpen(false); setMainView("chat"); return; }
    try {
      const result = await api("/conversations", {
        method: "POST",
        body: JSON.stringify({ type: "private", memberIds: [target.id || target.userId] }),
      });
      if (result?.id) {
        // Refresh conversation list
        const convosData = await api("/conversations");
        if (Array.isArray(convosData)) {
          setConvos(convosData.map(c => ({
            id: c.id, type: c.type, name: c.name,
            participants: (c.members || []).map(m => m.username),
            lastMovie: c.lastMovie, lastSender: c.lastSender,
            updatedAt: new Date(c.updatedAt).getTime(), unread: c.unread || 0,
          })));
        }
        setActiveConvo(result.id); setSidebarOpen(false); setMainView("chat");
      }
    } catch (e) { console.error("Start chat error:", e); }
  };

  const handleCreateGroup = async (name, members) => {
    try {
      // members are usernames, need to find user IDs
      const memberUsers = allUsers.filter(u => members.includes(u.username));
      const memberIds = memberUsers.map(u => u.id).filter(Boolean);
      // If IDs not available, search for them
      let finalIds = memberIds;
      if (finalIds.length === 0) {
        const usersData = await api("/users");
        if (Array.isArray(usersData)) {
          finalIds = usersData.filter(u => members.includes(u.username)).map(u => u.id);
        }
      }
      const result = await api("/conversations", {
        method: "POST",
        body: JSON.stringify({ type: "group", name, memberIds: finalIds }),
      });
      if (result?.id) {
        const convosData = await api("/conversations");
        if (Array.isArray(convosData)) {
          setConvos(convosData.map(c => ({
            id: c.id, type: c.type, name: c.name,
            participants: (c.members || []).map(m => m.username),
            lastMovie: c.lastMovie, lastSender: c.lastSender,
            updatedAt: new Date(c.updatedAt).getTime(), unread: c.unread || 0,
          })));
        }
        setActiveConvo(result.id); setSidebarOpen(false); setMainView("chat");
      }
    } catch (e) { console.error("Create group error:", e); }
  };

  const handleShareMovie = async (movie, note) => {
    if (!activeConvo) return;
    try {
      const result = await api(`/conversations/${activeConvo}/messages`, {
        method: "POST",
        body: JSON.stringify({ movie, note: note || null }),
      });
      if (result?.id) {
        // Add message locally for instant UI update
        const msg = {
          id: result.id, sender: user.username, senderData: { username: user.username, displayName: user.displayName, avatar: user.avatar, color: user.color },
          movie, note: note || null, timestamp: Date.now(), reactions: {},
        };
        setMessages(prev => ({ ...prev, [activeConvo]: [...(prev[activeConvo] || []), msg] }));
        setConvos(prev => prev.map(c => c.id === activeConvo
          ? { ...c, lastMovie: movie.title, lastSender: user.username, updatedAt: Date.now() } : c));
      }
    } catch (e) { console.error("Share movie error:", e); }
  };

  const handleReact = async (msgId, emoji) => {
    if (!activeConvo || !user) return;
    // Optimistic local update
    setMessages(prev => {
      const msgs = [...(prev[activeConvo] || [])];
      const idx = msgs.findIndex(m => m.id === msgId);
      if (idx === -1) return prev;
      const msg = { ...msgs[idx], reactions: { ...(msgs[idx].reactions || {}) } };
      const users = msg.reactions[emoji] ? [...msg.reactions[emoji]] : [];
      const ui = users.indexOf(user.username);
      if (ui >= 0) users.splice(ui, 1); else users.push(user.username);
      msg.reactions[emoji] = users;
      msgs[idx] = msg;
      return { ...prev, [activeConvo]: msgs };
    });
    // Send to backend
    try { await api(`/messages/${msgId}/reactions`, { method: "POST", body: JSON.stringify({ emoji }) }); } catch {}
  };

  const handleRate = async (msgId, rating) => {
    if (!activeConvo || !user) return;
    // Optimistic update
    setMessages(prev => {
      const msgs = [...(prev[activeConvo] || [])];
      const idx = msgs.findIndex(m => m.id === msgId);
      if (idx === -1) return prev;
      const msg = { ...msgs[idx], ratings: { ...(msgs[idx].ratings || {}), [user.username]: rating } };
      msgs[idx] = msg;
      return { ...prev, [activeConvo]: msgs };
    });
    try {
      const result = await api(`/messages/${msgId}/rate`, { method: "POST", body: JSON.stringify({ rating }) });
      if (result) {
        setMessages(prev => {
          const msgs = [...(prev[activeConvo] || [])];
          const idx = msgs.findIndex(m => m.id === msgId);
          if (idx === -1) return prev;
          msgs[idx] = { ...msgs[idx], ratings: result };
          return { ...prev, [activeConvo]: msgs };
        });
      }
    } catch {}
  };

  const handleReview = async (msgId, reviewText) => {
    if (!activeConvo || !user) return;
    setMessages(prev => {
      const msgs = [...(prev[activeConvo] || [])];
      const idx = msgs.findIndex(m => m.id === msgId);
      if (idx === -1) return prev;
      msgs[idx] = { ...msgs[idx], reviews: { ...(msgs[idx].reviews || {}), [user.username]: reviewText } };
      return { ...prev, [activeConvo]: msgs };
    });
    try {
      const result = await api(`/messages/${msgId}/review`, { method: "POST", body: JSON.stringify({ review: reviewText }) });
      if (result) {
        setMessages(prev => {
          const msgs = [...(prev[activeConvo] || [])];
          const idx = msgs.findIndex(m => m.id === msgId);
          if (idx === -1) return prev;
          msgs[idx] = { ...msgs[idx], reviews: result };
          return { ...prev, [activeConvo]: msgs };
        });
      }
    } catch {}
  };

  const handleWatched = async (msgId) => {
    if (!activeConvo || !user) return;
    try {
      const result = await api(`/messages/${msgId}/watched`, {
        method: "POST",
        body: JSON.stringify({ conversation_id: activeConvo }),
      });
      if (result?.watchedBy) {
        setMessages(prev => {
          const msgs = [...(prev[activeConvo] || [])];
          const idx = msgs.findIndex(m => m.id === msgId);
          if (idx === -1) return prev;
          msgs[idx] = { ...msgs[idx], watchedBy: result.watchedBy };
          return { ...prev, [activeConvo]: msgs };
        });
      }
    } catch {}
  };

  const handleShareToConvo = async (convoId, movie, note) => {
    try {
      const result = await api(`/conversations/${convoId}/messages`, {
        method: "POST",
        body: JSON.stringify({ movie, note: note || null }),
      });
      if (result?.id) {
        const msg = {
          id: result.id, sender: user.username, senderData: { username: user.username, displayName: user.displayName, avatar: user.avatar, color: user.color },
          movie, note: note || null, timestamp: Date.now(), reactions: {},
        };
        setMessages(prev => ({ ...prev, [convoId]: [...(prev[convoId] || []), msg] }));
        setConvos(prev => prev.map(c => c.id === convoId
          ? { ...c, lastMovie: movie.title, lastSender: user.username, updatedAt: Date.now() } : c));
      }
    } catch {}
    setActiveConvo(convoId);
    setMainView("chat");
  };

  const toggleWatchlist = async (movie) => {
    try {
      const result = await api("/watchlist", { method: "POST", body: JSON.stringify({ movie }) });
      if (result?.action === "added") {
        setWatchlist(prev => [...prev, movie]);
      } else {
        setWatchlist(prev => prev.filter(m => m.title !== movie.title || m.year !== movie.year));
      }
    } catch {}
  };

  const toggleWatched = async (movie) => {
    try {
      const result = await api("/watched", { method: "POST", body: JSON.stringify({ movie }) });
      if (result?.action === "added") {
        setWatched(prev => [...prev, movie]);
      } else {
        setWatched(prev => prev.filter(m => m.title !== movie.title || m.year !== movie.year));
      }
    } catch {}
  };

  const getConvoName = (c) => {
    if (c.type === "group") return c.name;
    const other = c.participants.find(p => p !== user?.username);
    return allUsers.find(u => u.username === other)?.displayName || other;
  };
  const getConvoUser = (c) => {
    if (c.type === "group") return { displayName: c.name, avatar: c.name.slice(0, 2).toUpperCase(), color: "#7C3AED" };
    const other = c.participants.find(p => p !== user?.username);
    return allUsers.find(u => u.username === other) || { displayName: other, avatar: "?", color: "#666" };
  };

  const myConvos = convos
    .filter(c => c.participants.includes(user?.username))
    .filter(c => !searchQ || getConvoName(c).toLowerCase().includes(searchQ.toLowerCase()))
    .sort((a, b) => b.updatedAt - a.updatedAt);

  const currentConvo = convos.find(c => c.id === activeConvo);
  const currentMsgs = messages[activeConvo] || [];

  if (loading) return (
    <div style={{ minHeight: "100vh", background: S.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Icon name="film" size={48} color={S.accent} /></div>
  );
  if (!user) return <AuthScreen onAuth={handleAuth} allUsers={allUsers} />;

  return (
    <div style={{ height: "100vh", background: S.bg, display: "flex", overflow: "hidden",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      {/* ===== SIDEBAR ===== */}
      <div style={{ width: sidebarOpen ? 340 : 0, minWidth: sidebarOpen ? 340 : 0,
        background: S.bgPanel, borderRight: `1px solid ${S.border}`,
        display: "flex", flexDirection: "column", transition: "all 0.2s", overflow: "hidden",
        position: window.innerWidth < 768 ? "absolute" : "relative", height: "100%", zIndex: 50 }}>
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${S.border}`,
          display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar user={user} size={36} />
          <div style={{ flex: 1 }}>
            <div style={{ color: S.text, fontWeight: 700, fontSize: 14 }}>{user.displayName}</div>
            <div style={{ color: S.textMuted, fontSize: 11 }}>@{user.username}</div>
          </div>
          <button onClick={() => setShowProfile(user.username)} title="My Profile"
            style={{ background: "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 4 }}>
            <Icon name="user" size={18} color={S.textSec} /></button>
          <button onClick={() => setShowCompare(true)} title="Compare Movies"
            style={{ background: "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 4 }}>
            <Icon name="grid" size={18} color={S.textSec} /></button>
          <button onClick={() => setShowNotifications(true)} title="Notifications"
            style={{ background: "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 4, position: "relative" }}>
            <Icon name="bell" size={18} color={S.textSec} />
            {unreadNotifs > 0 && <span style={{ position: "absolute", top: -2, right: -4,
              background: S.accent, color: "#fff", fontSize: 8, fontWeight: 700, padding: "0 4px",
              borderRadius: 8, minWidth: 14, textAlign: "center" }}>{unreadNotifs}</span>}
          </button>
          <button onClick={() => { setUser(null); setAuthToken(null); localStorage.removeItem("fs:token"); localStorage.removeItem("fs:user"); }} title="Sign out"
            style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
            <Icon name="logout" size={17} color={S.textMuted} /></button>
        </div>
        <div style={{ display: "flex", borderBottom: `1px solid ${S.border}`, padding: "0 8px" }}>
          {[{ id: "chats", label: "Chats", icon: "chat", badge: totalUnread },
            { id: "explore", label: "Explore", icon: "compass", badge: 0 },
            { id: "watchlist", label: "Watchlist", icon: "bookmark", badge: watchlist.length },
            { id: "watched", label: "Watched", icon: "eye", badge: watched.length },
            { id: "lists", label: "Lists", icon: "list", badge: customLists.length },
            { id: "activity", label: "Activity", icon: "signal", badge: 0 }].map(t => (
            <button key={t.id} onClick={() => { setSidebarTab(t.id); if (t.id === "explore") setMainView("explore"); if (t.id === "activity") { setMainView("activity"); api("/activity").then(d => { if (Array.isArray(d)) setActivityFeed(d); }); } }}
              title={t.label}
              style={{ flex: 1, padding: "12px 4px 10px", border: "none", cursor: "pointer",
                background: sidebarTab === t.id ? S.bgActive : "transparent",
                borderBottom: sidebarTab === t.id ? `2px solid ${S.accent}` : "2px solid transparent",
                color: sidebarTab === t.id ? S.text : S.textSec,
                display: "flex", flexDirection: "column", alignItems: "center", gap: 3, transition: "all 0.15s",
                position: "relative" }}>
              <div style={{ position: "relative" }}>
                <Icon name={t.icon} size={18} color={sidebarTab === t.id ? S.accent : S.textSec} />
                {t.badge > 0 && <span style={{ position: "absolute", top: -6, right: -10,
                  background: t.id === "chats" ? S.accent : S.purple,
                  color: "#fff", fontSize: 9, fontWeight: 700, padding: "0px 5px", borderRadius: 10, minWidth: 16,
                  textAlign: "center" }}>{t.badge}</span>}
              </div>
              <span style={{ fontSize: 10, fontWeight: 600 }}>{t.label}</span>
            </button>
          ))}
        </div>
        {sidebarTab === "chats" ? (
          <>
            <div style={{ padding: "10px 14px", display: "flex", gap: 8 }}>
              <button onClick={() => setShowNewChat(true)}
                style={{ flex: 1, padding: "8px 0", borderRadius: S.radiusSm, border: `1px solid ${S.border}`,
                  background: S.bgCard, color: S.textSec, fontSize: 12, fontWeight: 600, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = S.accent; e.currentTarget.style.color = S.accent; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = S.border; e.currentTarget.style.color = S.textSec; }}>
                <Icon name="chat" size={13} color="currentColor" /> Chat</button>
              <button onClick={(e) => { e.stopPropagation(); setShowNewGroup(true); }}
                style={{ flex: 1, padding: "8px 0", borderRadius: S.radiusSm, border: `1px solid ${S.border}`,
                  background: S.bgCard, color: S.textSec, fontSize: 12, fontWeight: 600, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = S.purple; e.currentTarget.style.color = S.purple; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = S.border; e.currentTarget.style.color = S.textSec; }}>
                <Icon name="group" size={13} color="currentColor" /> Group</button>
              <button onClick={(e) => { e.stopPropagation(); setShowAddFriend(true); }}
                style={{ flex: 1, padding: "8px 0", borderRadius: S.radiusSm, border: `1px solid ${S.border}`,
                  background: S.bgCard, color: S.textSec, fontSize: 12, fontWeight: 600, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 5, position: "relative" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = S.green; e.currentTarget.style.color = S.green; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = S.border; e.currentTarget.style.color = S.textSec; }}>
                <Icon name="user" size={13} color="currentColor" /> Crew
                {friendRequests.incoming.length > 0 && (
                  <div style={{ position: "absolute", top: -4, right: -4, background: S.accent, color: "#fff", fontSize: 9,
                    fontWeight: 700, width: 16, height: 16, borderRadius: "50%", display: "flex", alignItems: "center",
                    justifyContent: "center", border: `2px solid ${S.bgPanel}` }}>{friendRequests.incoming.length}</div>
                )}
              </button>
            </div>
            <div style={{ padding: "0 14px 8px" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", background: S.bg,
                borderRadius: S.radiusSm, padding: "0 12px", border: `1px solid ${S.border}` }}>
                <Icon name="search" size={14} />
                <input placeholder="Search chats or people..." value={searchQ} onChange={e => setSearchQ(e.target.value)}
                  style={{ flex: 1, padding: "8px 0", background: "none", border: "none", color: S.text, fontSize: 13, outline: "none" }} />
                {searchQ && (
                  <button onClick={() => setSearchQ("")} style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}>
                    <Icon name="x" size={14} color={S.textMuted} /></button>
                )}
              </div>
            </div>
            <div style={{ flex: 1, overflowY: "auto" }}>
              {/* User search results */}
              {searchQ.trim() && (() => {
                const matchedUsers = allUsers.filter(u =>
                  u.username !== user.username &&
                  (u.displayName.toLowerCase().includes(searchQ.toLowerCase()) ||
                   u.username.toLowerCase().includes(searchQ.toLowerCase()))
                );
                return matchedUsers.length > 0 ? (
                  <div style={{ marginBottom: 4 }}>
                    <div style={{ padding: "8px 18px 4px", color: S.textMuted, fontSize: 10, fontWeight: 700,
                      textTransform: "uppercase", letterSpacing: 1 }}>People</div>
                    {matchedUsers.map(u => {
                      const existingConvo = convos.find(c =>
                        c.type === "private" && c.participants.includes(user.username) && c.participants.includes(u.username));
                      return (
                        <button key={u.username} onClick={() => {
                          if (existingConvo) {
                            setActiveConvo(existingConvo.id); setMainView("chat"); setSidebarOpen(window.innerWidth >= 768);
                          } else {
                            handleStartChat(u);
                          }
                        }}
                          style={{ width: "100%", display: "flex", gap: 10, alignItems: "center",
                            padding: "8px 18px", border: "none", cursor: "pointer", textAlign: "left",
                            background: "transparent", transition: "background 0.15s" }}
                          onMouseEnter={e => e.currentTarget.style.background = S.bgHover}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                          <Avatar user={u} size={34} />
                          <div style={{ flex: 1 }}>
                            <div style={{ color: S.text, fontWeight: 600, fontSize: 13 }}>{u.displayName}</div>
                            <div style={{ color: S.textMuted, fontSize: 11 }}>@{u.username}</div>
                          </div>
                          <span style={{ color: S.blue, fontSize: 11, fontWeight: 600 }}>
                            {existingConvo ? "Open" : "Chat"}</span>
                        </button>
                      );
                    })}
                    <div style={{ height: 1, background: S.border, margin: "4px 18px" }} />
                  </div>
                ) : null;
              })()}
              {/* Conversations header */}
              {searchQ.trim() && myConvos.length > 0 && (
                <div style={{ padding: "8px 18px 4px", color: S.textMuted, fontSize: 10, fontWeight: 700,
                  textTransform: "uppercase", letterSpacing: 1 }}>Conversations</div>
              )}
              {myConvos.length === 0
                ? <div style={{ textAlign: "center", padding: 40, color: S.textMuted, fontSize: 13 }}>No conversations yet</div>
                : myConvos.map(c => {
                  const cUser = getConvoUser(c);
                  const isActive = c.id === activeConvo && mainView === "chat";
                  const unread = getUnreadCount(c.id);
                  return (
                    <button key={c.id} onClick={() => { setActiveConvo(c.id); setMainView("chat"); setSidebarOpen(window.innerWidth >= 768); }}
                      style={{ width: "100%", display: "flex", gap: 12, alignItems: "center",
                        padding: "11px 18px", border: "none", cursor: "pointer", textAlign: "left",
                        background: isActive ? S.bgActive : "transparent",
                        borderLeft: isActive ? `3px solid ${S.accent}` : "3px solid transparent",
                        transition: "all 0.12s" }}
                      onMouseEnter={e => !isActive && (e.currentTarget.style.background = S.bgHover)}
                      onMouseLeave={e => !isActive && (e.currentTarget.style.background = "transparent")}>
                      <div style={{ position: "relative" }}>
                        <Avatar user={cUser} size={42} />
                        {unread > 0 && <div style={{ position: "absolute", top: -2, right: -2, background: S.accent,
                          color: "#fff", fontSize: 10, fontWeight: 700, width: 18, height: 18,
                          borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                          border: `2px solid ${S.bgPanel}` }}>{unread}</div>}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ color: S.text, fontWeight: unread > 0 ? 700 : 600, fontSize: 14 }}>{getConvoName(c)}</span>
                          <span style={{ color: S.textMuted, fontSize: 11, flexShrink: 0 }}>{c.updatedAt ? timeAgo(c.updatedAt) : ""}</span>
                        </div>
                        <div style={{ color: unread > 0 ? S.textSec : S.textMuted, fontSize: 12, marginTop: 2,
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: unread > 0 ? 600 : 400 }}>
                          {c.type === "group" && <span style={{ color: S.purple, marginRight: 4 }}>{"\u2666"}</span>}
                          {c.lastMovie ? `${c.lastSender === user.username ? "You" : allUsers.find(u => u.username === c.lastSender)?.displayName || c.lastSender} shared ${c.lastMovie}` : "No movies shared yet"}
                        </div>
                      </div>
                    </button>
                  );
                })
              }
            </div>
          </>
        ) : sidebarTab === "watchlist" ? (
          <div style={{ flex: 1, overflowY: "auto" }}><WatchlistPanel watchlist={watchlist} onRemove={toggleWatchlist} onSelect={(m) => setWatchlistMovie(m)} onShareToChat={() => setShowWatchlistShare(true)} /></div>
        ) : sidebarTab === "watched" ? (
          <div style={{ flex: 1, overflowY: "auto" }}>
            {watched.length === 0 ? (
              <div style={{ textAlign: "center", padding: 50, color: S.textMuted }}>
                <Icon name="eye" size={40} color={S.border} />
                <p style={{ marginTop: 14, fontSize: 14 }}>No watched movies yet</p>
                <p style={{ fontSize: 12 }}>Mark movies as watched to track them here</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: 16 }}>
                <div style={{ color: S.textSec, fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                  {watched.length} movie{watched.length !== 1 ? "s" : ""} watched</div>
                {watched.map((m, i) => (
                  <button key={m.id || i} onClick={() => setWatchlistMovie(m)}
                    style={{ display: "flex", gap: 10, alignItems: "center", padding: 10,
                      background: S.bgCard, borderRadius: S.radiusSm, border: `1px solid ${S.border}`,
                      cursor: "pointer", textAlign: "left", width: "100%", transition: "border-color 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = S.green}
                    onMouseLeave={e => e.currentTarget.style.borderColor = S.border}>
                    <MoviePoster movie={m} size="compact" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: S.text, fontWeight: 600, fontSize: 13, overflow: "hidden",
                        textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.title}</div>
                      <div style={{ color: S.textSec, fontSize: 11, marginTop: 2 }}>{m.year} {"\u00B7"} {m.genre}</div>
                      {m.rating && <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 3 }}>
                        <Icon name="star" size={11} color={S.amber} />
                        <span style={{ color: S.amber, fontSize: 11, fontWeight: 700 }}>{m.rating}</span>
                      </div>}
                    </div>
                    <Icon name="eye" size={14} color={S.green} />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : sidebarTab === "lists" ? (
          <div style={{ flex: 1, overflowY: "auto" }}>
            <div style={{ padding: "12px 14px" }}>
              <button onClick={() => setShowCreateList(true)}
                style={{ width: "100%", padding: "10px 0", borderRadius: S.radiusSm, border: `1px solid ${S.purple}44`,
                  background: S.purple + "12", color: S.purple, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                + Create New List</button>
            </div>
            {customLists.length === 0 ? (
              <div style={{ textAlign: "center", padding: 40, color: S.textMuted }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>{"\uD83D\uDCCB"}</div>
                <p style={{ fontSize: 13 }}>No lists yet</p>
                <p style={{ fontSize: 11 }}>Create lists like "Best Horror" or "Date Night"</p>
              </div>
            ) : customLists.map(l => (
              <div key={l.id} style={{ padding: "12px 18px", borderBottom: `1px solid ${S.border}06`,
                display: "flex", alignItems: "center", gap: 12, transition: "background 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.background = S.bgHover}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: S.purple + "22",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, cursor: "pointer" }}
                  onClick={async () => {
                    setActiveList(l);
                    const items = await api(`/lists/${l.id}/items`);
                    if (Array.isArray(items)) setListItems(items);
                    setMainView("list");
                  }}>{"\uD83C\uDFAC"}</div>
                <div style={{ flex: 1, cursor: "pointer" }} onClick={async () => {
                  setActiveList(l);
                  const items = await api(`/lists/${l.id}/items`);
                  if (Array.isArray(items)) setListItems(items);
                  setMainView("list");
                }}>
                  <div style={{ color: S.text, fontWeight: 600, fontSize: 14 }}>{l.name}</div>
                  <div style={{ color: S.textMuted, fontSize: 11 }}>{l.itemCount || 0} movies{l.description ? ` · ${l.description}` : ""}</div>
                </div>
                <button onClick={async (e) => {
                  e.stopPropagation();
                  const items = await api(`/lists/${l.id}/items`);
                  if (Array.isArray(items)) setListItems(items);
                  setShowListShare(l);
                }} title="Share to Chat"
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 4, flexShrink: 0 }}>
                  <Icon name="send" size={14} color={S.textSec} />
                </button>
              </div>
            ))}
          </div>
        ) : sidebarTab === "activity" ? (
          <div style={{ flex: 1, overflowY: "auto" }}>
            {activityFeed.length === 0 ? (
              <div style={{ textAlign: "center", padding: 50, color: S.textMuted }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>{"\uD83D\uDCE1"}</div>
                <p style={{ fontSize: 13 }}>No activity yet</p>
                <p style={{ fontSize: 11 }}>Your friends' shares, ratings and reviews will show here</p>
              </div>
            ) : activityFeed.map((e, i) => {
              const typeEmoji = { share: "\uD83C\uDFAC", rating: "\u2B50", review: "\u270D\uFE0F" };
              const typeVerb = { share: "shared", rating: "rated", review: "reviewed" };
              const tAgo = (() => { const d = Date.now() - new Date(e.createdAt).getTime();
                if (d < 3600000) return Math.floor(d / 60000) + "m"; if (d < 86400000) return Math.floor(d / 3600000) + "h"; return Math.floor(d / 86400000) + "d"; })();
              return (
                <div key={i} style={{ padding: "12px 18px", borderBottom: `1px solid ${S.border}06`,
                  display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: e.user.color,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, fontWeight: 800, color: "#fff", flexShrink: 0 }}>{e.user.avatar}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: S.text, fontSize: 13 }}>
                      <span style={{ fontWeight: 700 }}>{e.user.displayName}</span>
                      <span style={{ color: S.textSec }}> {typeVerb[e.type] || e.type} </span>
                      <span style={{ fontWeight: 600 }}>{e.title}</span>
                      {e.type === "rating" && e.extra && <span style={{ color: S.amber, fontWeight: 700 }}> {e.extra}/10</span>}
                    </div>
                    {e.type === "review" && e.extra && (
                      <div style={{ color: S.textMuted, fontSize: 12, marginTop: 4, fontStyle: "italic",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>"{e.extra}"</div>
                    )}
                    <div style={{ color: S.textMuted, fontSize: 10, marginTop: 3 }}>{tAgo} ago</div>
                  </div>
                  {e.poster && <img src={e.poster} alt="" style={{ width: 32, height: 48, borderRadius: 4, objectFit: "cover", flexShrink: 0 }} />}
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}
        onClick={() => { if (sidebarOpen) setSidebarOpen(false); }}>
        {currentConvo && mainView === "chat" ? (
          <>
            <div style={{ padding: "12px 20px", borderBottom: `1px solid ${S.border}`, background: S.bgPanel,
              display: "flex", alignItems: "center", gap: 12 }}>
              <button onClick={() => setSidebarOpen(true)}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 4,
                  display: sidebarOpen && window.innerWidth >= 768 ? "none" : "block" }}>
                <Icon name="menu" size={20} color={S.textSec} /></button>
              <Avatar user={getConvoUser(currentConvo)} size={34} />
              <div style={{ flex: 1 }}>
                <div style={{ color: S.text, fontWeight: 700, fontSize: 15 }}>{getConvoName(currentConvo)}</div>
                <div style={{ color: S.textMuted, fontSize: 11 }}>
                  {currentConvo.type === "group" ? `${currentConvo.participants.length} members` : "Private"}</div>
              </div>
              <button onClick={() => setShowCreatePoll(true)}
                style={{ padding: "7px 14px", borderRadius: S.radiusSm, border: `1px solid ${S.border}`, cursor: "pointer",
                  background: S.bgCard, color: S.textSec, fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 5 }}>
                {"\uD83D\uDCCA"} Poll</button>
              <button onClick={() => setShowMovieSearch(true)}
                style={{ padding: "7px 14px", borderRadius: S.radiusSm, border: "none", cursor: "pointer",
                  background: `linear-gradient(135deg, ${S.accent}, ${S.accentSoft})`, color: "#fff",
                  fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 5 }}>
                <Icon name="film" size={14} color="#fff" /> Share</button>
            </div>
            {/* Chat search */}
            <div style={{ padding: "6px 20px", borderBottom: `1px solid ${S.border}`, display: "flex", alignItems: "center", gap: 8 }}>
              <Icon name="search" size={14} color={S.textMuted} />
              <input placeholder="Search movies in this chat..." value={chatSearch}
                onChange={e => setChatSearch(e.target.value)}
                style={{ flex: 1, padding: "6px 0", background: "none", border: "none",
                  color: S.text, fontSize: 12, outline: "none" }} />
              {chatSearch && <button onClick={() => setChatSearch("")}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}>
                <Icon name="x" size={14} color={S.textMuted} /></button>}
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
              {/* Inline Polls */}
              {(polls[activeConvo] || []).filter(p => !p.is_closed).map(poll => {
                const totalV = poll.totalVotes || 0;
                const myVote = poll.options.find(o => o.votes.includes(user.username));
                return (
                  <div key={`poll-${poll.id}`} style={{ padding: 14, borderRadius: S.radius, background: S.bgCard,
                    border: `1px solid ${S.purple}33`, marginBottom: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <div style={{ color: S.text, fontSize: 14, fontWeight: 700 }}>{"\uD83D\uDCCA"} {poll.question}</div>
                      {poll.creator_id === (allUsers.find(u => u.username === user.username)?.id) && (
                        <button onClick={async () => { await api(`/polls/${poll.id}/close`, { method: "POST" });
                          const p = await api(`/conversations/${activeConvo}/polls`);
                          if (Array.isArray(p)) setPolls(prev => ({ ...prev, [activeConvo]: p })); }}
                          style={{ padding: "3px 10px", borderRadius: 4, border: `1px solid ${S.border}`,
                            background: "transparent", color: S.textMuted, fontSize: 10, fontWeight: 600, cursor: "pointer" }}>Close</button>
                      )}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {poll.options.map(o => {
                        const voteCount = o.votes.length;
                        const pct = totalV > 0 ? Math.round(voteCount / totalV * 100) : 0;
                        const isMyVote = myVote?.id === o.id;
                        return (
                          <button key={o.id} onClick={async () => {
                            await api(`/polls/${poll.id}/vote`, { method: "POST", body: JSON.stringify({ optionId: o.id }) });
                            const p = await api(`/conversations/${activeConvo}/polls`);
                            if (Array.isArray(p)) setPolls(prev => ({ ...prev, [activeConvo]: p }));
                          }} style={{ display: "flex", gap: 8, alignItems: "center", padding: "8px 12px",
                            borderRadius: 8, border: `1px solid ${isMyVote ? S.purple : S.border}`,
                            background: isMyVote ? S.purple + "15" : S.bgPanel, cursor: "pointer", position: "relative",
                            overflow: "hidden", textAlign: "left", width: "100%" }}>
                            {totalV > 0 && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0,
                              width: `${pct}%`, background: S.purple + "15", transition: "width 0.3s" }} />}
                            {o.movie_poster && <img src={o.movie_poster} alt="" style={{ width: 24, height: 36, borderRadius: 3, objectFit: "cover", position: "relative", zIndex: 1 }} />}
                            <div style={{ flex: 1, position: "relative", zIndex: 1 }}>
                              <div style={{ color: S.text, fontSize: 13, fontWeight: 600 }}>{o.movie_title}</div>
                              <div style={{ color: S.textMuted, fontSize: 10 }}>{o.movie_year} {o.movie_genre && `· ${o.movie_genre}`}</div>
                            </div>
                            <div style={{ color: S.textSec, fontSize: 12, fontWeight: 700, position: "relative", zIndex: 1 }}>
                              {totalV > 0 ? `${pct}%` : ""} <span style={{ color: S.textMuted, fontWeight: 400, fontSize: 10 }}>{voteCount > 0 ? `(${voteCount})` : ""}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                      <div style={{ color: S.textMuted, fontSize: 10 }}>by {poll.creator_display_name}</div>
                      <div style={{ color: S.textMuted, fontSize: 10 }}>{totalV} vote{totalV !== 1 ? "s" : ""}</div>
                    </div>
                  </div>
                );
              })}
              {(() => {
                const filtered = chatSearch.trim()
                  ? currentMsgs.filter(m => m.movie?.title?.toLowerCase().includes(chatSearch.toLowerCase()) ||
                      m.movie?.genre?.toLowerCase().includes(chatSearch.toLowerCase()) ||
                      m.movie?.director?.toLowerCase().includes(chatSearch.toLowerCase()))
                  : currentMsgs;
                return filtered.length === 0 ? (
                <div style={{ textAlign: "center", padding: 60, color: S.textMuted }}>
                  <Icon name="film" size={48} color={S.border} />
                  <p style={{ marginTop: 16, fontSize: 14 }}>No movies shared yet</p>
                  <p style={{ fontSize: 12 }}>Click "Share" to send your first pick!</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  {filtered.map((msg, i) => {
                    const isMe = msg.sender === user.username;
                    const sender = allUsers.find(u => u.username === msg.sender);
                    const lr = readAt[activeConvo] || 0;
                    const prevMsg = currentMsgs[i - 1];
                    const showNew = !isMe && msg.timestamp > lr && i > 0 && (!prevMsg || prevMsg.timestamp <= lr || prevMsg.sender === user.username);
                    return (
                      <div key={msg.id}>
                        {showNew && (
                          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                            <div style={{ flex: 1, height: 1, background: S.accent + "44" }} />
                            <span style={{ color: S.accent, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>New</span>
                            <div style={{ flex: 1, height: 1, background: S.accent + "44" }} />
                          </div>
                        )}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6,
                            flexDirection: isMe ? "row-reverse" : "row" }}>
                            <Avatar user={sender || { displayName: msg.sender, avatar: "?", color: "#666" }} size={26} />
                            <span style={{ color: S.textSec, fontSize: 12, fontWeight: 600 }}>
                              {isMe ? "You" : sender?.displayName || msg.sender}</span>
                            <span style={{ color: S.textMuted, fontSize: 11 }}>{timeAgo(msg.timestamp)}</span>
                          </div>
                          <MovieCard movie={msg.movie} shared={msg}
                            reactions={msg.reactions} currentUser={user.username}
                            onReact={(emoji) => handleReact(msg.id, emoji)}
                            onToggleWatchlist={toggleWatchlist}
                            inWatchlist={watchlist.some(w => w.id === msg.movie.id)}
                            ratings={msg.ratings} onRate={(r) => handleRate(msg.id, r)}
                            reviews={msg.reviews} onReview={(text) => handleReview(msg.id, text)}
                            watchedBy={msg.watchedBy} onWatched={() => handleWatched(msg.id)}
                            onDetail={(m) => setChatMovie(m || msg.movie)} />
                        </div>
                      </div>
                    );
                  })}
                  <div ref={msgEndRef} />
                </div>
              )
              })()}
            </div>
            <div style={{ padding: "10px 20px", borderTop: `1px solid ${S.border}`, background: S.bgPanel }}>
              <button onClick={() => setShowMovieSearch(true)}
                style={{ width: "100%", padding: "12px 16px", borderRadius: S.radiusSm,
                  background: S.bg, border: `1px solid ${S.border}`, color: S.textMuted,
                  fontSize: 14, cursor: "pointer", textAlign: "left",
                  display: "flex", alignItems: "center", gap: 10, transition: "border-color 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = S.accent}
                onMouseLeave={e => e.currentTarget.style.borderColor = S.border}>
                <Icon name="search" size={16} color={S.textMuted} />
                Search and share a movie...
              </button>
            </div>
          </>
        ) : mainView === "explore" ? (
          <>
            <ExploreView
              onToggleWatchlist={toggleWatchlist}
              watchlist={watchlist}
              onShareTo={(movie) => setShareToMovie(movie)}
              showMenu={!sidebarOpen}
              onMenuClick={() => setSidebarOpen(true)}
              preferredLangs={preferredLangs}
              onEditLangs={() => setShowLangPicker(true)}
              onToggleWatched={toggleWatched}
              watched={watched} />
          </>
        ) : mainView === "list" && activeList ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "16px 24px", borderBottom: `1px solid ${S.border}`, background: S.bgPanel,
              display: "flex", alignItems: "center", gap: 12 }}>
              <button onClick={() => setMainView("chat")} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                <Icon name="back" size={20} color={S.textSec} /></button>
              <div style={{ flex: 1 }}>
                <div style={{ color: S.text, fontWeight: 700, fontSize: 16 }}>{activeList.name}</div>
                {activeList.description && <div style={{ color: S.textMuted, fontSize: 11 }}>{activeList.description}</div>}
              </div>
              <button onClick={async () => {
                if (confirm(`Delete "${activeList.name}"?`)) {
                  await api(`/lists/${activeList.id}`, { method: "DELETE" });
                  setCustomLists(prev => prev.filter(l => l.id !== activeList.id));
                  setMainView("chat"); setActiveList(null);
                }
              }} style={{ padding: "5px 12px", borderRadius: 6, border: `1px solid ${S.accent}33`,
                background: "transparent", color: S.accent, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Delete</button>
            </div>
            {/* Add movie search */}
            <div style={{ padding: "12px 24px", borderBottom: `1px solid ${S.border}` }}>
              <ListMovieSearch listId={activeList.id} onAdd={(movie) => {
                setListItems(prev => [...prev, { id: Date.now(), movie }]);
                setCustomLists(prev => prev.map(l => l.id === activeList.id ? { ...l, itemCount: (l.itemCount || 0) + 1 } : l));
              }} />
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
              {listItems.length === 0 ? (
                <div style={{ textAlign: "center", padding: 50, color: S.textMuted }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>{"\uD83C\uDFAC"}</div>
                  <p style={{ fontSize: 13 }}>This list is empty</p>
                  <p style={{ fontSize: 11 }}>Search above to add movies</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {listItems.map(item => (
                    <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
                      background: S.bgCard, borderRadius: S.radiusSm, border: `1px solid ${S.border}`,
                      transition: "border-color 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = S.purple}
                      onMouseLeave={e => e.currentTarget.style.borderColor = S.border}>
                      {item.movie.poster ? (
                        <img src={item.movie.poster} alt="" style={{ width: 36, height: 54, borderRadius: 4, objectFit: "cover", flexShrink: 0 }} />
                      ) : <div style={{ width: 36, height: 54, borderRadius: 4, background: S.bg, flexShrink: 0 }} />}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: S.text, fontSize: 13, fontWeight: 600, overflow: "hidden",
                          textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.movie.title}</div>
                        <div style={{ color: S.textMuted, fontSize: 11, marginTop: 2 }}>{item.movie.year} {item.movie.genre && `· ${item.movie.genre}`}</div>
                      </div>
                      <button onClick={async () => {
                        await api(`/lists/${activeList.id}/items/${item.id}`, { method: "DELETE" });
                        setListItems(prev => prev.filter(i => i.id !== item.id));
                        setCustomLists(prev => prev.map(l => l.id === activeList.id ? { ...l, itemCount: (l.itemCount || 1) - 1 } : l));
                      }} style={{ padding: "4px 10px", borderRadius: 4, border: `1px solid ${S.accent}33`,
                        background: "transparent", color: S.accent, fontSize: 10, fontWeight: 600, cursor: "pointer", flexShrink: 0 }}>Remove</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : mainView === "activity" ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "16px 24px", borderBottom: `1px solid ${S.border}`, background: S.bgPanel }}>
              <h2 style={{ color: S.text, fontSize: 20, fontWeight: 800, margin: 0 }}>{"\uD83D\uDCE1"} Activity Feed</h2>
              <p style={{ color: S.textMuted, fontSize: 11, margin: "4px 0 0" }}>See what your friends are sharing, rating, and reviewing</p>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
              {activityFeed.length === 0 ? (
                <div style={{ textAlign: "center", padding: 60, color: S.textMuted }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>{"\uD83D\uDCE1"}</div>
                  <p style={{ fontSize: 15 }}>No activity yet</p>
                  <p style={{ fontSize: 12 }}>When your friends share, rate, or review movies, it'll appear here</p>
                </div>
              ) : activityFeed.map((e, i) => {
                const typeEmoji = { share: "\uD83C\uDFAC", rating: "\u2B50", review: "\u270D\uFE0F" };
                const typeVerb = { share: "shared", rating: "rated", review: "reviewed" };
                const tAgo = (() => { const d = Date.now() - new Date(e.createdAt).getTime();
                  if (d < 60000) return "just now"; if (d < 3600000) return Math.floor(d / 60000) + "m ago";
                  if (d < 86400000) return Math.floor(d / 3600000) + "h ago"; return Math.floor(d / 86400000) + "d ago"; })();
                return (
                  <div key={i} style={{ display: "flex", gap: 16, padding: 16, background: S.bgCard,
                    borderRadius: S.radius, border: `1px solid ${S.border}`, marginBottom: 10 }}>
                    <div style={{ width: 44, height: 44, borderRadius: "50%", background: e.user.color,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 16, fontWeight: 800, color: "#fff", flexShrink: 0 }}>{e.user.avatar}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: S.text, fontSize: 14, lineHeight: 1.4 }}>
                        <span style={{ fontWeight: 700 }}>{e.user.displayName}</span>
                        <span style={{ color: S.textSec }}> {typeVerb[e.type] || e.type} </span>
                        <span style={{ fontWeight: 600 }}>{e.title}</span>
                        {e.year && <span style={{ color: S.textMuted }}> ({e.year})</span>}
                        {e.type === "rating" && e.extra && <span style={{ color: S.amber, fontWeight: 700 }}> — {e.extra}/10</span>}
                      </div>
                      {e.type === "review" && e.extra && (
                        <div style={{ color: S.textSec, fontSize: 12, marginTop: 6, fontStyle: "italic",
                          padding: "8px 12px", background: S.bg, borderRadius: 8, borderLeft: `3px solid ${S.purple}` }}>
                          {e.extra.length > 120 ? e.extra.slice(0, 120) + "..." : e.extra}
                        </div>
                      )}
                      <div style={{ color: S.textMuted, fontSize: 11, marginTop: 6 }}>{typeEmoji[e.type]} {tAgo}</div>
                    </div>
                    {e.poster && <img src={e.poster} alt="" style={{ width: 48, height: 72, borderRadius: 6, objectFit: "cover", flexShrink: 0 }} />}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", color: S.textMuted, padding: 40 }}>
            {!sidebarOpen && (
              <button onClick={() => setSidebarOpen(true)}
                style={{ position: "absolute", top: 16, left: 16, background: S.bgPanel,
                  border: `1px solid ${S.border}`, borderRadius: S.radiusSm, padding: 8, cursor: "pointer" }}>
                <Icon name="menu" size={20} color={S.textSec} /></button>
            )}
            <div style={{ width: 80, height: 80, borderRadius: 20, background: S.bgPanel,
              display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20,
              border: `1px solid ${S.border}` }}>
              <Icon name="film" size={40} color={S.accent} /></div>
            <h2 style={{ color: S.text, margin: "0 0 8px", fontWeight: 700, fontSize: 22 }}>Welcome to CineVerse</h2>
            <p style={{ margin: 0, fontSize: 14, textAlign: "center", maxWidth: 340, lineHeight: 1.6 }}>
              Search any movie, share it with your crew, and build your watchlist.</p>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12, padding: "6px 14px",
              background: S.green + "15", borderRadius: 20, border: `1px solid ${S.green}33` }}>
              <Icon name="zap" size={13} color={S.green} />
              <span style={{ color: S.green, fontSize: 12, fontWeight: 600 }}>Powered by</span>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              <button onClick={() => { setMainView("explore"); setSidebarTab("explore"); }}
                style={{ padding: "10px 20px", borderRadius: S.radiusSm, border: "none",
                  background: S.accent, color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                Explore Movies</button>
              <button onClick={() => setShowNewChat(true)}
                style={{ padding: "10px 20px", borderRadius: S.radiusSm, border: `1px solid ${S.accent}`,
                  background: "transparent", color: S.accent, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                Start a Chat</button>
            </div>
          </div>
        )}
      </div>

      {showMovieSearch && <MovieSearchModal onClose={() => setShowMovieSearch(false)} onShare={handleShareMovie} />}
      {showLangPicker && <LanguagePickerModal currentSelection={preferredLangs}
        onSave={(langs) => { setPreferredLangs(langs); setShowLangPicker(false); api("/users/languages", { method: "PUT", body: JSON.stringify({ languages: langs }) }); }} />}
      {mainView === "explore" && preferredLangs.length === 0 && !showLangPicker && (
        <LanguagePickerModal currentSelection={[]}
          onSave={(langs) => { setPreferredLangs(langs); api("/users/languages", { method: "PUT", body: JSON.stringify({ languages: langs }) }); }} />
      )}
      {showNewChat && <NewChatModal onClose={() => setShowNewChat(false)} onStart={handleStartChat} users={friends} currentUser={user} existingConvos={convos} />}
      {shareToMovie && <ShareToModal movie={shareToMovie} onClose={() => setShareToMovie(null)}
        convos={convos} allUsers={allUsers} currentUser={user}
        onShare={handleShareToConvo} onNewChat={() => setShowNewChat(true)} />}
      {showNewGroup && <CreateGroupModal onClose={() => setShowNewGroup(false)} onCreate={handleCreateGroup} users={friends} currentUser={user} />}
      {showAddFriend && <AddFriendModal onClose={() => setShowAddFriend(false)} allUsers={allUsers} currentUser={user}
        friends={friends} friendRequests={friendRequests}
        onSendRequest={async (targetId) => {
          await api("/friends/request", { method: "POST", body: JSON.stringify({ userId: targetId }) });
          const reqs = await api("/friends/requests");
          if (reqs) setFriendRequests(reqs);
        }}
        onAccept={async (reqId) => {
          await api(`/friends/accept/${reqId}`, { method: "POST" });
          const [f, reqs] = await Promise.all([api("/friends"), api("/friends/requests")]);
          if (Array.isArray(f)) setFriends(f);
          if (reqs) setFriendRequests(reqs);
        }}
        onReject={async (reqId) => {
          await api(`/friends/reject/${reqId}`, { method: "POST" });
          const reqs = await api("/friends/requests");
          if (reqs) setFriendRequests(reqs);
        }}
      />}
      {watchlistMovie && !chatPersonView && (
        <MovieDetailModal movie={watchlistMovie}
          onClose={() => setWatchlistMovie(null)}
          onBack={() => setWatchlistMovie(null)}
          onShare={(m) => { setWatchlistMovie(null); setShareToMovie(m); }}
          onToggleWatchlist={toggleWatchlist}
          watchlist={watchlist}
          onViewPerson={(name, role) => setChatPersonView({ name, role, from: "watchlist" })}
          onToggleWatched={toggleWatched} watched={watched} />
      )}
      {chatMovie && !chatPersonView && (
        <MovieDetailModal movie={chatMovie}
          onClose={() => setChatMovie(null)}
          onBack={() => setChatMovie(null)}
          onShare={(m) => { setChatMovie(null); setShareToMovie(m); }}
          onToggleWatchlist={toggleWatchlist}
          watchlist={watchlist}
          onViewPerson={(name, role) => setChatPersonView({ name, role, from: "chat" })}
          onToggleWatched={toggleWatched} watched={watched} />
      )}
      {showProfile && (
        <UserProfileModal username={showProfile} onClose={() => setShowProfile(null)} currentUser={user?.username} />
      )}
      {showCompare && (
        <MovieCompareModal onClose={() => setShowCompare(false)} />
      )}
      {showWatchlistShare && (
        <WatchlistSharePicker convos={convos} user={user}
          onClose={() => setShowWatchlistShare(false)}
          onSelect={async (convoId) => {
            setShowWatchlistShare(false);
            try {
              const watchlistMovie = {
                title: `${user.displayName}'s Watchlist`,
                year: new Date().getFullYear().toString(),
                genre: "",
                rating: null,
                director: "",
                imdb_id: null,
                overview: `Shared watchlist with ${watchlist.length} movies`,
                poster: watchlist[0]?.poster || null,
              };
              const noteData = JSON.stringify(watchlist.map(m => ({
                id: m.id, title: m.title, year: m.year, genre: m.genre,
                rating: m.rating, poster: m.poster, director: m.director,
              })));
              await handleShareToConvo(convoId, watchlistMovie, noteData);
              setActiveConvo(convoId);
              setMainView("chat");
              setSidebarTab("chats");
            } catch (err) { console.error("Share watchlist error:", err); }
          }} />
      )}
      {showListShare && (
        <WatchlistSharePicker convos={convos} user={user}
          onClose={() => setShowListShare(null)}
          onSelect={async (convoId) => {
            const list = showListShare;
            setShowListShare(null);
            try {
              // Fetch fresh items for this list
              const fetchedItems = await api(`/lists/${list.id}/items`);
              const items = Array.isArray(fetchedItems) ? fetchedItems : [];
              const listMovie = {
                title: `${list.name}`,
                year: new Date().getFullYear().toString(),
                genre: "",
                rating: null,
                director: "",
                imdb_id: null,
                overview: `${user.displayName}'s list · ${items.length} movie${items.length !== 1 ? "s" : ""}`,
                poster: items[0]?.movie?.poster || null,
              };
              const noteData = JSON.stringify(items.map(i => ({
                title: i.movie.title, year: i.movie.year, genre: i.movie.genre,
                rating: i.movie.rating, poster: i.movie.poster, director: i.movie.director,
              })));
              await handleShareToConvo(convoId, listMovie, noteData);
              setActiveConvo(convoId);
              setMainView("chat");
              setSidebarTab("chats");
            } catch (err) { console.error("Share list error:", err); }
          }} />
      )}
      {chatPersonView && (
        <PersonFilmographyModal
          name={chatPersonView.name} role={chatPersonView.role}
          onClose={() => setChatPersonView(null)}
          onBack={() => setChatPersonView(null)}
          onSelectMovie={(m) => {
            setChatPersonView(null);
            if (chatPersonView.from === "watchlist") setWatchlistMovie(m);
            else setChatMovie(m);
          }}
          onToggleWatchlist={toggleWatchlist}
          watchlist={watchlist} />
      )}
      {showNotifications && (
        <NotificationPanel onClose={() => { setShowNotifications(false); setUnreadNotifs(0); }} api={api}
          onAcceptFriend={async (fromUserId) => {
            const reqs = await api("/friends/requests");
            if (reqs?.incoming) {
              const req = reqs.incoming.find(r => r.user.id === fromUserId);
              if (req) {
                await api(`/friends/accept/${req.requestId}`, { method: "POST" });
                const [f, newReqs] = await Promise.all([api("/friends"), api("/friends/requests")]);
                if (Array.isArray(f)) setFriends(f);
                if (newReqs) setFriendRequests(newReqs);
              }
            }
          }}
          onRejectFriend={async (fromUserId) => {
            const reqs = await api("/friends/requests");
            if (reqs?.incoming) {
              const req = reqs.incoming.find(r => r.user.id === fromUserId);
              if (req) {
                await api(`/friends/reject/${req.requestId}`, { method: "POST" });
                const newReqs = await api("/friends/requests");
                if (newReqs) setFriendRequests(newReqs);
              }
            }
          }}
        />
      )}
      {showCreateList && (
        <CreateListModal onClose={() => setShowCreateList(false)} onSave={async (name, desc) => {
          const list = await api("/lists", { method: "POST", body: JSON.stringify({ name, description: desc }) });
          if (list) { setCustomLists(prev => [{ ...list, itemCount: 0 }, ...prev]); setShowCreateList(false); }
        }} />
      )}
      {showCreatePoll && activeConvo && (
        <CreatePollModal onClose={() => setShowCreatePoll(false)} onSave={async (question, options) => {
          await api(`/conversations/${activeConvo}/polls`, { method: "POST", body: JSON.stringify({ question, options }) });
          const p = await api(`/conversations/${activeConvo}/polls`);
          if (Array.isArray(p)) setPolls(prev => ({ ...prev, [activeConvo]: p }));
          setShowCreatePoll(false);
        }} />
      )}
    </div>
  );
}
