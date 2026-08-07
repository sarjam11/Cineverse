require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {
  initSchema, query: dbQuery, userQueries, conversationQueries, messageQueries,
  reactionQueries, watchlistQueries, readReceiptQueries,
  ratingQueries, reviewQueries, watchedTogetherQueries, trendingQueries, watchedQueries,
  notificationQueries, customListQueries, pollQueries, friendshipQueries,
} = require("./database");

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || "cineverse-secret-change-in-production-" + crypto.randomBytes(16).toString("hex");
const BCRYPT_ROUNDS = 10;

// ======================== MIDDLEWARE ========================

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || "*", credentials: true }));
app.use(express.json({ limit: "1mb" }));

// Rate limiting
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30, message: { error: "Too many auth attempts. Try again later." } });
const apiLimiter = rateLimit({ windowMs: 1 * 60 * 1000, max: 120, message: { error: "Too many requests. Slow down." } });
app.use("/api/auth", authLimiter);
app.use("/api", apiLimiter);

// JWT auth middleware
function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return res.status(401).json({ error: "No token provided" });
  try {
    const decoded = jwt.verify(header.slice(7), JWT_SECRET);
    req.userId = decoded.userId;
    req.username = decoded.username;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// Generate unique IDs
const genId = () => crypto.randomBytes(8).toString("hex");

// ======================== AUTH ROUTES ========================

app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, displayName, password } = req.body;
    if (!username?.trim() || !displayName?.trim() || !password?.trim()) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const clean = username.toLowerCase().trim();
    if (clean.length < 3) return res.status(400).json({ error: "Username must be at least 3 characters" });
    if (!/^[a-zA-Z0-9_]+$/.test(clean)) return res.status(400).json({ error: "Username can only contain letters, numbers, underscores" });
    if (password.length < 4) return res.status(400).json({ error: "Password must be at least 4 characters" });
    if (await userQueries.findByUsername(clean)) return res.status(409).json({ error: "Username already taken" });

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const avatar = displayName.trim().split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
    const colors = ["#E50914","#7C3AED","#0EA5E9","#10B981","#F59E0B","#EC4899","#6366F1","#14B8A6"];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const { securityQuestion, securityAnswer } = req.body;

    const user = await userQueries.create(clean, displayName.trim(), avatar, color, passwordHash, securityQuestion || null, securityAnswer ? securityAnswer.toLowerCase().trim() : null);
    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({
      token,
      user: { id: user.id, username: user.username, displayName: user.display_name, avatar: user.avatar, color: user.color },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
});

app.post("/api/auth/recover/question", async (req, res) => {
  try {
    const { username } = req.body;
    if (!username?.trim()) return res.status(400).json({ error: "Username required" });
    const user = await userQueries.findByUsername(username.toLowerCase().trim());
    if (!user) return res.status(404).json({ error: "User not found" });
    if (!user.security_question) return res.status(400).json({ error: "No security question set for this account" });
    res.json({ question: user.security_question });
  } catch (err) { res.status(500).json({ error: "Recovery failed" }); }
});

app.post("/api/auth/recover/reset", async (req, res) => {
  try {
    const { username, answer, newPassword } = req.body;
    if (!username?.trim() || !answer?.trim() || !newPassword?.trim()) return res.status(400).json({ error: "All fields required" });
    if (newPassword.length < 4) return res.status(400).json({ error: "Password must be at least 4 characters" });
    const user = await userQueries.findByUsername(username.toLowerCase().trim());
    if (!user) return res.status(404).json({ error: "User not found" });
    if (!user.security_answer) return res.status(400).json({ error: "No security question set" });
    if (user.security_answer !== answer.toLowerCase().trim()) return res.status(401).json({ error: "Incorrect answer" });
    const newHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await dbQuery("UPDATE users SET password_hash = $1 WHERE id = $2", [newHash, user.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: "Reset failed" }); }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username?.trim() || !password?.trim()) return res.status(400).json({ error: "All fields are required" });

    const user = await userQueries.findByUsername(username.toLowerCase().trim());
    if (!user) return res.status(401).json({ error: "User not found" });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: "Wrong password" });

    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      token,
      user: { id: user.id, username: user.username, displayName: user.display_name, avatar: user.avatar, color: user.color },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

app.get("/api/auth/me", authenticate, async (req, res) => {
  const user = await userQueries.findById(req.userId);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({
    id: user.id, username: user.username, displayName: user.display_name,
    avatar: user.avatar, color: user.color, preferredLangs: JSON.parse(user.preferred_langs || "[]"),
  });
});

// ======================== USER ROUTES ========================

app.get("/api/users/search", authenticate, async (req, res) => {
  const query = req.query.q?.trim();
  if (!query) return res.json([]);
  const users = await userQueries.search(query, req.userId);
  res.json(users.map(u => ({ id: u.id, username: u.username, displayName: u.display_name, avatar: u.avatar, color: u.color })));
});

app.get("/api/users", authenticate, async (req, res) => {
  const users = await userQueries.listAll(req.userId);
  res.json(users.map(u => ({ id: u.id, username: u.username, displayName: u.display_name, avatar: u.avatar, color: u.color })));
});

app.get("/api/users/:username", authenticate, async (req, res) => {
  const user = await userQueries.findByUsername(req.params.username);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ id: user.id, username: user.username, displayName: user.display_name, avatar: user.avatar, color: user.color });
});

app.put("/api/users/languages", authenticate, async (req, res) => {
  const { languages } = req.body;
  if (!Array.isArray(languages)) return res.status(400).json({ error: "Languages must be an array" });
  userQueries.updatePreferredLangs(req.userId, languages);
  res.json({ success: true, languages });
});

// ======================== FRIEND ROUTES ========================


app.get("/api/friends", authenticate, async (req, res) => {
  try {
    const friends = await friendshipQueries.getFriends(req.userId);
    res.json(friends.map(f => ({ id: f.id, username: f.username, displayName: f.display_name, avatar: f.avatar, color: f.color })));
  } catch (err) { res.status(500).json({ error: "Failed to get friends" }); }
});

app.get("/api/friends/requests", authenticate, async (req, res) => {
  try {
    const incoming = await friendshipQueries.getPendingIncoming(req.userId);
    const outgoing = await friendshipQueries.getPendingOutgoing(req.userId);
    res.json({
      incoming: incoming.map(r => ({ requestId: r.request_id, user: { id: r.user_id, username: r.username, displayName: r.display_name, avatar: r.avatar, color: r.color }, createdAt: r.created_at })),
      outgoing: outgoing.map(r => ({ requestId: r.request_id, user: { id: r.user_id, username: r.username, displayName: r.display_name, avatar: r.avatar, color: r.color }, createdAt: r.created_at })),
    });
  } catch (err) { res.status(500).json({ error: "Failed to get requests" }); }
});

app.post("/api/friends/request", authenticate, async (req, res) => {
  try {
    const { userId: targetUserId } = req.body;
    if (!targetUserId || targetUserId === req.userId) return res.status(400).json({ error: "Invalid user" });
    const result = await friendshipQueries.sendRequest(req.userId, targetUserId);
    if (result.action === "sent") {
      await notificationQueries.create(targetUserId, req.userId, "friend_request", "Casting Call", "wants you in their crew");
    }
    res.json(result);
  } catch (err) { res.status(500).json({ error: "Failed to send request" }); }
});

app.post("/api/friends/accept/:id", authenticate, async (req, res) => {
  try {
    const fr = await dbQuery("SELECT * FROM friendships WHERE id = $1 AND to_user_id = $2", [parseInt(req.params.id), req.userId]);
    const friendship = fr.rows[0];
    await friendshipQueries.acceptRequest(parseInt(req.params.id), req.userId);
    if (friendship) {
      await notificationQueries.create(friendship.from_user_id, req.userId, "friend_accepted", "Accepted your casting call", "You are now co-stars!");
    }
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: "Failed to accept" }); }
});

