// import React, { useState, useEffect, useRef } from 'react';
// import ImageSlider from '../../image-carousel';
// import "slick-carousel/slick/slick.css";
// import "slick-carousel/slick/slick-theme.css";
// import './drag-drop-file.scss';
// import ImageDrop from './image-drop';
// import FileDisplayContainer from './file-display-container';

// const DragDropFile = (props) => {
//     const fileInputRef = useRef();
//     const modalImageRef = useRef();
//     const modalRef = useRef();
//     const uploadModalRef = useRef();
//     const [selectedFiles, setSelectedFiles] = useState([]);
//     const [validFiles, setValidFiles] = useState([]);
//     const [unsupportedFiles, setUnsupportedFiles] = useState([]);
//     const [errorMessage, setErrorMessage] = useState('');

//     useEffect(() => {

//         let filteredArr = selectedFiles.reduce((acc, current) => {
//             const x = acc.find(item => item.name === current.name);
//             if (!x) {
//                 return acc.concat([current]);
//             } else {
//                 return acc;
//             }
//         }, []);
//         console.log("Effect is used");
//         setValidFiles([...filteredArr]);
//     }, [selectedFiles]);

//     const preventDefault = (e) => {
//         e.preventDefault();
//     }

//     const dragOver = (e) => {
//         preventDefault(e);
//     }

//     const dragEnter = (e) => {
//         preventDefault(e);
//     }

//     const dragLeave = (e) => {
//         preventDefault(e);
//     }

//     const fileDrop = (e) => {
//         preventDefault(e);
//         const files = e.dataTransfer.files;
//         if (files.length) {
//             handleFiles(files);
//         }
//     }

//     const filesSelected = () => {
//         if (fileInputRef.current.files.length) {
//             handleFiles(fileInputRef.current.files);
//         }
//     }

//     const fileInputClicked = () => {
//         fileInputRef.current.click();
//     }

//     const handleFiles = (files) => {
//         let invalidFound = false;
//         for (let i = 0; i < files.length; i++) {
//             if (validateFile(files[i])) {
//                 setSelectedFiles(prevArray => {
//                     console.log(prevArray);
//                     console.log(files[i]);
//                     return [...prevArray, files[i]];
//                 }
//                 );
//             } else {
//                 invalidFound = true;
//                 files[i]['invalid'] = true;
//                 setSelectedFiles(prevArray => [...prevArray, files[i]]);
//                 setErrorMessage('File type not permitted');
//                 setUnsupportedFiles(prevArray => [...prevArray, files[i]]);
//             }
//         }
//         updateDisabilityState(invalidFound);
//     }

//     const validateFile = (file) => {
//         const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/x-icon'];
//         if (validTypes.indexOf(file.type) === -1) {
//             return false;
//         }
//         return true;
//     }

//     const fileSize = (size) => {
//         if (size === 0) {
//             return '0 Bytes';
//         }
//         const k = 1024;
//         const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
//         const i = Math.floor(Math.log(size) / Math.log(k));
//         return parseFloat((size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
//     }

//     const fileType = (fileName) => {
//         return fileName.substring(fileName.lastIndexOf('.') + 1, fileName.length) || fileName;
//     }

//     const removeFile = (name) => {
//         const index = validFiles.findIndex(e => e.name === name);
//         const index2 = selectedFiles.findIndex(e => e.name === name);
//         const index3 = unsupportedFiles.findIndex(e => e.name === name);
//         validFiles.splice(index, 1);
//         selectedFiles.splice(index2, 1);
//         setValidFiles([...validFiles]);
//         setSelectedFiles([...selectedFiles]);
//         if (index3 !== -1) {
//             unsupportedFiles.splice(index3, 1);
//             setUnsupportedFiles([...unsupportedFiles]);
//         }

//         if (validFiles.length > 0 && unsupportedFiles.length === 0) {
//             updateDisabilityState(false);
//         }
//         else {
//             updateDisabilityState(true);
//             props.indicateImageExists(false);
//         }
//     }

//     const updateDisabilityState = (invalidFound) => {
//         invalidFound ? props.disablePost(true) : props.disablePost(false);
//     }

//     const openImageModal = (file) => {
//         const reader = new FileReader();
//         modalRef.current.style.display = "block";
//         reader.readAsDataURL(file);
//         reader.onload = function (e) {
//             modalImageRef.current.style.backgroundImage = `url(${e.target.result})`;
//         }
//     }

//     if (validFiles.length === 0) return (
//         <div className="photo-upload-container">
//             {unsupportedFiles.length ? <p>Please remove all unsupported files.</p> : ''}
//             <ImageDrop
//                 reference={fileInputRef}
//                 dragOver={dragOver}
//                 dragEnter={dragEnter}
//                 dragLeave={dragLeave}
//                 fileDrop={fileDrop}
//                 fileInputClicked={fileInputClicked}
//                 filesSelected={filesSelected}
//             />
//         </div>

//     );
//     else {
//         return (
//             <div className="photo-upload-container">
//                 {unsupportedFiles.length ? <p>Please remove all unsupported files.</p> : ''}
//                 <ImageSlider fileArray={validFiles} setImageArray={props.setImageArray} />
//                 <ImageDrop
//                     reference={fileInputRef}
//                     dragOver={dragOver}
//                     dragEnter={dragEnter}
//                     dragLeave={dragLeave}
//                     fileDrop={fileDrop}
//                     fileInputClicked={fileInputClicked}
//                     filesSelected={filesSelected}
//                 />
//                 <FileDisplayContainer
//                     validFiles={validFiles}
//                     openImageModal={openImageModal}
//                     removeFile={removeFile}
//                     fileType={fileType}
//                     fileSize={fileSize}
//                 />
//             </div>
//         );
//     }
// }

// export default DragDropFile;



