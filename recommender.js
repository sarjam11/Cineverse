// recommender.js — CineVerse Hybrid Recommendation Engine
// Place this file in the project root (same folder as server.js and database.js)

const { query } = require("./database");

// ================================================================
// TF-IDF ENGINE (zero dependencies)
// ================================================================

// Common English stop words to filter out of overview text
const STOP_WORDS = new Set([
  "a","an","the","and","or","but","in","on","at","to","for","of","with",
  "by","from","is","it","as","was","are","be","has","had","have","this",
  "that","not","no","he","she","his","her","they","their","we","our",
  "its","who","which","when","where","how","what","will","can","all",
  "been","would","there","than","into","also","after","before","just",
  "about","up","out","so","if","then","do","does","did","more","very",
  "only","over","such","any","each","own","being","between","both",
  "through","during","must","him","them","me","my","your","some",
]);

/**
 * Build a "movie soup" string from metadata for TF-IDF matching.
 * Genre and director are repeated to give them higher weight in the vector.
 */
function buildMovieSoup(movie) {
  const parts = [];

  // Genre (heavy weight — repeat 3x)
  if (movie.genre) {
    const genres = movie.genre.split(",").map(g => g.trim().toLowerCase().replace(/\s+/g, "_"));
    for (let i = 0; i < 3; i++) parts.push(...genres);
  }
  // Additional genres from TMDB array (repeat 2x)
  if (movie.genres && movie.genres.length > 0) {
    const extra = movie.genres.map(g => g.toLowerCase().replace(/\s+/g, "_"));
    for (let i = 0; i < 2; i++) parts.push(...extra);
  }

  // Director (medium weight — repeat 2x)
  if (movie.director && movie.director.trim()) {
    const dir = movie.director.toLowerCase().replace(/\s+/g, "");
    parts.push(dir, dir);
  }

  // Cast (as-is, single occurrence)
  if (movie.cast_names && movie.cast_names.length > 0) {
    parts.push(...movie.cast_names.map(n => n.toLowerCase().replace(/\s+/g, "")));
  }

  // Keywords from TMDB
  if (movie.keywords && movie.keywords.length > 0) {
    parts.push(...movie.keywords.map(k => k.toLowerCase().replace(/\s+/g, "_")));
  }

  // Overview (natural text, stop words will be filtered by TfIdf)
  if (movie.overview) {
    parts.push(movie.overview.toLowerCase());
  }

  // Language tag
  if (movie.original_language) {
    parts.push("lang_" + movie.original_language);
  }

  // Decade tag
  if (movie.year) {
    const yr = parseInt(movie.year);
    if (!isNaN(yr)) {
      const decade = Math.floor(yr / 10) * 10;
      parts.push("decade_" + decade + "s");
    }
  }

  // Media type tag
  if (movie.media_type) {
    parts.push("type_" + movie.media_type);
  }

  return parts.join(" ");
}

/**
 * Simple TF-IDF implementation. No npm packages needed.
 * Builds term frequency vectors per document, computes IDF across corpus,
 * and provides cosine similarity between any two documents.
 */
class TfIdf {
  constructor() {
    this.documents = [];   // array of { term: normalizedTF }
    this.df = {};          // document frequency: how many docs contain each term
    this.N = 0;            // total document count
  }

  /**
   * Add a document (text string) to the corpus.
   * Returns the document index.
   */
  addDocument(text) {
    const words = text.split(/\s+/).filter(w => w.length > 1 && !STOP_WORDS.has(w));
    const tf = {};
    for (const word of words) {
      tf[word] = (tf[word] || 0) + 1;
    }

    // Normalize TF by max frequency in this document
    const maxFreq = Math.max(...Object.values(tf), 1);
    for (const term in tf) {
      tf[term] = tf[term] / maxFreq;
    }

    const idx = this.documents.length;
    this.documents.push(tf);

    // Update document frequency counts
    const uniqueTerms = new Set(words);
    for (const term of uniqueTerms) {
      this.df[term] = (this.df[term] || 0) + 1;
    }

    this.N++;
    return idx;
  }

  /**
   * Get the TF-IDF weighted vector for a document.
   * Returns { term: tfidfWeight, ... }
   */
  getVector(docIdx) {
    const tf = this.documents[docIdx];
    if (!tf) return {};
    const vec = {};
    for (const term in tf) {
      const idf = Math.log(this.N / (this.df[term] || 1));
      const weight = tf[term] * idf;
      if (weight > 0.001) {
        vec[term] = weight;
      }
    }
    return vec;
  }