app.post("/api/friends/reject/:id", authenticate, async (req, res) => {
  try {
    await friendshipQueries.rejectRequest(parseInt(req.params.id), req.userId);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: "Failed to reject" }); }
});

app.delete("/api/friends/:userId", authenticate, async (req, res) => {
  try {
    await friendshipQueries.removeFriend(req.userId, parseInt(req.params.userId));
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: "Failed to remove friend" }); }
});

// ======================== CONVERSATION ROUTES ========================

app.get("/api/conversations", authenticate, async (req, res) => {
  const convos = await conversationQueries.listForUser(req.userId);
  const result = await Promise.all(convos.map(async c => {
    const members = await conversationQueries.getMembers(c.id);
    const unread = await readReceiptQueries.getUnreadCount(req.userId, c.id);
    return {
      id: c.id, type: c.type, name: c.name,
      members: members.map(m => ({ id: m.id, username: m.username, displayName: m.display_name, avatar: m.avatar, color: m.color })),
      lastMovie: c.last_movie, lastSender: c.last_sender,
      updatedAt: c.updated_at, unread,
    };
  }));
  res.json(result);
});

app.post("/api/conversations", authenticate, async (req, res) => {
  try {
    const { type, name, memberIds } = req.body;
    if (!type || !["private", "group"].includes(type)) return res.status(400).json({ error: "Invalid conversation type" });
    if (type === "group" && !name?.trim()) return res.status(400).json({ error: "Group name is required" });
    if (!memberIds?.length) return res.status(400).json({ error: "At least one member required" });

    // For private chats, check if one already exists
    if (type === "private" && memberIds.length === 1) {
      const existing = await conversationQueries.findPrivate(req.userId, memberIds[0]);
      if (existing) {
        const members = await conversationQueries.getMembers(existing.id);
        return res.json({
          id: existing.id, type: "private", existing: true,
          members: members.map(m => ({ id: m.id, username: m.username, displayName: m.display_name, avatar: m.avatar, color: m.color })),
        });
      }
    }

    const id = genId();
    await conversationQueries.create(id, type, type === "group" ? name.trim() : null);
    await conversationQueries.addMember(id, req.userId);
    memberIds.forEach(memberId => conversationQueries.addMember(id, memberId));

    const members = await conversationQueries.getMembers(id);
    res.status(201).json({
      id, type, name: type === "group" ? name.trim() : null,
      members: members.map(m => ({ id: m.id, username: m.username, displayName: m.display_name, avatar: m.avatar, color: m.color })),
    });
  } catch (err) {
    console.error("Create conversation error:", err);
    res.status(500).json({ error: "Failed to create conversation" });
  }
});

// ======================== MESSAGE ROUTES ========================

app.get("/api/conversations/:id/messages", authenticate, async (req, res) => {
  const { id } = req.params;
  const limit = parseInt(req.query.limit) || 50;
  const before = req.query.before || null;

  const messages = await messageQueries.listForConversation(id, limit, before);
  const reactionData = await reactionQueries.getForConversation(id);
  const ratingData = await ratingQueries.getForConversation(id);
  const reviewData = await reviewQueries.getForConversation(id);
  const watchedData = await watchedTogetherQueries.getForConversation(id);

  // Group reactions by message
  const reactionsByMsg = {};
  reactionData.forEach(r => {
    if (!reactionsByMsg[r.message_id]) reactionsByMsg[r.message_id] = {};
    if (!reactionsByMsg[r.message_id][r.emoji]) reactionsByMsg[r.message_id][r.emoji] = [];
    reactionsByMsg[r.message_id][r.emoji].push(r.username);
  });

  // Group ratings by message
  const ratingsByMsg = {};
  ratingData.forEach(r => {
    if (!ratingsByMsg[r.message_id]) ratingsByMsg[r.message_id] = {};
    ratingsByMsg[r.message_id][r.username] = r.rating;
  });

  // Group reviews by message
  const reviewsByMsg = {};
  reviewData.forEach(r => {
    if (!reviewsByMsg[r.message_id]) reviewsByMsg[r.message_id] = {};
    reviewsByMsg[r.message_id][r.username] = r.review_text;
  });

  // Group watched_together by message
  const watchedByMsg = {};
  watchedData.forEach(w => {
    if (!watchedByMsg[w.message_id]) watchedByMsg[w.message_id] = [];
    watchedByMsg[w.message_id].push(w.username);
  });

  const result = messages.map(m => ({
    id: m.id,
    sender: { username: m.sender_username, displayName: m.sender_display_name, avatar: m.sender_avatar, color: m.sender_color },
    movie: {
      title: m.movie_title, year: m.movie_year, genre: m.movie_genre, rating: m.movie_rating,
      director: m.movie_director, imdb_id: m.movie_imdb_id, overview: m.movie_overview,
      poster: m.movie_poster || null,
      media_type: m.media_type || "movie",
    },
    note: m.note || null,
    reactions: reactionsByMsg[m.id] || {},
    ratings: ratingsByMsg[m.id] || {},
    reviews: reviewsByMsg[m.id] || {},
    watchedBy: watchedByMsg[m.id] || [],
    createdAt: m.created_at,
  }));

  // Mark as read
  readReceiptQueries.markRead(req.userId, id);

  res.json(result);
});

