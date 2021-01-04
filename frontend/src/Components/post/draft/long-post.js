import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import LongEditor from '../editor/long-editor';
import ReviewPost from './review-post';

const INITIAL = "INITIAL";
const REVIEW = "REVIEW";
const NONE = "NONE";
const LONG = "LONG";

const LongPost = (props) => {
  const [windowState, setWindowState] = useState(INITIAL);
  const [hasContent, setHasContent] = useState(props.onlineDraft !== null);
  const [isSavePending, setSavePending] = useState(false);
  const [localDraft, setLocalDraft] = useState(props.onlineDraft);
  const [editorContainerSize, setEditorContainerSize] = useState(0);
  const [lastTwoBlockIdentical, setLastTwoBlockIdentical] = useState(false);
  const [lastBlockText, setLastBlockText] = useState("");
  const [lastBlockChanged, setLastBlockChanged] = useState(false);
  const editorContainerRef = useRef(null);
  const postHeaderRef = useRef(null);
  const dummyScrollRef = useRef(null);
  useEffect(() => {
    if (editorContainerRef.current) {
      if (editorContainerRef.current.offsetHeight && (editorContainerRef.current.offsetHeight !== editorContainerSize &&
        editorContainerRef.current.offsetHeight + postHeaderRef.current.offsetHeight > window.innerHeight
        && lastBlockChanged
      ) ||
        (editorContainerRef.current.offsetHeight !== editorContainerSize &&
          editorContainerRef.current.offsetHeight + postHeaderRef.current.offsetHeight > window.innerHeight &&
          lastTwoBlockIdentical)
      ) {
        dummyScrollRef.current.scrollIntoView();
      }
      setEditorContainerSize(editorContainerRef.current.offsetHeight);
    }
  })


  const handleSavePending = (currentlySaving) => {
    setSavePending(currentlySaving);
  }

  const syncChanges = () => {
    props.onLocalOnlineSync(localDraft)
      .then((result) => {
        if (result) {
          console.log("SAVING SIDE WAY");
          setSavePending(false);
        }
        else {
          alert("Save unsucessful");
        }
      }
      );
  }

  const setPostStage = (windowType, isSavePending) => {
    if (isSavePending) {
      if (!window.confirm("Do you want to leave while changes are being saved?")) {
        syncChanges();
      }
      else {
        //don't care, just leave
        if (windowType === NONE) {
          props.onPostTypeSet(windowType, null);
        }
        else {
          //go to review page
          setWindowState(windowType);
        }

      }
    }
    else {
      if (windowType === NONE) {
        props.onPostTypeSet(windowType, localDraft);
      }
      else if (windowType === INITIAL) {
        setWindowState(windowType);
      }
      //already saved, just set the local state
      else if (windowType === REVIEW) {
        setWindowState(windowType);
        props.onLocalSync(localDraft);
      }
      else {
        setWindowState(windowType);
      }
    }
  }
   if (windowState === INITIAL)
    return (
      <div className="long-post-window">
        <div ref={postHeaderRef}>
          <h2>Long Entry</h2>
          {isSavePending ? (<p>Saving</p>) : (<p>Saved</p>)}
          <div id="button-container">
            <span id="toggle-button-span">
              <button id="toggle-button" value={NONE} onClick={e => setPostStage(e.target.value, isSavePending)}>Return</button>
            </span>
            <span id="post-button-span">
              <button id="post-button" value={REVIEW} disabled={!hasContent} onClick={(e) => setPostStage(e.target.value, isSavePending)}>Review Post</button>
            </span>
          </div>
        </div>
        {props.onlineDraftRetrieved && !props.loading ?
          (
            <div className="long-editor-container" ref={editorContainerRef}>
              <LongEditor
                username={props.username}
                isSavePending={isSavePending}
                hasContent={hasContent}
                setHasContent={setHasContent}
                onSavePending={handleSavePending}
                onlineDraft={props.onlineDraft}
                localDraft={localDraft}
                syncChanges={syncChanges}
                setLocalDraft={setLocalDraft}
                lastTwoBlockIdentical={lastTwoBlockIdentical}
                setLastTwoBlockIdentical={setLastTwoBlockIdentical}
                lastBlockChanged={lastBlockChanged}
                setLastBlockChanged={setLastBlockChanged}
                lastBlockText={lastBlockText}
                setLastBlockText={setLastBlockText}
              />
              <br />
              <br />
              <br />
              <br />
              <div id="dummy-scroll" ref={dummyScrollRef}></div>
            </div>

          )
          : (
            <div>
              <p> Loading.... </p>
            </div>
          )
        }

      </div>
    );
  else {
    return (
      <ReviewPost
        displayPhoto={props.displayPhoto}
        isPaginated={false}
        textData={props.onlineDraft}
        closeModal={props.closeModal}
        postType={LONG}
        setPostStage={setPostStage}
        username={props.username}
        preferredPostType={props.preferredPostType}
        pursuitNames={props.pursuitNames}
        handlePreferredPostTypeChange={props.handlePreferredPostTypeChange}
      />
    )
  }
}

export default LongPost;