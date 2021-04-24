<template>
    <div>
        <div class="jumbotron bg-primary text-white text-center">
            <h2 class="lead display-4"># Conversations #</h2>
            <hr style="border: 1px solid grey;">
            <div class="row align">
                <i class="fas fa-microphone-alt mr-2"></i>
                <br>
                <p>Realtime communication at it's best!</p>
                <i class="fas fa-microphone-alt ml-2"></i>
            </div>
        </div>

        <!-- show loading state -->
        <div class="alert alert-info" v-if="loading">Processing .....</div>

        <!-- show error message -->
        <div class="alert alert-danger" v-if="hasErrors">
            <div v-for="error in errors" :key="error">{{ error }}</div>
        </div>

        <div class="container-fluid">
            <div class="row mt-3">
                <div class="col text-center">
                    <button @click="loginWithGoogle" class="btn btn-outline-danger btn-lg">Log in with Google</button>
                </div>
            </div>
            <div class="row mt-4">
                <div class="col text-center">
                    <button @click="loginWithTwitter" class="btn btn-outline-info btn-lg">Log in with Twitter</button>
                </div>
            </div>
        </div>

        <footer>
            <p class="copyright">&copy; 2021 ^_^ Creations</p>
        </footer>
    </div>
</template>

<script>
import auth from 'firebase/auth'
import database from 'firebase/database'
    export default {
        name: 'login',

        data() {
            return{
                errors: [],
                loading: false,
                usersRef: firebase.database().ref('users')
            }
        },

        computed: {
            hasErrors() {
                return this.errors.length > 0
            }
        },

        methods: {
            loginWithGoogle(){
                // set loading state true
                this.loading = true
                // clear old errors
                this.errors = []
                firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider())
                .then((response) => {
                    //pass user to save in db
                    this.saveUserToUsersRef(response.user)
                    //dispatch setUser action
                    this.$store.dispatch('setUser', response.user)
                    //redirect to chat page '/'
                    this.$router.push('/')                    
                })
                .catch(error => {
                    this.errors.push(error.message)
                    // set loading state false
                    this.loading = false
                })
            },
            // save user to database
            saveUserToUsersRef(user){
                return this.usersRef.child(user.uid).set({
                    name: user.displayName,
                    avatar: user.photoURL
                })
            },
            loginWithTwitter(){
                // set loading state true
                this.loading = true
                // clear old errors
                this.errors = []
                firebase.auth().signInWithPopup(new firebase.auth.TwitterAuthProvider())
                .then((response) => {
                    //dispatch setUser action
                    this.$store.dispatch('setUser', response.user)
                    //redirect to chat page '/'
                    this.$router.push('/')                    
                })
                .catch(error => {
                    this.errors.push(error.message)
                    // set loading state false
                    this.loading = false
                })
            }
        }
    }
</script>

<style>
    .btn, .jumbotron{
        border-radius: 5px;
    }
    .jumbotron{
        height: 35vh;
        justify-content: center;
    }
    .copyright{
        border-top: 1px solid #c5c5c5;
        padding: 5px 5px;
        text-align: center;
        margin-top: 180px;
        color: #555555;
        font-size: 15px;
    }
    .align{
        justify-content: center;
    }
</style>