app.post("/api/conversations/:id/messages", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { movie, note } = req.body;
    if (!movie?.title) return res.status(400).json({ error: "Movie title is required" });

    const msgId = genId();
    const message = await messageQueries.create(msgId, id, req.userId, movie, note || null);

    // Notify other conversation members
    const members = await conversationQueries.getMembers(id);
    for (const m of members) {
      if (m.id !== req.userId) {
        await notificationQueries.create(m.id, req.userId, "share", `Shared ${movie.title}`, movie.title, id, msgId);
      }
    }

    res.status(201).json({
      id: message.id,
      sender: { username: message.sender_username, displayName: message.sender_display_name, avatar: message.sender_avatar, color: message.sender_color },
      movie, note: note || null,
      reactions: {},
      createdAt: message.created_at,
    });
  } catch (err) {
    console.error("Send message error:", err);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// ======================== REACTION ROUTES ========================

app.post("/api/messages/:id/reactions", authenticate, async (req, res) => {
  try {
    const { emoji } = req.body;
    if (!emoji) return res.status(400).json({ error: "Emoji is required" });
    const result = await reactionQueries.toggle(req.params.id, req.userId, emoji);
    if (result.action === "added") {
      const msg = await messageQueries.findById(req.params.id);
      if (msg && msg.sender_id !== req.userId) {
        await notificationQueries.create(msg.sender_id, req.userId, "reaction", `Reacted ${emoji}`, msg.movie_title, msg.conversation_id, req.params.id);
      }
    }
    res.json(result);
  } catch (err) {
    console.error("Reaction error:", err);
    res.status(500).json({ error: "Failed to toggle reaction" });
  }
});

// ======================== MOVIE RATING ROUTES ========================

app.post("/api/messages/:id/rate", authenticate, async (req, res) => {
  try {
    const { rating } = req.body;
    if (!rating || rating < 1 || rating > 10 || (rating * 2) % 1 !== 0) {
      return res.status(400).json({ error: "Rating must be from 1 to 10 in 0.5 increments" });
    }
    await ratingQueries.setRating(req.params.id, req.userId, rating);
    const msg = await messageQueries.findById(req.params.id);
    if (msg && msg.sender_id !== req.userId) {
      await notificationQueries.create(msg.sender_id, req.userId, "rating", `Rated ${rating}/10`, msg.movie_title, msg.conversation_id, req.params.id);
    }
    const ratings = await ratingQueries.getForMessage(req.params.id);
    const result = {};
    ratings.forEach(r => { result[r.username] = r.rating; });
    res.json(result);
  } catch (err) {
    console.error("Rating error:", err);
    res.status(500).json({ error: "Failed to save rating" });
  }
});

// ======================== REVIEW ROUTES ========================

app.post("/api/messages/:id/review", authenticate, async (req, res) => {
  try {
    const { review } = req.body;
    if (!review?.trim()) return res.status(400).json({ error: "Review text required" });
    if (review.length > 500) return res.status(400).json({ error: "Review must be under 500 characters" });
    await reviewQueries.setReview(req.params.id, req.userId, review.trim());
    const reviews = await reviewQueries.getForMessage(req.params.id);
    const result = {};
    reviews.forEach(r => { result[r.username] = r.review_text; });
    res.json(result);
  } catch (err) {
    console.error("Review error:", err);
    res.status(500).json({ error: "Failed to save review" });
  }
});

// ======================== WATCHED TOGETHER ROUTES ========================

app.post("/api/messages/:id/watched", authenticate, async (req, res) => {
  try {
    const { conversation_id } = req.body;
    if (!conversation_id) return res.status(400).json({ error: "conversation_id required" });
    const result = await watchedTogetherQueries.toggle(conversation_id, req.params.id, req.userId);
    const watchers = await watchedTogetherQueries.getForConversation(conversation_id)
      .filter(w => w.message_id === req.params.id)
      .map(w => w.username);
    res.json({ ...result, watchedBy: watchers });
  } catch (err) {
    console.error("Watched error:", err);
    res.status(500).json({ error: "Failed to toggle watched" });
  }
});

// ======================== TRENDING AMONG FRIENDS ========================

app.get("/api/trending/friends", authenticate, async (req, res) => {
  try {
    const items = await trendingQueries.getAmongFriends(req.userId, 20);
    res.json(items.map(m => ({
      title: m.movie_title,
      year: m.movie_year,
      genre: m.movie_genre,
      director: m.movie_director,
      imdb_id: m.movie_imdb_id,
      overview: m.movie_overview,
      poster: m.movie_poster,
      shareCount: m.share_count,
      ratingCount: m.rating_count,
      avgRating: m.avg_rating,
    })));
  } catch (err) {
    console.error("Trending friends error:", err);
    res.status(500).json({ error: "Failed to get trending" });
  }
});

// ======================== USER PROFILE STATS ========================

app.get("/api/users/:username/stats", authenticate, async (req, res) => {
  try {
    const targetUser = await userQueries.findByUsername(req.params.username);
    if (!targetUser) return res.status(404).json({ error: "User not found" });
    const uid = targetUser.id;

    const totalShared = (await dbQuery(`SELECT COUNT(*) as c FROM messages WHERE sender_id = $1`, [uid])).rows[0]?.c;
    const totalRatings = (await dbQuery(`SELECT COUNT(*) as c FROM movie_ratings WHERE user_id = $1`, [uid])).rows[0]?.c;
    const avgRating = (await dbQuery(`SELECT ROUND(AVG(rating)::numeric, 1) as avg FROM movie_ratings WHERE user_id = $1`, [uid])).rows[0]?.avg;
    const totalWatchlist = (await dbQuery(`SELECT COUNT(*) as c FROM watchlist WHERE user_id = $1`, [uid])).rows[0]?.c;
    const totalReviews = (await dbQuery(`SELECT COUNT(*) as c FROM reviews WHERE user_id = $1`, [uid])).rows[0]?.c;
    const totalWatched = (await dbQuery(`SELECT COUNT(*) as c FROM watched_together WHERE user_id = $1`, [uid])).rows[0]?.c;
    const totalWatchedList = (await dbQuery(`SELECT COUNT(*) as c FROM watched WHERE user_id = $1`, [uid])).rows[0]?.c;

    // Top genres
    const topGenres = (await dbQuery(`SELECT movie_genre as genre, COUNT(*) as count FROM messages
       WHERE sender_id = $1 AND movie_genre IS NOT NULL AND movie_genre != ''
       GROUP BY movie_genre ORDER BY count DESC`, [uid])).rows;

    // Count movies with no genre
    const noGenreCount = (await dbQuery(`SELECT COUNT(*) as c FROM messages WHERE sender_id = $1 AND (movie_genre IS NULL OR movie_genre = '')`, [uid])).rows[0]?.c;
    if (noGenreCount > 0) topGenres.push({ genre: "Other", count: noGenreCount });

    // Genre ratings breakdown
    const genreRatings = (await dbQuery(`SELECT m.movie_genre as genre, ROUND(AVG(mr.rating)::numeric, 1) as avg_rating, COUNT(*) as count
       FROM movie_ratings mr JOIN messages m ON mr.message_id = m.id
       WHERE mr.user_id = $1 AND m.movie_genre IS NOT NULL AND m.movie_genre != ''
       GROUP BY m.movie_genre ORDER BY count DESC`, [uid])).rows;

    // Taste match with requesting user (if different)
    let tasteMatch = null;
    if (req.userId !== uid) {
      const commonMovies = (await dbQuery(`SELECT mr1.rating as r1, mr2.rating as r2
         FROM movie_ratings mr1
         JOIN movie_ratings mr2 ON mr1.message_id = mr2.message_id
         WHERE mr1.user_id = $1 AND mr2.user_id = $2`, [req.userId, uid])).rows;

      if (commonMovies.length >= 2) {
        const diffs = commonMovies.map(c => Math.abs(c.r1 - c.r2));
        const avgDiff = diffs.reduce((a, b) => a + b, 0) / diffs.length;
        tasteMatch = Math.round(Math.max(0, 100 - avgDiff * 10));
      }
    }

    // Recently shared
    const recentShared = (await dbQuery(`SELECT movie_title, movie_year, movie_genre, movie_poster, created_at
       FROM messages WHERE sender_id = $1 ORDER BY created_at DESC LIMIT 5`, [uid])).rows;

    // Watched movies
    const watchedMovies = (await dbQuery(`SELECT movie_title, movie_year, movie_genre, movie_rating, movie_director, movie_poster, watched_at
       FROM watched WHERE user_id = $1 ORDER BY watched_at DESC`, [uid])).rows;

    // Watched genre breakdown
    const watchedGenres = (await dbQuery(`SELECT movie_genre as genre, COUNT(*) as count, ROUND(AVG(movie_rating)::numeric, 1) as avg_rating
       FROM watched WHERE user_id = $1 AND movie_genre IS NOT NULL AND movie_genre != ''
       GROUP BY movie_genre ORDER BY count DESC`, [uid])).rows;

    // ---- ACHIEVEMENTS ----
    const badges = [];
    if (totalShared >= 1) badges.push({ emoji: "\uD83C\uDFAC", name: "First Share", desc: "Shared your first movie" });
    if (totalShared >= 10) badges.push({ emoji: "\uD83D\uDD25", name: "10 Club", desc: "Shared 10+ movies" });
    if (totalShared >= 50) badges.push({ emoji: "\uD83D\uDCAF", name: "50 Club", desc: "Shared 50+ movies" });
    if (totalShared >= 100) badges.push({ emoji: "\uD83C\uDFC6", name: "Century", desc: "Shared 100+ movies" });
    if (totalWatchedList >= 10) badges.push({ emoji: "\uD83D\uDC41", name: "Binge Watcher", desc: "Watched 10+ movies" });
    if (totalWatchedList >= 50) badges.push({ emoji: "\uD83C\uDF1F", name: "Movie Marathon", desc: "Watched 50+ movies" });
    if (totalReviews >= 5) badges.push({ emoji: "\u270D\uFE0F", name: "Critic", desc: "Written 5+ reviews" });
    if (totalReviews >= 25) badges.push({ emoji: "\uD83D\uDCDD", name: "Top Critic", desc: "Written 25+ reviews" });
    if (totalRatings >= 20) badges.push({ emoji: "\u2B50", name: "Rating Machine", desc: "Rated 20+ movies" });
    if (avgRating && avgRating >= 8) badges.push({ emoji: "\uD83D\uDE0A", name: "Easy Grader", desc: "Avg rating 8+" });
    if (avgRating && avgRating <= 5 && totalRatings >= 5) badges.push({ emoji: "\uD83E\uDDD0", name: "Tough Critic", desc: "Avg rating 5 or below" });

    const genreSpecific = [
      { genre: "Horror", emoji: "\uD83D\uDC7B", name: "Horror Fanatic" },
      { genre: "Action", emoji: "\uD83D\uDCA5", name: "Action Hero" },
      { genre: "Comedy", emoji: "\uD83E\uDD23", name: "Comedy King" },
      { genre: "Drama", emoji: "\uD83C\uDFAD", name: "Drama Lover" },
      { genre: "Sci-Fi", emoji: "\uD83D\uDE80", name: "Sci-Fi Geek" },
      { genre: "Romance", emoji: "\u2764\uFE0F", name: "Hopeless Romantic" },
      { genre: "Animation", emoji: "\uD83C\uDF1F", name: "Animation Fan" },
      { genre: "Thriller", emoji: "\uD83D\uDD2A", name: "Thrill Seeker" },
    ];
    const allGenreCounts = {};
    topGenres.forEach(g => { allGenreCounts[g.genre] = (allGenreCounts[g.genre] || 0) + g.count; });
    watchedGenres.forEach(g => { allGenreCounts[g.genre] = (allGenreCounts[g.genre] || 0) + g.count; });
    genreSpecific.forEach(gs => {
      if ((allGenreCounts[gs.genre] || 0) >= 10) badges.push({ emoji: gs.emoji, name: gs.name, desc: `10+ ${gs.genre} movies` });
    });

    const uniqueLangs = (await dbQuery(`SELECT COUNT(DISTINCT movie_genre) as c FROM watched WHERE user_id = $1 AND movie_genre IS NOT NULL`, [uid])).rows[0]?.c;
    if (uniqueLangs >= 5) badges.push({ emoji: "\uD83C\uDF0D", name: "World Cinema", desc: "5+ different genres" });

    const convoCount = (await dbQuery(`SELECT COUNT(DISTINCT conversation_id) as c FROM messages WHERE sender_id = $1`, [uid])).rows[0]?.c;
    if (convoCount >= 3) badges.push({ emoji: "\uD83E\uDD1D", name: "Social Butterfly", desc: "Active in 3+ chats" });

    // ---- SIMILAR TASTE FINDER ----
    let similarUsers = [];
    if (totalRatings >= 2) {
      const otherUsers = (await dbQuery(`SELECT id, username, display_name, avatar, color FROM users WHERE id != $1`, [uid])).rows;
      for (const other of otherUsers) {
        const common = (await dbQuery(`SELECT mr1.rating as r1, mr2.rating as r2
           FROM movie_ratings mr1
           JOIN movie_ratings mr2 ON mr1.message_id = mr2.message_id
           WHERE mr1.user_id = $1 AND mr2.user_id = $2`, [uid, other.id])).rows;
        if (common.length >= 2) {
          const diffs = common.map(c => Math.abs(c.r1 - c.r2));
          const avgDiff = diffs.reduce((a, b) => a + b, 0) / diffs.length;
          const match = Math.round(Math.max(0, 100 - avgDiff * 10));
          similarUsers.push({
            username: other.username, displayName: other.display_name,
            avatar: other.avatar, color: other.color,
            match, commonCount: common.length,
          });
        }
      }
      similarUsers.sort((a, b) => b.match - a.match);
      similarUsers = similarUsers.slice(0, 5);
    }

    res.json({
      username: targetUser.username,
      displayName: targetUser.display_name,
      avatar: targetUser.avatar,
      color: targetUser.color,
      joinedAt: targetUser.created_at,
      totalShared,
      totalRatings,
      avgRating: avgRating || 0,
      totalWatchlist,
      totalReviews,
      totalWatched,
      totalWatchedList,
      topGenres,
      genreRatings,
      tasteMatch,
      recentShared: recentShared.map(m => ({
        title: m.movie_title, year: m.movie_year, genre: m.movie_genre, poster: m.movie_poster,
      })),
      watchedMovies: watchedMovies.map(m => ({
        title: m.movie_title, year: m.movie_year, genre: m.movie_genre,
        rating: m.movie_rating, director: m.movie_director, poster: m.movie_poster,
      })),
      watchedGenres,
      badges,
      similarUsers,
    });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ error: "Failed to get stats" });
  }
});

