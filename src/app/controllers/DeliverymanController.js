import * as Yup from 'yup';

import User from '../models/User';
import File from '../models/File';
import Deliveryman from '../models/Deliveryman';

class DeliverymanController {
  async index(req, res) {
    const userAdm = await User.findOne({ 
      where: { id: req.userId, adm: true } 
    });

    if (!userAdm) {
      return res.status(400).json({error: 'User does not permission to view all users'});
    }

    const { page = 1 } = req.query;

    const deliveryman = await Deliveryman.findAll({
      limit: 5,
      offset: (page - 1) * 5
    });

    return res.json(deliveryman);
  }

  async store(req, res) {
    const userAdm = await User.findOne({ 
      where: { id: req.userId, adm: true } 
    });

    if (!userAdm) {
      return res.status(400).json({error: 'User does not permission to create an Deliveryman'});
    }

    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
    });

    if ( !(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { email, avatar_id } = req.body;

    const fileExist = await File.findOne({ where: { id: avatar_id }});

    if (!fileExist) {
      return res.status(400).json({error: 'File with this id does not exists.'});
    }

    const deliverymanExist = await Deliveryman.findOne({
      where: { email: email }
    });

    if (deliverymanExist) {
      return res.status(401).json({error: 'Deliveryman already exist.'});
    }

    const deliveryman = await Deliveryman.create(req.body);

    return res.json(deliveryman);
  }

  async update(req, res) {
    const userAdm = await User.findOne({ 
      where: { id: req.userId, adm: true } 
    });

    if (!userAdm) {
      return res.status(400).json({error: 'User does not permission to create an Deliveryman'});
    }

    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
    });

    if ( !(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const deliverymanExist = await Deliveryman.findOne({
      where: { email: req.body.email }
    });

    if (!deliverymanExist) {
      return res.status(400).json({error: 'Deliverman does not exist.'});
    }

    await Deliveryman.update(req.body, {
      where: { id: req.params.id }
    });

    const deliveryman = await Deliveryman.findOne({
      where: { id: req.params.id },
      attributes: ['id', 'name', 'email'],
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'path', 'url'],
        }
      ]
    });
    
    return res.json(deliveryman);
  }

  async delete(req, res) {
    const userAdm = await User.findOne({ 
      where: { id: req.userId, adm: true } 
    });

    if (!userAdm) {
      return res.status(400).json({error: 'User does not permission to create an Deliveryman'});
    }

    const deliverymanExist = await Deliveryman.findByPk(req.params.id);

    if (!deliverymanExist) {
      return res.json(400).json({error: 'Deleveryman does not exist'});
    }

    await Deliveryman.destroy({
      where: { id: req.params.id },
    });

    return res.json();
  }
}

export default new DeliverymanController();