  /**
   * Cosine similarity between two sparse vectors.
   * Returns a value between 0 (unrelated) and 1 (identical).
   */
  cosineSimilarity(vecA, vecB) {
    let dot = 0, magA = 0, magB = 0;

    for (const term in vecA) {
      const a = vecA[term];
      magA += a * a;
      if (term in vecB) {
        dot += a * vecB[term];
      }
    }
    for (const term in vecB) {
      magB += vecB[term] * vecB[term];
    }

    if (magA === 0 || magB === 0) return 0;
    return dot / (Math.sqrt(magA) * Math.sqrt(magB));
  }
}

// ================================================================
// COLLABORATIVE FILTERING ENGINE (Item-Item)
// ================================================================

/**
 * Item-Item collaborative filtering using cosine similarity
 * on the user-movie interaction matrix.
 *
 * Why item-item (not user-user):
 *  - Works better with few users (CineVerse's initial scale)
 *  - More stable — item profiles don't change as fast as user profiles
 *  - Easier to explain ("similar to movies you liked")
 */
class CollaborativeEngine {
  constructor() {
    this.userIndex = {};    // userId -> numeric index
    this.movieIndex = {};   // movieId -> numeric index
    this.movieIds = [];     // index -> movieId (reverse lookup)
    this.matrix = [];       // sparse: matrix[movieIdx] = { userIdx: score }
    this.userVectors = {};  // userId -> { movieId: score }
  }

  /**
   * Build from user_movie_scores rows.
   * Each row: { user_id, movie_id, final_score }
   */
  build(scores) {
    const users = [...new Set(scores.map(s => s.user_id))];
    const movies = [...new Set(scores.map(s => s.movie_id))];

    this.userIndex = {};
    this.movieIndex = {};
    this.movieIds = movies;
    users.forEach((uid, i) => this.userIndex[uid] = i);
    movies.forEach((mid, i) => this.movieIndex[mid] = i);

    // Build sparse item vectors (each movie = vector of user scores)
    this.matrix = movies.map(() => ({}));
    this.userVectors = {};

    for (const { user_id, movie_id, final_score } of scores) {
      const mi = this.movieIndex[movie_id];
      const ui = this.userIndex[user_id];
      if (mi !== undefined && ui !== undefined) {
        this.matrix[mi][ui] = parseFloat(final_score);
      }
      // Also build per-user lookup
      if (!this.userVectors[user_id]) this.userVectors[user_id] = {};
      this.userVectors[user_id][movie_id] = parseFloat(final_score);
    }

    console.log("[CF] Built matrix: " + users.length + " users x " + movies.length + " movies");
  }

  /**
   * Cosine similarity between two sparse vectors.
   */
  cosineSim(vecA, vecB) {
    let dot = 0, magA = 0, magB = 0;
    for (const key in vecA) {
      magA += vecA[key] * vecA[key];
      if (key in vecB) dot += vecA[key] * vecB[key];
    }
    for (const key in vecB) {
      magB += vecB[key] * vecB[key];
    }
    if (magA === 0 || magB === 0) return 0;
    return dot / (Math.sqrt(magA) * Math.sqrt(magB));
  }

  /**
   * Find movies similar to a given movie (item-item CF).
   */
  similarItems(movieId, topK) {
    topK = topK || 20;
    const mi = this.movieIndex[movieId];
    if (mi === undefined) return [];

    const targetVec = this.matrix[mi];
    // Need at least 2 users who interacted with this movie
    if (Object.keys(targetVec).length < 2) return [];

    const sims = [];
    for (let i = 0; i < this.matrix.length; i++) {
      if (i === mi) continue;
      const sim = this.cosineSim(targetVec, this.matrix[i]);
      if (sim > 0.01) {
        sims.push({ movieId: this.movieIds[i], similarity: sim });
      }
    }

    sims.sort((a, b) => b.similarity - a.similarity);
    return sims.slice(0, topK);
  }

