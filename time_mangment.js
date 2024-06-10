const cron = require('node-cron');
const {reservation} =require("./patientschema")
async function apoinmentTimer(time,month,dayOfMonth,reservationId){
    const [hour, minute] = time.split(':').map(Number);
    const cronString = `${minute} ${hour} ${dayOfMonth} ${month} *`
    const task = await cron.schedule(cronString,async () => {
        console.log('Running scheduled update...');
        // Your updateDocument function goes here
       await reservation.updateOne({_id:reservationId},{appointmentStatus:"finished"}).then()
      });
      console.log(task)
}
module.exports ={apoinmentTimer}