<template>

    <!-- File Upload Modal -->
    <modal name="modal-upload" id="fileModal" @opened="opened">
           <form action="#" class="form">
               <div class="form-group">
                   <h2 for="channelName" class="ml-3 mt-3 text-dark">Upload File (jpeg, png 1 mb max)</h2>
                   <div class="container-fluid">
                       <input @change="addFile" class="mt-4 ml-20 align-center text-dark" type="file" id="file" name="file" @keydown.shift.tab.prevent="">
                        <br>
                        <button @click.prevent="hide" class="mt-4 mr-3 btn btn-secondary" >Cancel</button>
                        <button @click.prevent="sendFile" class="mt-4 btn btn-primary" >Send File</button>
                   </div>
                   
               </div>
           </form>
        </modal>
        
</template>

<script>
import mime from 'mime-types'

    export default {
        name: 'file-modal',

        data(){
            return {
                file: null,
                authorized: ['image/jpeg', 'image/jpg', 'image/png']
            }
        },

        methods: {

            isValid(filename) {
                let index = this.authorized.indexOf(mime.lookup(filename))
                return index !== -1
            },

            hide(){
               this.$modal.hide('modal-upload')
            },

            addFile(e){
                let files = e.target.files
                console.log(files)

                if(files.length === 1) {
                    this.file = files[0]
                }
            },

            sendFile(){
                    if(this.file !== null) {
                        if(this.isValid(this.file.name)) {
                            let metadata = {contentType: mime.lookup(this.file.name)}
                            this.$parent.uploadFile(this.file, metadata)
                            this.$modal.hide('modal-upload')
                        }
                }
            },

            // reset form
            resetForm() {
                $('.form').trigger('reset')
                this.file = null
            }
        }
    }
</script>