  /**
   * Recommend for a user: weighted sum of item similarities
   * to items the user has interacted with.
   */
  recommendForUser(userId, topK) {
    topK = topK || 30;
    const userMovies = this.userVectors[userId];
    if (!userMovies || Object.keys(userMovies).length === 0) return [];

    const candidates = {};

    // For each movie the user liked, find similar movies
    for (const movieIdStr of Object.keys(userMovies)) {
      const movieId = parseInt(movieIdStr);
      const userScore = userMovies[movieIdStr];
      const similar = this.similarItems(movieId, 30);

      for (const item of similar) {
        // Skip movies user already interacted with
        if (userMovies[item.movieId] !== undefined) continue;
        if (!candidates[item.movieId]) candidates[item.movieId] = { score: 0, count: 0 };
        candidates[item.movieId].score += item.similarity * userScore;
        candidates[item.movieId].count++;
      }
    }

    // Normalize by count
    const results = Object.keys(candidates).map(function(mid) {
      var data = candidates[mid];
      return {
        movieId: parseInt(mid),
        score: data.count > 0 ? data.score / data.count : 0,
      };
    });

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, topK);
  }
}

// ================================================================
// HYBRID FUSION ENGINE
// ================================================================

class HybridRecommender {
  constructor() {
    this.tfidf = new TfIdf();
    this.cf = new CollaborativeEngine();
    this.movies = [];       // array of movie row objects from DB
    this.movieIdToIdx = {}; // movie.id -> tfidf document index
    this.isReady = false;
  }

  /**
   * Initialize the engine: load all data from PostgreSQL and build models.
   * Called on server startup and on periodic refresh.
   */
  async init() {
    console.log("[Recommender] Initializing...");
    const startTime = Date.now();

    // 1. Load all movies from central table
    const movieResult = await query("SELECT * FROM movies ORDER BY id");
    this.movies = movieResult.rows;

    if (this.movies.length === 0) {
      console.log("[Recommender] No movies in database yet. Skipping init.");
      return;
    }

    // 2. Build TF-IDF content vectors for every movie
    this.tfidf = new TfIdf();
    this.movieIdToIdx = {};
    for (const movie of this.movies) {
      const soup = buildMovieSoup(movie);
      const idx = this.tfidf.addDocument(soup);
      this.movieIdToIdx[movie.id] = idx;
    }

    // 3. Build collaborative filtering model from user-movie scores
    const scoresResult = await query(
      "SELECT user_id, movie_id, final_score FROM user_movie_scores WHERE final_score > 0"
    );
    if (scoresResult.rows.length > 0) {
      this.cf.build(scoresResult.rows);
    }

    var elapsed = Date.now() - startTime;
    console.log(
      "[Recommender] Ready — " + this.movies.length + " movies, " +
      scoresResult.rows.length + " interactions (" + elapsed + "ms)"
    );
    this.isReady = true;
  }

  // ----------------------------------------------------------------
  // CONTENT-BASED: find movies similar to a specific movie
  // ----------------------------------------------------------------

  contentSimilar(movieId, topK) {
    topK = topK || 15;
    const idx = this.movieIdToIdx[movieId];
    if (idx === undefined) return [];

    const targetVec = this.tfidf.getVector(idx);
    const sims = [];

    for (const movie of this.movies) {
      if (movie.id === movieId) continue;
      const otherIdx = this.movieIdToIdx[movie.id];
      if (otherIdx === undefined) continue;
      const otherVec = this.tfidf.getVector(otherIdx);
      const sim = this.tfidf.cosineSimilarity(targetVec, otherVec);
      if (sim > 0.01) {
        sims.push({ movieId: movie.id, score: sim, source: "cbf" });
      }
    }

    sims.sort((a, b) => b.score - a.score);
    return sims.slice(0, topK);
  }

  // ----------------------------------------------------------------
  // CONTENT-BASED: user taste profile recommendations
  // ----------------------------------------------------------------

  contentProfileRecs(userId, userScores, topK) {
    topK = topK || 20;
    if (!userScores || userScores.length === 0) return [];

    // Build weighted centroid of user's liked movie vectors
    const centroid = {};
    let totalWeight = 0;

    for (const row of userScores) {
      const idx = this.movieIdToIdx[row.movie_id];
      if (idx === undefined) continue;
      const vec = this.tfidf.getVector(idx);
      const weight = parseFloat(row.final_score);
      totalWeight += weight;

      for (const term in vec) {
        centroid[term] = (centroid[term] || 0) + vec[term] * weight;
      }
    }

    if (totalWeight === 0) return [];

    // Normalize centroid
    for (const term in centroid) {
      centroid[term] /= totalWeight;
    }

    // Find movies closest to user centroid, excluding already-seen
    const seenMovieIds = new Set(userScores.map(s => parseInt(s.movie_id)));
    const candidates = [];

    for (const movie of this.movies) {
      if (seenMovieIds.has(movie.id)) continue;
      const idx = this.movieIdToIdx[movie.id];
      if (idx === undefined) continue;
      const vec = this.tfidf.getVector(idx);
      const sim = this.tfidf.cosineSimilarity(centroid, vec);
      if (sim > 0.01) {
        candidates.push({ movieId: movie.id, score: sim, source: "cbf" });
      }
    }

    candidates.sort((a, b) => b.score - a.score);
    return candidates.slice(0, topK);
  }

