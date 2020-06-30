import React from 'react';
import Axios from '../../Axios/axios';

import {
  ImageSideButton,
  Block,
  addNewBlock,
  createEditorState,
  Editor,
} from 'medium-draft';
import 'isomorphic-fetch';

class CustomImageSideButton extends ImageSideButton {

  /*
  We will only check for first file and also whether
  it is an image or not.
  */

//  const file = document.getElementById('inputGroupFile01').files;

//  const formData = new FormData();
//  formData.append('img', file[0]);
//  if (file[0]) Axios.postImage(formData)
//      .then(r => {
//          console.log(r)
//      }).then(

//          () =>
//              document
//                  .getElementById('img')
//                  .setAttribute('src', `http://localhost:5000/entry/image/${file[0].name}`)
//      );
  
  onChange(e) {
    const file = e.target.files[0];
    if (file.type.indexOf('image/') === 0) {
      // This is a post request to server endpoint with image as `image`
      const formData = new FormData();
      formData.append('img', file);
      Axios.postImage(formData)
      .then((response) => {
        if (response.status === 201) {
          // Assuming server responds with
          // `{ "url": "http://example-cdn.com/image.jpg"}`
        //   return response.json().then(
              //TODO
        //       data => {
        //     if (data.url) {
        //       this.props.setEditorState(addNewBlock(
        //         this.props.getEditorState(),
        //         Block.IMAGE, {
        //           src: data.url,
        //         }
        //       ));
        //     }
        //   }
            
                return this.props.setEditorState(addNewBlock(
                            this.props.getEditorState(),
                            Block.IMAGE, {
                              src: `http://localhost:5000/entry/image/${file.name}`,
                            }
                          ));
          
          
        //   );
        }
      });
    }
    this.props.close();
  }

}

export default CustomImageSideButton;
