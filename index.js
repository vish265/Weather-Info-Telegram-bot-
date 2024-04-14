const request = require('request');
const TelegramBot = require('node-telegram-bot-api');

const token = 'YOUR_TELEGRAM_BOT_TOKEN';
const bot = new TelegramBot(token, { polling: true });

// Store subscribed users
let subscribedUsers = [];

// Admin chat ID (replace with your admin chat ID)
const adminChatId = 'YOUR_ADMIN_CHAT_ID';

bot.on('message', function(msg) {
    const chatId = msg.chat.id;
    const messageText = msg.text;

    if (messageText.startsWith('/subscribe')) {
        if (!subscribedUsers.includes(chatId)) {
            subscribedUsers.push(chatId);
            bot.sendMessage(chatId, 'You have subscribed for weather updates.');
        } else {
            bot.sendMessage(chatId, 'You are already subscribed for weather updates.');
        }
    } else if (messageText.startsWith('/unsubscribe')) {
        const index = subscribedUsers.indexOf(chatId);
        if (index !== -1) {
            subscribedUsers.splice(index, 1);
            bot.sendMessage(chatId, 'You have unsubscribed from weather updates.');
        } else {
            bot.sendMessage(chatId, 'You are not subscribed for weather updates.');
        }
    } else if (messageText.startsWith('/admin')) {
        // Check if the message is from admin
       
        if (parseInt(chatId) !== parseInt(adminChatId)) {
            bot.sendMessage(chatId, 'You are not authorized to access the admin panel.');
            return;
        }

        // Parse admin commands
        const command = messageText.split(' ')[1];
        if (command === 'settings') {
            // Implement settings management logic (e.g., updating API keys)
            bot.sendMessage(chatId, 'Admin settings panel: WIP');
        } else if (command === 'block') {
            const userId = parseInt(messageText.split(' ')[2]);
            const index = subscribedUsers.indexOf(userId);
            if (index !== -1) {
                subscribedUsers.splice(index, 1);
                bot.sendMessage(userId, 'You have been blocked from receiving weather updates.');
                bot.sendMessage(chatId, `User ${userId} has been blocked.`);
            } else {
                bot.sendMessage(chatId, 'User not found in subscription list.');
            }
        } else if (command === 'delete') {
            const userId = parseInt(messageText.split(' ')[2]);
            const index = subscribedUsers.indexOf(userId);
            if (index !== -1) {
                subscribedUsers.splice(index, 1);
                bot.sendMessage(userId, 'You have been deleted from the subscription list.');
                bot.sendMessage(chatId, `User ${userId} has been deleted from the subscription list.`);
            } else {
                bot.sendMessage(chatId, 'User not found in subscription list.');
            }
        }else if (command === 'subscribers') {
            // Send list of subscribers to admin
            const subscribersList = subscribedUsers.join('\n');
            bot.sendMessage(chatId, `Subscribed users:\n${subscribersList}`);
        } else {
            bot.sendMessage(chatId, 'Invalid admin command.');
        }
    } else if (subscribedUsers.includes(chatId)) {
        // Process weather update request only if the user is subscribed
        request(`http://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(messageText)}&appid=cf91234d8163156444f40244819557fe`, function(error, response, body) {
            if (error) {
                bot.sendMessage(chatId, 'Error occurred while fetching weather data.');
                return;
            }

            const weatherData = JSON.parse(body);
            if (weatherData.cod === 200) {
                const temperature = (weatherData.main.temp - 273.15).toFixed(2);
                const weatherDescription = weatherData.weather[0].description;

                const message = `Weather in ${messageText}:
Temperature: ${temperature}°C
Description: ${weatherDescription}`;

                bot.sendMessage(chatId, message);
            } else {
                bot.sendMessage(chatId, 'Weather information is not available for the specified city.');
            }
        });
    }
});






