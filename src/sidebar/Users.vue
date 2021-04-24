<template>
    <div>
        <div class="text-light">
            <h4>Users</h4>

            <div class="mt-4 mb-5">
                <button v-for="user in users" :key="user.uid" 
                class="list-group-item list-group-item-action" 
                type="button" 
                :class="{'active': isActive(user)}"
                @click.prevent="changeChannel(user)">
                    <span>
                        <span :class="{'fa fa-circle online': isOnline(user), 'fa fa-circle offline': !isOnline(user)}">
                        </span>
                        <img :src="user.avatar" class="img rounded-circle ml-2" height="20"/>
                        <span>
                            <a :class="{'text-light': isActive(user)}" href="#">{{user.name}}</a>
                            <!-- fix notification to privateMessages -->
                            <span v-if="getNotification(user) >= 1" class="float-right">{{getNotification(user)}}</span>
                        </span>
                    </span>
                </button>
            </div>

        </div>
    </div>
</template>

<script>
import database from 'firebase/database'
import {mapGetters} from 'vuex'
import mixins from '../mixins'

    export default {
        name: 'users',

        data() {
            return {
                users: [],
                usersRef: firebase.database().ref('users'),
                connectedRef: firebase.database().ref('.info/connected'),    // this path returns connected key if user is online
                presenceRef: firebase.database().ref('presence'),
                privateMessagesRef: firebase.database().ref('privateMessages'),
                notifCount: [],
                channel: null
            }
        },

        mixins: [mixins],

        computed: {
            ...mapGetters(['currentUser', 'currentChannel', 'isPrivate'])
        },

        watch: {
            isPrivate() {
                if(!this.isPrivate){
                    this.resetNotifications
                }
            }
        },

        methods: {
            addListeners(){
                // watches the child added event and return the snapshot
                this.usersRef.on('child_added', (snapshot) => {
                    if(this.currentUser.uid !==  snapshot.key){
                        // build user object and push to users[]
                        let user = snapshot.val()
                        user['uid'] = snapshot.key
                        user['status'] = 'offline'
                        this.users.push(user)
                    }
                })

                //use presenceRef child_Added and child_remove to show user status of online or offline
                this.presenceRef.on('child_added', snapshot => {
                    if(this.currentUser.uid !== snapshot.key){
                        //pass user to status method
                        this.addStatusToUser(snapshot.key)

                        // handlling notifications to private messages
                        let channelId = this.getChannelId(snapshot.key)
                        this.privateMessagesRef.child(channelId).on('value', snapshot => {
                            this.handleNotifications(channelId, this.currentChannel.id, this.notifCount, snapshot)
                        })
                    }
                })

                this.presenceRef.on('child_removed', snapshot => {
                    if(this.currentUser.uid !== snapshot.key){
                        //pass user to status method
                        this.addStatusToUser(snapshot.key, false)  
                        
                        this.privateMessagesRef.child(this.getChannelId(snapshot.key)).off()
                    }
                })

                // return connected to everyuser logged in
                this.connectedRef.on('value', snapshot => {
                    if(snapshot.val() === true){
                        let ref = this.presenceRef.child(this.currentUser.uid)
                        ref.set(true)
                        ref.onDisconnect().remove()
                    }
                })
            },

            isActive(user) {
                let channelId = this.getChannelId(user.uid)
                return this.currentChannel.id === channelId
            },

            getChannelId(userId){
                // making sure the 1st userId is smaller than the 2nd 
                return userId < this.currentUser.uid ? userId+'/'+this.currentUser.uid : this.currentUser.uid +'/'+ userId
            },

            // notification method
            getNotification(user){
                let channelId = this.getChannelId(user.uid)
                let notif = 0

                this.notifCount.forEach(el => {
                    if(el.id === channelId) {
                        notif = el.notif
                    }
                })
                return notif
            },

            // reset notification once read to 0
            resetNotifications(user = null){
                let channelId = null

                if(user !== null){
                    channelId = this.getChannelId(user.uid)
                } else {
                    channelId = this.channel.id
                } 

                let index = this.notifCount.findIndex(el => el.id === channelId)
                if(index !== -1){
                    this.notifCount[index].total = this.notifCount[index].lastKnownTotal
                    this.notifCount[index].notif = 0
                }
            },

            //add status to user method
            // connected is defaultly set to true
            addStatusToUser(userId, connected = true){
                let index = this.users.findIndex(user => user.uid === userId)
                if(index !== -1){
                    connected === true ? this.users[index].status = 'online' : this.users[index].status = 'offline'
                }
            },

            // change channel
            changeChannel(user){
                if(this.channel === null){
                    this.resetNotifications(user)
                } else {
                    this.resetNotifications()
                }
                // to change channel you need channelId and create a method that gets the channelId
                let channelId = this.getChannelId(user.uid)
                // create channel object with id and name
                let channel = {id: channelId, name: user.name}

                this.channel = channel

                this.$store.dispatch('setPrivate', true)
                this.$store.dispatch('setCurrentChannel', channel)

            },

            //is online method
            isOnline(user) {
                return user.status == 'online'
            },

            detachListeners(){
                // these will run on beforeDestroy lifecycle method 
                this.usersRef.off()
                this.presenceRef.off()
                this.connectedRef.off()

                this.channels.forEach(el => {
                   this.messagesRef.child(el.id).off()
                })
            }

        },

        // execute in mounted and before destroy
        mounted(){
            this.addListeners()
        },

        beforeDestroy(){
            this.detachListeners()
        }
    }
</script>

<style scoped>
    .chnnl{
        cursor: pointer;
    }

    .online{
        color: green;
    }

    .offline{
        color: red;
    }
</style>