  // ----------------------------------------------------------------
  // HYBRID: combine CBF + CF + Popularity
  // ----------------------------------------------------------------

  async recommend(userId, topK) {
    topK = topK || 20;
    if (!this.isReady) return [];

    // Get user's interaction history
    const userScoresResult = await query(
      "SELECT movie_id, final_score FROM user_movie_scores WHERE user_id = $1 AND final_score > 0",
      [userId]
    );
    const userScores = userScoresResult.rows;
    const nInteractions = userScores.length;

    // Adaptive weights based on how much data we have for this user
    var wCBF, wCF, wPop;
    if (nInteractions < 3) {
      // Cold start: mostly popularity
      wCBF = 0.2; wCF = 0.0; wPop = 0.8;
    } else if (nInteractions < 8) {
      // Warming up: lean on content-based
      wCBF = 0.7; wCF = 0.1; wPop = 0.2;
    } else if (nInteractions < 20) {
      // Balanced
      wCBF = 0.5; wCF = 0.4; wPop = 0.1;
    } else {
      // Mature: trust collaborative filtering
      wCBF = 0.3; wCF = 0.6; wPop = 0.1;
    }

    var scoreMap = {}; // movieId -> { cbf, cf, pop }

    // --- Content-Based scores ---
    var cbfRecs = this.contentProfileRecs(userId, userScores, topK * 3);
    var cbfMax = cbfRecs.length > 0 ? cbfRecs[0].score : 1;
    for (var i = 0; i < cbfRecs.length; i++) {
      var movieId = cbfRecs[i].movieId;
      if (!scoreMap[movieId]) scoreMap[movieId] = { cbf: 0, cf: 0, pop: 0 };
      scoreMap[movieId].cbf = cbfMax > 0 ? cbfRecs[i].score / cbfMax : 0;
    }

    // --- Collaborative Filtering scores ---
    if (nInteractions >= 3) {
      var cfRecs = this.cf.recommendForUser(userId, topK * 3);
      var cfMax = cfRecs.length > 0 ? cfRecs[0].score : 1;
      for (var j = 0; j < cfRecs.length; j++) {
        var mid = cfRecs[j].movieId;
        if (!scoreMap[mid]) scoreMap[mid] = { cbf: 0, cf: 0, pop: 0 };
        scoreMap[mid].cf = cfMax > 0 ? cfRecs[j].score / cfMax : 0;
      }
    }

    // --- Popularity baseline ---
    var seenIds = new Set(userScores.map(s => parseInt(s.movie_id)));
    for (var k = 0; k < this.movies.length; k++) {
      var movie = this.movies[k];
      if (seenIds.has(movie.id)) continue;
      if (!scoreMap[movie.id]) scoreMap[movie.id] = { cbf: 0, cf: 0, pop: 0 };
      scoreMap[movie.id].pop = Math.min((movie.tmdb_rating || 0) / 10, 1);
    }

    // --- Weighted fusion ---
    var results = [];
    var movieIdStrs = Object.keys(scoreMap);
    for (var n = 0; n < movieIdStrs.length; n++) {
      var id = parseInt(movieIdStrs[n]);
      var scores = scoreMap[id];
      var final = wCBF * scores.cbf + wCF * scores.cf + wPop * scores.pop;
      if (final > 0.01) {
        var source = "hybrid";
        if (scores.cbf > scores.cf && scores.cbf > scores.pop) source = "cbf";
        else if (scores.cf > scores.cbf && scores.cf > scores.pop) source = "cf";
        else if (scores.pop > scores.cbf && scores.pop > scores.cf) source = "popularity";

        results.push({ movieId: id, score: final, source: source, breakdown: scores });
      }
    }

    results.sort((a, b) => b.score - a.score);
    return this.diversify(results, topK);
  }

  // ----------------------------------------------------------------
  // DIVERSITY: prevent filter bubble
  // ----------------------------------------------------------------

