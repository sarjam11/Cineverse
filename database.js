const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("neon") ? { rejectUnauthorized: false } : false,
});

async function query(text, params) {
  return pool.query(text, params);
}

async function initSchema() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      display_name TEXT NOT NULL,
      avatar TEXT NOT NULL DEFAULT '',
      color TEXT NOT NULL DEFAULT '#7C3AED',
      password_hash TEXT NOT NULL,
      preferred_langs TEXT DEFAULT '[]',
      security_question TEXT,
      security_answer TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL CHECK(type IN ('private', 'group')),
      name TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS conversation_members (
      conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      joined_at TIMESTAMP DEFAULT NOW(),
      PRIMARY KEY (conversation_id, user_id)
    );
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      movie_title TEXT NOT NULL,
      movie_year TEXT,
      movie_genre TEXT,
      movie_rating REAL,
      movie_director TEXT,
      movie_imdb_id TEXT,
      movie_overview TEXT,
      movie_poster TEXT,
      media_type TEXT DEFAULT 'movie',
      note TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS reactions (
      id SERIAL PRIMARY KEY,
      message_id TEXT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      emoji TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(message_id, user_id, emoji)
    );
    CREATE TABLE IF NOT EXISTS watchlist (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      movie_title TEXT NOT NULL,
      movie_year TEXT,
      movie_genre TEXT,
      movie_rating REAL,
      movie_director TEXT,
      movie_imdb_id TEXT,
      movie_overview TEXT,
      movie_poster TEXT,
      added_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_id, movie_title, movie_year)
    );
    CREATE TABLE IF NOT EXISTS read_receipts (
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      last_read_at TIMESTAMP DEFAULT NOW(),
      PRIMARY KEY (user_id, conversation_id)
    );
    CREATE TABLE IF NOT EXISTS movie_ratings (
      id SERIAL PRIMARY KEY,
      message_id TEXT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      rating REAL NOT NULL CHECK(rating >= 1 AND rating <= 10),
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(message_id, user_id)
    );
    CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      message_id TEXT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      review_text TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(message_id, user_id)
    );
    CREATE TABLE IF NOT EXISTS watched_together (
      id SERIAL PRIMARY KEY,
      conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      message_id TEXT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(message_id, user_id)
    );
    CREATE TABLE IF NOT EXISTS share_tokens (
      token TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS watched (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      movie_title TEXT NOT NULL,
      movie_year TEXT,
      movie_genre TEXT,
      movie_rating REAL,
      movie_director TEXT,
      movie_imdb_id TEXT,
      movie_overview TEXT,
      movie_poster TEXT,
      media_type TEXT DEFAULT 'movie',
      watched_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_id, movie_title, movie_year)
    );
    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      from_user_id INTEGER,
      type TEXT NOT NULL,
      title TEXT,
      body TEXT,
      conversation_id TEXT,
      message_id TEXT,
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS custom_lists (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS custom_list_items (
      id SERIAL PRIMARY KEY,
      list_id INTEGER NOT NULL REFERENCES custom_lists(id) ON DELETE CASCADE,
      movie_title TEXT NOT NULL,
      movie_year TEXT,
      movie_genre TEXT,
      movie_rating REAL,
      movie_director TEXT,
      movie_poster TEXT,
      movie_imdb_id TEXT,
      media_type TEXT DEFAULT 'movie',
      added_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(list_id, movie_title, movie_year)
    );
    CREATE TABLE IF NOT EXISTS polls (
      id SERIAL PRIMARY KEY,
      conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      creator_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      question TEXT NOT NULL,
      is_closed BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS poll_options (
      id SERIAL PRIMARY KEY,
      poll_id INTEGER NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
      movie_title TEXT NOT NULL,
      movie_year TEXT,
      movie_poster TEXT,
      movie_genre TEXT
    );
    CREATE TABLE IF NOT EXISTS poll_votes (
      id SERIAL PRIMARY KEY,
      poll_id INTEGER NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
      option_id INTEGER NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(poll_id, user_id)
    );
    CREATE TABLE IF NOT EXISTS friendships (
      id SERIAL PRIMARY KEY,
      from_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      to_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(from_user_id, to_user_id)
    );

    -- ======================== RECOMMENDER TABLES ========================

    CREATE TABLE IF NOT EXISTS movies (
      id SERIAL PRIMARY KEY,
      tmdb_id INTEGER UNIQUE,
      imdb_id TEXT,
      title TEXT NOT NULL,
      year TEXT,
      genre TEXT,
      genres TEXT[] DEFAULT '{}',
      director TEXT,
      cast_names TEXT[] DEFAULT '{}',
      keywords TEXT[] DEFAULT '{}',
      overview TEXT,
      poster TEXT,
      tmdb_rating REAL,
      tmdb_popularity REAL,
      original_language TEXT,
      runtime INTEGER,
      media_type TEXT DEFAULT 'movie',
      content_vector JSONB,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(title, year)
    );

    CREATE TABLE IF NOT EXISTS user_movie_scores (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      movie_id INTEGER NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
      explicit_rating REAL,
      implicit_score REAL DEFAULT 0,
      final_score REAL DEFAULT 0,
      updated_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_id, movie_id)
    );

    CREATE TABLE IF NOT EXISTS recommendation_cache (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      movie_id INTEGER NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
      score REAL NOT NULL,
      source TEXT NOT NULL DEFAULT 'hybrid',
      explanation TEXT,
      generated_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_id, movie_id)
    );

    CREATE TABLE IF NOT EXISTS movie_similarity (
      movie_a INTEGER NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
      movie_b INTEGER NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
      similarity REAL NOT NULL,
      PRIMARY KEY(movie_a, movie_b)
    );
  `);

  // Create indexes (IF NOT EXISTS supported in PG 9.5+)
  const indexes = [
    "CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at)",
    "CREATE INDEX IF NOT EXISTS idx_conv_members_user ON conversation_members(user_id)",
    "CREATE INDEX IF NOT EXISTS idx_reactions_message ON reactions(message_id)",
    "CREATE INDEX IF NOT EXISTS idx_watchlist_user ON watchlist(user_id)",
    "CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)",
    "CREATE INDEX IF NOT EXISTS idx_movie_ratings_message ON movie_ratings(message_id)",
    "CREATE INDEX IF NOT EXISTS idx_reviews_message ON reviews(message_id)",
    "CREATE INDEX IF NOT EXISTS idx_watched_together_convo ON watched_together(conversation_id)",
    "CREATE INDEX IF NOT EXISTS idx_watched_user ON watched(user_id)",
    "CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(user_id, is_read, created_at)",
    "CREATE INDEX IF NOT EXISTS idx_custom_lists_user ON custom_lists(user_id)",
    "CREATE INDEX IF NOT EXISTS idx_list_items_list ON custom_list_items(list_id)",
    "CREATE INDEX IF NOT EXISTS idx_polls_convo ON polls(conversation_id)",
    "CREATE INDEX IF NOT EXISTS idx_poll_votes_poll ON poll_votes(poll_id)",
    "CREATE INDEX IF NOT EXISTS idx_friendships_users ON friendships(from_user_id, to_user_id, status)",
    "CREATE INDEX IF NOT EXISTS idx_movies_tmdb ON movies(tmdb_id)",
    "CREATE INDEX IF NOT EXISTS idx_movies_title_year ON movies(title, year)",
    "CREATE INDEX IF NOT EXISTS idx_ums_user ON user_movie_scores(user_id, final_score DESC)",
    "CREATE INDEX IF NOT EXISTS idx_ums_movie ON user_movie_scores(movie_id)",
    "CREATE INDEX IF NOT EXISTS idx_rec_cache_user ON recommendation_cache(user_id, score DESC)",
    "CREATE INDEX IF NOT EXISTS idx_movie_sim ON movie_similarity(movie_a, similarity DESC)",
  ];
  for (const idx of indexes) { try { await query(idx); } catch {} }

  console.log("PostgreSQL schema initialized.");
}

// ======================== USER QUERIES ========================

const userQueries = {
  async create(username, displayName, avatar, color, passwordHash, securityQuestion, securityAnswer) {
    const r = await query(
      `INSERT INTO users (username, display_name, avatar, color, password_hash, security_question, security_answer)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`, [username, displayName, avatar, color, passwordHash, securityQuestion || null, securityAnswer || null]);
    return this.findById(r.rows[0].id);
  },
  async findByUsername(username) {
    const r = await query("SELECT * FROM users WHERE LOWER(username) = LOWER($1)", [username]);
    return r.rows[0] || null;
  },
  async findById(id) {
    const r = await query("SELECT id, username, display_name, avatar, color, preferred_langs, created_at FROM users WHERE id = $1", [id]);
    return r.rows[0] || null;
  },
  async search(q, excludeUserId) {
    const r = await query("SELECT id, username, display_name, avatar, color FROM users WHERE id != $1 AND (LOWER(username) LIKE LOWER($2) OR LOWER(display_name) LIKE LOWER($3)) LIMIT 20",
      [excludeUserId, `%${q}%`, `%${q}%`]);
    return r.rows;
  },
  async listAll(excludeUserId) {
    const r = await query("SELECT id, username, display_name, avatar, color FROM users WHERE id != $1 ORDER BY display_name", [excludeUserId]);
    return r.rows;
  },
  async updatePreferredLangs(userId, langs) {
    await query("UPDATE users SET preferred_langs = $1 WHERE id = $2", [JSON.stringify(langs), userId]);
  },
};

// ======================== CONVERSATION QUERIES ========================

const conversationQueries = {
  async create(id, type, name) {
    await query("INSERT INTO conversations (id, type, name) VALUES ($1,$2,$3)", [id, type, name]);
    return this.findById(id);
  },
  async findById(id) {
    const r = await query("SELECT * FROM conversations WHERE id = $1", [id]);
    return r.rows[0] || null;
  },
  async addMember(conversationId, userId) {
    await query("INSERT INTO conversation_members (conversation_id, user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING", [conversationId, userId]);
  },
  async getMembers(conversationId) {
    const r = await query(
      `SELECT u.id, u.username, u.display_name, u.avatar, u.color
       FROM conversation_members cm JOIN users u ON cm.user_id = u.id WHERE cm.conversation_id = $1`, [conversationId]);
    return r.rows;
  },
  async listForUser(userId) {
    const r = await query(
      `SELECT c.*,
        (SELECT m.movie_title FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1) as last_movie,
        (SELECT u.username FROM messages m JOIN users u ON m.sender_id = u.id WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1) as last_sender
       FROM conversations c JOIN conversation_members cm ON c.id = cm.conversation_id
       WHERE cm.user_id = $1 ORDER BY c.updated_at DESC`, [userId]);
    return r.rows;
  },
  async findPrivate(userId1, userId2) {
    const r = await query(
      `SELECT c.id FROM conversations c WHERE c.type = 'private'
       AND EXISTS (SELECT 1 FROM conversation_members WHERE conversation_id = c.id AND user_id = $1)
       AND EXISTS (SELECT 1 FROM conversation_members WHERE conversation_id = c.id AND user_id = $2)`, [userId1, userId2]);
    return r.rows[0] || null;
  },
  async updateTimestamp(id) {
    await query("UPDATE conversations SET updated_at = NOW() WHERE id = $1", [id]);
  },
};

// ======================== MESSAGE QUERIES ========================

const messageQueries = {
  async create(id, conversationId, senderId, movie, note) {
    await query(
      `INSERT INTO messages (id, conversation_id, sender_id, movie_title, movie_year, movie_genre, movie_rating, movie_director, movie_imdb_id, movie_overview, movie_poster, media_type, note)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
      [id, conversationId, senderId, movie.title, movie.year, movie.genre, movie.rating, movie.director, movie.imdb_id, movie.overview, movie.poster || null, movie.media_type || "movie", note]);
    await conversationQueries.updateTimestamp(conversationId);
    return this.findById(id);
  },
  async findById(id) {
    const r = await query(
      `SELECT m.*, u.username as sender_username, u.display_name as sender_display_name, u.avatar as sender_avatar, u.color as sender_color
       FROM messages m JOIN users u ON m.sender_id = u.id WHERE m.id = $1`, [id]);
    return r.rows[0] || null;
  },
  async listForConversation(conversationId, limit = 50, before = null) {
    let r;
    if (before) {
      r = await query(
        `SELECT * FROM (SELECT m.*, u.username as sender_username, u.display_name as sender_display_name, u.avatar as sender_avatar, u.color as sender_color
         FROM messages m JOIN users u ON m.sender_id = u.id
         WHERE m.conversation_id = $1 AND m.created_at < $2
         ORDER BY m.created_at DESC LIMIT $3) sub ORDER BY sub.created_at ASC`, [conversationId, before, limit]);
    } else {
      r = await query(
        `SELECT * FROM (SELECT m.*, u.username as sender_username, u.display_name as sender_display_name, u.avatar as sender_avatar, u.color as sender_color
         FROM messages m JOIN users u ON m.sender_id = u.id
         WHERE m.conversation_id = $1 ORDER BY m.created_at DESC LIMIT $2) sub ORDER BY sub.created_at ASC`, [conversationId, limit]);
    }
    return r.rows;
  },
};

