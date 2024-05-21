const mongoose = require('mongoose');
const {profile} =require("./schems")

// Function to generate time slots between start time and end time with the specified step
const generateTimeSlots =(startTime, endTime, step) => {
  const timeSlots = [];
  let currentTime = startTime;
  const [s_hours,s_minutes] = startTime.split(':').map(Number);
  const [e_hours, e_minutes] = endTime.split(':').map(Number);
  if(s_minutes!=0 & e_minutes!=0){
    start =s_hours+(s_minutes/60) 
    end= e_hours+(e_minutes/60) 
  }else{start =s_hours 
    end   = e_hours} 
   
  while (start< end) {
    let [c_hours, c_minutes] = currentTime.split(':').map(Number);
    timeSlots.push({ time: currentTime, available: true });
    let totalMinutes = (c_hours * 60) +c_minutes +parseInt(step ,10);;
   let nextHours = Math.floor(totalMinutes / 60);
   let nextMinutes = totalMinutes % 60;
    // Calculate next time
    currentTime = `${nextHours.toString().padStart(2, '0')}:${nextMinutes.toString().padStart(2, '0')}`.slice(0, 5);
    start = (totalMinutes / 60)  
  }
  
  return timeSlots;
};

// Function to generate weekly schedules for the next two weeks
const generateWeeklySchedules = async (userId,startDayOfWeek, startTime, endTime, step,workdays) => {
  try {
    const now = new Date(); 
    const currentDayOfWeek = now.getDay();
    // Calculate the start and end dates for the next two weeks
    const startDate = new Date(now);
    const endDate = new Date(now);
    endDate.setDate(now.getDate() + 13); // Two weeks from now
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const weeklySchedules = [];

    // Loop through each day and generate time slots
    for (let i = 0; i < 15; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      const dayOfWeek = daysOfWeek[currentDate.getDay()];
      const month = (currentDate.getMonth() + 1).toString();
      const Year = currentDate.getFullYear().toString()
      // If the day is before the start day of the week, skip it
      if (dayOfWeek !== startDayOfWeek && i === 0) continue;
      if (workdays.includes(dayOfWeek) == false) continue;
      const dayOfMonth = currentDate.getDate().toString();
      const timeSlots = await generateTimeSlots(startTime, endTime, step);
      const weeklySchedule = {userId,month,Year,dayOfWeek, dayOfMonth, timeSlots, available:true};
      weeklySchedules.push(weeklySchedule);
    }

    return weeklySchedules;
  } catch (err) {
    console.error('Failed to generate weekly schedules', err);
  }
};
const  AutdSchedule = async () => {
  const newappoinments = [];
 profile.find()
 .then(async result =>{
for(let i = 0; i < result.length; i++){
    const{userId,workdays,startTime, endTime, step } = result[i]
    
    const now = new Date(); 
    const currentDayOfWeek = now.getDay();
    // Calculate the start and end dates for the next two weeks
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      startDate= new Date(now)
      const currentDate = new Date(now);
      currentDate.setDate(startDate.getDate() + 14);
      const dayOfWeek = daysOfWeek[currentDate.getDay()];

      if (workdays.includes(dayOfWeek) == false){currentDate.setDate(startDate.getDate() + 15)
        const dayOfWeek = daysOfWeek[currentDate.getDay()];}
      const dayOfMonth = currentDate.getDate().toString();
      const timeSlots = await generateTimeSlots(startTime, endTime, step);
      const newappoinment = { userId,dayOfWeek, dayOfMonth, timeSlots, available:true};
      newappoinments.push(newappoinment);
    
}})
.catch((err) => {
  console.log('error  happend in AutdSchedule',err)
})



return newappoinments
}






  module.exports = {generateWeeklySchedules,AutdSchedule}