import { createStore } from 'vuex'

const store = createStore({
    state () {
        return {
            state: {
              activeUsers : "sfakjfsaklfsa"
          }
      }
    },
    getters: {
        activeUsers(state) {
            return state;
        }
    },
    mutations: {
        addUser(state, userInformation) {
            state.activeUsers = userInformation;
        }
    }
})
  
export default store;