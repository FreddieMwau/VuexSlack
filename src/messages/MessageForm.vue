<template>
    <div>
        <div class="messageform">

            <!-- file upload progress bar -->
            <div class="progress" v-if="uploadState !== null">
                <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar">{{uploadLabel}}</div>
            </div>

            <form @submit.prevent="sendMessage">
                <div class="input-group mb-3">
                    <input v-model.trim="message" type="text" name="message" id="message" placeholder="Write something" class="form-control mt-3" autofocus>

                    <div class="input-group-append">
                        <button @click="sendMessage" class="btn btn-primary mt-3" type="button">&nbsp; Send &nbsp;</button>
                    </div>

                    <div class="input-group-append">
                        <button @click.prevent="show" :disabled="uploadState == 'uploading'" class="btn btn-warning mt-3" type="button">Upload</button>
                    </div>
                </div>
            </form>

            <!-- File Modal -->
            <file-modal ref="file_modal"></file-modal>

        </div>
    </div>
</template>

<script>
import {mapGetters} from 'vuex'
import FileModal from './FileModal'
import { v4 as uuidv4 } from 'uuid'
import storage from 'firebase/storage'

    export default {
        name: 'message-form',

        components: {FileModal},

        data() {
            return {
                message: '',
                errors: [],
                storageRef: firebase.storage().ref(),
                uploadTask: null,
                uploadState: null
            }
        },

        computed: {
            //get current channel and current user
            ...mapGetters(['currentChannel', 'currentUser', 'isPrivate']),

            // upload state
            uploadLabel(){
                switch(this.uploadState){
                    case 'uploading': return 'Uploading in progress'
                        break
                    case 'error': return 'Error occured'
                        break
                    case 'done': return 'Upload completed'
                        break 
                    default: return ''
                }
            }
        },

        methods: {
            show(){
               this.$modal.show('modal-upload');
            },

            sendMessage(){
                // construct new message object
                // let newMessage = {
                //     content: this.message,
                //     timestamp: firebase.database.ServerValue.TIMESTAMP,
                //     user: {
                //         name: this.currentUser.displayName,
                //         avatar: this.currentUser.photoURL,
                //         id: this.currentUser.uid
                //     }
                // }

                // validation
                if(this.currentChannel !== null){
                    if(this.message.length > 0){
                        //reference parent to ref the parent component 
                        //use child to create a new child node in messages
                        // with the id that matches the current channel id and push
                        // using push makes each message have a message id of its own
                        this.$parent.getMessagesRef().child(this.currentChannel.id).push().set(this.createMessage())
                        .then(() => {
                            //next tick method available globally used immediately after change of data to wait for DOM update 
                            // it takes callback function as argument
                            this.$nextTick(() => {
                                $("html, body").scrollTop($(document).height());
                            })
                        })
                        // display error in the errors array
                        .catch((error) => {
                            this.errors.push(error.message)
                        })
                        // reset the value of message to empty
                        this.message = ''
                    }
                }
            },

            createMessage(fileUrl = null) {
                // create message object to push to firebase
                let message = {
                    timestamp: firebase.database.ServerValue.TIMESTAMP,
                    user: {
                        name: this.currentUser.displayName,
                        avatar: this.currentUser.photoURL,
                        id: this.currentUser.uid
                    }
                }

                if(fileUrl == null){
                    // either send message with content
                    message['content'] = this.message
                } else {
                    // or send the message with image
                    message['image'] = fileUrl
                }
                return message
            },

            uploadFile(file, metadata){
                if(file === null) return false
                
                // path to upload file
                let pathToUpload = this.currentChannel.id
                let ref = this.$parent.getMessagesRef()
                let filePath = this.getPath() + '/'+ uuidv4() + '.jpg'

                this.uploadTask = this.storageRef.child(filePath).put(file, metadata)
                this.uploadState = "uploading"

                // on upload state change
                this.uploadTask.on('state_changed', snapshot => {
                    //upload in progress
                    let percent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                    $(".progress-bar").css("width", percent+'%')
                }, error => {
                    // errors
                    this.errors.push(error.message)
                    this.uploadState = 'error'
                    this.uploadTask = null
                    // reset form
                    this.$refs.file_modal.resetForm()
                }, () => {
                    //upload finish
                    this.uploadState = 'done'
                    // reset form
                    this.$refs.file_modal.resetForm()
                    // recover the url of file
                    let fileUrl = this.uploadTask.snapshot.ref.getDownloadURL().then(fileUrl => {
                        console.log('The fileUrl :', fileUrl)
                         this.sendFileMessage(fileUrl, ref, pathToUpload)
                    })
                }
                )
            },

            sendFileMessage(fileUrl, ref, pathToUpload) {
                 ref.child(pathToUpload).push().set(this.createMessage(fileUrl)).then(() => {
                     this.$nextTick(() => {
                         $("html, body").scrollTop($(document).height())
                     })
                 }).catch(error => {
                     this.errors.push(error.message)
                 })
            },

            // folder directory to store files in firebase storage
            getPath(){
                if(this.isPrivate){
                    return 'chat/private/'+this.currentChannel.id
                } else {
                    return 'chat/public'
                }
            }
        },

        mounted(){
            $("html, body").scrollTop($(document).height())
        },

        beforeDestroy() {
            if(this.uploadTask !== null) {
                this.uploadTask.cancel()
                this.uploadTask = null
            }
        }
    }
</script>

<style scoped>
    .messageform{
        position: fixed;
        left: 0;
        bottom: 0;
        width: 67%;
        z-index: 100;
        color: whitesmoke;
        text-align: center;
        margin-bottom: -20px;
        margin-left: 33.3%;
    }

    input, button{
        height: 50px;
    }

    .progress{
        margin-bottom: -16px;

    }
</style>
