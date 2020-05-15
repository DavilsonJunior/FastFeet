import User from '../models/User';

class UserController {
  async index(req, res) {
    const { id } = req.params;

    const { name, email } = await User.findOne({
      where: { id },
    });

    return res.json({
      id,
      name,
      email,
    });
  }

  async store(req, res) {
    const { nome, email, password_hash } = req.body;

    return res.json();
  }
}

export default new UserController();