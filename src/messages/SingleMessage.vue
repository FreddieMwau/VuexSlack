<template>
    <div>
        <div class="mt-3 mb-5">
            <div v-for="message in messages" :key="message">
                <div class="media">
                    <img :src="message.user.avatar" height="50" alt="" class="align-self-start rounded-circle mr-3">
                    <div class="media-body">
                        <h6 class="mt-0">
                            <a href="#">{{ message.user.name }}</a> -{{message.timestamp | fromNow}}
                        </h6>
                        <p v-if="!isFile(message)" :class="{'self_message': selfMessage(message.user)}">{{message.content}}</p>
                        <img v-else class="img img-responsive" height="200" :src="message.image" alt="image"/>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import moment from 'moment'
import {mapGetters} from 'vuex'

    export default {
        name: 'single-message',
        props: ['messages'],

        computed: {
            ...mapGetters(['currentUser'])
        },

        methods: {
            selfMessage(user){
                return user.id === this.currentUser.uid
            },

            isFile(message) {
                return message.content == null && message.image != null 
            }
        },

        filters: {
            fromNow(value){
                // will convert given date to human readable format
                return moment(value).fromNow()
            }
        }
    }
</script>

<style scoped>
    .self_message{
        border-left: 5px solid red;
        padding: 0 10px;
    }
</style>
