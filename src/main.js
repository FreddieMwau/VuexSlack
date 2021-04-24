// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import firebase from 'firebase/app'
import store from './store'
import auth from 'firebase/auth'
import VModal from 'vue-js-modal'


Vue.use(VModal)

Vue.config.productionTip = false


  // Your web app's Firebase configuration
  var firebaseConfig = {
    apiKey: "AIzaSyB9NOfTp6coEtQYQkjujYB7Mtf79FWK-Ik",
    authDomain: "slack-bf0f3.firebaseapp.com",
    projectId: "slack-bf0f3",
    storageBucket: "slack-bf0f3.appspot.com",
    messagingSenderId: "87503208022",
    appId: "1:87503208022:web:1a538fc9d3ce46651845f7"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  window.firebase = firebase;

  const unsubscribe = firebase.auth().onAuthStateChanged(user => {
    // dispatch user
    store.dispatch('setUser', user)
    
    new Vue({
      el: '#app',
      router,
      store,
      components: { App },
      template: '<App/>'
    });

      // recursion = this function calls itself on the auth state change
      unsubscribe()
    
  })


