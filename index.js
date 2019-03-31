const awsIot = require('aws-iot-device-sdk');
const five = require('johnny-five');
const Raspi = require('raspi-io').RaspiIO;

const logger = require('./logger');

require('dotenv').config();

const board = new five.Board({ io: new Raspi() });

const { keyPath, certPath, caPath, clientId, host, debug, thingName } = process.env;
const config = { keyPath, certPath, caPath, clientId, host, debug };

const thingShadows = awsIot.thingShadow(config);

board.on('ready', () => {
  const thermometer = new five.Thermometer({ controller: 'MCP9808' });

  thingShadows.on('status', (name, stat, _, stateObject) => {
    logger.info(`received ${stat} on ${name}: ${JSON.stringify(stateObject)}`)
    if (stat === 'accepted') process.exit();
  });

  thingShadows.on('connect', () => {
    logger.info('connected');

    thingShadows.register(thingName, () => {
      logger.info('registered');

      thermometer.on('data', function() {
        const temp = Math.trunc(this.F);
        this.disable();
        logger.info(`temp: ${temp}`);

        const thingState = { state: { reported: { temp } } };
        const update = thingShadows.update(thingName, thingState)
        if (update === null) logger.error('failed');
      });
    });
  });
});
