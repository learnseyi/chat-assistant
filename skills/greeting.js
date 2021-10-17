const getTime = require ('./timeOfDay');
const webex = require('webex');



module.exports = (controller)=> {
// controller.on('spawn',async(bot,message,trigger)=>{
//   const person = await bot.api.people.get({personId: message.user})
//   await bot.say(message,'Good Day ' + person.firstName)
// })
//     controller.hears('sample','message,direct_message', async (bot, message) => {
//         await bot.reply(message, 'I heard a sample message.');
//     });

    // controller.on('direct_message,message', async (bot, message,memberships) => {
    //     console.log("MESSAGE from: " +  getTime());
    //     // console.log(webex)
    //     await bot.reply(message, `Echo: ${ message.text}` );
    // });

    controller.on('user_space_join,direct_message,message', async (bot, message) =>{
      const person = await bot.api.people.get({personId: message.user})
      await bot.reply(message,` Good ${getTime()} ${person.firstName}, how can I help you today?`);
})


}


// module.exports = (async(bot)=>{
//   await bot.reply('hello how can I help you')
// })
// bot.api.people.get({personId:message.user})
// .then(curUser=> console.log(curUser))
// .catch(err=>{
//   console.log(err)
