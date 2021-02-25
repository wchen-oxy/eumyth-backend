import React, { useState, useRef, useEffect } from 'react';
import LongEditor from '../editor/long-editor';
import ReviewPost from './review-post';
import {
  INITIAL_STATE,
  REVIEW_STATE,
  NONE,
  LONG
} from "../../constants/flags";
import "./long-post.scss";

const LongPost = (props) => {
  const [windowState, setWindowState] = useState(INITIAL_STATE);
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
      const correctedEditorHeight =
        editorContainerRef.current.offsetHeight
        + postHeaderRef.current.offsetHeight;
      if (editorContainerRef.current.offsetHeight
        && (editorContainerRef.current.offsetHeight !== editorContainerSize
          &&
          correctedEditorHeight > window.innerHeight
          && lastBlockChanged
        ) ||
        (editorContainerRef.current.offsetHeight !== editorContainerSize
          && correctedEditorHeight > window.innerHeight
          && lastTwoBlockIdentical)
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
        if (windowType === NONE) {
          props.onPostTypeSet(windowType, null);
        }
        else {
          setWindowState(windowType);
        }
      }
    }
    else {
      switch (windowType) {
        case (NONE):
          props.onPostTypeSet(windowType, localDraft);
          break;
        case (INITIAL_STATE):
          setWindowState(windowType);
          break;
        case (REVIEW_STATE):
          setWindowState(windowType);
          props.onLocalSync(localDraft);
          break;
        default:
          throw new Error("No Windows Matched");
      }
    }
  }
  if (windowState === INITIAL_STATE)
    return (
      <div className="longpost-window">
        <div ref={postHeaderRef}>
          <h2>Long Entry</h2>
          {isSavePending ? (<p>Saving</p>) : (<p>Saved</p>)}
          <div className="longpost-button-container">
            <span  >
              <button
                value={NONE}
                onClick={e => setPostStage(e.target.value, isSavePending)}
              >
                Return
                </button>
            </span>
            <span  >
              <button
                value={REVIEW_STATE}
                disabled={!hasContent}
                onClick={(e) => setPostStage(e.target.value, isSavePending)}
              >
                Review Post
              </button>
            </span>
          </div>
        </div>
        {props.onlineDraftRetrieved && !props.loading ?
          (
            <div id="longpost-container" ref={editorContainerRef}>
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
              <div ref={dummyScrollRef}></div>
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
        previousState={INITIAL_STATE}
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
        previewTitle={null}
      />
    )
  }
}

export default LongPost;