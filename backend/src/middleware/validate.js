/**
 * Generic Zod request validator middleware.
 * Validates req.body, req.query, or req.params against a Zod schema.
 */
function validate(schema, source = "body") {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const errors = result.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`);
      return res.status(400).json({ error: "Validation failed", details: errors });
    }
    req[source] = result.data;
    next();
  };
}

module.exports = validate;