// ======================== WATCHLIST ROUTES ========================

app.get("/api/watchlist", authenticate, async (req, res) => {
  const items = await watchlistQueries.list(req.userId);
  res.json(items.map(w => ({
    id: w.id,
    movie: {
      title: w.movie_title, year: w.movie_year, genre: w.movie_genre, rating: w.movie_rating,
      director: w.movie_director, imdb_id: w.movie_imdb_id, overview: w.movie_overview,
      poster: w.movie_poster || null,
    },
    addedAt: w.added_at,
  })));
});

app.post("/api/watchlist", authenticate, async (req, res) => {
  try {
    const { movie } = req.body;
    if (!movie?.title) return res.status(400).json({ error: "Movie title is required" });
    const result = await watchlistQueries.add(req.userId, movie);
    res.json(result);
  } catch (err) {
    console.error("Watchlist error:", err);
    res.status(500).json({ error: "Failed to update watchlist" });
  }
});

app.delete("/api/watchlist/:id", authenticate, async (req, res) => {
  watchlistQueries.remove(req.userId, req.params.id);
  res.json({ success: true });
});

// Share watchlist — generates a public link
app.post("/api/watchlist/share", authenticate, async (req, res) => {
  try {
    // Reuse existing token or create new one
    let existing = (await dbQuery(`SELECT token FROM share_tokens WHERE user_id = $1`, [req.userId])).rows[0];
    if (!existing) {
      const token = crypto.randomBytes(12).toString("hex");
      await dbQuery(`INSERT INTO share_tokens (token, user_id) VALUES ($1, $2)`, [token, req.userId]);
      existing = { token };
    }
    res.json({ token: existing.token });
  } catch (err) {
    console.error("Share error:", err);
    res.status(500).json({ error: "Failed to generate share link" });
  }
});

// Public watchlist view — no auth required
app.get("/api/watchlist/shared/:token", async (req, res) => {
  try {
    const record = (await dbQuery(`SELECT st.user_id, u.username, u.display_name, u.avatar, u.color FROM share_tokens st JOIN users u ON st.user_id = u.id WHERE st.token = $1`, [req.params.token])).rows[0];
    if (!record) return res.status(404).json({ error: "Watchlist not found" });
    const items = await watchlistQueries.list(record.user_id);
    res.json({
      user: { username: record.username, displayName: record.display_name, avatar: record.avatar, color: record.color },
      movies: items.map(w => ({
        title: w.movie_title, year: w.movie_year, genre: w.movie_genre,
        rating: w.movie_rating, poster: w.movie_poster, director: w.movie_director,
      })),
    });
  } catch (err) {
    console.error("Shared watchlist error:", err);
    res.status(500).json({ error: "Failed to load watchlist" });
  }
});

