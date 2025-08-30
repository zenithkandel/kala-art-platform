const bcrypt = require('bcrypt');

const password = 'admin123';
const hash = bcrypt.hashSync(password, 12);

console.log('Password:', password);
console.log('Bcrypt Hash:', hash);
