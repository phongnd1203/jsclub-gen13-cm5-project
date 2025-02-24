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

const Login = (req, res) => {
  res.render("login");
};

const signUp = (req, res) => {
  res.render("signup");
};

const home = (req, res) => {
  res.render("home");
};

export const controllers = {
  Login,
  signUp,
  home,
};