// ======================== READ RECEIPTS ========================

app.post("/api/conversations/:id/read", authenticate, async (req, res) => {
  readReceiptQueries.markRead(req.userId, req.params.id);
  res.json({ success: true });
});

// ======================== WATCHED LIST ROUTES ========================

app.get("/api/watched", authenticate, async (req, res) => {
  const items = await watchedQueries.list(req.userId);
  res.json(items.map(w => ({
    id: w.id,
    movie: {
      title: w.movie_title, year: w.movie_year, genre: w.movie_genre, rating: w.movie_rating,
      director: w.movie_director, imdb_id: w.movie_imdb_id, overview: w.movie_overview,
      poster: w.movie_poster || null,
    },
    watchedAt: w.watched_at,
  })));
});

app.post("/api/watched", authenticate, async (req, res) => {
  try {
    const { movie } = req.body;
    if (!movie?.title) return res.status(400).json({ error: "Movie title is required" });
    const result = await watchedQueries.add(req.userId, movie);
    res.json(result);
  } catch (err) {
    console.error("Watched error:", err);
    res.status(500).json({ error: "Failed to update watched list" });
  }
});

// ======================== USERNAME CHECK ========================

app.get("/api/check-username/:username", async (req, res) => {
  const user = await userQueries.findByUsername(req.params.username.toLowerCase().trim());
  res.json({ available: !user });
});

// ======================== NOTIFICATIONS ========================

app.get("/api/notifications", authenticate, async (req, res) => {
  try {
    const items = await notificationQueries.list(req.userId);
    res.json(items.map(n => ({
      id: n.id, type: n.type, title: n.title, body: n.body,
      from: n.from_user_id ? { id: n.from_user_id, username: n.from_username, displayName: n.from_display_name, avatar: n.from_avatar, color: n.from_color } : null,
      conversationId: n.conversation_id, messageId: n.message_id,
      isRead: !!n.is_read, createdAt: n.created_at,
    })));
  } catch (err) { res.status(500).json({ error: "Failed to get notifications" }); }
});

app.get("/api/notifications/count", authenticate, async (req, res) => {
  res.json({ count: notificationQueries.unreadCount(req.userId) });
});

app.post("/api/notifications/read", authenticate, async (req, res) => {
  notificationQueries.markAllRead(req.userId);
  res.json({ success: true });
});

// ======================== CUSTOM LISTS ========================

app.get("/api/lists", authenticate, async (req, res) => {
  try { res.json(customListQueries.listForUser(req.userId)); }
  catch (err) { res.status(500).json({ error: "Failed to get lists" }); }
});

app.post("/api/lists", authenticate, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: "List name required" });
    const list = await customListQueries.create(req.userId, name.trim(), description?.trim() || "");
    res.status(201).json(list);
  } catch (err) { res.status(500).json({ error: "Failed to create list" }); }
});

app.put("/api/lists/:id", authenticate, async (req, res) => {
  try {
    const { name, description } = req.body;
    await customListQueries.update(req.params.id, req.userId, name?.trim(), description?.trim() || "");
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: "Failed to update list" }); }
});

app.delete("/api/lists/:id", authenticate, async (req, res) => {
  try { customListQueries.delete(req.params.id, req.userId); res.json({ success: true }); }
  catch (err) { res.status(500).json({ error: "Failed to delete list" }); }
});

app.get("/api/lists/:id/items", authenticate, async (req, res) => {
  try {
    const items = await customListQueries.getItems(req.params.id);
    res.json(items.map(i => ({
      id: i.id, movie: { title: i.movie_title, year: i.movie_year, genre: i.movie_genre,
        rating: i.movie_rating, director: i.movie_director, poster: i.movie_poster,
        imdb_id: i.movie_imdb_id, media_type: i.media_type },
      addedAt: i.added_at,
    })));
  } catch (err) { res.status(500).json({ error: "Failed to get list items" }); }
});

app.post("/api/lists/:id/items", authenticate, async (req, res) => {
  try {
    const list = await customListQueries.getById(req.params.id);
    if (!list || list.user_id !== req.userId) return res.status(403).json({ error: "Not your list" });
    const { movie } = req.body;
    if (!movie?.title) return res.status(400).json({ error: "Movie required" });
    res.json(customListQueries.addItem(req.params.id, movie));
  } catch (err) { res.status(500).json({ error: "Failed to add to list" }); }
});

app.delete("/api/lists/:id/items/:itemId", authenticate, async (req, res) => {
  try { customListQueries.removeItem(req.params.id, req.params.itemId); res.json({ success: true }); }
  catch (err) { res.status(500).json({ error: "Failed to remove item" }); }
});

// ======================== POLLS ========================

app.post("/api/conversations/:id/polls", authenticate, async (req, res) => {
  try {
    const { question, options } = req.body;
    if (!question?.trim()) return res.status(400).json({ error: "Question required" });
    if (!options?.length || options.length < 2) return res.status(400).json({ error: "At least 2 options required" });
    if (options.length > 6) return res.status(400).json({ error: "Maximum 6 options" });
    const poll = await pollQueries.create(req.params.id, req.userId, question.trim());
    options.forEach(o => pollQueries.addOption(poll.id, o));
    // Notify members
    const members = await conversationQueries.getMembers(req.params.id);
    members.forEach(m => {
      if (m.id !== req.userId) notificationQueries.create(m.id, req.userId, "poll", "Created a poll", question.trim(), req.params.id);
    });
    const polls = await pollQueries.getForConversation(req.params.id);
    res.status(201).json(polls.find(p => p.id === poll.id));
  } catch (err) { console.error("Poll error:", err); res.status(500).json({ error: "Failed to create poll" }); }
});

app.get("/api/conversations/:id/polls", authenticate, async (req, res) => {
  try { res.json(pollQueries.getForConversation(req.params.id)); }
  catch (err) { res.status(500).json({ error: "Failed to get polls" }); }
});

app.post("/api/polls/:id/vote", authenticate, async (req, res) => {
  try {
    const { optionId } = req.body;
    if (!optionId) return res.status(400).json({ error: "Option required" });
    const result = await pollQueries.vote(req.params.id, optionId, req.userId);
    const poll = (await dbQuery(`SELECT * FROM polls WHERE id = $1`, [req.params.id])).rows[0];
    if (poll && poll.creator_id !== req.userId) {
      await notificationQueries.create(poll.creator_id, req.userId, "poll_vote", "Voted on your poll", poll.question, poll.conversation_id);
    }
    res.json(result);
  } catch (err) { res.status(500).json({ error: "Failed to vote" }); }
});

app.post("/api/polls/:id/close", authenticate, async (req, res) => {
  try { pollQueries.close(req.params.id, req.userId); res.json({ success: true }); }
  catch (err) { res.status(500).json({ error: "Failed to close poll" }); }
});

// ======================== ACTIVITY FEED ========================