// ======================== REACTION QUERIES ========================

const reactionQueries = {
  async toggle(messageId, userId, emoji) {
    const e = await query("SELECT id FROM reactions WHERE message_id=$1 AND user_id=$2 AND emoji=$3", [messageId, userId, emoji]);
    if (e.rows.length > 0) {
      await query("DELETE FROM reactions WHERE id=$1", [e.rows[0].id]);
      return { action: "removed" };
    }
    await query("INSERT INTO reactions (message_id, user_id, emoji) VALUES ($1,$2,$3)", [messageId, userId, emoji]);
    return { action: "added" };
  },
  async getForMessage(messageId) {
    const r = await query("SELECT r.emoji, u.username FROM reactions r JOIN users u ON r.user_id = u.id WHERE r.message_id=$1", [messageId]);
    return r.rows;
  },
  async getForConversation(conversationId) {
    const r = await query(
      `SELECT r.message_id, r.emoji, u.username FROM reactions r
       JOIN users u ON r.user_id = u.id JOIN messages m ON r.message_id = m.id
       WHERE m.conversation_id = $1`, [conversationId]);
    return r.rows;
  },
};

// ======================== READ RECEIPT QUERIES ========================

const readReceiptQueries = {
  async markRead(userId, conversationId) {
    await query(
      `INSERT INTO read_receipts (user_id, conversation_id, last_read_at) VALUES ($1,$2,NOW())
       ON CONFLICT (user_id, conversation_id) DO UPDATE SET last_read_at = NOW()`, [userId, conversationId]);
  },
  async getUnreadCount(userId, conversationId) {
    const r = await query(
      `SELECT COUNT(*) as c FROM messages m WHERE m.conversation_id = $1 AND m.sender_id != $2
       AND m.created_at > COALESCE((SELECT last_read_at FROM read_receipts WHERE user_id=$2 AND conversation_id=$1), '1970-01-01')`,
      [conversationId, userId]);
    return parseInt(r.rows[0]?.c || 0);
  },
};

