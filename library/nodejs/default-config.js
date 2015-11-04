/**
 * Summary
 */

module.exports = {
  app: {
    name: 'app_name',
    port: process.env.APP_NAME_PORT || 3000
  },
  database: {
    name: 'devdb',
    host: 'localhost',
    dialect: 'mysql',
    username: process.env.ATTENDANCE_DB_USER || 'devuser',
    password: process.env.ATTENDANCE_DB_PASS || 'devpass'
  }
};
