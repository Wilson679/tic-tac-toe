const Ably = require('ably');

// 初始化 Ably 客户端
const ably = new Ably.Realtime({ key: process.env.ABLY_API_KEY });

// 获取一个频道
const channel = ably.channels.get('tic-tac-toe');

// 发布消息到频道
function publishMessage(event, data) {
    console.log(`尝试发布消息: ${event}`, data);
    channel.publish(event, data, (err) => {
        if (err) {
            console.error('发布消息失败:', err);
        } else {
            console.log(`消息已成功发布: ${event}`, data);
        }
    });
}

// 订阅频道消息
function subscribeToMessages(event, callback) {
    console.log(`订阅事件: ${event}`);
    channel.subscribe(event, (message) => {
        console.log(`收到消息: ${event}`, message.data);
        callback(message.data);
    });
}

module.exports = {
    publishMessage,
    subscribeToMessages,
};