// ======================== WATCHLIST QUERIES ========================

const watchlistQueries = {
  async add(userId, movie) {
    try {
      await query(
        `INSERT INTO watchlist (user_id, movie_title, movie_year, movie_genre, movie_rating, movie_director, movie_imdb_id, movie_overview, movie_poster)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [userId, movie.title, movie.year, movie.genre, movie.rating, movie.director, movie.imdb_id, movie.overview, movie.poster || null]);
      return { action: "added" };
    } catch (e) {
      if (e.code === "23505") {
        await query("DELETE FROM watchlist WHERE user_id=$1 AND movie_title=$2 AND movie_year=$3", [userId, movie.title, movie.year]);
        return { action: "removed" };
      }
      throw e;
    }
  },
  async list(userId) {
    const r = await query("SELECT * FROM watchlist WHERE user_id=$1 ORDER BY added_at DESC", [userId]);
    return r.rows;
  },
  async remove(userId, watchlistId) {
    await query("DELETE FROM watchlist WHERE id=$1 AND user_id=$2", [watchlistId, userId]);
  },
};

// ======================== RATING QUERIES ========================

const ratingQueries = {
  async rate(messageId, userId, rating) {
    await query(
      `INSERT INTO movie_ratings (message_id, user_id, rating) VALUES ($1,$2,$3)
       ON CONFLICT (message_id, user_id) DO UPDATE SET rating = $3`, [messageId, userId, rating]);
  },
  async getForMessage(messageId) {
    const r = await query(
      "SELECT mr.rating, u.username FROM movie_ratings mr JOIN users u ON mr.user_id = u.id WHERE mr.message_id=$1", [messageId]);
    return r.rows;
  },
};

// ======================== REVIEW QUERIES ========================

const reviewQueries = {
  async add(messageId, userId, text) {
    await query(
      `INSERT INTO reviews (message_id, user_id, review_text) VALUES ($1,$2,$3)
       ON CONFLICT (message_id, user_id) DO UPDATE SET review_text = $3`, [messageId, userId, text]);
  },
  async getForMessage(messageId) {
    const r = await query(
      "SELECT r.review_text, r.created_at, u.username, u.display_name, u.avatar, u.color FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.message_id=$1 ORDER BY r.created_at DESC",
      [messageId]);
    return r.rows;
  },
};

// ======================== WATCHED TOGETHER QUERIES ========================

const watchedTogetherQueries = {
  async add(conversationId, messageId, userId) {
    await query("INSERT INTO watched_together (conversation_id, message_id, user_id) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING", [conversationId, messageId, userId]);
  },
  async getForMessage(messageId) {
    const r = await query(
      "SELECT u.username, u.display_name, u.avatar, u.color FROM watched_together wt JOIN users u ON wt.user_id = u.id WHERE wt.message_id=$1", [messageId]);
    return r.rows;
  },
};

// ======================== SHARE TOKEN QUERIES ========================

const shareTokenQueries = {
  async create(token, userId) {
    await query("INSERT INTO share_tokens (token, user_id) VALUES ($1,$2) ON CONFLICT (token) DO UPDATE SET user_id=$2", [token, userId]);
  },
  async findByToken(token) {
    const r = await query("SELECT * FROM share_tokens WHERE token=$1", [token]);
    return r.rows[0] || null;
  },
};

// ======================== TRENDING QUERIES ========================

const trendingQueries = {
  async getForUser(userId, limit = 10) {
    const r = await query(
      `SELECT m.movie_title, m.movie_year, m.movie_genre, m.movie_director, m.movie_imdb_id, m.movie_overview, m.movie_poster,
        COUNT(DISTINCT m.id) as share_count, COUNT(DISTINCT mr.id) as rating_count, ROUND(AVG(mr.rating)::numeric, 1) as avg_rating
       FROM messages m JOIN conversation_members cm ON m.conversation_id = cm.conversation_id
       LEFT JOIN movie_ratings mr ON mr.message_id = m.id
       WHERE cm.user_id = $1
       GROUP BY m.movie_title, m.movie_year, m.movie_genre, m.movie_director, m.movie_imdb_id, m.movie_overview, m.movie_poster
       ORDER BY share_count DESC, rating_count DESC LIMIT $2`, [userId, limit]);
    return r.rows;
  },
};

// ======================== WATCHED QUERIES ========================

const watchedQueries = {
  async add(userId, movie) {
    try {
      await query(
        `INSERT INTO watched (user_id, movie_title, movie_year, movie_genre, movie_rating, movie_director, movie_imdb_id, movie_overview, movie_poster, media_type)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [userId, movie.title, movie.year, movie.genre, movie.rating, movie.director, movie.imdb_id, movie.overview, movie.poster || null, movie.media_type || "movie"]);
      return { action: "added" };
    } catch (e) {
      if (e.code === "23505") {
        await query("DELETE FROM watched WHERE user_id=$1 AND movie_title=$2 AND movie_year=$3", [userId, movie.title, movie.year]);
        return { action: "removed" };
      }
      throw e;
    }
  },
  async list(userId) {
    const r = await query("SELECT * FROM watched WHERE user_id=$1 ORDER BY watched_at DESC", [userId]);
    return r.rows;
  },
  async remove(userId, watchedId) {
    await query("DELETE FROM watched WHERE id=$1 AND user_id=$2", [watchedId, userId]);
  },
};

