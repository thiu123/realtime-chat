/**
 * Script chạy MỘT LẦN để sửa dữ liệu cũ.
 *
 * Vì sao cần?
 * Trước đây schema khai báo `@Prop({ type: Types.ObjectId })`. Cách viết này bị
 * @nestjs/mongoose hiểu thành kiểu `Mixed`, nên các khoá ngoại (conversationId,
 * senderId, lastMessage, participants) bị lưu xuống MongoDB dưới dạng CHUỖI thay
 * vì ObjectId. Hệ quả: câu aggregate đếm tin nhắn chưa đọc không khớp được document
 * nào và `unreadCount` luôn bằng 0.
 *
 * Schema đã được sửa lại thành `MongooseSchema.Types.ObjectId`. Script này đổi nốt
 * dữ liệu cũ sang ObjectId cho khớp.
 *
 * Cách chạy (nhớ backup database trước):
 *   npm run migrate:object-ids
 */
require('dotenv').config();
const mongoose = require('mongoose');

const { ObjectId } = mongoose.Types;

/** Đổi chuỗi id sang ObjectId; giá trị nào đã đúng kiểu thì trả về null (khỏi ghi lại). */
function toObjectId(value) {
  if (typeof value !== 'string' || !ObjectId.isValid(value)) {
    return null;
  }

  return new ObjectId(value);
}

/** Đổi cả mảng id. Trả về null nếu không có phần tử nào cần đổi. */
function toObjectIdArray(values) {
  if (!Array.isArray(values)) {
    return null;
  }

  let changed = false;
  const converted = values.map((value) => {
    const objectId = toObjectId(value);
    if (objectId) {
      changed = true;
      return objectId;
    }

    return value;
  });

  return changed ? converted : null;
}

/**
 * Duyệt toàn bộ document của một collection và sửa các field được liệt kê.
 * @param {string} collectionName tên collection
 * @param {string[]} idFields các field chứa 1 id
 * @param {string[]} idArrayFields các field chứa mảng id
 */
async function migrateCollection(collectionName, idFields, idArrayFields) {
  const collection = mongoose.connection.db.collection(collectionName);
  const documents = await collection.find({}).toArray();

  const operations = [];

  for (const document of documents) {
    const changes = {};

    for (const field of idFields) {
      const objectId = toObjectId(document[field]);
      if (objectId) {
        changes[field] = objectId;
      }
    }

    for (const field of idArrayFields) {
      const objectIds = toObjectIdArray(document[field]);
      if (objectIds) {
        changes[field] = objectIds;
      }
    }

    if (Object.keys(changes).length > 0) {
      operations.push({
        updateOne: { filter: { _id: document._id }, update: { $set: changes } },
      });
    }
  }

  if (operations.length === 0) {
    console.log(`- ${collectionName}: không có gì phải sửa`);
    return;
  }

  await collection.bulkWrite(operations);
  console.log(`- ${collectionName}: đã sửa ${operations.length} document`);
}

async function main() {
  const uri =
    process.env.MONGODB_URL || 'mongodb://localhost:27017/realtime-chat';

  await mongoose.connect(uri);
  console.log('Đã kết nối database, bắt đầu chuyển đổi...');

  await migrateCollection('messages', ['conversationId', 'senderId'], ['readBy']);
  await migrateCollection('conversations', ['lastMessage'], ['participants']);

  await mongoose.disconnect();
  console.log('Xong.');
}

main().catch(async (error) => {
  console.error('Lỗi khi chuyển đổi:', error);
  await mongoose.disconnect();
  process.exit(1);
});