  diversify(results, topK) {
    var movieMap = {};
    for (var i = 0; i < this.movies.length; i++) {
      movieMap[this.movies[i].id] = this.movies[i];
    }

    var final = [];
    var genreCounts = {};
    var maxPerGenre = Math.ceil(topK / 3);

    for (var j = 0; j < results.length; j++) {
      if (final.length >= topK) break;
      var movie = movieMap[results[j].movieId];
      var genre = (movie && movie.genre) ? movie.genre : "Other";
      genreCounts[genre] = (genreCounts[genre] || 0) + 1;

      if (genreCounts[genre] <= maxPerGenre) {
        final.push(results[j]);
      }
    }

    // Backfill if diversity filter was too aggressive
    if (final.length < topK) {
      for (var k = 0; k < results.length; k++) {
        if (final.length >= topK) break;
        var alreadyIn = false;
        for (var l = 0; l < final.length; l++) {
          if (final[l].movieId === results[k].movieId) { alreadyIn = true; break; }
        }
        if (!alreadyIn) final.push(results[k]);
      }
    }

    return final;
  }

  // ----------------------------------------------------------------
  // SOCIAL: "Crew Picks" — popular among user's friends
  // ----------------------------------------------------------------

  async crewPicks(userId, topK) {
    topK = topK || 15;
    var result = await query('\
      WITH my_friends AS (\
        SELECT CASE\
          WHEN from_user_id = $1 THEN to_user_id\
          ELSE from_user_id\
        END as friend_id\
        FROM friendships\
        WHERE (from_user_id = $1 OR to_user_id = $1)\
          AND status = \'accepted\'\
      ),\
      my_seen AS (\
        SELECT movie_id FROM user_movie_scores WHERE user_id = $1\
      ),\
      friend_scores AS (\
        SELECT\
          ums.movie_id,\
          COUNT(DISTINCT ums.user_id) as friend_count,\
          AVG(ums.final_score) as avg_score\
        FROM user_movie_scores ums\
        JOIN my_friends f ON ums.user_id = f.friend_id\
        WHERE ums.final_score > 0.3\
          AND ums.movie_id NOT IN (SELECT movie_id FROM my_seen)\
        GROUP BY ums.movie_id\
      )\
      SELECT\
        fs.movie_id, fs.friend_count, fs.avg_score,\
        m.title, m.year, m.genre, m.poster, m.director,\
        m.tmdb_rating, m.overview, m.imdb_id, m.tmdb_id, m.media_type\
      FROM friend_scores fs\
      JOIN movies m ON m.id = fs.movie_id\
      ORDER BY fs.friend_count DESC, fs.avg_score DESC\
      LIMIT $2\
    ', [userId, topK]);

    return result.rows.map(function(r) {
      return {
        movieId: r.movie_id,
        title: r.title,
        year: r.year,
        genre: r.genre,
        poster: r.poster,
        director: r.director,
        tmdb_rating: r.tmdb_rating,
        overview: r.overview,
        imdb_id: r.imdb_id,
        tmdb_id: r.tmdb_id,
        media_type: r.media_type,
        friendCount: parseInt(r.friend_count),
        avgScore: parseFloat(r.avg_score).toFixed(2),
        source: "crew",
      };
    });
  }

  // ----------------------------------------------------------------
  // "Because you liked X" — content-similar to a specific movie
  // ----------------------------------------------------------------

  async similarTo(movieTitle, movieYear, topK) {
    topK = topK || 12;
    var movieResult = await query(
      "SELECT id FROM movies WHERE title = $1 AND year = $2",
      [movieTitle, movieYear || null]
    );
    if (!movieResult.rows[0]) return [];

    var movieId = movieResult.rows[0].id;
    var similar = this.contentSimilar(movieId, topK);

    // Enrich with full movie details
    var movieMap = {};
    for (var i = 0; i < this.movies.length; i++) {
      movieMap[this.movies[i].id] = this.movies[i];
    }

    var results = [];
    for (var j = 0; j < similar.length; j++) {
      var m = movieMap[similar[j].movieId];
      if (!m) continue;
      results.push({
        movieId: similar[j].movieId,
        title: m.title,
        year: m.year,
        genre: m.genre,
        poster: m.poster,
        director: m.director,
        tmdb_rating: m.tmdb_rating,
        overview: m.overview,
        imdb_id: m.imdb_id,
        tmdb_id: m.tmdb_id,
        media_type: m.media_type,
        similarity: Math.round(similar[j].score * 100),
        source: "cbf",
      });
    }
    return results;
  }
}

// ================================================================
// SINGLETON EXPORT
// ================================================================

var recommender = new HybridRecommender();

module.exports = { recommender: recommender, HybridRecommender: HybridRecommender, TfIdf: TfIdf, CollaborativeEngine: CollaborativeEngine };
