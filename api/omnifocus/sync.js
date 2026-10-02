const tasksHandler = require('./tasks');

module.exports = async (req, res) => {
  return tasksHandler(req, res);
};