app.get("/api/activity", authenticate, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 30;
    const events = (await dbQuery(`WITH friends AS (
        SELECT DISTINCT cm2.user_id FROM conversation_members cm1
        JOIN conversation_members cm2 ON cm1.conversation_id = cm2.conversation_id
        WHERE cm1.user_id = $1 AND cm2.user_id != $2
      )
      SELECT 'share' as type, m.movie_title as title, m.movie_poster as poster, m.movie_genre as genre,
        m.movie_year as year, m.created_at as ts, u.username, u.display_name, u.avatar, u.color,
        NULL as extra
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.sender_id IN (SELECT user_id FROM friends)
       UNION ALL
       SELECT 'rating' as type, msg.movie_title as title, msg.movie_poster as poster, msg.movie_genre as genre,
        msg.movie_year as year, mr.created_at as ts, u.username, u.display_name, u.avatar, u.color,
        CAST(mr.rating AS TEXT) as extra
       FROM movie_ratings mr
       JOIN users u ON mr.user_id = u.id
       JOIN messages msg ON mr.message_id = msg.id
       WHERE mr.user_id IN (SELECT user_id FROM friends)
       UNION ALL
       SELECT 'review' as type, msg.movie_title as title, msg.movie_poster as poster, msg.movie_genre as genre,
        msg.movie_year as year, r.created_at as ts, u.username, u.display_name, u.avatar, u.color,
        r.review_text as extra
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       JOIN messages msg ON r.message_id = msg.id
       WHERE r.user_id IN (SELECT user_id FROM friends)
       ORDER BY ts DESC LIMIT $3`, [req.userId, req.userId, limit])).rows;
    res.json(events.map(e => ({
      type: e.type, title: e.title, poster: e.poster, genre: e.genre, year: e.year,
      user: { username: e.username, displayName: e.display_name, avatar: e.avatar, color: e.color },
      extra: e.extra, createdAt: e.ts,
    })));
  } catch (err) { console.error("Activity error:", err); res.status(500).json({ error: "Failed to get activity" }); }
});

// ======================== MOVIE SEARCH (TMDB API) ========================

const TMDB_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMG = "https://image.tmdb.org/t/p/w500";

const TMDB_GENRE_MAP = {
  28:"Action",12:"Adventure",16:"Animation",35:"Comedy",80:"Crime",
  99:"Documentary",18:"Drama",10751:"Family",14:"Fantasy",36:"History",
  27:"Horror",10402:"Music",9648:"Mystery",10749:"Romance",878:"Sci-Fi",
  53:"Thriller",10752:"War",37:"Western",
};

const GENRE_TO_ID = Object.fromEntries(Object.entries(TMDB_GENRE_MAP).map(([k,v]) => [v, k]));

const LANG_TO_CODE = {
  English:"en",Hindi:"hi",Korean:"ko",Japanese:"ja",French:"fr",Spanish:"es",
  Tamil:"ta",Telugu:"te",German:"de",Italian:"it",Chinese:"zh",Portuguese:"pt",
  Turkish:"tr",Thai:"th",Arabic:"ar",Malayalam:"ml",Kannada:"kn",Bengali:"bn",
  Russian:"ru",Swedish:"sv",Marathi:"mr",Punjabi:"pa",Gujarati:"gu",Urdu:"ur",
  Polish:"pl",Dutch:"nl",Danish:"da",Norwegian:"no",Finnish:"fi",Greek:"el",
  Czech:"cs",Romanian:"ro",Hungarian:"hu",Vietnamese:"vi",Indonesian:"id",
  Malay:"ms",Filipino:"tl",Hebrew:"he",Persian:"fa",Ukrainian:"uk",
  Serbian:"sr",Croatian:"hr",Swahili:"sw",Nepali:"ne",Sinhala:"si",
  Icelandic:"is",Georgian:"ka",Catalan:"ca",Amharic:"am",Yoruba:"yo",
};

async function tmdbFetch(path) {
  if (!TMDB_KEY) throw new Error("TMDB_API_KEY not set in .env");
  const sep = path.includes("?") ? "&" : "?";
  const res = await fetch(`${TMDB_BASE}${path}${sep}api_key=${TMDB_KEY}`);
  if (!res.ok) throw new Error(`TMDB API error ${res.status}`);
  return res.json();
}

function formatMedia(m, forceType = null) {
  const type = forceType || m.media_type || (m.title ? "movie" : "tv");
  return {
    id: m.id,
    title: m.title || m.name || m.original_title || m.original_name,
    year: ((m.release_date || m.first_air_date || "").slice(0, 4)),
    rating: m.vote_average ? parseFloat(m.vote_average.toFixed(1)) : null,
    genre: TMDB_GENRE_MAP[m.genre_ids?.[0]] || TMDB_GENRE_MAP[m.genres?.[0]?.id] || "",
    director: "",
    imdb_id: m.imdb_id || null,
    overview: m.overview || "",
    poster: m.poster_path ? `${TMDB_IMG}${m.poster_path}` : null,
    tmdb_id: m.id,
    media_type: type,
  };
}

// ---- OMDB (IMDB Ratings) ----
const OMDB_KEY = process.env.OMDB_API_KEY;
const imdbRatingCache = new Map();

async function fetchIMDBRating(title, year, imdbId) {
  if (!OMDB_KEY) return null;
  const cacheKey = imdbId || `${title}-${year}`;
  if (imdbRatingCache.has(cacheKey)) return imdbRatingCache.get(cacheKey);
  try {
    const query = imdbId
      ? `i=${imdbId}`
      : `t=${encodeURIComponent(title)}${year ? `&y=${year}` : ""}`;
    const res = await fetch(`https://www.omdbapi.com/?${query}&apikey=${OMDB_KEY}`);
    const data = await res.json();
    if (data.Response === "True" && data.imdbRating && data.imdbRating !== "N/A") {
      const rating = parseFloat(data.imdbRating);
      imdbRatingCache.set(cacheKey, rating);
      return rating;
    }
  } catch {}
  return null;
}

// Enrich a list of movies with IMDB ratings (parallel, with limit)
async function enrichWithIMDB(movies) {
  if (!OMDB_KEY) return movies;
  const enriched = await Promise.all(
    movies.map(async (m) => {
      const imdbRating = await fetchIMDBRating(m.title, m.year, m.imdb_id);
      return { ...m, imdb_rating: imdbRating, rating: imdbRating || m.rating };
    })
  );
  return enriched;
}


// ======================== UPCOMING & CALENDAR ========================

