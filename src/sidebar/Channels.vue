<template>
    <div>
        <button @click.prevent="show" class="btn btn-outline-primary">Add Channel</button>

        <!-- show list of channels -->
        <div class="mt-4">
            <button v-for="channel in channels" 
            :key="channel" 
            class="list-group-item list-group-item-action" 
            type="button" 
            :class="{'active': setActiveChannel(channel)}" 
            @click="changeChannel(channel)">
                {{channel.name}}
                    <span 
                        v-if="getNotification(channel) > 0 && channel.id != currentChannel.id" 
                        class="float-right">
                        {{getNotification(channel)}}
                    </span>
            </button>
        </div>

        <modal name="modal-element" id="channelModal" @opened="opened">
           <form action="#" class="form">
               <div class="form-group mdl">
                   <h2 for="channelName" class="ml-3 mt-3">Channel Name</h2>
                   <div class="container-fluid">
                       <input v-model="new_channel" class="mt-4 ml-20" type="text" id="channelName" name="channelName" @keydown.shift.tab.prevent="">
                       <!-- errors -->
                       <ul class="list-group" v-if="hasErrors">
                           <li class="list-group-item text-danger" v-for="error in errors" :key="error">{{error}}</li>
                       </ul>
                        <br>
                        <button @click.prevent="hide" class="mt-4 mr-3 btn btn-secondary" >Cancel</button>
                        <button @click.prevent="addChannel" class="mt-4 btn btn-primary" >Add Channel</button>
                   </div>
                   
               </div>
           </form>
        </modal>      

        
    </div>
</template>

<script>
import database from 'firebase/database'
import {mapGetters} from 'vuex'
import mixins from '../mixins'


    export default {
        name: 'channels',

        data(){
            return {
                new_channel: '',
                errors: [],
                channelsRef: firebase.database().ref('channels'),
                messagesRef: firebase.database().ref('messages'),
                notifCount: [],
                channels: [],
                channel: null
            }
        },

        mixins: [mixins],

        computed: {
            ...mapGetters(['currentChannel', 'isPrivate']),

            hasErrors() {
                return this.errors.length > 0
            }
        },

        watch: {
            isPrivate(){
                if(this.isPrivate){
                    this.resetNotifications()
                }
            }
        },

        methods: {
           show(){
               this.$modal.show('modal-element');
           },

           opened(){
               this.$refs.name.focus()
           },

           hide(){
               this.$modal.hide('modal-element')
           },

           //add channel
           addChannel(){
               this.errors = []
               // get key for the channel created
               let key = this.channelsRef.push().key
               // minimum info to create a channel is ID and name
               let newChannel = {id: key, name: this.new_channel}
               //create channel in db with the key assigned
               this.channelsRef.child(key).update(newChannel)
               .then(() => {
                //    dispatch setCurrentChannel when a new channel is added
                   this.$store.dispatch('setCurrentChannel', newChannel)
                   this.new_channel = ''
                   this.$modal.hide('modal-element')
               })
               // error handling
               .catch((error) => {
                   this.errors.push(error.message)
               })
           },

           //set active channel
           setActiveChannel(channel){
               return channel.id === this.currentChannel.id
           },

            // change channel
           changeChannel(channel){
               // reset notifications
                this.resetNotifications()
                this.$store.dispatch('setPrivate', false)
                this.$store.dispatch("setCurrentChannel", channel)  
                // set channel to arg channel
                this.channel = channel
           },

           addListeners(){
               this.channelsRef.on('child_added', snapshot => {
                //post snapshot value to channel array
                this.channels.push(snapshot.val())
                // set current channel
                if(this.channels.length > 0) {
                    // set first channel as current channel
                    this.channel = this.channels[0]
                    // dispatch current channel to store
                    this.$store.dispatch("setCurrentChannel", this.channel)
                }
                // add count listener to manage the notifications
                this.addCountListener(snapshot.key)
                
               })
           },

           addCountListener(channelId){
               this.messagesRef.child(channelId).on('value', snapshot => {
                   this.handleNotifications(channelId, this.currentChannel.id, this.notifCount, snapshot)
               })
           },

           getNotification(channel){
               let notif = 0
               this.notifCount.forEach(el => {
                   if(el.id === channel.id){
                       notif = el.notif
                   }
               });
               return notif
           },

            // reset notifications
           resetNotifications(){
               let index = this.notifCount.findIndex(el => el.id === this.channel.id)
               if(index !== -1){
                   this.notifCount[index].total = this.notifCount[index].lastKnownTotal
                   this.notifCount[index].notif = 0
               }
           },

           detachListeners(){
               // turn off listening before destroying off stops listening for changes
               this.channelsRef.off()
               this.channels.forEach(el => {
                   this.messagesRef.child(el.id).off()
               })
           },

           // reset form
            resetForm() {
                $('.form').trigger('reset')
                this.file = null
            }
        },
        
        mounted(){
            this.addListeners()
        },

        beforeDestroy(){
            this.detachListeners()
        }
    }
</script>
