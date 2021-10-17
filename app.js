require('dotenv').config()
const path = require('path')
const { v4: uuidv4 } = require('uuid');
const {Botkit} = require('botkit');
const { WebexAdapter } = require('botbuilder-adapter-webex');
var public_url = process.env.PUBLIC_URL;
const adapter = new WebexAdapter({
    access_token: process.env.WEBEX_ACCESS_TOKEN,
    public_address: public_url ? public_url : 'http://127.0.0.1',
    secret: ( process.env.WEBSOCKET_EVENTS === 'True' ) ? null : uuidv4()
});

const controller = new Botkit({
    webhook_uri: '/api/messages',
    adapter: adapter,
});


// Express response stub to supply to processWebsocketActivity

class responseStub {
    status(){}
    end(){}
}

function processWebsocketActivity( event ) {
    // Express request stub to fool the Activity processor
    let requestStub = {};
    // Event details are expected in a 'body' property
    requestStub.body = event;

    // Hand the event off to the Botkit activity processory
    controller.adapter.processActivity( requestStub, new responseStub, controller.handleTurn.bind( controller ) )
}

controller.ready( async () => {
    // load  bot skills
controller.removeDeviceRegistrationsOnStart = true;
    controller.loadModules(path.join(__dirname, 'skills'));

    if ( ( !public_url ) && ( process.env.WEBSOCKET_EVENTS !== 'True' ) ) {
        console.log( '\n-->No inbound event channel available.  Please configure at least one of PUBLIC_URL and/or WEBSOCKET_EVENTS' );
        process.exit( 1 );
    }

    if ( public_url ) {
        // Make the app public_url available to feature modules, for use in adaptive card content links
        controller.public_url = public_url;

    }

    if ( process.env.WEBSOCKET_EVENTS == 'True' ) {
        await controller.adapter._api.memberships.listen();
        controller.adapter._api.memberships.on( 'created', ( event ) => processWebsocketActivity( event ) );
        controller.adapter._api.memberships.on( 'updated', ( event ) => processWebsocketActivity( event ) );
        controller.adapter._api.memberships.on( 'deleted', ( event ) => processWebsocketActivity( event ) );

        await controller.adapter._api.messages.listen();
        controller.adapter._api.messages.on('created', ( event ) => processWebsocketActivity( event ) );
        controller.adapter._api.messages.on('deleted', ( event ) => processWebsocketActivity( event ) );

        await controller.adapter._api.attachmentActions.listen();
        controller.adapter._api.attachmentActions.on('created', ( event ) => processWebsocketActivity( event ) );

        // Remove unnecessary auto-created webhook subscription
        await controller.adapter.resetWebhookSubscriptions();

        console.log( 'Using websockets for incoming messages/events');
    }
    else {
        // Register attachmentActions webhook
        controller.adapter.registerAdaptiveCardWebhookSubscription( controller.getConfig( 'webhook_uri' ) );
    }
});
if (public_url) {
    controller.publicFolder('/www', __dirname + '/www');

    controller.webserver.get('/', (req, res) => {
        res.send(JSON.stringify(controller.botCommons, null, 4));
    });

    console.log('Health check available at: ' + public_url);
}
controller.commandHelp = [];

controller.checkAddMention = function (roomType, command) {

    var botName = adapter.identity.displayName;

    if (roomType === 'group') {

        return `\`@${botName} ${command}\``
    }

    return `\`${command}\``
}


// const secret = process.env.PUBLIC_URL
// controller.hears('hi','direct_message', async(bot, message) => {
//   await console.log(message)
//     await bot.reply(message, `I heard a message! ${message.reference.user.name}`);
// });
