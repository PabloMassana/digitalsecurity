const { ObjectId } = require("mongodb");

function isValidId(value) {
  return typeof value === "string" && ObjectId.isValid(value) && String(new ObjectId(value)) === value;
}

function publicMovie(movie) {
  return {
    id: movie._id.toString(),
    title: movie.title,
    year: movie.year,
    genre: movie.genre,
    description: movie.description || "",
    runtime: movie.runtime || "",
    rating: movie.rating || "",
    tagline: movie.tagline || "",
    synopsis: movie.synopsis || "",
    cast: movie.cast || [],
    color: movie.color || "",
    image: movie.image || "",
    sellerId: movie.sellerId ? movie.sellerId.toString() : null,
    createdAt: movie.createdAt,
    updatedAt: movie.updatedAt
  };
}

function publicUser(user) {
  return {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

module.exports = { isValidId, publicMovie, publicUser, escapeRegex };