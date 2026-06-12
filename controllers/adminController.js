const { Priest, Diocese } = require('../models');
const { Op } = require('sequelize');

exports.getDashboard = async (req, res) => {
  try {
    const totalPriests = await Priest.count();
    const activePriests = await Priest.count({ where: { priestStatus: 'active' } });
    const totalDioceses = await Diocese.count();
    const recentPriests = await Priest.findAll({
      include: [{ model: Diocese, as: 'diocese' }],
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    const byDiocese = await Diocese.findAll({
      include: [{
        model: Priest,
        as: 'priests',
        attributes: []
      }],
      attributes: ['id', 'name'],
    });

    res.render('admin/dashboard', {
      title: 'Dashboard',
      layout: 'layouts/main',
      totalPriests, activePriests, totalDioceses, recentPriests, byDiocese
    });
  } catch (err) {
    console.error(err);
    res.render('admin/dashboard', { title: 'Dashboard', layout: 'layouts/main', error: err.message });
  }
};