// ======================== NOTIFICATION QUERIES ========================

const notificationQueries = {
  async create(userId, fromUserId, type, title, body, conversationId = null, messageId = null) {
    if (userId === fromUserId) return;
    await query("INSERT INTO notifications (user_id, from_user_id, type, title, body, conversation_id, message_id) VALUES ($1,$2,$3,$4,$5,$6,$7)",
      [userId, fromUserId, type, title, body, conversationId, messageId]);
  },
  async list(userId, limit = 40) {
    const r = await query(
      `SELECT n.*, u.username as from_username, u.display_name as from_display_name, u.avatar as from_avatar, u.color as from_color
       FROM notifications n LEFT JOIN users u ON n.from_user_id = u.id
       WHERE n.user_id = $1 ORDER BY n.created_at DESC LIMIT $2`, [userId, limit]);
    return r.rows;
  },
  async unreadCount(userId) {
    const r = await query("SELECT COUNT(*) as c FROM notifications WHERE user_id=$1 AND is_read=FALSE", [userId]);
    return parseInt(r.rows[0]?.c || 0);
  },
  async markAllRead(userId) {
    await query("UPDATE notifications SET is_read=TRUE WHERE user_id=$1 AND is_read=FALSE", [userId]);
  },
};

// ======================== CUSTOM LIST QUERIES ========================

