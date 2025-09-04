// server/scripts/backfillNotifications.js
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Post = require('../models/Post');
const User = require('../models/User');
const Notification = require('../models/Notification');

async function main() {
  await mongoose.connect(process.env.MONGO_URI);

  const posts = await Post.find().populate('author comments.author comments.replies.author comments.replies.replies.author');
  let count = 0;

  for (const post of posts) {
    // Comments
    for (const comment of post.comments) {
      // Notify post author for comment
      if (post.author._id.toString() !== comment.author._id.toString()) {
        const exists = await Notification.findOne({
          recipient: post.author._id,
          sender: comment.author._id,
          message: { $regex: comment.content.substring(0, 20) }
        });
        if (!exists) {
          await Notification.create({
            recipient: post.author._id,
            sender: comment.author._id,
            message: `${comment.author.username} commented on your post: "${comment.content.substring(0, 100)}"`,
            link: `/posts/${post._id}`
          });
          console.log(`[Comment] Notification created for recipient: ${post.author.username} (ID: ${post.author._id}) from sender: ${comment.author.username} (ID: ${comment.author._id})`);
          count++;
        }
      }
      // Replies to comment
      for (const reply of comment.replies) {
        if (comment.author._id.toString() !== reply.author._id.toString()) {
          const exists = await Notification.findOne({
            recipient: comment.author._id,
            sender: reply.author._id,
            message: { $regex: reply.content.substring(0, 20) }
          });
          if (!exists) {
            await Notification.create({
              recipient: comment.author._id,
              sender: reply.author._id,
              message: `${reply.author.username} replied to your comment: "${reply.content.substring(0, 100)}"`,
              link: `/posts/${post._id}`
            });
            console.log(`[Reply] Notification created for recipient: ${comment.author.username} (ID: ${comment.author._id}) from sender: ${reply.author.username} (ID: ${reply.author._id})`);
            count++;
          }
        }
        // Replies to replies (nested)
        if (reply.replies && reply.replies.length > 0) {
          for (const subReply of reply.replies) {
            if (reply.author._id.toString() !== subReply.author._id.toString()) {
              const exists = await Notification.findOne({
                recipient: reply.author._id,
                sender: subReply.author._id,
                message: { $regex: subReply.content.substring(0, 20) }
              });
              if (!exists) {
                await Notification.create({
                  recipient: reply.author._id,
                  sender: subReply.author._id,
                  message: `${subReply.author.username} replied to your comment: "${subReply.content.substring(0, 100)}"`,
                  link: `/posts/${post._id}`
                });
                console.log(`[SubReply] Notification created for recipient: ${reply.author.username} (ID: ${reply.author._id}) from sender: ${subReply.author.username} (ID: ${subReply.author._id})`);
                count++;
              }
            }
          }
        }
      }
    }
  }

  console.log(`Backfilled ${count} notifications.`);
  mongoose.disconnect();
}

main().catch(err => {
  console.error(err);
  mongoose.disconnect();
});