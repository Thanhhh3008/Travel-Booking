// src/services/BookingTimeoutService.js
/**
 * BookingTimeoutService
 * ─────────────────────────────────────────────────────────────────────────────
 * Dùng Redis để theo dõi timeout thanh toán VNPay.
 *
 * Cơ chế hoạt động:
 *  1. Khi booking được tạo → gọi scheduleTimeout(bookingId) → set key Redis
 *     với TTL = PAYMENT_TIMEOUT_SECONDS (mặc định 10 phút).
 *  2. Background poller chạy mỗi POLL_INTERVAL_MS (mặc định 30 giây) → scan
 *     các booking TrangThai='0' đã quá hạn timeout → tự động CANCELLED.
 *  3. Khi VNPay callback thành công → gọi clearTimeout(bookingId) → xóa key
 *     Redis, ngăn poller cancel nhầm booking đã thanh toán.
 *
 * Key Redis format:  booking:timeout:<bookingId>
 * Value:             "<bookingId>"  (string đơn giản)
 * TTL:               600 giây (10 phút)
 * ─────────────────────────────────────────────────────────────────────────────
 */

const pool = require('../database/client');
const redisClient = require('./RedisClient');

const PAYMENT_TIMEOUT_SECONDS = 10 * 60; // 10 phút
const POLL_INTERVAL_MS = 30 * 1000;      // poll mỗi 30 giây
const KEY_PREFIX = 'booking:timeout:';

class BookingTimeoutService {
    constructor() {
        this._pollTimer = null;
    }

    // ─────────────────────────────────────────────────────────
    //  ĐẶT TIMEOUT CHO MỘT BOOKING (gọi ngay sau khi tạo booking)
    // ─────────────────────────────────────────────────────────
    async scheduleTimeout(bookingId) {
        try {
            const key = `${KEY_PREFIX}${bookingId}`;
            await redisClient.set(key, String(bookingId), {
                EX: PAYMENT_TIMEOUT_SECONDS,  // TTL 10 phút
            });
            console.log(`[BookingTimeout] ⏳ Đặt timeout ${PAYMENT_TIMEOUT_SECONDS}s cho booking #${bookingId}`);
        } catch (err) {
            // Redis lỗi → không block luồng chính, chỉ log
            console.error(`[BookingTimeout] ❌ Không thể set timeout cho booking #${bookingId}:`, err.message);
        }
    }

    // ─────────────────────────────────────────────────────────
    //  XÓA TIMEOUT KHI THANH TOÁN THÀNH CÔNG
    // ─────────────────────────────────────────────────────────
    async clearTimeout(bookingId) {
        try {
            const key = `${KEY_PREFIX}${bookingId}`;
            const deleted = await redisClient.del(key);
            if (deleted) {
                console.log(`[BookingTimeout] ✅ Đã xóa timeout cho booking #${bookingId} (thanh toán thành công)`);
            }
        } catch (err) {
            console.error(`[BookingTimeout] ❌ Không thể xóa timeout cho booking #${bookingId}:`, err.message);
        }
    }

    // ─────────────────────────────────────────────────────────
    //  KIỂM TRA BOOKING CÒN TRONG THỜI GIAN CHO PHÉP KHÔNG
    // ─────────────────────────────────────────────────────────
    async isStillPending(bookingId) {
        try {
            const key = `${KEY_PREFIX}${bookingId}`;
            const val = await redisClient.get(key);
            return val !== null; // còn key → còn trong thời gian thanh toán
        } catch (err) {
            console.error(`[BookingTimeout] ❌ Không thể kiểm tra timeout booking #${bookingId}:`, err.message);
            return true; // fallback an toàn: không cancel nếu Redis lỗi
        }
    }

    // ─────────────────────────────────────────────────────────
    //  CANCEL MỘT BOOKING ĐÃ HẾT HẠN THANH TOÁN
    // ─────────────────────────────────────────────────────────
    async _cancelExpiredBooking(bookingId) {
        try {
            const sql = `
                UPDATE chitietdatphong
                SET TrangThai = '2',
                    LichSu    = 'CANCELLED'
                WHERE MaChiTietDatPhong = ?
                  AND TrangThai = '0'
            `;
            // TrangThai = '2' → CANCELLED (nhả phòng cho người khác đặt)
            const [result] = await pool.execute(sql, [bookingId]);

            if (result.affectedRows > 0) {
                console.log(`[BookingTimeout] 🚫 Booking #${bookingId} đã bị HỦY do quá 10 phút chưa thanh toán`);
            } else {
                // Booking đã được thanh toán hoặc đã cancel rồi → bỏ qua
                console.log(`[BookingTimeout] ℹ️  Booking #${bookingId} không cần cancel (đã thanh toán hoặc cancel rồi)`);
            }
        } catch (err) {
            console.error(`[BookingTimeout] ❌ Lỗi khi cancel booking #${bookingId}:`, err.message);
        }
    }

    // ─────────────────────────────────────────────────────────
    //  BACKGROUND POLLER: quét các booking hết hạn
    // ─────────────────────────────────────────────────────────
    async _pollExpiredBookings() {
        try {
            // Lấy tất cả booking đang chờ thanh toán (TrangThai = '0')
            // mà đã tạo quá PAYMENT_TIMEOUT_SECONDS giây
            const sql = `
                SELECT MaChiTietDatPhong
                FROM chitietdatphong
                WHERE TrangThai = '0'
                  AND LichSu    = 'BOOKED'
                  AND NgayDatPhong <= DATE_SUB(NOW(), INTERVAL ? SECOND)
            `;
            const [rows] = await pool.execute(sql, [PAYMENT_TIMEOUT_SECONDS]);

            if (rows.length === 0) return;

            console.log(`[BookingTimeout] 🔍 Tìm thấy ${rows.length} booking hết hạn, đang kiểm tra Redis...`);

            for (const row of rows) {
                const bookingId = row.MaChiTietDatPhong;

                // Kiểm tra Redis: nếu key KHÔNG còn tồn tại → đã hết TTL → cancel
                const stillPending = await this.isStillPending(bookingId);
                if (!stillPending) {
                    await this._cancelExpiredBooking(bookingId);
                }
            }
        } catch (err) {
            console.error('[BookingTimeout] ❌ Lỗi polling expired bookings:', err.message);
        }
    }

    // ─────────────────────────────────────────────────────────
    //  KHỞI ĐỘNG POLLER (gọi 1 lần khi app start)
    // ─────────────────────────────────────────────────────────
    startPoller() {
        if (this._pollTimer) return; // đã chạy rồi

        console.log(`[BookingTimeout] 🚀 Khởi động background poller (interval=${POLL_INTERVAL_MS / 1000}s)`);
        this._pollTimer = setInterval(() => {
            this._pollExpiredBookings();
        }, POLL_INTERVAL_MS);

        // Unref để Node.js không bị giữ lại chỉ vì timer này
        if (this._pollTimer.unref) this._pollTimer.unref();
    }

    // ─────────────────────────────────────────────────────────
    //  DỪNG POLLER (dùng khi graceful shutdown)
    // ─────────────────────────────────────────────────────────
    stopPoller() {
        if (this._pollTimer) {
            clearInterval(this._pollTimer);
            this._pollTimer = null;
            console.log('[BookingTimeout] ⛔ Đã dừng background poller');
        }
    }
}

// Singleton – dùng chung toàn app
module.exports = new BookingTimeoutService();
