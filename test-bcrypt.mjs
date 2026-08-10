import bcrypt from 'bcryptjs';

const password = '123456';
const oldHash = '$2a$10$y.V2q7Z22W4b7Z481c81z.U8G9n2z6f72/g.42775g9/g';

console.log('Compare test with old hash:', bcrypt.compareSync(password, oldHash));
