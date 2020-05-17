import Recipient from '../models/Recipient';
import User from '../models/User';
import * as Yup from 'yup';

class Destinatario {
  async index(req, res) {
    const destinatario = await Recipient.findAll();

    res.json(destinatario);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      rua: Yup.string().required(),
      numero: Yup.number().required(),
      complemento: Yup.string().notRequired(),
      estado: Yup.string().required(),
      cidade: Yup.string().required(),
      cep: Yup.string().required(),
    });

    if ( !(await schema.isValid(req.body)) ) {
      return res.status(400).json({ error: 'validation fails' });
    }

    const userExists = await User.findOne({ where: { id: req.userId, type: 'admin' } });
    
    if (!userExists) {
      return res.status(401).json({ error: 'users does not an admin' });
    }

    const { rua, numero, complemento, estado, cidade, cep } = req.body;

    const recipient = await Recipient.create({
        rua, 
        numero, 
        complemento, 
        estado, 
        cidade, 
        cep,
        user_id: req.userId,
    });

    return res.json(recipient);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      rua: Yup.string(),
      numero: Yup.number(),
      complemento: Yup.string(),
      estado: Yup.string(),
      cidade: Yup.string(),
      cep: Yup.string(),
    });

    if ( !(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }    
    
    const userExists = await User.findOne({ where: { id: req.userId, type: 'admin' }});

    if (!userExists) {
      return res.status(401).json({ error: 'User does not exists or he does not access permitted' });
    }

    const { id } = req.params;

    const recipientId = await Recipient.findByPk(id);
    
    
    if (!recipientId) {
      return res.status(400).json({ error: 'Destinatario does not exists' });
    }

    await Recipient.update(req.body, { where: { user_id: req.userId }});
    
    const { rua, numero, complemento, estado, cidade, cep  } = await Recipient.findOne({ where: { user_id: req.userId }});

    return res.json({
      rua, 
      numero, 
      complemento, 
      estado, 
      cidade, 
      cep
    });
  }
}

export default new Destinatario();