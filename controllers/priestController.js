const { Priest, Diocese } = require('../models');
const countries = require('../config/countries');
const path = require('path');
const fs = require('fs');

// Helper: get all dioceses for forms
async function getDioceses() {
  return Diocese.findAll({ where: { isActive: true }, order: [['name', 'ASC']] });
}

// LIST
exports.index = async (req, res) => {
  try {
    const search = req.query.search || '';
    const diocese = req.query.diocese || '';
    const status = req.query.status || '';
    const limit = 15;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const offset = (page - 1) * limit;
    const where = {};
    const { Op } = require('sequelize');

    if (search) where.fullName = { [Op.like]: `%${search}%` };
    if (diocese) where.dioceseId = diocese;
    if (status) where.priestStatus = status;

    const { count, rows: priests } = await Priest.findAndCountAll({
      where,
      include: [{ model: Diocese, as: 'diocese' }],
      order: [['fullName', 'ASC']],
      limit, offset
    });

    const dioceses = await getDioceses();
    const totalPages = Math.ceil(count / limit);

    res.render('priests/index', {
      title: 'Priests', layout: 'layouts/main',
      priests, dioceses, count, totalPages,
      currentPage: page, limit, query: req.query
    });
  } catch (err) {
    console.error(err);
    req.flash('error', err.message);
    res.redirect('/admin/dashboard');
  }
};

// STEP 1 - GET
exports.getStep1 = async (req, res) => {
  const { priestId } = req.query;
  let priest = null;
  if (priestId) priest = await Priest.findByPk(priestId);

  res.render('priests/step1', {
    title: 'Add Priest - Personal Info',
    layout: 'layouts/main',
    countries, priest, priestId
  });
};

// STEP 1 - POST
exports.postStep1 = async (req, res) => {
  try {
    const { priestId, fullName, dateOfBirth, placeOfBirthCountry, placeOfBirthCity, maritalStatus } = req.body;
    let priest;

    const data = { fullName, dateOfBirth, placeOfBirthCountry, placeOfBirthCity, maritalStatus, formStep: Math.max(1, 1) };

    if (req.file) data.photo = req.file.filename;

    if (priestId) {
      priest = await Priest.findByPk(priestId);
      await priest.update(data);
    } else {
      priest = await Priest.create(data);
    }

    res.redirect(`/admin/priests/step2?priestId=${priest.id}`);
  } catch (err) {
    req.flash('error', err.message);
    res.redirect('/admin/priests/step1');
  }
};

// STEP 2 - GET
exports.getStep2 = async (req, res) => {
  const { priestId } = req.query;
  if (!priestId) return res.redirect('/admin/priests/step1');
  const priest = await Priest.findByPk(priestId);
  if (!priest) return res.redirect('/admin/priests/step1');

  res.render('priests/step2', {
    title: 'Add Priest - Baptism Info',
    layout: 'layouts/main', priest, countries
  });
};

// STEP 2 - POST
exports.postStep2 = async (req, res) => {
  try {
    const { priestId, dateOfBaptism, placeOfBaptism, baptizedBy } = req.body;
    const priest = await Priest.findByPk(priestId);
    if (!priest) return res.redirect('/admin/priests/step1');

    await priest.update({ dateOfBaptism, placeOfBaptism, baptizedBy, formStep: Math.max(priest.formStep, 2) });
    res.redirect(`/admin/priests/step3?priestId=${priestId}`);
  } catch (err) {
    req.flash('error', err.message);
    res.redirect(`/admin/priests/step2?priestId=${req.body.priestId}`);
  }
};

// STEP 3 - GET
exports.getStep3 = async (req, res) => {
  const { priestId } = req.query;
  const priest = await Priest.findByPk(priestId);
  if (!priest) return res.redirect('/admin/priests/step1');

  res.render('priests/step3', {
    title: 'Add Priest - Confirmation Info',
    layout: 'layouts/main', priest, countries
  });
};

// STEP 3 - POST
exports.postStep3 = async (req, res) => {
  try {
    const { priestId, dateOfConfirmation, placeOfConfirmation, confirmationBishop } = req.body;
    const priest = await Priest.findByPk(priestId);
    await priest.update({ dateOfConfirmation, placeOfConfirmation, confirmationBishop, formStep: Math.max(priest.formStep, 3) });
    res.redirect(`/admin/priests/step4?priestId=${priestId}`);
  } catch (err) {
    req.flash('error', err.message);
    res.redirect(`/admin/priests/step3?priestId=${req.body.priestId}`);
  }
};

// STEP 4 - GET
exports.getStep4 = async (req, res) => {
  const { priestId } = req.query;
  const priest = await Priest.findByPk(priestId);
  if (!priest) return res.redirect('/admin/priests/step1');

  res.render('priests/step4', {
    title: 'Add Priest - Education Info',
    layout: 'layouts/main', priest
  });
};