const customListQueries = {
  async create(userId, name, description = "") {
    const r = await query("INSERT INTO custom_lists (user_id, name, description) VALUES ($1,$2,$3) RETURNING id", [userId, name, description]);
    return { id: r.rows[0].id, name, description };
  },
  async listForUser(userId) {
    const r = await query("SELECT * FROM custom_lists WHERE user_id=$1 ORDER BY created_at DESC", [userId]);
    const lists = [];
    for (const l of r.rows) {
      const c = await query("SELECT COUNT(*) as c FROM custom_list_items WHERE list_id=$1", [l.id]);
      lists.push({ ...l, itemCount: parseInt(c.rows[0].c) });
    }
    return lists;
  },
  async getById(listId) { const r = await query("SELECT * FROM custom_lists WHERE id=$1", [listId]); return r.rows[0] || null; },
  async update(listId, userId, name, description) {
    await query("UPDATE custom_lists SET name=$1, description=$2 WHERE id=$3 AND user_id=$4", [name, description, listId, userId]);
  },
  async delete(listId, userId) { await query("DELETE FROM custom_lists WHERE id=$1 AND user_id=$2", [listId, userId]); },
  async addItem(listId, movie) {
    try {
      await query(
        `INSERT INTO custom_list_items (list_id, movie_title, movie_year, movie_genre, movie_rating, movie_director, movie_poster, movie_imdb_id, media_type)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [listId, movie.title, movie.year, movie.genre, movie.rating, movie.director, movie.poster || null, movie.imdb_id, movie.media_type || "movie"]);
      return { action: "added" };
    } catch (e) {
      if (e.code === "23505") return { action: "exists" };
      throw e;
    }
  },
  async removeItem(listId, itemId) { await query("DELETE FROM custom_list_items WHERE id=$1 AND list_id=$2", [itemId, listId]); },
  async getItems(listId) { const r = await query("SELECT * FROM custom_list_items WHERE list_id=$1 ORDER BY added_at DESC", [listId]); return r.rows; },
};

// ======================== POLL QUERIES ========================

const pollQueries = {
  async create(conversationId, creatorId, question) {
    const r = await query("INSERT INTO polls (conversation_id, creator_id, question) VALUES ($1,$2,$3) RETURNING id", [conversationId, creatorId, question]);
    return { id: r.rows[0].id };
  },
  async addOption(pollId, movie) {
    const r = await query("INSERT INTO poll_options (poll_id, movie_title, movie_year, movie_poster, movie_genre) VALUES ($1,$2,$3,$4,$5) RETURNING id",
      [pollId, movie.title, movie.year || "", movie.poster || null, movie.genre || ""]);
    return { id: r.rows[0].id };
  },
  async vote(pollId, optionId, userId) {
    try {
      await query("INSERT INTO poll_votes (poll_id, option_id, user_id) VALUES ($1,$2,$3)", [pollId, optionId, userId]);
      return { action: "voted" };
    } catch (e) {
      if (e.code === "23505") {
        await query("UPDATE poll_votes SET option_id=$1 WHERE poll_id=$2 AND user_id=$3", [optionId, pollId, userId]);
        return { action: "changed" };
      }
      throw e;
    }
  },
  async getForConversation(conversationId) {
    const pr = await query("SELECT p.*, u.username as creator_username, u.display_name as creator_display_name FROM polls p JOIN users u ON p.creator_id = u.id WHERE p.conversation_id=$1 ORDER BY p.created_at DESC", [conversationId]);
    const result = [];
    for (const p of pr.rows) {
      const opts = await query("SELECT * FROM poll_options WHERE poll_id=$1", [p.id]);
      const votes = await query("SELECT pv.*, u.username FROM poll_votes pv JOIN users u ON pv.user_id = u.id WHERE pv.poll_id=$1", [p.id]);
      result.push({
        ...p,
        options: opts.rows.map(o => ({ ...o, votes: votes.rows.filter(v => v.option_id === o.id).map(v => v.username) })),
        totalVotes: votes.rows.length,
      });
    }
    return result;
  },
  async close(pollId, userId) {
    await query("UPDATE polls SET is_closed=TRUE WHERE id=$1 AND creator_id=$2", [pollId, userId]);
  },
};

// ======================== FRIENDSHIP QUERIES ========================

const friendshipQueries = {
  async sendRequest(fromUserId, toUserId) {
    const e = await query(
      "SELECT * FROM friendships WHERE (from_user_id=$1 AND to_user_id=$2) OR (from_user_id=$2 AND to_user_id=$1)", [fromUserId, toUserId]);
    if (e.rows.length > 0) {
      const existing = e.rows[0];
      if (existing.status === "accepted") return { action: "already_friends" };
      if (existing.status === "pending") return { action: "already_pending" };
      if (existing.status === "rejected") {
        await query("UPDATE friendships SET status='pending', from_user_id=$1, to_user_id=$2, created_at=NOW() WHERE id=$3", [fromUserId, toUserId, existing.id]);
        return { action: "sent" };
      }
    }
    await query("INSERT INTO friendships (from_user_id, to_user_id, status) VALUES ($1,$2,'pending')", [fromUserId, toUserId]);
    return { action: "sent" };
  },
  async acceptRequest(friendshipId, userId) {
    await query("UPDATE friendships SET status='accepted' WHERE id=$1 AND to_user_id=$2", [friendshipId, userId]);
  },
  async rejectRequest(friendshipId, userId) {
    await query("UPDATE friendships SET status='rejected' WHERE id=$1 AND to_user_id=$2", [friendshipId, userId]);
  },
  async getFriends(userId) {
    const r = await query(
      `SELECT u.id, u.username, u.display_name, u.avatar, u.color FROM friendships f
       JOIN users u ON (CASE WHEN f.from_user_id=$1 THEN f.to_user_id ELSE f.from_user_id END) = u.id
       WHERE (f.from_user_id=$1 OR f.to_user_id=$1) AND f.status='accepted'`, [userId]);
    return r.rows;
  },
  async getPendingIncoming(userId) {
    const r = await query(
      `SELECT f.id as request_id, f.created_at, u.id as user_id, u.username, u.display_name, u.avatar, u.color
       FROM friendships f JOIN users u ON f.from_user_id = u.id
       WHERE f.to_user_id=$1 AND f.status='pending' ORDER BY f.created_at DESC`, [userId]);
    return r.rows;
  },
  async getPendingOutgoing(userId) {
    const r = await query(
      `SELECT f.id as request_id, f.created_at, u.id as user_id, u.username, u.display_name, u.avatar, u.color
       FROM friendships f JOIN users u ON f.to_user_id = u.id
       WHERE f.from_user_id=$1 AND f.status='pending' ORDER BY f.created_at DESC`, [userId]);
    return r.rows;
  },
  async removeFriend(userId, friendUserId) {
    await query("DELETE FROM friendships WHERE (from_user_id=$1 AND to_user_id=$2) OR (from_user_id=$2 AND to_user_id=$1)", [userId, friendUserId]);
  },
};

// ======================== RECOMMENDER: MOVIE SYNC ========================

const movieSyncQueries = {
  /**
   * Scan all existing tables and upsert into the central movies table.
   * Call once on startup to backfill, then ensureMovie() handles new entries.
   */
  async backfillMovies() {
    const result = await query(`
      INSERT INTO movies (title, year, genre, director, imdb_id, overview, poster, media_type)
      SELECT DISTINCT ON (title, year)
        title, year, genre, director, imdb_id, overview, poster, media_type
      FROM (
        SELECT movie_title as title, movie_year as year, movie_genre as genre,
               movie_director as director, movie_imdb_id as imdb_id,
               movie_overview as overview, movie_poster as poster,
               media_type
        FROM messages WHERE movie_title IS NOT NULL AND movie_title != ''
        UNION
        SELECT movie_title, movie_year, movie_genre, movie_director,
               movie_imdb_id, movie_overview, movie_poster, 'movie'
        FROM watchlist WHERE movie_title IS NOT NULL AND movie_title != ''
        UNION
        SELECT movie_title, movie_year, movie_genre, movie_director,
               movie_imdb_id, movie_overview, movie_poster, media_type
        FROM watched WHERE movie_title IS NOT NULL AND movie_title != ''
        UNION
        SELECT movie_title, movie_year, movie_genre, movie_director,
               NULL, NULL, movie_poster, media_type
        FROM custom_list_items WHERE movie_title IS NOT NULL AND movie_title != ''
      ) combined
      ON CONFLICT (title, year) DO UPDATE SET
        genre = COALESCE(NULLIF(EXCLUDED.genre, ''), movies.genre),
        director = COALESCE(NULLIF(EXCLUDED.director, ''), movies.director),
        imdb_id = COALESCE(EXCLUDED.imdb_id, movies.imdb_id),
        overview = COALESCE(NULLIF(EXCLUDED.overview, ''), movies.overview),
        poster = COALESCE(EXCLUDED.poster, movies.poster)
    `);
    const count = (await query("SELECT COUNT(*) as c FROM movies")).rows[0].c;
    console.log(`[Recommender] Backfilled ${count} movies into central table`);
    return parseInt(count);
  },

  /**
   * Ensure a single movie exists in the central table. Returns the movie row ID.
   * Call this whenever a movie is shared, watchlisted, or marked watched.
   */
  async ensureMovie(movie) {
    if (!movie.title) return null;
    const existing = await query(
      "SELECT id FROM movies WHERE title = $1 AND year = $2",
      [movie.title, movie.year || null]
    );
    if (existing.rows[0]) return existing.rows[0].id;

    const r = await query(`
      INSERT INTO movies (title, year, genre, director, imdb_id, overview, poster, tmdb_id, media_type)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      ON CONFLICT (title, year) DO UPDATE SET
        genre = COALESCE(NULLIF(EXCLUDED.genre, ''), movies.genre),
        poster = COALESCE(EXCLUDED.poster, movies.poster)
      RETURNING id
    `, [
      movie.title, movie.year || null, movie.genre || null,
      movie.director || null, movie.imdb_id || null,
      movie.overview || null, movie.poster || null,
      movie.tmdb_id || null, movie.media_type || "movie"
    ]);
    return r.rows[0].id;
  },

  async findByTitleYear(title, year) {
    const r = await query("SELECT * FROM movies WHERE title = $1 AND year = $2", [title, year || null]);
    return r.rows[0] || null;
  },

  async findById(id) {
    const r = await query("SELECT * FROM movies WHERE id = $1", [id]);
    return r.rows[0] || null;
  },
};

// ======================== RECOMMENDER: SCORE AGGREGATOR ========================

const SIGNAL_WEIGHTS = {
  explicit_rating: 1.0,   // movie_ratings (1-10 scale, normalized to 0-1)
  watched:         0.85,  // user marked a movie as watched
  list_add:        0.80,  // added to a custom list
  shared:          0.75,  // shared in a conversation
  reviewed:        0.90,  // wrote a review (highest implicit signal)
  watchlist:       0.60,  // added to watchlist (intent, not yet consumed)
  poll_vote:       0.50,  // voted for a movie in a poll
  reacted:         0.35,  // reacted with emoji to a shared movie
};

const scoringQueries = {
  /**
   * Rebuild ALL user-movie scores from scratch.
   * Scans every signal table and fuses into user_movie_scores.
   * Run on startup and periodically (every 6 hours).
   */
  async rebuildAllScores() {
    console.log("[Recommender] Rebuilding user-movie scores...");

    // Clear stale scores
    await query("DELETE FROM user_movie_scores");

    // 1. Explicit ratings: movie_ratings → messages → movies
    await query(`
      INSERT INTO user_movie_scores (user_id, movie_id, explicit_rating, final_score)
      SELECT mr.user_id, mov.id, AVG(mr.rating) / 10.0, AVG(mr.rating) / 10.0
      FROM movie_ratings mr
      JOIN messages m ON mr.message_id = m.id
      JOIN movies mov ON mov.title = m.movie_title
        AND COALESCE(mov.year, '') = COALESCE(m.movie_year, '')
      GROUP BY mr.user_id, mov.id
      ON CONFLICT (user_id, movie_id) DO UPDATE SET
        explicit_rating = EXCLUDED.explicit_rating,
        updated_at = NOW()
    `);

    // 2. Watched (strong positive — user finished the movie)
    await query(`
      INSERT INTO user_movie_scores (user_id, movie_id, implicit_score, final_score)
      SELECT w.user_id, mov.id, ${SIGNAL_WEIGHTS.watched}, ${SIGNAL_WEIGHTS.watched}
      FROM watched w
      JOIN movies mov ON mov.title = w.movie_title
        AND COALESCE(mov.year, '') = COALESCE(w.movie_year, '')
      ON CONFLICT (user_id, movie_id) DO UPDATE SET
        implicit_score = GREATEST(user_movie_scores.implicit_score, ${SIGNAL_WEIGHTS.watched}),
        updated_at = NOW()
    `);

    // 3. Shared in conversations (user actively recommended it)
    await query(`
      INSERT INTO user_movie_scores (user_id, movie_id, implicit_score, final_score)
      SELECT m.sender_id, mov.id, ${SIGNAL_WEIGHTS.shared}, ${SIGNAL_WEIGHTS.shared}
      FROM messages m
      JOIN movies mov ON mov.title = m.movie_title
        AND COALESCE(mov.year, '') = COALESCE(m.movie_year, '')
      ON CONFLICT (user_id, movie_id) DO UPDATE SET
        implicit_score = GREATEST(user_movie_scores.implicit_score, ${SIGNAL_WEIGHTS.shared}),
        updated_at = NOW()
    `);

    // 4. Custom list adds (curated intent)
    await query(`
      INSERT INTO user_movie_scores (user_id, movie_id, implicit_score, final_score)
      SELECT cl.user_id, mov.id, ${SIGNAL_WEIGHTS.list_add}, ${SIGNAL_WEIGHTS.list_add}
      FROM custom_list_items cli
      JOIN custom_lists cl ON cli.list_id = cl.id
      JOIN movies mov ON mov.title = cli.movie_title
        AND COALESCE(mov.year, '') = COALESCE(cli.movie_year, '')
      ON CONFLICT (user_id, movie_id) DO UPDATE SET
        implicit_score = GREATEST(user_movie_scores.implicit_score, ${SIGNAL_WEIGHTS.list_add}),
        updated_at = NOW()
    `);

    // 5. Watchlist (intent signal — wants to watch but hasn't yet)
    await query(`
      INSERT INTO user_movie_scores (user_id, movie_id, implicit_score, final_score)
      SELECT wl.user_id, mov.id, ${SIGNAL_WEIGHTS.watchlist}, ${SIGNAL_WEIGHTS.watchlist}
      FROM watchlist wl
      JOIN movies mov ON mov.title = wl.movie_title
        AND COALESCE(mov.year, '') = COALESCE(wl.movie_year, '')
      ON CONFLICT (user_id, movie_id) DO UPDATE SET
        implicit_score = GREATEST(user_movie_scores.implicit_score, ${SIGNAL_WEIGHTS.watchlist}),
        updated_at = NOW()
    `);

    // 6. Reviews (very strong signal — user engaged enough to write about it)
    await query(`
      INSERT INTO user_movie_scores (user_id, movie_id, implicit_score, final_score)
      SELECT r.user_id, mov.id, ${SIGNAL_WEIGHTS.reviewed}, ${SIGNAL_WEIGHTS.reviewed}
      FROM reviews r
      JOIN messages m ON r.message_id = m.id
      JOIN movies mov ON mov.title = m.movie_title
        AND COALESCE(mov.year, '') = COALESCE(m.movie_year, '')
      ON CONFLICT (user_id, movie_id) DO UPDATE SET
        implicit_score = GREATEST(user_movie_scores.implicit_score, ${SIGNAL_WEIGHTS.reviewed}),
        updated_at = NOW()
    `);

    // 7. Final score: blend explicit + implicit
    //    If user rated explicitly: 70% rating + 30% implicit
    //    If no explicit rating: use implicit score as-is
    await query(`
      UPDATE user_movie_scores SET
        final_score = CASE
          WHEN explicit_rating IS NOT NULL THEN
            0.7 * explicit_rating + 0.3 * COALESCE(implicit_score, 0)
          ELSE implicit_score
        END,
        updated_at = NOW()
    `);

    const count = (await query("SELECT COUNT(*) as c FROM user_movie_scores")).rows[0].c;
    console.log(`[Recommender] Built ${count} user-movie score entries`);
    return parseInt(count);
  },
};

module.exports = {
  initSchema, query, pool,
  userQueries, conversationQueries, messageQueries, reactionQueries,
  readReceiptQueries, watchlistQueries, ratingQueries, reviewQueries,
  watchedTogetherQueries, shareTokenQueries, trendingQueries,
  watchedQueries, notificationQueries, customListQueries, pollQueries,
  friendshipQueries, movieSyncQueries, scoringQueries,
};
