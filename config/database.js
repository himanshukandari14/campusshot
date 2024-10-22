const mongoose=require('mongoose');
require('dotenv');

const dbConnection=()=>{
 mongoose.connect(process.env.DATABASE_URL)
 .then(()=>{console.log('Database is running..')})
 .catch((error)=>{console.log('error in connection to db:',error)})
}

module.exports=dbConnection;
