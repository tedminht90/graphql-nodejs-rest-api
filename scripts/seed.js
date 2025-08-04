const { faker } = require('@faker-js/faker');
const { Writable } = require('stream');
const copyFrom = require('pg-copy-streams').from;
const pool = require('../src/config/db');

const BATCH_SIZE = 10000; // Chèn 10,000 bản ghi mỗi lần
const TOTAL_RECORDS = 1000000; // Tổng số bản ghi cần chèn

// Sử dụng Set để đảm bảo email là duy nhất
const generatedEmails = new Set();

// Hàm tạo một người dùng giả với email duy nhất
function createRandomUser() {
    let email;
    // Tiếp tục tạo email mới cho đến khi nó là duy nhất
    do {
        email = faker.internet.email().toLowerCase();
    } while (generatedEmails.has(email));

    // Thêm email vừa tạo vào Set
    generatedEmails.add(email);

    return {
        name: faker.person.fullName(),
        email: email,
    };
}

// Hàm chính để chèn dữ liệu
async function seedDatabase() {
    const client = await pool.connect();
    console.log(`Bắt đầu chèn ${TOTAL_RECORDS} bản ghi...`);

    const startTime = Date.now();

    try {
        // Bắt đầu một transaction
        await client.query('BEGIN');

        // Sử dụng pg-copy-streams để chèn dữ liệu hiệu quả
        const stream = client.query(copyFrom('COPY test_nodejs.users (name, email) FROM STDIN'));
        let recordsPushed = 0;

        // Hàm để đẩy dữ liệu vào stream
        const pushNextBatch = () => {
            for (let i = 0; i < BATCH_SIZE && recordsPushed < TOTAL_RECORDS; i++) {
                const user = createRandomUser();
                // Dữ liệu cho COPY FROM STDIN phải được phân tách bằng tab và kết thúc bằng dòng mới
                const line = `${user.name}\t${user.email}\n`;
                const canContinue = stream.write(line);
                recordsPushed++;

                if (recordsPushed % 100000 === 0) {
                    console.log(`Đã chuẩn bị ${recordsPushed} / ${TOTAL_RECORDS} bản ghi...`);
                }

                if (!canContinue) {
                    stream.once('drain', pushNextBatch);
                    return;
                }
            }

            if (recordsPushed < TOTAL_RECORDS) {
                setImmediate(pushNextBatch); // Sử dụng setImmediate để tránh tràn stack
            } else {
                stream.end();
            }
        };

        // Bắt đầu quá trình
        pushNextBatch();

        // Đợi stream kết thúc
        await new Promise((resolve, reject) => {
            stream.on('finish', resolve);
            stream.on('error', reject);
        });

        // Commit transaction
        await client.query('COMMIT');
        const endTime = Date.now();
        const duration = (endTime - startTime) / 1000; // tính bằng giây
        console.log(`Hoàn thành! Đã chèn thành công ${recordsPushed} bản ghi trong ${duration.toFixed(2)} giây.`);

    } catch (error) {
        // Rollback nếu có lỗi
        await client.query('ROLLBACK');
        console.error('Lỗi khi chèn dữ liệu:', error);
    } finally {
        // Giải phóng client
        client.release();
        pool.end(); // Đóng pool sau khi hoàn thành
    }
}

seedDatabase();