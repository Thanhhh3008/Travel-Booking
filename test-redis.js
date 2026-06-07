const redisClient = require('./src/services/RedisClient');

async function testRedis() {
    console.log('⏳ Bắt đầu test Redis...');

    try {
        // Đợi một chút để client connect (nếu chưa)
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 1. Test ghi dữ liệu với TTL (5 giây)
        console.log('📝 Đang ghi dữ liệu: test_key = "Hello TripStay" (TTL: 5s)');
        await redisClient.set('test_key', 'Hello TripStay', { EX: 5 });

        // 2. Test đọc dữ liệu ngay lập tức
        const value = await redisClient.get('test_key');
        console.log(`✅ Đọc dữ liệu thành công: test_key = "${value}"`);

        // 3. Test đợi hết hạn TTL
        console.log('⏳ Đợi 6 giây để xem key có tự động bị xóa (hết hạn) không...');
        await new Promise(resolve => setTimeout(resolve, 6000));

        // 4. Test đọc lại sau khi hết hạn
        const valueAfter = await redisClient.get('test_key');
        if (valueAfter === null) {
            console.log('✅ Key đã tự động xóa thành công sau khi hết hạn (TTL hoạt động tốt)!');
        } else {
            console.log(`❌ Lỗi: Key vẫn còn tồn tại: ${valueAfter}`);
        }

        console.log('🎉 Test hoàn tất!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Lỗi khi test Redis:', err.message);
        process.exit(1);
    }
}

testRedis();
