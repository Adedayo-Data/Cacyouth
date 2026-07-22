// Single on/off switch for accepting new registrations (participant, vendor,
// and bulk group) — driven by an env var so it can be flipped on Railway
// without a redeploy. Defaults CLOSED: unset (the normal case right after
// this ships) means registration is off until someone explicitly sets
// REGISTRATION_OPEN=true.
const isRegistrationOpen = () => process.env.REGISTRATION_OPEN === 'true';

const requireRegistrationOpen = (req, res, next) => {
  if (!isRegistrationOpen()) {
    return res.status(503).json({ error: 'Registration is temporarily closed' });
  }
  next();
};

module.exports = { isRegistrationOpen, requireRegistrationOpen };