// Upcoming movies (next 3 months)
app.get("/api/movies/upcoming", async (req, res) => {
  try {
    const today = new Date();
    const threeMonths = new Date(today);
    threeMonths.setMonth(threeMonths.getMonth() + 3);
    const from = today.toISOString().slice(0, 10);
    const to = threeMonths.toISOString().slice(0, 10);

    const pages = [1, 2, 3];
    const results = await Promise.all(
      pages.map(p => tmdbFetch(`/discover/movie?sort_by=popularity.desc&primary_release_date.gte=${from}&primary_release_date.lte=${to}&page=${p}`)
        .then(d => d.results || []).catch(() => []))
    );

    const seen = new Set();
    const movies = [];
    for (const batch of results) {
      for (const m of batch) {
        if (!seen.has(m.id) && m.release_date) {
          seen.add(m.id);
          movies.push({ ...formatMedia(m, "movie"), release_date: m.release_date });
        }
      }
    }
    movies.sort((a, b) => a.release_date.localeCompare(b.release_date));
    res.json(movies);
  } catch (err) {
    console.error("Upcoming error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Movies by month
app.get("/api/movies/calendar/:year/:month", async (req, res) => {
  try {
    const { year, month } = req.params;
    const from = `${year}-${month.padStart(2, "0")}-01`;
    const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
    const to = `${year}-${month.padStart(2, "0")}-${lastDay}`;

    const pages = [1, 2, 3];
    const results = await Promise.all(
      pages.map(p => tmdbFetch(`/discover/movie?sort_by=popularity.desc&primary_release_date.gte=${from}&primary_release_date.lte=${to}&page=${p}`)
        .then(d => d.results || []).catch(() => []))
    );

    const seen = new Set();
    const movies = [];
    for (const batch of results) {
      for (const m of batch) {
        if (!seen.has(m.id) && m.release_date) {
          seen.add(m.id);
          movies.push({ ...formatMedia(m, "movie"), release_date: m.release_date });
        }
      }
    }
    movies.sort((a, b) => a.release_date.localeCompare(b.release_date));
    res.json(movies);
  } catch (err) {
    console.error("Calendar error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Movie of the Day
app.get("/api/movies/daily", async (req, res) => {
  try {
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    const page = (seed % 20) + 1;
    const index = seed % 20;

    const data = await tmdbFetch(`/movie/top_rated?page=${page}`);
    const movies = data.results || [];
    const pick = movies[index % movies.length];
    if (!pick) return res.json(null);

    const details = await tmdbFetch(`/movie/${pick.id}?append_to_response=credits`);
    const director = details.credits?.crew?.find(c => c.job === "Director");
    const imdbRating = await fetchIMDBRating(pick.title, (pick.release_date || "").slice(0, 4), details.imdb_id);

    res.json({
      ...formatMedia(pick, "movie"),
      director: director?.name || "",
      imdb_rating: imdbRating,
      imdb_id: details.imdb_id,
      tagline: details.tagline || null,
    });
  } catch (err) {
    console.error("Daily movie error:", err.message);
    res.status(500).json({ error: err.message });
  }
});


// ======================== HEALTH CHECK ========================

app.get("/api/health", async (req, res) => {
  res.json({ status: "ok", users: null /* removed */.prepare("SELECT COUNT(*) as c FROM users").get().c });
});

// ======================== YEAR IN REVIEW ========================

app.get("/api/users/:username/year-review/:year", authenticate, async (req, res) => {
  try {
    const targetUser = await userQueries.findByUsername(req.params.username);
    if (!targetUser) return res.status(404).json({ error: "User not found" });
    const uid = targetUser.id;
    const year = req.params.year;

    const totalShared = (await dbQuery(`SELECT COUNT(*) as c FROM messages WHERE sender_id = $1 AND EXTRACT(YEAR FROM created_at)::TEXT = $2`, [uid, `${year}%`])).rows[0]?.c;
    const totalWatched = (await dbQuery(`SELECT COUNT(*) as c FROM watched WHERE user_id = $1 AND EXTRACT(YEAR FROM watched_at)::TEXT = $2`, [uid, `${year}%`])).rows[0]?.c;
    const totalTVWatched = (await dbQuery(`SELECT COUNT(*) as c FROM watched WHERE user_id = $1 AND EXTRACT(YEAR FROM watched_at)::TEXT = $2 AND media_type = 'tv'`, [uid, `${year}%`])).rows[0]?.c;
    const totalRatings = (await dbQuery(`SELECT COUNT(*) as c FROM movie_ratings mr JOIN messages m ON mr.message_id = m.id WHERE mr.user_id = $1 AND EXTRACT(YEAR FROM mr.created_at)::TEXT = $2`, [uid, `${year}%`])).rows[0]?.c;
    const avgRating = (await dbQuery(`SELECT ROUND(AVG(mr.rating)::numeric, 1) as avg FROM movie_ratings mr WHERE mr.user_id = $1 AND EXTRACT(YEAR FROM mr.created_at)::TEXT = $2`, [uid, `${year}%`])).rows[0]?.avg;
    const totalReviews = (await dbQuery(`SELECT COUNT(*) as c FROM reviews WHERE user_id = $1 AND EXTRACT(YEAR FROM created_at)::TEXT = $2`, [uid, `${year}%`])).rows[0]?.c;

    const topGenre = (await dbQuery(`SELECT movie_genre as genre, COUNT(*) as count FROM messages
       WHERE sender_id = $1 AND EXTRACT(YEAR FROM created_at)::TEXT = $2 AND movie_genre IS NOT NULL AND movie_genre != ''
       GROUP BY movie_genre ORDER BY count DESC LIMIT 1`, [uid, `${year}%`])).rows[0];

    const topDirector = (await dbQuery(`SELECT movie_director as director, COUNT(*) as count FROM messages
       WHERE sender_id = $1 AND EXTRACT(YEAR FROM created_at)::TEXT = $2 AND movie_director IS NOT NULL AND movie_director != ''
       GROUP BY movie_director ORDER BY count DESC LIMIT 1`, [uid, `${year}%`])).rows[0];

    const monthlyActivity = (await dbQuery(`SELECT LPAD(EXTRACT(MONTH FROM created_at)::TEXT, 2, '0') as month, COUNT(*) as count
       FROM messages WHERE sender_id = $1 AND EXTRACT(YEAR FROM created_at)::TEXT = $2
       GROUP BY month ORDER BY count DESC`, [uid, `${year}%`])).rows;

    const mostActiveMonth = monthlyActivity[0];
    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

    const highestRated = (await dbQuery(`SELECT m.movie_title as title, m.movie_year as year, m.movie_poster as poster, mr.rating
       FROM movie_ratings mr JOIN messages m ON mr.message_id = m.id
       WHERE mr.user_id = $1 AND EXTRACT(YEAR FROM mr.created_at)::TEXT = $2
       ORDER BY mr.rating DESC LIMIT 3`, [uid, `${year}%`])).rows;

    res.json({
      year,
      username: targetUser.username,
      displayName: targetUser.display_name,
      avatar: targetUser.avatar,
      color: targetUser.color,
      totalShared,
      totalWatched,
      totalTVWatched,
      totalRatings,
      avgRating: avgRating || 0,
      totalReviews,
      topGenre: topGenre?.genre || null,
      topGenreCount: topGenre?.count || 0,
      topDirector: topDirector?.director || null,
      topDirectorCount: topDirector?.count || 0,
      mostActiveMonth: mostActiveMonth ? monthNames[parseInt(mostActiveMonth.month) - 1] : null,
      mostActiveMonthCount: mostActiveMonth?.count || 0,
      monthlyActivity: monthlyActivity.map(m => ({ month: monthNames[parseInt(m.month) - 1], count: m.count })),
      highestRated: highestRated.map(m => ({ title: m.title, year: m.year, poster: m.poster, rating: m.rating })),
    });
  } catch (err) {
    console.error("Year review error:", err);
    res.status(500).json({ error: "Failed to generate year review" });
  }
});

// ======================== CHAT SEARCH ========================

app.get("/api/conversations/:id/search", authenticate, async (req, res) => {
  try {
    const query = req.query.q?.trim();
    if (!query) return res.json([]);
    const results = (await dbQuery(`SELECT m.*, u.username as sender_username, u.display_name as sender_display_name
       FROM messages m JOIN users u ON m.sender_id = u.id
       WHERE m.conversation_id = $1 AND (m.movie_title LIKE $2 OR m.movie_director LIKE $3 OR m.movie_genre LIKE $4)
       ORDER BY m.created_at DESC LIMIT 20`, [req.params.id, `%${query}%`, `%${query}%`, `%${query}%`])).rows;
    res.json(results.map(m => ({
      id: m.id, title: m.movie_title, year: m.movie_year, genre: m.movie_genre,
      poster: m.movie_poster, sender: m.sender_username, createdAt: m.created_at,
    })));
  } catch (err) {
    res.status(500).json({ error: "Search failed" });
  }
});

// Search movies & TV shows
app.post("/api/movies/search", async (req, res) => {
  try {
    const { query, type = "all" } = req.body;
    if (!query?.trim()) return res.status(400).json({ error: "Query required" });
    let results = [];
    if (type === "movie") {
      const data = await tmdbFetch(`/search/movie?query=${encodeURIComponent(query)}&page=1`);
      results = (data.results || []).map(m => formatMedia(m, "movie"));
    } else if (type === "tv") {
      const data = await tmdbFetch(`/search/tv?query=${encodeURIComponent(query)}&page=1`);
      results = (data.results || []).map(m => formatMedia(m, "tv"));
    } else {
      const data = await tmdbFetch(`/search/multi?query=${encodeURIComponent(query)}&page=1`);
      results = (data.results || []).filter(m => m.media_type === "movie" || m.media_type === "tv").map(m => formatMedia(m));
    }
    res.json(results.slice(0, 20));
  } catch (err) {
    console.error("Movie search error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Trending movies & TV shows
app.get("/api/movies/trending", async (req, res) => {
  try {
    const type = req.query.type || "all";
    const endpoint = type === "tv" ? "/trending/tv/week" : type === "movie" ? "/trending/movie/week" : "/trending/all/week";
    const data = await tmdbFetch(endpoint);
    const items = (data.results || []).filter(m => m.media_type !== "person").slice(0, 16).map(m => formatMedia(m, type === "all" ? undefined : type));
    res.json(items);
  } catch (err) {
    console.error("Trending error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Browse by genre or language (multi-page)
app.post("/api/movies/browse", async (req, res) => {
  try {
    const { genre, language, page = 1, type = "movie", yearFrom, yearTo, minRating, sortBy } = req.body;
    const langCode = language ? LANG_TO_CODE[language] : null;
    const mediaType = type === "tv" ? "tv" : "movie";
    const sort = sortBy === "rating" ? "vote_average.desc" : sortBy === "date" ? "primary_release_date.desc" : "popularity.desc";
    let url = `/discover/${mediaType}?sort_by=${sort}`;

    if (sortBy === "rating") url += "&vote_count.gte=50";
    if (yearFrom) url += `&${mediaType === "tv" ? "first_air_date.gte" : "primary_release_date.gte"}=${yearFrom}-01-01`;
    if (yearTo) url += `&${mediaType === "tv" ? "first_air_date.lte" : "primary_release_date.lte"}=${yearTo}-12-31`;
    if (minRating) url += `&vote_average.gte=${minRating}&vote_count.gte=10`;

    if (genre) {
      const genreIds = genre.split(",").map(g => GENRE_TO_ID[g.trim()]).filter(Boolean);
      if (genreIds.length > 0) url += `&with_genres=${genreIds.join(",")}`;
    }
    if (language && LANG_TO_CODE[language]) {
      url += `&with_original_language=${LANG_TO_CODE[language]}`;
    }

    // Fetch more pages for regional languages
    const pageCount = 5;
    const pages = Array.from({ length: pageCount }, (_, i) => page + i);
    const results = await Promise.all(
      pages.map(p => tmdbFetch(`${url}&page=${p}`).then(d => d.results || []).catch(() => []))
    );

    const seen = new Set();
    const combined = [];
    for (const batch of results) {
      for (const m of batch) {
        if (!seen.has(m.id)) { seen.add(m.id); combined.push(formatMedia(m, mediaType)); }
      }
    }
    res.json(combined);
  } catch (err) {
    console.error("Browse error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Movie & TV show details
app.post("/api/movies/details", async (req, res) => {
  try {
    const { title, year, tmdb_id, media_type = "movie" } = req.body;
    const mtype = media_type === "tv" ? "tv" : "movie";
    let itemId = tmdb_id;

    if (!itemId) {
      if (!title) return res.status(400).json({ error: "Title or tmdb_id required" });
      const search = await tmdbFetch(`/search/${mtype}?query=${encodeURIComponent(title)}${year ? (mtype === "tv" ? `&first_air_date_year=${year}` : `&year=${year}`) : ""}`);
      if (!search.results?.length) return res.json({});
      itemId = search.results[0].id;
    }

    const item = await tmdbFetch(`/${mtype}/${itemId}?append_to_response=credits,similar`);

    const director = item.credits?.crew?.find(c => c.job === "Director");
    const creators = item.created_by?.map(c => c.name) || [];
    const cast = (item.credits?.cast || []).slice(0, 8).map(c => c.name);
    const similar = (item.similar?.results || []).slice(0, 3).map(m => m.title || m.name);
    const imdbRating = await fetchIMDBRating(item.title || item.name, ((item.release_date || item.first_air_date || "").slice(0, 4)), item.imdb_id);

    res.json({
      summary: item.overview || "",
      cast,
      runtime: mtype === "tv"
        ? (item.number_of_seasons ? `${item.number_of_seasons} season${item.number_of_seasons > 1 ? "s" : ""}, ${item.number_of_episodes || "?"} episodes` : null)
        : (item.runtime ? `${item.runtime} min` : null),
      language: item.spoken_languages?.[0]?.english_name || item.original_language || null,
      country: item.production_countries?.[0]?.name || item.origin_country?.[0] || null,
      awards: null,
      box_office: item.revenue ? `$${(item.revenue / 1000000).toFixed(0)}M` : null,
      similar,
      director: director?.name || creators.join(", ") || "",
      poster: item.poster_path ? `${TMDB_IMG}${item.poster_path}` : null,
      imdb_id: item.imdb_id || null,
      imdb_rating: imdbRating,
      media_type: mtype,
      seasons: item.number_of_seasons || null,
      episodes: item.number_of_episodes || null,
      status: item.status || null,
    });
  } catch (err) {
    console.error("Details error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Actor filmography (movies + TV)
app.post("/api/movies/person", async (req, res) => {
  try {
    const { name, role } = req.body;
    if (!name) return res.status(400).json({ error: "Name required" });
    const search = await tmdbFetch(`/search/person?query=${encodeURIComponent(name)}`);
    if (!search.results?.length) return res.json([]);
    const personId = search.results[0].id;
    const [movieCredits, tvCredits] = await Promise.all([
      tmdbFetch(`/person/${personId}/movie_credits`).catch(() => ({ cast: [], crew: [] })),
      tmdbFetch(`/person/${personId}/tv_credits`).catch(() => ({ cast: [], crew: [] })),
    ]);
    let items = [];
    if (role === "directed by") {
      items = [
        ...(movieCredits.crew || []).filter(m => m.job === "Director").map(m => ({ ...m, _type: "movie" })),
        ...(tvCredits.crew || []).filter(m => m.job === "Director").map(m => ({ ...m, _type: "tv" })),
      ];
    } else {
      items = [
        ...(movieCredits.cast || []).map(m => ({ ...m, _type: "movie" })),
        ...(tvCredits.cast || []).map(m => ({ ...m, _type: "tv" })),
      ];
    }
    const sorted = items
      .filter(m => (m.title || m.name) && (m.release_date || m.first_air_date))
      .sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0))
      .slice(0, 30);
    res.json(sorted.map(m => formatMedia(m, m._type)));
  } catch (err) {
    console.error("Person error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ======================== SERVE FRONTEND (PRODUCTION) ========================

const path = require("path");
const distPath = path.join(__dirname, "dist");
const fs = require("fs");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get("*", async (req, res) => {
    if (!req.path.startsWith("/api/")) {
      res.sendFile(path.join(distPath, "index.html"));
    }
  });
}

// ======================== START SERVER ========================

initSchema().then(() => {
app.listen(PORT, () => {
  const hasFrontend = fs.existsSync(distPath);
  console.log(`
  ╔═══════════════════════════════════════════╗
  ║           CineVerse Server               ║
  ╠═══════════════════════════════════════════╣
  ║  Port:      ${String(PORT).padEnd(29)}║
  ║  Database:  SQLite (cineverse.db)        ║
  ║  Frontend:  ${(hasFrontend ? "✓ Serving built app" : "✗ Run npm run build").padEnd(29)}║
  ║  TMDB:      ${(TMDB_KEY ? "✓ Connected" : "✗ NOT SET").padEnd(29)}║
  ╚═══════════════════════════════════════════╝
  `);
});
});
