import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore, format, subHours } from 'date-fns';
import pt from 'date-fns/locale/pt';

import Order from '../models/Order';
import User from '../models/User';
import File from '../models/File';
import Deliveryman from '../models/Deliveryman';
import Recipient from '../models/Recipient';
import Notification from '../schemas/Notification';

import Mail from '../../lib/Mail';
import CancellationMail from '../jobs/CancellationMail';
import Queue from '../../lib/Queue';

class OrderController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const userAdm = await User.findOne({
      where: { id: req.userId, adm: true }
    });

    if (!userAdm) {
      return res.status(400).json({error: 'User does not an admin'});
    }

    const order = await Order.findAll({
      where: { canceled_at: null },
      order: ['updated_at'],
      limit: 5,
      offset: (page - 1) * 5,
      include: [
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['id', 'name', 'email', 'avatar_id'],      
        },
        {
          model: Recipient,
          as: 'recipient',
          attributes: ['id', 'rua', 'numero', 'complemento', 'estado', 'cidade', 'cep'],
        },
      ]
    });

    return res.json(order);
  }

  async store(req, res) {
    const userAdm = await User.findOne({
      where: { id: req.userId, adm: true }
    });

    if (!userAdm) {
      return res.status(400).json({error: 'User does not an admin'});
    }

    const schema = Yup.object().shape({
      recipient_id: Yup.number().required(),
      deliveryman_id: Yup.number().required(),
      product: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { recipient_id, deliveryman_id, product } = req.body;    

    const deliveryman = await Deliveryman.findOne({
      where: { id: deliveryman_id },
    });

    const recipient = await Recipient.findOne({
      where: { id: recipient_id },
    });

    await Mail.sendMail({
      to: `${deliveryman.name} <${deliveryman.email}>`,
      subject: 'Novo produto para entrega',
      template: 'appointment',
      context: {
        deliveryman: deliveryman.name,
        produto: product,
        rua: recipient.rua,
        numero: recipient.numero,
        complemento: recipient.complemento,
        cidade: recipient.cidade,
        estado: recipient.estado,
      }
    });

    await Notification.create({
      content: `Nova entrega para ${deliveryman.name} para a ${recipient.rua}, ${recipient.numero}, ${recipient.complemento}, ${recipient.cidade} - ${recipient.estado}`,
      deliveryman: deliveryman_id,
    });
    
    const order = await Order.create({
      recipient_id,
      deliveryman_id,
      product,
    });

    return res.json(order);
  }

  async update(req, res) {
    const userAdm = await User.findOne({
      where: { id: req.userId, adm: true }
    });

    if (!userAdm) {
      return res.status(400).json({error: 'User does not an admin'});
    }

    const schema = Yup.object().shape({
      recipient_id: Yup.number().required(),
      deliveryman_id: Yup.number().required(),
      product: Yup.string(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const deliveryman = await Deliveryman.findByPk(req.body.deliveryman_id);

    if (!deliveryman) {
      return res.status(400).json({error: 'deliveryman does not exist'});
    }

    const recipient = await Recipient.findByPk(req.body.recipient_id);

    if (!recipient) {
      return res.status(400).json({error: 'recipient does not exist'});
    }

    const { id } = req.params;

    await Order.update(req.body, {
      where: { id }
    });

    const order = await Order.findOne({
      where: { id },
      attributes: ['id', 'recipient_id', 'deliveryman_id', 'product'],
    });

    return res.json(order);
  }

  async delete(req, res) {
    const userAdm = await User.findOne({
      where: { id: req.userId, adm: true }
    });

    if (!userAdm) {
      return res.status(400).json({error: 'User does not an admin'});
    }

    const { id } = req.params;

    const order = await Order.findByPk(id);

    if (!order) {
      return res.json(400).json({error: 'Order does not exist'});
    }

    await Order.destroy({
      where: { id },
    });

    return res.json();
  }
} 

export default new OrderController();