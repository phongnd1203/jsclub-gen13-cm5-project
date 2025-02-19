/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 */

/**
 * Health check controller
 * @param {Request} req - Express request
 * @param {Response} res - Express response
 * @returns {void}
 */
export function healthController(req, res) {
  res.json({ status: "ok" });
}
