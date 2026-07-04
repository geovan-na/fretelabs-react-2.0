const upload = require('../config/multer');

const uploadSingle = upload.single('arquivo');
const uploadMultiple = upload.array('arquivos', 10);

module.exports = { uploadSingle, uploadMultiple };