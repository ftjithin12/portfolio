/**
 * Command Registry
 * Registers all public and administrative bot commands
 */

const startCommand = require('./start');
const helpCommand = require('./help');
const aboutCommand = require('./about');
const portfolioCommand = require('./portfolio');
const servicesCommand = require('./services');
const pricingCommand = require('./pricing');
const coursesCommand = require('./courses');
const faqCommand = require('./faq');
const contactCommand = require('./contact');
const adminCommand = require('./admin');

function registerCommands(bot) {
  bot.command('start', startCommand);
  bot.command('help', helpCommand);
  bot.command('about', aboutCommand);
  bot.command('portfolio', portfolioCommand);
  bot.command('services', servicesCommand);
  bot.command('pricing', pricingCommand);
  bot.command('courses', coursesCommand);
  bot.command('faq', faqCommand);
  bot.command('contact', contactCommand);
  bot.command('admin', adminCommand);
}

module.exports = {
  registerCommands,
  startCommand,
  helpCommand,
  aboutCommand,
  portfolioCommand,
  servicesCommand,
  pricingCommand,
  coursesCommand,
  faqCommand,
  contactCommand,
  adminCommand
};
