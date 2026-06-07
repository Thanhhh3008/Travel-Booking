// src/services/RedisClient.js
/**
 * Singleton Redis Client
 * ─────────────────────────────────────────────────────────────────────────────
 * Khởi tạo và export một redis client duy nhất dùng chung cho toàn bộ app.
 * Thư viện: `redis` v4+ (đã có trong package.json)
 *
 * Biến môi trường:
 *   REDIS_URL  (mặc định: redis://127.0.0.1:6379)
 * ─────────────────────────────────────────────────────────────────────────────
 */

const { createClient } = require('redis');

const MAX_RETRIES = 5;

const client = createClient({
    url: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
    socket: {
        // Giới hạn reconnect tối đa MAX_RETRIES lần, mỗi lần cách 2 giây
        // Trả về Error để dừng hẳn (false = dừng ngay, không retry thêm)
        reconnectStrategy: (retries) => {
            if (retries >= MAX_RETRIES) {
                console.warn(`[Redis] ⚠️  Đã thử ${MAX_RETRIES} lần, dừng reconnect. App vẫn chạy bình thường (không có Redis).`);
                return false; // false = ngừng reconnect
            }
            const delay = 2000; // 2 giây mỗi lần retry
            console.log(`[Redis] 🔄 Thử kết nối lại lần ${retries + 1}/${MAX_RETRIES} sau ${delay}ms...`);
            return delay;
        },
    },
});

client.on('error', (err) => {
    // Chỉ log lỗi quan trọng, bỏ qua lỗi ECONNREFUSED thông thường khi reconnect
    if (!err.message.includes('ECONNREFUSED')) {
        console.error('[Redis] ❌ Redis Client Error:', err.message);
    }
});

client.on('connect', () => {
    console.log('[Redis] ✅ Đã kết nối Redis thành công');
});

// Kết nối ngay khi module được require
(async () => {
    try {
        await client.connect();
    } catch (err) {
        console.warn('[Redis] ⚠️  Không thể kết nối Redis:', err.message);
        console.warn('[Redis] ℹ️  App vẫn chạy bình thường. Tính năng timeout booking sẽ bị tắt.');
        // App vẫn tiếp tục chạy, timeout service sẽ graceful degrade
    }
})();

module.exports = client;
