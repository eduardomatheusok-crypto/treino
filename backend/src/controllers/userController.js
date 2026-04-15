import User from '../models/User.js';

export async function createUser(req, res) {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Nome do usuario e obrigatorio.' });
    }

    const user = await User.create({ name });
    return res.status(201).json(user);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao criar usuario.', error: error.message });
  }
}

export async function getOrCreateDemoUser(req, res) {
  try {
    let user = await User.findOne({ name: 'Usuario Demo' });

    if (!user) {
      user = await User.create({ name: 'Usuario Demo' });
    }

    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao obter usuario demo.', error: error.message });
  }
}