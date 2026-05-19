const { Sequelize } = require('sequelize');

const testPooler = async () => {
  const url = 'postgresql://postgres.ynzghixmzsngsfpmhqwn:UEkdVBT-xd%25d9Pp@aws-0-eu-central-1.pooler.supabase.com:6543/postgres';
  const sequelize = new Sequelize(url, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });

  try {
    console.log('Testing Supabase Pooler connection...');
    await sequelize.authenticate();
    console.log('✅ [SUCCESS] Pooler connection works perfectly!');
    await sequelize.close();
  } catch (error) {
    console.log(`❌ [FAILED] Pooler — ${error.message}`);
  }
};

testPooler();
