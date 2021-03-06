const { usersRes, othersRes } = require('../libs/messages');

module.exports = {
  // eslint-disable-next-line no-unused-vars
  errorsHandler: (err, req, res, next) => {
    switch (err.name) {
      case 'CastError':
        res.status(400).send({ message: othersRes.wrongIdFormat });
        break;

      case 'DocumentNotFoundError':
        res.status(404).send({ message: usersRes.notFound });
        break;

      case 'ValidationError':
        res.status(403).send({ message: othersRes.dupEmail });
        break;

      default:
        res
          .status(err.status || 500)
          .send({ message: err.message || 'ошибка сервера' });
    }
  }
};
