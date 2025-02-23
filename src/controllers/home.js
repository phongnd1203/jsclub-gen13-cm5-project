/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 */

/**
 * check controller
 * @param {Request} req - Express request
 * @param {Response} res - Express response
 * @returns {void}
 */

const homeController = (req, res) => {
  res.render("home");
};

export const controllers = {
  homeController,
};
