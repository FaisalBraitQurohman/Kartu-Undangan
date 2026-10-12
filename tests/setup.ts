if (
  process.env.REQUIRE_DATABASE_TESTS === "true" &&
  !process.env.TEST_DATABASE_URL
)
  throw new Error(
    "Database suites require TEST_DATABASE_URL; skipping is forbidden.",
  );
if (process.env.TEST_DATABASE_URL)
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
