<template>
  <div class="main-container">
    <div v-if="!isUsernameEntered" class="login">
      <input type="text" v-model="username" class="username-input" />
      <button class="power-button" @click="sendInformations">
        <i class="fa-solid fa-power-off"></i>
      </button>
    </div>
    <div v-else class="application">
      <div class="contacts-list">
        <div
          class="contact-container"
          v-for="user in users"
          @click="selectUser(user)"
          :class="{ 'contact-selected': messageReceiverID === user.userID }"
        >
          <div class="contact-avatar">
            <div
              v-if="messageNotification(user.userID) != 0"
              class="notification"
            >
              {{ messageNotification(user.userID) }}
            </div>
          </div>
          <div class="contact-informations">
            <div class="contact-name">
              {{ user.username.toUpperCase() }}
            </div>
            <div class="contact-last-message">
              <span
                v-if="showLastMessage(user.userID).senderID === socket.id"
                :class="{
                  'my-last-message':
                    showLastMessage(user.userID).senderID === socket.id,
                }"
                >Sen:</span
              >
              {{ showLastMessage(user.userID).content }}
            </div>
          </div>
        </div>
      </div>
      <div class="chat-window" v-if="isUserSelected">
        <div class="messages-container">
          <div class="messages">
            <div v-for="message in displayingMessages">
              <div
                class="message-aligner"
                :class="{
                  'user-message-alignment': message.senderID === this.socket.id,
                }"
              >
                <div
                  class="message-box"
                  :class="{
                    'user-message-box': message.senderID === this.socket.id,
                  }"
                >
                  <div class="message-content">
                    {{ message.content }}
                  </div>
                  <div class="message-time">{{ message.time }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <input
          type="text"
          class="message-input"
          ref="messageInput"
          placeholder="Type Something to Send a Message"
          @keydown.enter="sendMessage($event.target.value)"
        />
      </div>
    </div>
  </div>
  <div v-for="a in allMessages">{{ a }}</div>
</template>

<script>
import io from "socket.io-client";
export default {
  data() {
    return {
      socket: {},
      users: [],
      allMessages: [],
      displayingMessages: [],
      unseenMessages: [],
      username: "",
      userAvatar: "",
      messageReceiverID: "",
      isUsernameEntered: false,
      isUserSelected: false,
    };
  },
  mounted() {
    this.socket = io("http://localhost:3000");
    this.socket.on("connect", () => {});
    this.socket.on("setOnlineUsers", (data) => {
      this.users = data.filter((user) => user.username !== this.username);
    });
    this.socket.on(
      "receiveMessage",
      (message, senderID, receiverID, time, isSeen) => {
        if (this.socket.id === senderID || this.socket.id === receiverID) {
          this.getMessage(message, senderID, receiverID, time, isSeen);
        }
        if (this.messageReceiverID === senderID) {
          this.sendSeenInfo();
        }
      }
    );
    this.socket.on("SeenInfo", (senderID) => {
      console.log("görüld");
    });
  },
  methods: {
    showLastMessage(id) {
      let userChat = this.allMessages.filter((message) => {
        return message.senderID === id || message.receiverID === id;
      });

      return userChat.length > 0 ? userChat[userChat.length - 1] : false;
    },
    getMessage(message, senderID, receiverID, time, isSeen) {
      if (senderID !== this.socket.id) {
        this.unseenMessages.push({
          content: message,
          senderID,
          receiverID,
          time,
          isSeen,
        });
      }
      this.allMessages.push({
        content: message,
        senderID,
        receiverID,
        time,
        isSeen,
      });
      this.setDisplayingMessages();
    },
    sendInformations() {
      this.isUsernameEntered = true;
      this.socket.emit(
        "OnlineUser",
        this.username,
        this.socket.id,
        this.userAvatar,
        false
      );
    },
    sendMessage(message) {
      if (this.$refs.messageInput.value != "") {
        this.socket.emit(
          "Message",
          message,
          this.socket.id,
          this.messageReceiverID,
          new Date().getHours() + ":" + new Date().getMinutes(),
          false
        );
        this.getMessage(
          message,
          this.socket.id,
          this.messageReceiverID,
          new Date().getHours() + ":" + new Date().getMinutes(),
          false
        );
        this.$refs.messageInput.value = "";
      }
    },
    sendSeenInfo() {
      this.socket.emit("SendSeenInfo", this.socket.id, this.messageReceiverID);
      this.unseenMessages = this.unseenMessages.filter(
        (message) => message.senderID !== this.messageReceiverID
      );
    },
    selectUser(user) {
      if (!this.isUserSelected) {
        this.isUserSelected = true;
      }
      this.messageReceiverID = user.userID;
      this.setDisplayingMessages();
      this.sendSeenInfo();
    },
    setDisplayingMessages() {
      this.displayingMessages = this.allMessages.filter((message) => {
        return (
          this.messageReceiverID === message.receiverID ||
          this.messageReceiverID === message.senderID
        );
      });
    },
    messageNotification(userID) {
      let number = 0;
      this.unseenMessages.forEach((message) => {
        if (message.senderID === userID) {
          number++;
        }
      });
      return number;
    },
    dateControl() {
      if (this.allMessages != []) {
        return this.allMessages.some((message) => {
          message.senderID === this.messageReceiverID ||
            this.socket.id === message.senderID;
        });
      } else {
        return false;
      }
    },
  },
};
</script>
