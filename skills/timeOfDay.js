

const time = new Date();


// check current time and return time of the day
const getTime = ()=>{
  let timeOfDay = ' ';
  if(time.getHours() < 12){
    timeOfDay = 'Morning';
  }else if(time.getHours() >= 12 && time.getHours() < 17){
    timeOfDay = 'Afternoon';
  }else{
    timeOfDay = 'Evening';
  }
return  timeOfDay;
}

module.exports = getTime
