<template>
  <div class="main-container">
    <div v-if="!isUsernameEntered" class="info-window">
      <div>
        <h2>Enter Your Name</h2>
        <input
          class="name-input"
          type="text"
          v-model="username"
          @keydown.enter="sendInformations"
        />
      </div>
      <div class="upload-part">
        <h2>Upload Your Avatar</h2>
        <span style="font-size: small; margin-bottom: 1rem"
          >For example : https://i.redd.it/b1vou6aalqr81.jpg</span
        >
        <input ref="avatarUpload" type="file" style="display: none" />
        <input
          class="name-input"
          type="text"
          placeholder="Image URL"
          v-model="userAvatar"
        />
        <div v-if="userAvatar !== ''" class="avatar-preview-container">
          <img class="avatar" :src="userAvatar" />
        </div>
      </div>
    </div>
    <div v-else class="chat-window">
      <div class="user-information">
        WELCOME ABOARD
        <span style="margin-left: 0.5rem; color: #ffc107">{{
          username.toUpperCase()
        }}</span>
      </div>
      <div class="application">
        <div
          class="contacts"
          :class="{ 'set-center': !isUserSelected && users.length === 0 }"
        >
          <div class="info-text" v-if="users.length === 0">
            It seems like you are single here ...
          </div>
          <button
            class="contact-container"
            :class="{ 'contact-selected': messageReceiverID === user.userID }"
            v-for="user in users"
            @click="selectUser(user)"
          >
            <div
              class="contact-photo-container"
              :class="{
                'contact-photo-selected': messageReceiverID === user.userID,
              }"
            >
              <img class="contact-photo" :src="user.avatar" />
            </div>
            <div class="contact-informations">
              <div class="contact-name">{{ user.username }}</div>
              <div class="last-message"></div>
            </div>
          </button>
        </div>
        <div class="chat-box" :class="{ 'set-center': !isUserSelected }">
          <div v-if="!isUserSelected && users.length !== 0" class="info-text">
            Select a chat to start messaging
          </div>
          <div v-else class="chat-area">
            <div v-for="message in messages">
              <div
                v-if="
                  message.senderID === messageReceiverID ||
                  message.receiverID === messageReceiverID
                "
                class="message-box-container"
                :class="{ 'align-right': message.senderID === this.socket.id }"
              >
                <div
                  class="message-box"
                  :class="{ 'my-message': message.senderID === this.socket.id }"
                >
                  {{ message.content }}
                </div>
              </div>
            </div>
          </div>
          <div class="type-area" v-if="isUserSelected">
            <input
              ref="messageInput"
              class="type-input"
              placeholder="Type Something to Send"
              @keydown.enter="sendMessage($event.target.value)"
            />
          </div>
        </div>
      </div>
      <div class="footer">Socket ID : {{ socket.id }}</div>
    </div>
  </div>
</template>

<script>
import io from "socket.io-client";
export default {
  data() {
    return {
      socket: {},
      users: [],
      messages: [],
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
      console.log(this.users);
    });
    this.socket.on("receiveMessage", (message, senderID, receiverID) => {
      this.displayMessage(message, senderID, receiverID);
    });
  },
  methods: {
    test() {
      console.log(this.$refs.URLInput);
    },
    sendInformations() {
      this.isUsernameEntered = true;
      this.socket.emit(
        "OnlineUser",
        this.username,
        this.socket.id,
        this.userAvatar
      );
    },
    displayMessage(message, senderID, receiverID) {
      this.messages.push({ content: message, senderID, receiverID });
    },
    sendMessage(message) {
      this.socket.emit(
        "Message",
        message,
        this.socket.id,
        this.messageReceiverID
      );
      this.displayMessage(message, this.socket.id, this.messageReceiverID);
      this.$refs.messageInput.value = "";
    },
    selectUser(user) {
      if (!this.isUserSelected) {
        this.isUserSelected = true;
      }
      this.messageReceiverID = user.userID;
    },
  },
};
</script>
