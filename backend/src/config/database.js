const mongoose = require("mongoose");

function buildMongoUri(env) {
  const {
    MONGOOSE_URI,
    MONGOOSE_USER,
    MONGOOSE_PASS,
    MONGOOSE_HOST = "127.0.0.1:27017",
    MONGOOSE_DB = "moderex",
    MONGOOSE_PROTOCOL = "mongodb",
  } = env;

  if (MONGOOSE_URI && (MONGOOSE_URI.startsWith("mongodb://") || MONGOOSE_URI.startsWith("mongodb+srv://"))) {
    return MONGOOSE_URI;
  }

  const auth =
    MONGOOSE_USER && MONGOOSE_PASS
      ? `${encodeURIComponent(MONGOOSE_USER)}:${encodeURIComponent(MONGOOSE_PASS)}@`
      : "";

  const protocol = MONGOOSE_PROTOCOL === "mongodb+srv" ? "mongodb+srv" : "mongodb";
  const uri = `${protocol}://${auth}${MONGOOSE_HOST}/${MONGOOSE_DB}`;

  return uri;
}

const connectDatabase = async () => {
  try {
    const uri = buildMongoUri(process.env);

    if (!uri.startsWith("mongodb://") && !uri.startsWith("mongodb+srv://")) {
      throw new Error('Invalid MongoDB URI. It must start with "mongodb://" or "mongodb+srv://".');
    }

    const usingFullUri = !!process.env.MONGOOSE_URI;
    const protocol = uri.startsWith("mongodb+srv://") ? "mongodb+srv" : "mongodb";
    const host = process.env.MONGOOSE_HOST || "(from URI)";
    const db = process.env.MONGOOSE_DB || "(from URI)";
    const hasAuth = !!(process.env.MONGOOSE_USER && process.env.MONGOOSE_PASS);
    console.log(
      `[DB] ${usingFullUri ? "Full URI" : "Constructed URI"} -> protocol=${protocol}, host=${host}, db=${db}, auth=${hasAuth ? "yes" : "no"}`
    );

    await mongoose.connect(uri);

    console.log("Database connected.");
  } catch (error) {
    console.error("Database connection error:", error.message);
    console.error(
      "Check your .env configuration: set MONGOOSE_URI, or MONGOOSE_USER/MONGOOSE_PASS/MONGOOSE_HOST/MONGOOSE_DB."
    );
    process.exit(1);
  }
};

module.exports = connectDatabase;