// STEP 4 - POST
exports.postStep4 = async (req, res) => {
  try {
    const { priestId, primarySchool, secondarySchool, college, collegeSpecialization, university, universitySpecialization } = req.body;
    const priest = await Priest.findByPk(priestId);
    await priest.update({ primarySchool, secondarySchool, college, collegeSpecialization, university, universitySpecialization, formStep: Math.max(priest.formStep, 4) });
    res.redirect(`/admin/priests/step5?priestId=${priestId}`);
  } catch (err) {
    req.flash('error', err.message);
    res.redirect(`/admin/priests/step4?priestId=${req.body.priestId}`);
  }
};

// STEP 5 - GET
exports.getStep5 = async (req, res) => {
  const { priestId } = req.query;
  const priest = await Priest.findByPk(priestId);
  if (!priest) return res.redirect('/admin/priests/step1');

  const dioceses = await getDioceses();
  res.render('priests/step5', {
    title: 'Add Priest - Theology & Assignment',
    layout: 'layouts/main', priest, dioceses
  });
};

// STEP 5 - POST
exports.postStep5 = async (req, res) => {
  try {
    const { priestId, theologyLevel, theologyInstitution, dioceseId, placeOfWork, dateAssigned, ordinationDate, priestStatus } = req.body;
    const priest = await Priest.findByPk(priestId);
    await priest.update({ theologyLevel, theologyInstitution, dioceseId, placeOfWork, dateAssigned, ordinationDate, priestStatus, formStep: 5 });
    req.flash('success', `Priest ${priest.fullName} has been saved successfully!`);
    res.redirect(`/admin/priests/${priestId}/view`);
  } catch (err) {
    req.flash('error', err.message);
    res.redirect(`/admin/priests/step5?priestId=${req.body.priestId}`);
  }
};

// VIEW
exports.view = async (req, res) => {
  const priest = await Priest.findByPk(req.params.id, {
    include: [{ model: Diocese, as: 'diocese' }]
  });
  if (!priest) { req.flash('error', 'Priest not found'); return res.redirect('/admin/priests'); }

  res.render('priests/view', { title: `Fr. ${priest.fullName}`, layout: 'layouts/main', priest });
};

// PRINT
exports.print = async (req, res) => {
  const priest = await Priest.findByPk(req.params.id, {
    include: [{ model: Diocese, as: 'diocese' }]
  });
  if (!priest) return res.redirect('/admin/priests');
  res.render('priests/print', { title: `Print - ${priest.fullName}`, layout: 'layouts/print', priest });
};

// EDIT - redirect to step 1 with priestId
exports.edit = async (req, res) => {
  const priest = await Priest.findByPk(req.params.id);
  if (!priest) { req.flash('error', 'Priest not found'); return res.redirect('/admin/priests'); }
  res.redirect(`/admin/priests/step1?priestId=${priest.id}`);
};

// DELETE
exports.delete = async (req, res) => {
  try {
    const priest = await Priest.findByPk(req.params.id);
    if (!priest) { req.flash('error', 'Priest not found'); return res.redirect('/admin/priests'); }
    const name = priest.fullName;
    await priest.destroy();
    req.flash('success', `Priest ${name} deleted successfully`);
    res.redirect('/admin/priests');
  } catch (err) {
    req.flash('error', err.message);
    res.redirect('/admin/priests');
  }
};

// UPDATE STATUS (quick toggle without editing)
exports.updateStatus = async (req, res) => {
  try {
    const priest = await Priest.findByPk(req.params.id);
    if (!priest) {
      if (req.xhr || req.headers.accept.includes('application/json')) {
        return res.json({ success: false, message: 'Priest not found' });
      }
      req.flash('error', 'Priest not found');
      return res.redirect('/admin/priests');
    }

    const { status } = req.body;
    const validStatuses = ['active', 'retired', 'deceased', 'on_leave'];
    if (!validStatuses.includes(status)) {
      if (req.xhr || req.headers.accept.includes('application/json')) {
        return res.json({ success: false, message: 'Invalid status' });
      }
      req.flash('error', 'Invalid status value');
      return res.redirect('/admin/priests');
    }

    await priest.update({ priestStatus: status });

    // Support both AJAX and regular form POST
    if (req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'))) {
      return res.json({ success: true, status, name: priest.fullName });
    }

    req.flash('success', `${priest.fullName}'s status updated to "${status.replace('_', ' ')}"`);
    const redirect = req.body.redirect || '/admin/priests';
    res.redirect(redirect);
  } catch (err) {
    if (req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'))) {
      return res.json({ success: false, message: err.message });
    }
    req.flash('error', err.message);
    res.redirect('/admin/priests');
  }
};

// API: Get cities by country
exports.getCities = (req, res) => {
  const country = countries.find(c => c.name === req.params.country);
  res.json(country ? country.cities : []);
};
