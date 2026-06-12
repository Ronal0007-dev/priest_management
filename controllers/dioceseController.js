const { Diocese, Priest } = require('../models');

exports.index = async (req, res) => {
  try {
    const search = req.query.search || '';
    const status = req.query.status || '';
    const limit = 10;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const offset = (page - 1) * limit;
    const where = {};
    const { Op } = require('sequelize');

    if (search) where.name = { [Op.like]: `%${search}%` };
    if (status === 'active') where.isActive = true;
    else if (status === 'inactive') where.isActive = false;

    const { count, rows: dioceses } = await Diocese.findAndCountAll({
      where,
      include: [{ model: Priest, as: 'priests', attributes: ['id'] }],
      order: [['name', 'ASC']],
      limit,
      offset,
      distinct: true
    });

    // For print: all dioceses (no pagination)
    const allDioceses = await Diocese.findAll({
      where,
      include: [{ model: Priest, as: 'priests', attributes: ['id'] }],
      order: [['name', 'ASC']]
    });

    const totalPages = Math.ceil(count / limit);

    res.render('dioceses/index', {
      title: 'Dioceses',
      layout: 'layouts/main',
      dioceses, allDioceses, count, totalPages,
      currentPage: page,
      limit,
      query: req.query || {}
    });
  } catch (err) {
    console.error(err);
    req.flash('error', err.message);
    res.redirect('/admin/dashboard');
  }
};

exports.getCreate = (req, res) => {
  res.render('dioceses/create', { title: 'Add Diocese', layout: 'layouts/main' });
};

exports.postCreate = async (req, res) => {
  try {
    const { name, description } = req.body;
    await Diocese.create({ name, description });
    req.flash('success', 'Diocese created successfully');
    res.redirect('/admin/dioceses');
  } catch (err) {
    req.flash('error', err.message);
    res.redirect('/admin/dioceses/create');
  }
};

exports.getEdit = async (req, res) => {
  const diocese = await Diocese.findByPk(req.params.id);
  if (!diocese) { req.flash('error', 'Diocese not found'); return res.redirect('/admin/dioceses'); }
  res.render('dioceses/edit', { title: 'Edit Diocese', layout: 'layouts/main', diocese });
};

exports.postEdit = async (req, res) => {
  try {
    const diocese = await Diocese.findByPk(req.params.id);
    if (!diocese) { req.flash('error', 'Diocese not found'); return res.redirect('/admin/dioceses'); }
    await diocese.update(req.body);
    req.flash('success', 'Diocese updated successfully');
    res.redirect('/admin/dioceses');
  } catch (err) {
    req.flash('error', err.message);
    res.redirect(`/admin/dioceses/${req.params.id}/edit`);
  }
};

exports.delete = async (req, res) => {
  try {
    const diocese = await Diocese.findByPk(req.params.id);
    if (!diocese) { req.flash('error', 'Diocese not found'); return res.redirect('/admin/dioceses'); }
    await diocese.destroy();
    req.flash('success', 'Diocese deleted successfully');
    res.redirect('/admin/dioceses');
  } catch (err) {
    req.flash('error', 'Cannot delete a diocese that has priests assigned to it');
    res.redirect('/admin/dioceses');
  }
};

exports.print = async (req, res) => {
  try {
    const dioceses = await Diocese.findAll({
      include: [{ model: Priest, as: 'priests', attributes: ['id', 'fullName', 'priestStatus', 'placeOfWork'] }],
      order: [['name', 'ASC']]
    });
    res.render('dioceses/print', {
      title: 'Dioceses List - Print',
      layout: 'layouts/print',
      dioceses
    });
  } catch (err) {
    req.flash('error', err.message);
    res.redirect('/admin/dioceses');
  }
};
